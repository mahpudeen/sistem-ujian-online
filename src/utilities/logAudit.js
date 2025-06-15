import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logAudit({ userId, nama, role, aksi, entitas, entitasId, detail }) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId,
      nama,
      role,
      aksi,
      entitas,
      entitasId,
      detail,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Gagal menyimpan audit log:", error);
  }
}
