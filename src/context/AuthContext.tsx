import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthChange } from '../services/auth';
import { db } from '../config/firebase';

// ── Types ──────────────────────────────────────────────────────
export interface UserData {
    uid: string;
    email: string;
    username: string;
    role: 'patient' | 'doctor' | 'admin';
    photoURL: string | null;
    onboardingComplete: boolean;
    profile: {
        age: number | null;
        height: number | null;
        weight: number | null;
        targetWeight: number | null;
        diabetesType: string | null;
        activityLevel: string | null;
        goals: string[];
        medicalConditions: string[];
    };
    settings: {
        language: string;
        units: { weight: string; height: string; glucose: string };
        notifications: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
});

// ── Provider ───────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase auth state
        const unsubscribeAuth = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);

            if (!firebaseUser) {
                setUserData(null);
                setLoading(false);
                return;
            }

            // Listen to the user's Firestore document in real-time
            const unsubscribeDoc = onSnapshot(
                doc(db, 'users', firebaseUser.uid),
                (snap) => {
                    if (snap.exists()) {
                        setUserData(snap.data() as UserData);
                    }
                    setLoading(false);
                },
                () => {
                    // Error reading doc — still stop loading
                    setLoading(false);
                },
            );

            return () => unsubscribeDoc();
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook ───────────────────────────────────────────────────────
export function useAuth() {
    return useContext(AuthContext);
}
