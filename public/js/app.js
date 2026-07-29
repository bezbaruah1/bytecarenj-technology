// =============================================================
// BYTECARE NJ TECHNOLOGY — CUSTOMER PORTAL SCRIPT
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadReviews();
  setupForms();
});

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') toast.style.borderLeftColor = '#ef4444';
  if (type === 'success') toast.style.borderLeftColor = '#10b981';
  toast.innerText = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navigation & Scroll
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open);
    });
  }

  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
    });
  });
}

// Modals Handling
function openBookingModal(serviceName = '') {
  const modal = document.getElementById('bookingModal');
  if (serviceName) {
    const select = document.getElementById('bookService');
    if (select) select.value = serviceName;
  }
  if (modal) modal.classList.add('is-open');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('is-open');
}

function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.add('is-open');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) modal.classList.remove('is-open');
}

// Close modals when clicking backdrop
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('is-open');
    }
  });
});

// Setup Form Listeners
function setupForms() {
  // 1. Tracker Form
  const trackerForm = document.getElementById('trackerForm');
  if (trackerForm) {
    trackerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = document.getElementById('trackInput').value.trim();
      if (!query) return;
      await trackTicket(query);
    });
  }

  // 2. Booking Form
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        serviceType: document.getElementById('bookService').value,
        customerName: document.getElementById('bookName').value,
        phone: document.getElementById('bookPhone').value,
        email: document.getElementById('bookEmail').value,
        deviceModel: document.getElementById('bookDevice').value,
        problemDescription: document.getElementById('bookProblem').value
      };

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          closeBookingModal();
          bookingForm.reset();
          showToast(`Success! Your Ticket ID is: ${data.ticket.id}`, 'success');
          // Auto fill & trigger tracker
          document.getElementById('trackInput').value = data.ticket.id;
          await trackTicket(data.ticket.id);
          document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
        } else {
          showToast(data.error || 'Failed to submit booking', 'error');
        }
      } catch (err) {
        showToast('Server connection error. Please try calling +91 97077 01954.', 'error');
      }
    });
  }

  // 3. Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('contactName').value,
        phone: document.getElementById('contactPhone').value,
        message: document.getElementById('contactMessage').value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          contactForm.reset();
          showToast('Inquiry submitted! We will contact you shortly.', 'success');
        } else {
          showToast(data.error || 'Submission failed', 'error');
        }
      } catch (err) {
        showToast('Error submitting contact form.', 'error');
      }
    });
  }

  // 4. Review Form
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('revName').value,
        location: document.getElementById('revLocation').value,
        service: document.getElementById('revService').value,
        rating: document.getElementById('revRating').value,
        comment: document.getElementById('revComment').value
      };

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          closeReviewModal();
          reviewForm.reset();
          showToast(data.message, 'success');
        } else {
          showToast(data.error || 'Review submission failed', 'error');
        }
      } catch (err) {
        showToast('Error connecting to review server.', 'error');
      }
    });
  }
}

