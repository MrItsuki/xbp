import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
} from 'firebase/database';
import type { Projects, Workshops, Part, Workshop } from './types';

const firebaseConfig = {
  apiKey: 'AIzaSyC9T8Qj76wLjU9_g3cFkDJjr0lSb972Cv4',
  authDomain: 'seads-40a87.firebaseapp.com',
  databaseURL: 'https://seads-40a87-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'seads-40a87',
  storageBucket: 'seads-40a87.firebasestorage.app',
  messagingSenderId: '593225820599',
  appId: '1:593225820599:web:4f193bc3458c095180a032',
  measurementId: 'G-2Q94JEE3BF',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ── 購読 ──

export function subscribeProjects(cb: (p: Projects) => void): () => void {
  return onValue(ref(db, 'projects'), (snap) => cb((snap.val() as Projects) ?? {}));
}

export function subscribeWorkshops(cb: (w: Workshops) => void): () => void {
  return onValue(ref(db, 'workshops'), (snap) => cb((snap.val() as Workshops) ?? {}));
}

export function subscribeConnection(cb: (online: boolean) => void): () => void {
  return onValue(ref(db, '.info/connected'), (snap) => cb(Boolean(snap.val())));
}

// ── 企画 ──

export async function createProject(name: string, description: string): Promise<void> {
  await push(ref(db, 'projects'), { name, description, createdAt: Date.now(), parts: null });
}

export async function updateProject(pid: string, data: { name: string; description: string }): Promise<void> {
  await update(ref(db, `projects/${pid}`), data);
}

/** 企画削除（紐づくワークショップも一括削除） */
export async function deleteProjectCascade(pid: string, workshops: Workshops): Promise<void> {
  const updates: Record<string, null> = { [`projects/${pid}`]: null };
  for (const [wid, ws] of Object.entries(workshops)) {
    if (ws.projectId === pid) updates[`workshops/${wid}`] = null;
  }
  await update(ref(db), updates);
}

// ── 部品 ──

export async function addPart(pid: string, part: Omit<Part, 'updatedAt'>): Promise<void> {
  await push(ref(db, `projects/${pid}/parts`), { ...part, updatedAt: Date.now() });
}

export async function updatePart(
  pid: string,
  partId: string,
  data: Pick<Part, 'name' | 'unit' | 'minStock' | 'perParticipant'>,
): Promise<void> {
  await update(ref(db, `projects/${pid}/parts/${partId}`), { ...data, updatedAt: Date.now() });
}

export async function deletePart(pid: string, partId: string): Promise<void> {
  await remove(ref(db, `projects/${pid}/parts/${partId}`));
}

export async function setPartStock(pid: string, partId: string, stock: number): Promise<void> {
  await update(ref(db, `projects/${pid}/parts/${partId}`), {
    stock: Math.max(0, stock),
    updatedAt: Date.now(),
  });
}

// ── ワークショップ ──

export async function createWorkshop(data: Omit<Workshop, 'createdAt'>): Promise<void> {
  await push(ref(db, 'workshops'), { ...data, createdAt: Date.now() });
}

export async function updateWorkshop(
  wid: string,
  data: Pick<Workshop, 'name' | 'description' | 'date' | 'location' | 'participants'>,
): Promise<void> {
  await update(ref(db, `workshops/${wid}`), data);
}

export async function deleteWorkshop(wid: string): Promise<void> {
  await remove(ref(db, `workshops/${wid}`));
}
