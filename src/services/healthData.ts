import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    where,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Types ──────────────────────────────────────────────────────────
export interface GlucoseReading {
    id?: string;
    value: number;
    unit: string;
    mealTiming: string;
    notes?: string;
    timestamp: Timestamp;
}

export interface WeightReading {
    id?: string;
    kg: number;
    grams: number;
    timestamp: Timestamp;
}

export interface BloodPressureReading {
    id?: string;
    systolic: number;
    diastolic: number;
    notes?: string;
    timestamp: Timestamp;
}

export interface WaterEntry {
    id?: string;
    amount: number; // ml
    timestamp: Timestamp;
}

type MetricCollection = 'glucose' | 'weight' | 'bloodPressure' | 'water' | 'hba1c';

// ── Helpers ────────────────────────────────────────────────────────
function userMetricRef(uid: string, metric: MetricCollection) {
    return collection(db, 'users', uid, metric);
}

// ── Add Readings ───────────────────────────────────────────────────

export async function addGlucoseReading(
    uid: string,
    value: number,
    unit: string,
    mealTiming: string,
    notes?: string,
) {
    return addDoc(userMetricRef(uid, 'glucose'), {
        value,
        unit,
        mealTiming,
        notes: notes || null,
        timestamp: serverTimestamp(),
    });
}

export async function addWeightReading(
    uid: string,
    kg: number,
    grams: number,
) {
    return addDoc(userMetricRef(uid, 'weight'), {
        kg,
        grams,
        timestamp: serverTimestamp(),
    });
}

export async function addBloodPressure(
    uid: string,
    systolic: number,
    diastolic: number,
    notes?: string,
) {
    return addDoc(userMetricRef(uid, 'bloodPressure'), {
        systolic,
        diastolic,
        notes: notes || null,
        timestamp: serverTimestamp(),
    });
}

export async function addWaterIntake(uid: string, amount: number) {
    return addDoc(userMetricRef(uid, 'water'), {
        amount,
        timestamp: serverTimestamp(),
    });
}

export async function addHbA1cReading(
    uid: string,
    value: number,
    testDate: string,
    nextAppointment?: string,
) {
    return addDoc(userMetricRef(uid, 'hba1c'), {
        value,
        testDate,
        nextAppointment: nextAppointment || null,
        timestamp: serverTimestamp(),
    });
}

// ── Query Readings ─────────────────────────────────────────────────

export async function getReadings(
    uid: string,
    metric: MetricCollection,
    days: number = 7,
) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const q = query(
        userMetricRef(uid, metric),
        where('timestamp', '>=', Timestamp.fromDate(since)),
        orderBy('timestamp', 'desc'),
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getLatestReading(uid: string, metric: MetricCollection) {
    const q = query(
        userMetricRef(uid, metric),
        orderBy('timestamp', 'desc'),
        limit(1),
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ── Today's Water Total ────────────────────────────────────────────
export async function getTodayWaterTotal(uid: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        userMetricRef(uid, 'water'),
        where('timestamp', '>=', Timestamp.fromDate(today)),
        orderBy('timestamp', 'desc'),
    );

    const snap = await getDocs(q);
    return snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
}

// ── User Goal Weight ───────────────────────────────────────────────
export async function getUserGoalWeight(uid: string): Promise<number | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return userDoc.data()?.targetWeight ?? null;
}

export async function updateUserGoalWeight(uid: string, goalKg: number): Promise<void> {
    await updateDoc(doc(db, 'users', uid), { targetWeight: goalKg });
}

// ── Get ALL readings (no limit) ────────────────────────────────────
export async function getAllReadings(uid: string, metricType: MetricCollection) {
    const q = query(
        userMetricRef(uid, metricType),
        orderBy('timestamp', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Water Settings ─────────────────────────────────────────────────
export interface WaterSettings {
    dailyGoalL: number;            // daily goal in litres
    containerType: 'glass' | 'bottle';
    containerVolumeL: number;      // container volume in litres
}

const DEFAULT_WATER_SETTINGS: WaterSettings = {
    dailyGoalL: 1.5,
    containerType: 'glass',
    containerVolumeL: 0.25,
};

export async function getUserWaterSettings(uid: string): Promise<WaterSettings> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return DEFAULT_WATER_SETTINGS;
    const data = userDoc.data();
    return {
        dailyGoalL: data?.waterGoalL ?? DEFAULT_WATER_SETTINGS.dailyGoalL,
        containerType: data?.waterContainerType ?? DEFAULT_WATER_SETTINGS.containerType,
        containerVolumeL: data?.waterContainerVolumeL ?? DEFAULT_WATER_SETTINGS.containerVolumeL,
    };
}

export async function updateUserWaterSettings(uid: string, settings: Partial<WaterSettings>): Promise<void> {
    const updateData: any = {};
    if (settings.dailyGoalL !== undefined) updateData.waterGoalL = settings.dailyGoalL;
    if (settings.containerType !== undefined) updateData.waterContainerType = settings.containerType;
    if (settings.containerVolumeL !== undefined) updateData.waterContainerVolumeL = settings.containerVolumeL;
    await updateDoc(doc(db, 'users', uid), updateData);
}
