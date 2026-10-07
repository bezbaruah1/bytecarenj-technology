// =============================================================
// BYTECARE NJ TECHNOLOGY — CUSTOMER PORTAL SCRIPT
// =============================================================

const BYTECARE_WHATSAPP_NUMBER = '918638594006';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSiteLoader();
  initNavigation();
  initServiceCarousels();
  loadServicesData();
  loadOwnerProfile();
  loadReviews();
  setupForms();
  initWhatsAppWidget();
  initBackToTop();
  initAdminKeyboardShortcut();
});

// =============================================================
// 1. LIGHT / DARK MODE THEME TOGGLE
// =============================================================
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  // Set initial aria-pressed or title based on current theme
  const updateAria = (current) => {
    toggleBtn.setAttribute('aria-label', `Switch to ${current === 'dark' ? 'light' : 'dark'} mode`);
    toggleBtn.setAttribute('title', `Switch to ${current === 'dark' ? 'light' : 'dark'} mode`);
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateAria(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bytecare-theme', next);
    updateAria(next);
  });
}

// =============================================================
// 2. TECHNICIAN BENCH BOOT SEQUENCE (KAMRUP R)
// =============================================================
function initSiteLoader() {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;

  document.body.classList.add('is-loading');

  const progressText = document.getElementById('loaderProgressText');
  const statusText = document.getElementById('loaderStatusText');
  const prevTerminalText = document.getElementById('loaderTerminalPrev');
  const segments = document.querySelectorAll('#loaderSegments .seg');
  const skipBtn = document.getElementById('loaderSkipBtn');

  // Check if user already saw full boot in this tab session
  const hasBootedBefore = sessionStorage.getItem('bytecare_booted_session');
  const stepInterval = hasBootedBefore ? 70 : 220;

  const diagnosticSteps = [
    {
      pct: 15,
      active: 'Probing SMPS voltage rails (19.5V, 5V, 3.3V)...',
      prev: 'POST: System power rails initiated'
    },
    {
      pct: 35,
      active: 'Scanning I2C diagnostic bus & motherboard telemetry...',
      prev: '✓ SMPS: Voltage rails nominal (+19.5V DC stable)'
    },
    {
      pct: 58,
      active: 'Thermal profiling: Silicon core 32.4°C — cooling nominal...',
      prev: '✓ BUS: Chipset handshake & RAM integrity OK'
    },
    {
      pct: 78,
      active: 'Calibrating soldering station & microscope optics...',
      prev: '✓ THERMAL: Cooling pads & heatsink impedance verified'
    },
    {
      pct: 92,
      active: 'Connecting Kamrup (R) repair tracking & WhatsApp API...',
      prev: '✓ BENCH: Hardware diagnostic sensors online'
    },
    {
      pct: 100,
      active: 'All circuits nominal. Welcome to Bytecare NJ.',
      prev: '✓ READY: Kamrup (R) bench systems live'
    }
  ];

  let finished = false;
  let activeTimeouts = [];

  function updateSegments(pct) {
    if (!segments || segments.length === 0) return;
    const activeCount = Math.round((pct / 100) * segments.length);
    segments.forEach((seg, idx) => {
      if (idx < activeCount) seg.classList.add('is-active');
      else seg.classList.remove('is-active');
    });
  }

  function finish(isInstant = false) {
    if (finished) return;
    finished = true;
    activeTimeouts.forEach(t => clearTimeout(t));

    sessionStorage.setItem('bytecare_booted_session', 'true');

    if (progressText) progressText.textContent = '100%';
    if (statusText) statusText.textContent = 'All circuits nominal. Welcome in.';
    if (prevTerminalText) prevTerminalText.textContent = '✓ BENCH READY: Systems fully online';
    updateSegments(100);

    const fadeDelay = isInstant ? 50 : 250;
    setTimeout(() => {
      loader.classList.add('is-complete');
      document.body.classList.remove('is-loading');
      setTimeout(() => loader.remove(), 700);
    }, fadeDelay);
  }

  // Interactive Skip handlers
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      finish(true);
    });
  }

  const keyHandler = (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      finish(true);
      document.removeEventListener('keydown', keyHandler);
    }
  };
  document.addEventListener('keydown', keyHandler);

  // Run the diagnostic step timeline
  diagnosticSteps.forEach((step, index) => {
    const t = setTimeout(() => {
      if (finished) return;
      if (progressText) progressText.textContent = `${String(step.pct).padStart(2, '0')}%`;
      if (statusText) statusText.textContent = step.active;
      if (prevTerminalText) prevTerminalText.textContent = step.prev;
      updateSegments(step.pct);

      if (index === diagnosticSteps.length - 1) {
        finish();
      }
    }, (index + 1) * stepInterval);
    activeTimeouts.push(t);
  });

  const safetyTimeout = setTimeout(() => finish(true), 3800);
  activeTimeouts.push(safetyTimeout);
}

