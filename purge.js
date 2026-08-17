const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chudsquad-901b3-default-rtdb.firebaseio.com"
});

async function purge() {
  const db = admin.database();
  const thirtyMinsAgo = Date.now() - (30 * 60 * 1000);

  const snapshot = await db.ref("messages")
    .orderByChild("created_at")
    .endAt(thirtyMinsAgo)
    .once("value");

  if (!snapshot.exists()) {
    console.log("No expired messages found.");
    return;
  }

  const updates = {};
  snapshot.forEach((child) => {
    updates[`messages/${child.key}`] = null;
  });

  await db.ref().update(updates);
  console.log("Expired messages purged successfully.");
}

purge()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Purge error:", err);
    process.exit(1);
  });
