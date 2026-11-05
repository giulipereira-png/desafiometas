import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DayLog, GoalConfig } from './types/workout';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity as per skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline.');
      return false;
    }
    // Permissions error or non-existent document is expected on test path
    return true;
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-out error:', err);
    throw err;
  }
}

// Cloud Firestore Sync Helpers
export async function syncWorkoutToCloud(userId: string, log: DayLog): Promise<void> {
  const path = `users/${userId}/workouts/${log.date}`;
  try {
    const cleanLog = JSON.parse(JSON.stringify(log));
    await setDoc(doc(db, 'users', userId, 'workouts', log.date), {
      ...cleanLog,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWorkoutFromCloud(userId: string, date: string): Promise<void> {
  const path = `users/${userId}/workouts/${date}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workouts', date));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncGoalToCloud(userId: string, goal: GoalConfig): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), {
      userId,
      userName: goal.userName || 'Giu Sousa',
      userHandle: goal.userHandle || '@prof_giu',
      swimTargetKm: goal.swimTargetKm || 45,
      gymWeeklyTargetDays: goal.gymWeeklyTargetDays || 4,
      targetEndDate: goal.targetEndDate || '2026-12-31',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToUserWorkouts(
  userId: string,
  onWorkouts: (logs: Record<string, DayLog>) => void
): Unsubscribe {
  const path = `users/${userId}/workouts`;
  const workoutsRef = collection(db, 'users', userId, 'workouts');

  return onSnapshot(
    workoutsRef,
    (snapshot) => {
      const logs: Record<string, DayLog> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DayLog;
        if (data.date) {
          logs[data.date] = data;
        }
      });
      onWorkouts(logs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeToUserGoal(
  userId: string,
  onGoal: (goal: Partial<GoalConfig>) => void
): Unsubscribe {
  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onGoal(data as Partial<GoalConfig>);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
