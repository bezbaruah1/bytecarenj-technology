const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

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
app.get('/api/bookings/track/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Tracking ID or Phone number is required.' });
    }

    const matches = db.getTicketByIdentifier(identifier);
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
app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  res.json({ success: true, tickets: db.getTickets() });
});

// Admin update repair ticket
app.patch('/api/admin/bookings/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const updated = db.updateTicket(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Ticket not found' });
  }
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
  res.json({ success: true, review: updated });
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
