import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Configure notification behaviour ──────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ── Permission & Token ─────────────────────────────────────────────

export async function registerForPushNotifications(uid?: string) {
    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return null;
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Save token to Firestore user document
    if (uid) {
        try {
            await updateDoc(doc(db, 'users', uid), { pushToken: token });
        } catch (e) {
            console.warn('Failed to save push token:', e);
        }
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication', {
            name: 'Medication Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2196F3',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('health', {
            name: 'Health Reminders',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
        });
    }

    return token;
}

// ── Medication Reminders ──────────────────────────────────────────

export async function scheduleMedicationReminder(
    medicationId: string,
    medicationName: string,
    timeString: string, // "08:00 AM" format
    days: string[], // ["Mon", "Tue", ...]
) {
    // Parse time
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return;

    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    // Map day names to weekday numbers (Sunday = 1 in Expo)
    const dayMap: Record<string, number> = {
        Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7,
    };

    // Cancel existing reminders for this medication
    await cancelMedicationReminders(medicationId);

    // Schedule a repeating notification for each day
    for (const day of days) {
        const weekday = dayMap[day];
        if (!weekday) continue;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '💊 Medication Reminder',
                body: `Time to take ${medicationName}`,
                data: { medicationId, type: 'medication' },
                sound: 'default',
                ...(Platform.OS === 'android' && { channelId: 'medication' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday,
                hour,
                minute,
            },
            identifier: `med_${medicationId}_${day}`,
        });
    }
}

export async function cancelMedicationReminders(medicationId: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
        if (notif.identifier.startsWith(`med_${medicationId}_`)) {
            await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
    }
}

// ── Glucose Check Reminders ───────────────────────────────────────

export async function scheduleGlucoseReminder(hour: number = 8, minute: number = 0) {
    // Cancel existing glucose reminders
    await cancelGlucoseReminders();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '🩸 Glucose Check',
            body: 'Time to check your blood glucose level',
            data: { type: 'glucose' },
            sound: 'default',
            ...(Platform.OS === 'android' && { channelId: 'health' }),
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        },
        identifier: 'glucose_daily',
    });
}

export async function cancelGlucoseReminders() {
    try {
        await Notifications.cancelScheduledNotificationAsync('glucose_daily');
    } catch {
        // May not exist
    }
}

// ── Utility ───────────────────────────────────────────────────────

export async function cancelAllReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
    return Notifications.getAllScheduledNotificationsAsync();
}
