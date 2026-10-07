// =============================================================
// BYTECARE NJ TECHNOLOGY — FIRESTORE DATABASE SEED SCRIPT
// Uploads local db.json data directly into Cloud Firestore
// =============================================================

const fs = require('fs');
const path = require('path');

// Check if Firebase Web Config or Service Account is provided
const configPath = path.join(__dirname, 'public', 'js', 'firebase-config.js');
const dbJsonPath = path.join(__dirname, 'data', 'db.json');

async function seed() {
  console.log('🚀 [Seed] Starting Bytecare NJ Firestore Data Migration...');

  if (!fs.existsSync(dbJsonPath)) {
    console.error('❌ [Seed] db.json not found at', dbJsonPath);
    return;
  }

  const rawData = fs.readFileSync(dbJsonPath, 'utf8');
  const dbData = JSON.parse(rawData);

  // Read config
  let configText = fs.readFileSync(configPath, 'utf8');
  let configMatch = configText.match(/const firebaseConfig = ({[\s\S]*?});/);
  if (!configMatch) {
    console.error('❌ [Seed] Could not parse firebaseConfig from public/js/firebase-config.js');
    return;
  }

  let firebaseConfig;
  try {
    eval('firebaseConfig = ' + configMatch[1]);
  } catch (e) {
    console.error('❌ [Seed] Invalid firebaseConfig syntax:', e);
    return;
  }

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
    console.warn('⚠️ [Seed] Please paste your actual Firebase credentials into public/js/firebase-config.js first!');
    console.log('Instructions:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Click Project Settings -> General -> Web App (</>)');
    console.log('3. Copy firebaseConfig into public/js/firebase-config.js');
    console.log('4. Run: node seed-firestore.js\n');
    return;
  }

  console.log(`📦 [Seed] Connecting to Firestore project: ${firebaseConfig.projectId}...`);

  const { initializeApp } = require('firebase/app');
  const { getFirestore, doc, setDoc } = require('firebase/firestore');

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  // 1. Seed Services
  if (Array.isArray(dbData.services)) {
    console.log(`⚙️ Seeding ${dbData.services.length} Services...`);
    for (const service of dbData.services) {
      await setDoc(doc(firestore, 'services', service.id), service);
      console.log(`  ✓ Service: ${service.title} (${service.id})`);
    }
  }

  // 2. Seed Owner Profile
  if (dbData.ownerProfile) {
    console.log('👤 Seeding Owner Profile (Jyotimoni Bezbaruah)...');
    await setDoc(doc(firestore, 'ownerProfile', 'profile'), dbData.ownerProfile);
    console.log('  ✓ Owner profile seeded');
  }

  // 3. Seed Repair Tickets
  if (Array.isArray(dbData.tickets)) {
    console.log(`🎫 Seeding ${dbData.tickets.length} Repair Tickets...`);
    for (const ticket of dbData.tickets) {
      await setDoc(doc(firestore, 'tickets', ticket.id), ticket);
      console.log(`  ✓ Ticket: ${ticket.id} (${ticket.customerName})`);
    }
  }

  // 4. Seed Reviews
  if (Array.isArray(dbData.reviews)) {
    console.log(`⭐ Seeding ${dbData.reviews.length} Customer Reviews...`);
    for (let i = 0; i < dbData.reviews.length; i++) {
      const review = dbData.reviews[i];
      const revId = `review-${i + 1}`;
      const reviewPayload = {
        ...review,
        reviewerName: review.reviewerName || review.name || 'Customer'
      };
      await setDoc(doc(firestore, 'reviews', revId), reviewPayload);
      console.log(`  ✓ Review from: ${review.name || reviewPayload.reviewerName}`);
    }
  }

  // 5. Seed Contacts
  if (Array.isArray(dbData.contacts)) {
    console.log(`✉️ Seeding ${dbData.contacts.length} Contact Messages...`);
    for (const contact of dbData.contacts) {
      await setDoc(doc(firestore, 'contacts', String(contact.id)), contact);
      console.log(`  ✓ Contact from: ${contact.name}`);
    }
  }

  console.log('\n🎉 [Seed] Migration Complete! All data is live in Cloud Firestore!');
}

seed().catch(err => {
  console.error('❌ [Seed] Error during Firestore seed:', err);
});
