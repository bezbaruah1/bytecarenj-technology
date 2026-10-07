# Firebase Cloud Firestore Integration Guide — Bytecare NJ Technology

This guide walks you through connecting Bytecare NJ to **Google Cloud Firestore**. Everything in the codebase is already built and ready—you just need to create the project in Firebase and paste your credentials.

---

### Step 1: Create a Free Firebase Project
1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **"Add project"** (or **"Create a project"**).
3. Enter a project name, e.g.: `bytecare-nj` (or any name you prefer).
4. Google Analytics is optional (you can enable or disable it).
5. Click **"Create project"** and wait ~10 seconds.

---

### Step 2: Create Cloud Firestore Database
1. In your Firebase Project console, click **"Build"** in the left sidebar, then select **"Firestore Database"**.
2. Click **"Create database"**.
3. **Location**: Select `asia-south1 (Mumbai)` for the fastest response times in Assam / India.
4. **Security Rules**: Select **"Start in test mode"** (we already have a hardened [`firestore.rules`](file:///e:/ByteCare%20NJ%20Technologies/jyotirmoni-web/bytecare/firestore.rules) file ready for production).
5. Click **"Create"**.

---

### Step 3: Get Your Web App Keys (`firebaseConfig`)
1. In the Firebase console, click the **Settings Gear icon ⚙️** at the top-left next to "Project Overview", then choose **"Project settings"**.
2. Scroll down to the **"Your apps"** section and click the **Web icon `</>`**.
3. Register app nickname: `Bytecare Web` (leave Firebase Hosting checkbox unchecked for now) and click **"Register app"**.
4. You will see a `firebaseConfig` snippet that looks like this:
   ```javascript
  const firebaseConfig = {
    apiKey: "AIzaSyBb9vLDNJFmgjPbjSmgSDkAZAUCqlGlgUY",
    authDomain: "bytecarenj.firebaseapp.com",
    projectId: "bytecarenj",
    storageBucket: "bytecarenj.firebasestorage.app",
    messagingSenderId: "4366889205",
    appId: "1:4366889205:web:436dd73ed6df17b41e15bc",
    measurementId: "G-PNBCT2EGMW"
  };
   ```

---

### Step 4: Paste Credentials into Bytecare
1. Open [`public/js/firebase-config.js`](file:///e:/ByteCare%20NJ%20Technologies/jyotirmoni-web/bytecare/public/js/firebase-config.js).
2. Replace the placeholder `firebaseConfig` object at the top with your keys from Step 3.
3. Save the file.

---

### Step 5: Migrate All Existing Shop Data (1 Command)
To automatically push all your shop data (Laptop repair, PC repair, CCTV setup with multiple images, Passport photo printing, Owner profile for Jyotimoni, and sample tickets) straight into Cloud Firestore, run:

```powershell
node seed-firestore.js
```

You will see:
```text
🚀 [Seed] Starting Bytecare NJ Firestore Data Migration...
📦 [Seed] Connecting to Firestore project: bytecare-nj...
⚙️ Seeding 4 Services...
  ✓ Service: Laptop Repair (laptop-repair)
  ✓ Service: PCs Repair (pc-repair)
  ✓ Service: Passport Size Photo Printing (passport-photo)
  ✓ Service: CCTV Installation (cctv-installation)
👤 Seeding Owner Profile (Jyotimoni Bezbaruah)...
  ✓ Owner profile seeded
🎫 Seeding Repair Tickets...
  ✓ Ticket: BC-8942-KMR (Rahul Nath)
...
🎉 [Seed] Migration Complete! All data is live in Cloud Firestore!
```

---

### Features Unlocked with Firebase:
- **Instant Live Tracking**: When a customer tracks `BC-8942-KMR`, the page subscribes via real-time WebSocket. If you change status to *"Ready for Pickup"*, their screen updates live without refreshing.
- **Real-Time Admin Dashboard**: Any new booking submitted on the website pops up on the Admin portal immediately.
- **100% Free Forever**: Backed by Google Cloud's Spark plan (50,000 reads/day, 20,000 writes/day, no credit card required).
