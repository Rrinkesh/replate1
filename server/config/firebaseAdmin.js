const admin = require("firebase-admin");

const initFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log(
        "Firebase Admin SDK initialized successfully with service account cert",
      );
    } catch (error) {
      console.error("Firebase Admin Cert Init Error:", error.message);
      admin.initializeApp({ projectId });
    }
  } else if (projectId) {
    admin.initializeApp({ projectId });
    console.log(
      `Firebase Admin SDK initialized with project ID '${projectId}'`,
    );
  } else {
    // Development mode fallback initialization
    admin.initializeApp({
      projectId: "replate-dev",
    });
    console.warn(
      "Firebase Admin SDK initialized in dev mode fallback. Supply FIREBASE_* credentials in server/.env for production verification.",
    );
  }

  return admin;
};

initFirebaseAdmin();

module.exports = admin;
