import {
    collection,
    addDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Types ──────────────────────────────────────────────────────────
export interface Medication {
    id?: string;
    name: string;
    dosage: string;
    unit: string;
    form: string;
    frequency: string;
    days: string[];
    times: string[];
    reminder: boolean;
    reminderTiming: string;
    startDate: string;
    notes?: string | null;
    active: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface MedicationDoseLog {
    id?: string;
    medicationId: string;
    medicationName: string;
    status: 'taken' | 'skipped';
    timestamp: Timestamp;
}

// ── Helpers ────────────────────────────────────────────────────────
function medicationsRef(uid: string) {
    return collection(db, 'users', uid, 'medications');
}

function doseLogsRef(uid: string) {
    return collection(db, 'users', uid, 'medicationLogs');
}

// ── Medication CRUD ────────────────────────────────────────────────

export async function addMedication(
    uid: string,
    data: Omit<Medication, 'id' | 'active' | 'createdAt' | 'updatedAt'>,
) {
    return addDoc(medicationsRef(uid), {
        ...data,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function getMedications(uid: string): Promise<Medication[]> {
    const q = query(
        medicationsRef(uid),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Medication));
}

export async function updateMedication(
    uid: string,
    medId: string,
    data: Partial<Medication>,
) {
    const ref = doc(db, 'users', uid, 'medications', medId);
    return updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deactivateMedication(uid: string, medId: string) {
    return updateMedication(uid, medId, { active: false });
}

// ── Dose Logging ───────────────────────────────────────────────────

export async function logDose(
    uid: string,
    medicationId: string,
    medicationName: string,
    status: 'taken' | 'skipped',
) {
    return addDoc(doseLogsRef(uid), {
        medicationId,
        medicationName,
        status,
        timestamp: serverTimestamp(),
    });
}

export async function getTodaysDoses(uid: string): Promise<MedicationDoseLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
        doseLogsRef(uid),
        where('timestamp', '>=', Timestamp.fromDate(today)),
        orderBy('timestamp', 'desc'),
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MedicationDoseLog));
}

// ── Stats ──────────────────────────────────────────────────────────

export async function getMedicationStats(uid: string) {
    const meds = await getMedications(uid);
    const todayDoses = await getTodaysDoses(uid);
    const takenCount = todayDoses.filter((d) => d.status === 'taken').length;

    return {
        totalActive: meds.length,
        takenToday: takenCount,
        medications: meds,
        todayDoses,
    };
}
