import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ALLOWED_EMAIL = "taytoddpattison@gmail.com";

function getAdminAuth() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getAuth();
}

/**
 * Verify Firebase ID token from Authorization header
 * Returns the decoded token if valid and email matches, otherwise null
 */
export async function verifyAdmin(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.email !== ALLOWED_EMAIL) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