// =============================================================
// 3. WHATSAPP HELPER
// =============================================================
function openWhatsApp(message = '') {
  const defaultMsg = 'Hello Bytecare NJ Technology, I would like to inquire about your services.';
  const text = encodeURIComponent(message || defaultMsg);
  const url = `https://wa.me/${BYTECARE_WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

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

// =============================================================
// 4. NAVIGATION & SMOOTH SCROLLING
// =============================================================
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open);
    });
  }

  document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', (e) => {
      document.body.classList.remove('nav-open');
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  const openBookingBtn = document.getElementById('openBookingBtn');
  if (openBookingBtn) {
    openBookingBtn.addEventListener('click', () => openBookingModal());
  }
}

// Back to Top button
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Secret Admin Shortcut: Ctrl+Shift+A or Alt+A
function initAdminKeyboardShortcut() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
      e.preventDefault();
      window.location.href = '/admin.html';
    }
  });
}

// =============================================================
// 5. SERVICES MULTI-IMAGE GALLERY CAROUSELS
// =============================================================
function initServiceCarousels() {
  const carousels = document.querySelectorAll('.service-img-wrapper');
  carousels.forEach(wrapper => {
    setupCarouselEvents(wrapper);
  });
}

function setupCarouselEvents(wrapper) {
  const slides = wrapper.querySelectorAll('.service-slide');
  const dots = wrapper.querySelectorAll('.service-nav-dot');
  const prevBtn = wrapper.querySelector('.service-arrow-prev');
  const nextBtn = wrapper.querySelector('.service-arrow-next');

  if (slides.length <= 1) return;

  let currentIndex = 0;

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      if (i === currentIndex) slide.classList.add('is-active');
      else slide.classList.remove('is-active');
    });

    dots.forEach((dot, i) => {
      if (i === currentIndex) dot.classList.add('is-active');
      else dot.classList.remove('is-active');
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(i);
    });
  });
}

// Fetch dynamic service images from server to stay in sync with Admin changes
async function loadServicesData() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success && data.services) {
      data.services.forEach(s => {
        const wrapper = document.querySelector(`[data-service-id="${s.id}"]`);
        if (wrapper && Array.isArray(s.images) && s.images.length > 0) {
          renderServiceGallery(wrapper, s.images, s.title);
        }
      });
    }
  } catch (err) {
    console.warn('Could not sync dynamic service images:', err);
  }
}

function renderServiceGallery(wrapper, images, title) {
  const tag = wrapper.querySelector('.service-img-tag');
  const tagHtml = tag ? tag.outerHTML : '';

  let slidesHtml = images.map((img, i) => `
    <div class="service-slide ${i === 0 ? 'is-active' : ''}">
      <img src="${img}" alt="${title} photo ${i + 1}" onerror="this.src='/images/cracked-screen.jpg'">
    </div>
  `).join('');

  let navHtml = '';
  if (images.length > 1) {
    navHtml = `
      <button type="button" class="service-arrow service-arrow-prev" aria-label="Previous image">‹</button>
      <button type="button" class="service-arrow service-arrow-next" aria-label="Next image">›</button>
      <div class="service-nav-dots">
        ${images.map((_, i) => `<button type="button" class="service-nav-dot ${i === 0 ? 'is-active' : ''}" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>
    `;
  }

  wrapper.innerHTML = slidesHtml + tagHtml + navHtml;
  setupCarouselEvents(wrapper);
}

// =============================================================
// 6. OWNER PROFILE (WHY US SECTION)
// =============================================================
async function loadOwnerProfile() {
  try {
    const res = await fetch('/api/owner');
    const data = await res.json();
    if (data.success && data.owner) {
      const o = data.owner;
      const avatar = document.getElementById('whyUsOwnerImg');
      const name = document.getElementById('whyUsOwnerName');
      const bio = document.getElementById('whyUsOwnerBio');

      if (avatar && o.image) avatar.src = o.image;
      if (name && o.name) name.innerText = `Meet ${o.name}`;
      if (bio && o.role) {
        bio.innerText = `${o.role} at Bytecare NJ Technology — Kamrup (R), Assam`;
      }
    }
  } catch (err) {
    console.warn('Could not load dynamic owner profile:', err);
  }
}

// =============================================================
// 7. MODALS
// =============================================================
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

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('is-open');
    }
  });
});