// Track Ticket API
async function trackTicket(identifier) {
  const resultBox = document.getElementById('trackerResult');
  resultBox.style.display = 'block';
  resultBox.innerHTML = `<div style="text-align:center; padding:1rem; color:rgba(255,255,255,0.7);">Searching database for "${identifier}"...</div>`;

  try {
    const res = await fetch(`/api/bookings/track/${encodeURIComponent(identifier)}`);
    const data = await res.json();

    if (!data.success || !data.tickets || data.tickets.length === 0) {
      resultBox.innerHTML = `
        <div style="background:rgba(239,68,68,0.15); border:1px solid #ef4444; padding:1.2rem; border-radius:8px; color:#fca5a5;">
          <strong>No matching tickets found!</strong><br>
          Please verify your Tracking ID (e.g. <code>BC-8942-GLP</code>) or Phone number. You can also call us at <strong>+91 97077 01954</strong>.
        </div>
      `;
      return;
    }

    let html = '';
    data.tickets.forEach(ticket => {
      const stepIndex = getStepIndex(ticket.status);
      const badgeClass = getBadgeClass(ticket.status);

      html += `
        <div class="ticket-result-box">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
              <span class="eyebrow" style="color:var(--color-primary);">TICKET ID: ${ticket.id}</span>
              <h3 style="margin:0.2rem 0; font-family:var(--font-title); color:#fff; font-size:1.3rem;">
                ${ticket.deviceModel || ticket.serviceType}
              </h3>
              <div style="font-size:0.85rem; color:rgba(255,255,255,0.7);">
                Customer: <strong>${ticket.customerName}</strong> | Service: <strong>${ticket.serviceType}</strong>
              </div>
            </div>
            <div>
              <span class="badge ${badgeClass}">${ticket.status}</span>
            </div>
          </div>

          <!-- Stepper Progress Bar -->
          <div class="stepper">
            <div class="step-item ${stepIndex >= 1 ? (stepIndex > 1 ? 'completed' : 'active') : ''}">
              <div class="step-circle">1</div>
              <div class="step-label">Received</div>
            </div>
            <div class="step-item ${stepIndex >= 2 ? (stepIndex > 2 ? 'completed' : 'active') : ''}">
              <div class="step-circle">2</div>
              <div class="step-label">Diagnosing</div>
            </div>
            <div class="step-item ${stepIndex >= 3 ? (stepIndex > 3 ? 'completed' : 'active') : ''}">
              <div class="step-circle">3</div>
              <div class="step-label">In Repair</div>
            </div>
            <div class="step-item ${stepIndex >= 4 ? (stepIndex > 4 ? 'completed' : 'active') : ''}">
              <div class="step-circle">4</div>
              <div class="step-label">Ready Pickup</div>
            </div>
            <div class="step-item ${stepIndex >= 5 ? 'completed' : ''}">
              <div class="step-circle">5</div>
              <div class="step-label">Delivered</div>
            </div>
          </div>

          <div style="background:rgba(0,0,0,0.25); border-radius:8px; padding:1.2rem; border-left:3px solid var(--color-primary); font-size:0.9rem;">
            <div style="margin-bottom:0.4rem;"><strong>Technician Status Update:</strong> ${ticket.techNotes || 'Work in progress.'}</div>
            <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:rgba(255,255,255,0.6); margin-top:0.6rem;">
              <span>Est. Cost: <strong>₹${ticket.estimatedCost || '0'}</strong></span>
              <span>Updated: ${new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `;
    });

    resultBox.innerHTML = html;

  } catch (err) {
    resultBox.innerHTML = `<div style="color:#ef4444; padding:1rem;">Failed to fetch repair status. Check internet connection.</div>`;
  }
}

function trackSample(id) {
  const input = document.getElementById('trackInput');
  if (input) {
    input.value = id;
    trackTicket(id);
    document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
  }
}

function getStepIndex(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending': return 1;
    case 'diagnosing': return 2;
    case 'in repair': return 3;
    case 'ready for pickup': return 4;
    case 'completed': return 5;
    default: return 1;
  }
}

function getBadgeClass(status) {
  switch ((status || '').toLowerCase()) {
    case 'pending': return 'badge-pending';
    case 'diagnosing': return 'badge-diagnosing';
    case 'in repair': return 'badge-repairing';
    case 'ready for pickup': return 'badge-ready';
    case 'completed': return 'badge-completed';
    default: return 'badge-pending';
  }
}

// Fetch Reviews
async function loadReviews() {
  const container = document.getElementById('reviewsGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();

    if (data.success && data.reviews.length > 0) {
      container.innerHTML = data.reviews.map(r => `
        <div class="review-card">
          <div class="stars">${'⭐'.repeat(r.rating)}</div>
          <p>"${r.comment}"</p>
          <div class="reviewer-info">
            <div>
              <div class="reviewer-name">${r.name}</div>
              <div class="reviewer-loc">${r.location} — ${r.service || 'Service'}</div>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}
