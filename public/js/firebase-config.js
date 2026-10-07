// =============================================================
// BYTECARE NJ TECHNOLOGY — FIREBASE CONFIGURATION & ADAPTER
// Cloud Firestore Real-time Database Integration (Kamrup (R), Assam)
// =============================================================

/**
 * Replace the placeholder values below with your Firebase Web App credentials.
 * Obtain these from:
 * 1. Go to https://console.firebase.google.com/
 * 2. Select your Project (or Create Project: "bytecare-nj")
 * 3. Click Project Settings (Gear icon) -> General
 * 4. Under "Your apps", click Web (</>) and copy the firebaseConfig object below.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBb9vLDNJFmgjPbjSmgSDkAZAUCqlGlgUY",
  authDomain: "bytecarenj.firebaseapp.com",
  projectId: "bytecarenj",
  storageBucket: "bytecarenj.firebasestorage.app",
  messagingSenderId: "4366889205",
  appId: "1:4366889205:web:436dd73ed6df17b41e15bc",
  measurementId: "G-PNBCT2EGMW"
};

(function () {
  let app = null;
  let db = null;
  let configured = false;

  function isConfigured() {
    return Boolean(
      firebaseConfig.apiKey &&
      firebaseConfig.apiKey !== "YOUR_API_KEY" &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== "YOUR_PROJECT_ID"
    );
  }

  // Initialize Firebase when valid credentials are provided
  if (typeof firebase !== 'undefined' && isConfigured()) {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
      } else {
        app = firebase.app();
      }
      db = firebase.firestore();
      configured = true;
      console.log('⚡ [Bytecare Firebase] Successfully connected to Cloud Firestore (' + firebaseConfig.projectId + ')');
    } catch (err) {
      console.warn('⚠️ [Bytecare Firebase] Initialization error:', err);
      configured = false;
    }
  } else {
    console.info('ℹ️ [Bytecare Firebase] Standby mode: using local Express/mock data until Firebase credentials are provided.');
  }

  // Global helper API for both app.js and admin.js
  window.BytecareFirebase = {
    config: firebaseConfig,
    isConfigured: function () { return configured; },
    getApp: function () { return app; },
    getDb: function () { return db; },

    // Generate unique repair ticket ID: BC-XXXX-KMR
    generateTicketId: function () {
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `BC-${rand}-KMR`;
    },

    // Collections helper
    collections: {
      TICKETS: 'tickets',
      SERVICES: 'services',
      OWNER: 'ownerProfile',
      REVIEWS: 'reviews',
      CONTACTS: 'contacts'
    }
  };
})();
