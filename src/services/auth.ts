import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithCredential,
    GoogleAuthProvider,
    OAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

// ── Configure Google Sign-In (call once at app startup) ────────
GoogleSignin.configure({
    webClientId: '333411713540-2hoi454ompouqis1t4o2b1t2ik9pjdb4.apps.googleusercontent.com',
});

// ── Firestore user doc helper ──────────────────────────────────
async function ensureUserDoc(user: User, username?: string) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    // Only create doc if it doesn't already exist (first login)
    if (!snap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email || '',
            username: username || user.displayName || user.email?.split('@')[0] || 'user',
            role: 'patient',
            photoURL: user.photoURL || null,
            pushToken: null,
            createdAt: serverTimestamp(),
            onboardingComplete: false,
            profile: {
                age: null,
                height: null,
                weight: null,
                targetWeight: null,
                diabetesType: null,
                activityLevel: null,
                goals: [],
                medicalConditions: [],
            },
            settings: {
                language: 'en',
                units: { weight: 'kg', height: 'cm', glucose: 'mg/dL' },
                notifications: true,
            },
        });
    }
}

// ── Sign Up (Email/Password) ──────────────────────────────────
export async function signUp(email: string, password: string, username: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(credential.user, username);
    return credential.user;
}

// ── Sign In (Email/Password) ──────────────────────────────────
export async function signIn(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
}

// ── Google Sign-In (Native) ────────────────────────────────────
export async function signInWithGoogle() {
    // Check if Play Services are available (Android)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Open native Google account picker
    const response = await GoogleSignin.signIn();

    if (!response.data?.idToken) {
        throw new Error('No ID token returned from Google Sign-In');
    }

    // Create Firebase credential from the Google ID token
    const googleCredential = GoogleAuthProvider.credential(response.data.idToken);
    const result = await signInWithCredential(auth, googleCredential);
    await ensureUserDoc(result.user);
    return result.user;
}

// ── Apple Sign-In ──────────────────────────────────────────────
export async function signInWithApple() {
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 10);
    const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
    );

    // Start Apple sign-in
    const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
    });

    const { identityToken } = appleCredential;
    if (!identityToken) throw new Error('No identity token from Apple');

    // Create Firebase credential
    const provider = new OAuthProvider('apple.com');
    const oauthCredential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
    });

    const result = await signInWithCredential(auth, oauthCredential);

    // Use Apple name if available
    const fullName = appleCredential.fullName;
    const displayName = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : undefined;

    await ensureUserDoc(result.user, displayName || undefined);
    return result.user;
}

// ── Sign Out ───────────────────────────────────────────────────
export async function logOut() {
    // Sign out from Google too if signed in with Google
    try { await GoogleSignin.signOut(); } catch { /* not signed in with Google */ }
    return signOut(auth);
}

// ── Password Reset ─────────────────────────────────────────────
export async function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
}

// ── Auth State Listener ────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}
