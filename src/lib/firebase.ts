import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Define the standard OperationType enum and FirestoreErrorInfo interface as per SKILL.md
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

let app;
let db: any;
let auth: any;
let isFirebaseAvailable = false;

try {
  // Check if firebase elements are placeholder or real
  if (firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('FakeKeyPlaceholder')) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;

    // Test connection as required by SKILL.md
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase connectivity or offline status.");
        }
      }
    };
    testConnection();

    // Authenticate anonymously so we satisfy rules requiring isSignedIn()
    signInAnonymously(auth).catch((err) => {
      console.warn("Failed to sign in anonymously to Firebase auth:", err.message);
    });
  } else {
    console.log("Firebase placeholder credentials detected. Fallback local engine will be used.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase SDK:", e);
}

export { db, auth, isFirebaseAvailable };

// Standardized error handler throwing error payload as strict JSON per SKILL.md rules
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous_alex',
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        email: p.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface WellnessData {
  id?: string;
  studentId: string;
  studentName: string;
  mood: number;
  moodLabel: string;
  sleepHours: number;
  sleepQuality: string;
  notes?: string;
  attentionSnapshot?: string;
  createdAt?: any;
}

// Save wellness details
export async function saveWellnessCheckIn(data: WellnessData): Promise<string> {
  const checkInId = `checkin_${Date.now()}`;
  const payload = {
    ...data,
    createdAt: isFirebaseAvailable ? serverTimestamp() : new Date().toISOString()
  };

  // 1. Primary Save: Firebase Firestore (if enabled)
  if (isFirebaseAvailable && db) {
    const colPath = 'wellness_check_ins';
    try {
      await setDoc(doc(db, colPath, checkInId), payload);
      console.log("Wellness check-in successfully written to Firestore:", checkInId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colPath}/${checkInId}`);
    }
  }

  // 2. Secondary Save: Local Storage for high fidelity simulation persistence & fallback
  try {
    const stored = localStorage.getItem('neurolearn_wellness_history');
    const list = stored ? JSON.parse(stored) : [];
    list.unshift({ ...payload, id: checkInId, createdAt: new Date().toISOString() });
    localStorage.setItem('neurolearn_wellness_history', JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.error("Local storage sync error:", err);
  }

  // Sync to backend simulated database
  try {
    await fetch('/api/simulation/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.studentId,
        service: 'wellness_checkin',
        wellnessPayload: data,
        success: true
      })
    });
  } catch (err) {
    console.warn("Backend telemetry sync offline details:", err);
  }

  return checkInId;
}

// Retrieve wellness history
export async function getWellnessCheckIns(studentId: string): Promise<WellnessData[]> {
  // Try loading from Firebase if available
  if (isFirebaseAvailable && db) {
    const colPath = 'wellness_check_ins';
    try {
      const q = query(
        collection(db, colPath),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc'),
        limit(15)
      );
      const snapshot = await getDocs(q);
      const list: WellnessData[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.push({
          id: docSnap.id,
          ...item,
          createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt
        } as WellnessData);
      });
      if (list.length > 0) return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('neurolearn_wellness_history');
    if (stored) {
      const list = JSON.parse(stored);
      return list.filter((item: any) => item.studentId === studentId);
    }
  } catch (err) {
    console.error("Failed to parse local checkin logs:", err);
  }

  // Empty default history
  return [
    {
      id: "chk-default-1",
      studentId,
      studentName: "Alex Mercer",
      mood: 4,
      moodLabel: "Energized",
      sleepHours: 7.2,
      sleepQuality: "Excellent",
      notes: "Had a great resting cycle. Ready to study computing concepts!",
      attentionSnapshot: "High",
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: "chk-default-2",
      studentId,
      studentName: "Alex Mercer",
      mood: 2,
      moodLabel: "Exhausted",
      sleepHours: 5.0,
      sleepQuality: "Tossing & Turning",
      notes: "Anxious about exam preparation. Alpha-waves were heavily suppressed.",
      attentionSnapshot: "Low",
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];
}

export interface DistressSignal {
  id?: string;
  studentId: string;
  studentName: string;
  message: string;
  attentionSnapshot?: string;
  stressSnapshot?: string;
  heartRateSnapshot?: number;
  createdAt?: any;
}

// Global Help distress trigger saving to Firestore
export async function sendDistressSignal(data: DistressSignal): Promise<string> {
  const signalId = `signal_${Date.now()}`;
  const payload = {
    ...data,
    createdAt: isFirebaseAvailable ? serverTimestamp() : new Date().toISOString()
  };

  // 1. Primary Save: Firebase Firestore (if enabled)
  if (isFirebaseAvailable && db) {
    const colPath = 'distress_signals';
    try {
      await setDoc(doc(db, colPath, signalId), payload);
      console.log("Distress signal successfully written to Firestore:", signalId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colPath}/${signalId}`);
    }
  }

  // 2. Secondary Save: Local Storage for standalone offline tracking & telemetry
  try {
    const stored = localStorage.getItem('neurolearn_distress_signals');
    const list = stored ? JSON.parse(stored) : [];
    list.unshift({ ...payload, id: signalId, createdAt: new Date().toISOString() });
    localStorage.setItem('neurolearn_distress_signals', JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.error("Local storage distress sync error:", err);
  }

  // Sync to simulated telemetry
  try {
    await fetch('/api/simulation/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: data.studentId,
        service: 'distress_signal',
        signalId: signalId,
        success: true
      })
    });
  } catch (err) {
    console.warn("Backend telemetry sync offline details:", err);
  }

  return signalId;
}

// Retrieve historic distress signals
export async function getDistressSignals(): Promise<DistressSignal[]> {
  if (isFirebaseAvailable && db) {
    const colPath = 'distress_signals';
    try {
      const q = query(
        collection(db, colPath),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const list: DistressSignal[] = [];
      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        list.push({
          id: docSnap.id,
          ...item,
          createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt
        } as DistressSignal);
      });
      if (list.length > 0) return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('neurolearn_distress_signals');
    if (stored) {
      const list = JSON.parse(stored);
      if (list.length > 0) return list;
    }
  } catch (err) {
    console.error("Failed to parse local distress signals:", err);
  }

  // Pre-seed some default distress signals
  return [
    {
      id: "sig-default-1",
      studentId: "student_alex",
      studentName: "Alex Mercer",
      message: "Elevated heart rate spike detected during critical computing quiz tasks. Manual support alert requested.",
      attentionSnapshot: "Low",
      stressSnapshot: "High",
      heartRateSnapshot: 112,
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
    }
  ];
}
