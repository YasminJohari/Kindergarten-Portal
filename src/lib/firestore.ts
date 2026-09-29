import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type WhereFilterOp,
} from 'firebase/firestore';

/** A single Firestore where() clause, e.g. ['parentUid', '==', uid]. */
export type WhereFilter = [fieldPath: string, op: WhereFilterOp, value: DocumentData];

interface SubscribeOptions {
  /**
   * Server-side filters. Security rules reject a *whole* query when any
   * candidate row would fail, so a guardian must never subscribe to a full
   * collection — always pass their own ownership filter.
   */
  filters?: WhereFilter[];
}

/** createdAt reaches us as an ISO string, a Timestamp or a Date depending on
 *  how the document was written; normalise it so sorting never throws. */
function createdAtValue(row: DocumentData): number {
  const raw = (row as { createdAt?: unknown }).createdAt;
  if (!raw) return 0;
  if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw).getTime() || 0;
  const maybe = raw as { seconds?: number; toDate?: () => Date };
  if (typeof maybe?.toDate === 'function') return maybe.toDate().getTime();
  if (typeof maybe?.seconds === 'number') return maybe.seconds * 1000;
  return 0;
}

export function subscribeCollection<T extends DocumentData>(
  path: string,
  onData: (rows: T[]) => void,
  onError?: (err: unknown) => void,
  options: SubscribeOptions = {}
): () => void {
  if (!isFirebaseConfigured) return () => undefined;
  const filters = options.filters;
  // A filter list that resolved to empty (a parent with no linked child yet)
  // must not silently widen into a read of everybody's records.
  if (filters && filters.length === 0) return () => undefined;

  try {
    // Filtered queries are sorted in memory rather than with orderBy(): a
    // where() on one field combined with orderBy() on another forces every
    // reader to create a composite index in the Firestore console first.
    const constraints = (filters ?? []).map(([field, op, value]) => where(field, op, value));
    const q = constraints.length
      ? query(collection(db, path), ...constraints)
      : query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })) as T[];
        if (constraints.length) rows.sort((a, b) => createdAtValue(b) - createdAtValue(a));
        onData(rows);
      },
      (err) => onError?.(err)
    );
  } catch (err) {
    onError?.(err);
    return () => undefined;
  }
}

/**
 * Find the guardian account that owns a student so a new invoice can be stamped
 * with a `parentUid` the security rules can check. Reading another user's
 * profile is allowed for staff only, so this is a staff-side helper.
 */
export async function findParentUidByStudent(studentId: string): Promise<string | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDocs(
      query(collection(db, 'users'), where('childIds', 'array-contains', studentId), limit(1))
    );
    return snap.empty ? null : snap.docs[0].id;
  } catch {
    // Rules not deployed yet, or no guardian linked to this student.
    return null;
  }
}

export async function saveDoc(path: string, id: string, data: DocumentData): Promise<void> {
  if (!isFirebaseConfigured) return;
  await setDoc(doc(db, path, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function addToCollection(path: string, data: DocumentData): Promise<string> {
  if (!isFirebaseConfigured) throw new Error('Firebase belum dikonfigurasi.');
  const ref = await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateDocFields(path: string, id: string, data: DocumentData): Promise<void> {
  if (!isFirebaseConfigured) return;
  await updateDoc(doc(db, path, id), { ...data, updatedAt: serverTimestamp() });
}
