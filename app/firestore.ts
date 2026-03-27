// app/firestore.ts
import {
  doc, getDoc, setDoc, collection, query, where,
  onSnapshot, addDoc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ─── ユーザープロフィール ───
export async function getUserProfile(uid) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

export async function setUserProfile(uid, data) {
  if (!db) return;
  try {
    await setDoc(doc(db, "users", uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) { console.error("setUserProfile error:", e); }
}

// ─── 施設コード ───
export async function getFacility(code) {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "facilities", code));
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

export async function createFacility(code, ownerUid, name) {
  if (!db) return;
  try {
    await setDoc(doc(db, "facilities", code), {
      name, ownerUid, createdAt: serverTimestamp()
    });
  } catch (e) { console.error("createFacility error:", e); }
}

// ─── 学習データの同期 ───
export async function syncLearnerStats(uid, stats, streak, profile) {
  if (!db || !uid) return;
  try {
    const accuracy = stats.totalAnswered > 0
      ? Math.round(stats.totalCorrect / stats.totalAnswered * 100) : 0;

    // 科目別正答率を計算
    const subjectAccuracy = {};
    Object.entries(stats.byCategory || {}).forEach(([cat, val]) => {
      if (val.answered > 0) {
        subjectAccuracy[cat] = {
          attempts: val.answered,
          correct: val.correct,
        };
      }
    });

    await setDoc(doc(db, "learnerStats", uid), {
      name: profile?.name || "Unknown",
      facilityCode: profile?.facilityCode || "",
      totalAnswered: stats.totalAnswered,
      totalCorrect: stats.totalCorrect,
      accuracy,
      streak: streak || { lastDate: null, count: 0 },
      subjectAccuracy,
      lastActive: serverTimestamp(),
    }, { merge: true });
  } catch (e) { console.error("syncLearnerStats error:", e); }
}

// ─── メンター：学習者一覧を購読 ───
export function subscribeToLearners(facilityCode, callback) {
  if (!db) return () => {};
  const q = query(
    collection(db, "learnerStats"),
    where("facilityCode", "==", facilityCode)
  );
  return onSnapshot(q, (snap) => {
    const learners = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    callback(learners);
  }, (err) => { console.error("subscribeToLearners error:", err); });
}

// ─── メッセージ送信 ───
export async function sendMessage(toUid, fromName, text) {
  if (!db) return false;
  try {
    await addDoc(collection(db, "messages"), {
      toUid, fromName, text, read: false, createdAt: serverTimestamp()
    });
    return true;
  } catch { return false; }
}

// ─── メッセージ購読 ───
export function subscribeToMessages(uid, callback) {
  if (!db) return () => {};
  const q = query(collection(db, "messages"), where("toUid", "==", uid));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    msgs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(msgs);
  });
}

export async function markMessageRead(uid, msgId) {
  if (!db) return;
  try { await updateDoc(doc(db, "messages", msgId), { read: true }); } catch {}
}
