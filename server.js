const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const fbSync = require('./firebase-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware for Admin
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = 'bytecare-admin-secret-token-2026';

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized admin access' });
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// Get services catalog
app.get('/api/services', (req, res) => {
  const data = db.readDb();
  res.json({ success: true, services: data.services });
});

// Create new repair/service booking
app.post('/api/bookings', (req, res) => {
  try {
    const { customerName, phone, email, serviceType, deviceModel, problemDescription } = req.body;
    if (!customerName || !phone || !serviceType) {
      return res.status(400).json({ success: false, error: 'Name, Phone, and Service Type are required fields.' });
    }

    const newTicket = db.addTicket({
      customerName,
      phone,
      email,
      serviceType,
      deviceModel,
      problemDescription
    });

    // Auto-sync new booking to Cloud Firestore
    fbSync.syncTicket(newTicket);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully!',
      ticket: newTicket
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, error: 'Failed to process booking request' });
  }
});

// Live repair tracking lookup
app.get('/api/bookings/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Tracking ID or Phone number is required.' });
    }

    let matches = db.getTicketByIdentifier(identifier);
    if (matches.length === 0) {
      // Direct Cloud Firestore lookup fallback
      try {
        const dbFs = fbSync.initFirestore();
        if (dbFs) {
          const { doc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');
          const cleanId = identifier.trim().toUpperCase();
          const cleanPhone = identifier.trim().replace(/\D/g, '');

          const docSnap = await getDoc(doc(dbFs, 'tickets', cleanId));
          if (docSnap.exists()) {
            matches = [docSnap.data()];
          } else if (cleanPhone.length >= 6) {
            const q = query(collection(dbFs, 'tickets'), where('phone', '==', cleanPhone));
            const qSnap = await getDocs(q);
            qSnap.forEach(d => matches.push(d.data()));
          }
        }
      } catch (fsErr) {
        console.warn('Firestore fallback track error:', fsErr);
      }
    }

    if (matches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active repair tickets found matching that Tracking ID or Phone Number.'
      });
    }

    res.json({
      success: true,
      count: matches.length,
      tickets: matches
    });
  } catch (err) {
    console.error('Error tracking ticket:', err);
    res.status(500).json({ success: false, error: 'Failed to track repair ticket' });
  }
});

// Contact form submission
app.post('/api/contact', (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ success: false, error: 'Name, Phone, and Message are required.' });
    }

    const contact = db.addContact({ name, phone, email, subject, message });
    // Auto-sync contact to Cloud Firestore
    fbSync.syncContact(contact);
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! Our team will contact you shortly.',
      contact
    });
  } catch (err) {
    console.error('Error saving contact message:', err);
    res.status(500).json({ success: false, error: 'Failed to submit contact message' });
  }
});

// Fetch approved customer reviews
app.get('/api/reviews', (req, res) => {
  try {
    const reviews = db.getReviews(true);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

// Submit a new customer review
app.post('/api/reviews', (req, res) => {
  try {
    const { name, location, rating, comment, service } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Name, Rating, and Review content are required.' });
    }

    const newReview = db.addReview({ name, location, rating, comment, service });
    // Auto-sync review to Cloud Firestore
    fbSync.syncReview(newReview);
    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will appear on our website after quick moderation.',
      review: newReview
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// -------------------------------------------------------------
// ADMIN API ENDPOINTS
// -------------------------------------------------------------

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({
      success: true,
      token: ADMIN_TOKEN,
      message: 'Admin authentication successful'
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid admin password' });
  }
});

// Admin get dashboard stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({ success: true, stats: db.getStats() });
});

// Admin get all repair tickets
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  let tickets = db.getTickets();
  try {
    const dbFs = fbSync.initFirestore();
    if (dbFs) {
      const { collection, getDocs } = require('firebase/firestore');
      const snap = await getDocs(collection(dbFs, 'tickets'));
      const map = new Map();
      tickets.forEach(t => map.set(t.id, t));
      snap.forEach(d => map.set(d.id, d.data()));
      tickets = Array.from(map.values());
      tickets.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  } catch (fsErr) {
    console.warn('Firestore admin bookings query notice:', fsErr);
  }
  res.json({ success: true, tickets });
});

// Admin update repair ticket
app.patch('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  let updated = db.updateTicket(id, req.body);

  if (!updated) {
    // Check and update in Cloud Firestore directly
    try {
      const dbFs = fbSync.initFirestore();
      if (dbFs) {
        const { doc, getDoc, setDoc } = require('firebase/firestore');
        const docRef = doc(dbFs, 'tickets', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          updated = {
            ...snap.data(),
            ...req.body,
            updatedAt: new Date().toISOString()
          };
          await setDoc(docRef, updated, { merge: true });
        }
      }
    } catch (fsErr) {
      console.warn('Firestore fallback update notice:', fsErr);
    }
  }

  if (!updated) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }
  // Auto-sync updated ticket to Cloud Firestore
  fbSync.syncTicket(updated);
  res.json({ success: true, ticket: updated });
});

// Admin get all contact inquiries
app.get('/api/admin/contacts', requireAdmin, (req, res) => {
  res.json({ success: true, contacts: db.getContacts() });
});

// Admin update contact status
app.patch('/api/admin/contacts/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateContact(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Contact not found' });
  }
  // Auto-sync updated contact to Cloud Firestore
  fbSync.syncContact(updated);
  res.json({ success: true, contact: updated });
});

// Admin get all reviews (including unapproved)
app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  res.json({ success: true, reviews: db.getReviews(false) });
});

// Admin approve / moderate review
app.patch('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateReview(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }
  // Auto-sync moderated review to Cloud Firestore
  fbSync.syncReview(updated);
  res.json({ success: true, review: updated });
});

// -------------------------------------------------------------
// OWNER PROFILE & SERVICES MEDIA ENDPOINTS
// -------------------------------------------------------------

// Public: Get Owner Profile (for Why Us section)
app.get('/api/owner', (req, res) => {
  res.json({ success: true, owner: db.getOwnerProfile() });
});

// Admin: Update Owner Profile
app.patch('/api/admin/owner', requireAdmin, (req, res) => {
  const updated = db.updateOwnerProfile(req.body);
  fbSync.syncOwnerProfile(updated);
  res.json({ success: true, owner: updated });
});

// Admin: Get all services
app.get('/api/admin/services', requireAdmin, (req, res) => {
  res.json({ success: true, services: db.getServices() });
});

// Admin: Update a service
app.patch('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateService(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  fbSync.syncService(id, updated);
  res.json({ success: true, service: updated });
});

// Admin: Add image to service
app.post('/api/admin/services/:id/images', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ success: false, error: 'imageUrl is required' });
  }
  const updated = db.addServiceImage(id, imageUrl);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.json({ success: true, service: updated });
});

// Admin: Delete image from service
app.delete('/api/admin/services/:id/images/:index', requireAdmin, (req, res) => {
  const { id, index } = req.params;
  const updated = db.removeServiceImage(id, parseInt(index, 10));
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Service not found' });
  }
  res.json({ success: true, service: updated });
});

// List available image assets
app.get('/api/gallery-images', (req, res) => {
  try {
    const fs = require('fs');
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      return res.json({ success: true, images: [] });
    }
    const files = fs.readdirSync(imagesDir)
      .filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f))
      .map(f => `/images/${f}`);
    res.json({ success: true, images: files });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to list images' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bytecare NJ Full Stack Application running on http://localhost:${PORT}`);
  });
}

module.exports = app;
