// =============================================================
// BYTECARE NJ TECHNOLOGY — SERVER-SIDE FIRESTORE BRIDGE
// Automatically synchronizes Express API requests to Cloud Firestore
// =============================================================

const fs = require('fs');
const path = require('path');

let firestore = null;
let initialized = false;

const defaultFirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBb9vLDNJFmgjPbjSmgSDkAZAUCqlGlgUY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bytecarenj.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "bytecarenj",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "bytecarenj.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "4366889205",
  appId: process.env.FIREBASE_APP_ID || "1:4366889205:web:436dd73ed6df17b41e15bc",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-PNBCT2EGMW"
};

function getFirebaseConfig() {
  try {
    const configPath = path.join(__dirname, 'public', 'js', 'firebase-config.js');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const match = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);
      if (match) {
        let parsed;
        eval('parsed = ' + match[1]);
        if (parsed && parsed.apiKey && parsed.apiKey !== 'YOUR_API_KEY') {
          return parsed;
        }
      }
    }
  } catch (e) {
    // Fallback to default config
  }
  return defaultFirebaseConfig;
}

function initFirestore() {
  if (initialized) return firestore;
  initialized = true;

  try {
    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      return null;
    }

    const { initializeApp, getApps } = require('firebase/app');
    const { getFirestore } = require('firebase/firestore');

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    console.log(`⚡ [Firestore Bridge] Connected to Cloud Firestore project: ${firebaseConfig.projectId}`);
    return firestore;
  } catch (err) {
    console.warn('⚠️ [Firestore Bridge] Could not initialize Firebase client:', err.message);
    return null;
  }
}

// -------------------------------------------------------------
// FIRESTORE SYNC HELPERS (All asynchronous & non-blocking)
// -------------------------------------------------------------

async function syncTicket(ticket) {
  try {
    const db = initFirestore();
    if (!db || !ticket || !ticket.id) return;
    const { doc, setDoc } = require('firebase/firestore');
    await setDoc(doc(db, 'tickets', String(ticket.id)), ticket, { merge: true });
    console.log(`⚡ [Firestore] Ticket ${ticket.id} synced to Cloud Firestore.`);
  } catch (err) {
    console.warn(`⚠️ [Firestore] Failed to sync ticket ${ticket?.id}:`, err.message);
  }
}

async function syncContact(contact) {
  try {
    const db = initFirestore();
    if (!db || !contact || !contact.id) return;
    const { doc, setDoc } = require('firebase/firestore');
    await setDoc(doc(db, 'contacts', String(contact.id)), contact, { merge: true });
    console.log(`⚡ [Firestore] Contact ${contact.id} synced to Cloud Firestore.`);
  } catch (err) {
    console.warn(`⚠️ [Firestore] Failed to sync contact:`, err.message);
  }
}

async function syncReview(review) {
  try {
    const db = initFirestore();
    if (!db || !review || !review.id) return;
    const { doc, setDoc } = require('firebase/firestore');
    const payload = {
      ...review,
      reviewerName: review.name || review.reviewerName || 'Customer',
      rating: Number(review.rating) || 5
    };
    await setDoc(doc(db, 'reviews', String(review.id)), payload, { merge: true });
    console.log(`⚡ [Firestore] Review ${review.id} synced to Cloud Firestore.`);
  } catch (err) {
    console.warn(`⚠️ [Firestore] Failed to sync review:`, err.message);
  }
}

async function syncOwnerProfile(profile) {
  try {
    const db = initFirestore();
    if (!db || !profile) return;
    const { doc, setDoc } = require('firebase/firestore');
    await setDoc(doc(db, 'ownerProfile', 'profile'), profile, { merge: true });
    console.log('⚡ [Firestore] Owner profile synced to Cloud Firestore.');
  } catch (err) {
    console.warn('⚠️ [Firestore] Failed to sync owner profile:', err.message);
  }
}

async function syncService(serviceId, serviceData) {
  try {
    const db = initFirestore();
    if (!db || !serviceId) return;
    const { doc, setDoc } = require('firebase/firestore');
    await setDoc(doc(db, 'services', String(serviceId)), serviceData, { merge: true });
    console.log(`⚡ [Firestore] Service ${serviceId} synced to Cloud Firestore.`);
  } catch (err) {
    console.warn(`⚠️ [Firestore] Failed to sync service:`, err.message);
  }
}

module.exports = {
  initFirestore,
  syncTicket,
  syncContact,
  syncReview,
  syncOwnerProfile,
  syncService
};