// =============================================================
// 8. FORMS & TRACKING
// =============================================================
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
        let createdTicket = null;
        let apiSucceeded = false;

        try {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && data.ticket) {
              createdTicket = data.ticket;
              apiSucceeded = true;
            }
          }
        } catch (fetchErr) {
          console.warn('API /api/bookings unreachable, using Cloud Firestore fallback:', fetchErr);
        }

        // Direct Cloud Firestore write / sync
        if (window.BytecareFirebase && window.BytecareFirebase.isConfigured()) {
          try {
            const fsDb = window.BytecareFirebase.getDb();
            if (fsDb) {
              if (!createdTicket) {
                const ticketId = window.BytecareFirebase.generateTicketId();
                createdTicket = {
                  id: ticketId,
                  ...payload,
                  status: 'Pending',
                  estimatedCost: 0,
                  techNotes: 'Job request submitted online (bytecarenj.in). Awaiting technician inspection.',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
              }
              await fsDb.collection('tickets').doc(createdTicket.id).set(createdTicket, { merge: true });
              console.log('⚡ [Cloud Firestore] Ticket saved successfully:', createdTicket.id);
            }
          } catch (fsErr) {
            console.warn('Firestore direct write notice:', fsErr);
          }
        }

        if (createdTicket) {
          closeBookingModal();
          bookingForm.reset();
          showToast(`Success! Your Ticket ID is: ${createdTicket.id}`, 'success');
          document.getElementById('trackInput').value = createdTicket.id;
          await trackTicket(createdTicket.id);
          document.getElementById('track').scrollIntoView({ behavior: 'smooth' });
        } else {
          showToast('Failed to submit booking. Please call +91 ' + BYTECARE_WHATSAPP_NUMBER.slice(-10), 'error');
        }
      } catch (err) {
        showToast(`Server connection error. Please call +91 ${BYTECARE_WHATSAPP_NUMBER.slice(-10)}.`, 'error');
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
        let sent = false;
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.success) sent = true;
          }
        } catch (_) {}

        // Direct Cloud Firestore write for contact inquiry
        if (window.BytecareFirebase && window.BytecareFirebase.isConfigured()) {
          try {
            const fsDb = window.BytecareFirebase.getDb();
            const contactId = `MSG-${Date.now()}`;
            await fsDb.collection('contacts').doc(contactId).set({
              id: contactId,
              ...payload,
              status: 'Unread',
              createdAt: new Date().toISOString()
            });
            sent = true;
          } catch (fsErr) {
            console.warn('Firestore contact write notice:', fsErr);
          }
        }

        if (sent) {
          contactForm.reset();
          showToast('Inquiry submitted! We will contact you shortly.', 'success');
        } else {
          showToast('Error submitting contact form.', 'error');
        }
      } catch (err) {
        showToast('Error submitting contact form.', 'error');
      }
    });

    const contactWhatsAppBtn = document.getElementById('contactWhatsAppBtn');
    if (contactWhatsAppBtn) {
      contactWhatsAppBtn.addEventListener('click', () => {
        const name = document.getElementById('contactName')?.value.trim();
        const phone = document.getElementById('contactPhone')?.value.trim();
        const msg = document.getElementById('contactMessage')?.value.trim();

        let formattedMsg = 'Hello Bytecare NJ Technology,';
        if (name) formattedMsg += ` my name is ${name}.`;
        if (phone) formattedMsg += ` (Phone: ${phone})`;
        if (msg) formattedMsg += `\n\nInquiry: ${msg}`;
        else formattedMsg += `\n\nI have an inquiry regarding your computer repair & tech services in Kamrup (R).`;

        openWhatsApp(formattedMsg);
      });
    }
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
    let tickets = [];
    try {
      const res = await fetch(`/api/bookings/track/${encodeURIComponent(identifier)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.tickets)) {
          tickets = data.tickets;
        }
      }
    } catch (_) {}

    // Direct Cloud Firestore lookup fallback
    if (tickets.length === 0 && window.BytecareFirebase && window.BytecareFirebase.isConfigured()) {
      try {
        const fsDb = window.BytecareFirebase.getDb();
        if (fsDb) {
          const cleanId = (identifier || '').trim().toUpperCase();
          const cleanPhone = (identifier || '').trim().replace(/\D/g, '');

          const docSnap = await fsDb.collection('tickets').doc(cleanId).get();
          if (docSnap.exists) {
            tickets = [docSnap.data()];
          } else if (cleanPhone.length >= 6) {
            const querySnap = await fsDb.collection('tickets').where('phone', '==', cleanPhone).get();
            if (!querySnap.empty) {
              querySnap.forEach(d => tickets.push(d.data()));
            }
          }
        }
      } catch (fsErr) {
        console.warn('Firestore tracking lookup notice:', fsErr);
      }
    }

    if (tickets.length === 0) {
      resultBox.innerHTML = `
        <div style="background:rgba(239,68,68,0.15); border:1px solid #ef4444; padding:1.2rem; border-radius:8px; color:#fca5a5;">
          <strong>No matching tickets found!</strong><br>
          Please verify your Tracking ID (e.g. <code>BC-8942-KMR</code>) or Phone number.<br>
          <div style="margin-top: 0.9rem; display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
            <a href="https://wa.me/${BYTECARE_WHATSAPP_NUMBER}?text=Hello%20Bytecare%20NJ%2C%20I%20need%20help%20tracking%20my%20repair%20for%3A%20${encodeURIComponent(identifier)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-sm">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.44 0-2.86-.38-4.11-1.12l-.3-.18-3.05.8 1.01-2.97-.2-.31a8.2 8.2 0 0 1-1.26-4.46c0-4.55 3.7-8.24 8.25-8.24zm4.52 11.64c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
              Chat on WhatsApp (+91 86385 94006)
            </a>
            <a href="tel:+918638594006" class="btn-secondary btn-sm" style="color:#ffffff; border-color:rgba(255,255,255,0.4);">
              Call Shop
            </a>
          </div>
        </div>
      `;
      return;
    }

    let html = '';
    tickets.forEach(ticket => {
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
            <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:rgba(255,255,255,0.6); margin-top:0.6rem; flex-wrap:wrap; gap:0.4rem;">
              <span>Est. Cost: <strong>₹${ticket.estimatedCost || '0'}</strong></span>
              <span>Updated: ${new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top:0.9rem; display:flex; justify-content:flex-end;">
            <a href="https://wa.me/${BYTECARE_WHATSAPP_NUMBER}?text=Hello%20Bytecare%20NJ%2C%20I%20am%20inquiring%20about%20my%20repair%20ticket%20${ticket.id}%20(${encodeURIComponent(ticket.deviceModel || ticket.serviceType)})" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-sm">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c4.55 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83a8.19 8.19 0 0 1-5.82 2.41h-.01c-1.44 0-2.86-.38-4.11-1.12l-.3-.18-3.05.8 1.01-2.97-.2-.31a8.2 8.2 0 0 1-1.26-4.46c0-4.55 3.7-8.24 8.25-8.24zm4.52 11.64c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>
              <span>Chat with Tech on WhatsApp</span>
            </a>
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

// =============================================================
// 9. REVIEWS
// =============================================================
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

// =============================================================
// 10. FLOATING WHATSAPP CHAT WIDGET
// =============================================================
function initWhatsAppWidget() {
  const trigger = document.getElementById('whatsappFloatTrigger');
  const chatBox = document.getElementById('whatsappChatBox');
  const closeBtn = document.getElementById('closeWhatsAppBox');
  const sendBtn = document.getElementById('whatsappSendBtn');
  const input = document.getElementById('whatsappCustomMsg');
  const chips = document.querySelectorAll('.wa-chip');
  const badge = document.querySelector('.whatsapp-badge');

  if (!trigger || !chatBox) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = chatBox.classList.toggle('is-open');
    if (isOpen) {
      if (badge) badge.style.display = 'none';
      setTimeout(() => input?.focus(), 150);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      chatBox.classList.remove('is-open');
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.getAttribute('data-msg');
      openWhatsApp(msg);
      chatBox.classList.remove('is-open');
    });
  });

  function handleCustomSend() {
    const text = input ? input.value.trim() : '';
    openWhatsApp(text || 'Hello Bytecare NJ Technology, I would like to inquire about your services.');
    if (input) input.value = '';
    chatBox.classList.remove('is-open');
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleCustomSend);
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCustomSend();
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (!chatBox.contains(e.target) && !trigger.contains(e.target)) {
      chatBox.classList.remove('is-open');
    }
  });
}
