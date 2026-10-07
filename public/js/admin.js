// =============================================================
// BYTECARE NJ TECHNOLOGY — ADMIN PORTAL SCRIPT
// =============================================================

let adminToken = localStorage.getItem('adminToken') || '';
let availableImagesList = [];

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();

  const statusBadge = document.getElementById('firebaseStatusBadge');
  if (statusBadge && window.BytecareFirebase) {
    if (window.BytecareFirebase.isConfigured()) {
      statusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      statusBadge.style.color = '#10b981';
      statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
      statusBadge.innerText = '⚡ Firestore: Connected';
    } else {
      statusBadge.style.background = 'rgba(245, 158, 11, 0.18)';
      statusBadge.style.color = '#f59e0b';
      statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      statusBadge.innerText = 'DB: Local Standby';
    }
  }

  if (adminToken) {
    showDashboard();
  }

  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pass = document.getElementById('adminPass').value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pass })
        });
        const data = await res.json();

        if (data.success) {
          adminToken = data.token;
          localStorage.setItem('adminToken', adminToken);
          showToast('Authenticated successfully!', 'success');
          showDashboard();
        } else {
          showToast(data.error || 'Invalid password', 'error');
        }
      } catch (err) {
        showToast('Login request failed', 'error');
      }
    });
  }

  // Owner profile form
  const ownerForm = document.getElementById('ownerProfileForm');
  if (ownerForm) {
    ownerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveOwnerProfile();
    });
  }

  // Live preview image when typing URL
  const ownerImgInput = document.getElementById('ownerImgInput');
  if (ownerImgInput) {
    ownerImgInput.addEventListener('input', () => {
      const preview = document.getElementById('ownerPreviewImg');
      if (preview && ownerImgInput.value) {
        preview.src = ownerImgInput.value;
      }
    });
  }
});

// Theme Toggle
function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('bytecare-theme', next);
  });
}

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

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  adminToken = '';
  document.getElementById('dashboardBox').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('loginBox').style.display = 'block';
  showToast('Logged out.', 'info');
}

function showDashboard() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('dashboardBox').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'inline-block';
  loadDashboard();
}

async function loadDashboard() {
  await Promise.all([
    loadStats(),
    loadTickets(),
    loadServicesAdmin(),
    loadOwnerProfile(),
    loadContacts(),
    loadReviews(),
    loadGalleryImagesList()
  ]);
}

async function loadGalleryImagesList() {
  try {
    const res = await fetch('/api/gallery-images');
    const data = await res.json();
    if (data.success) {
      availableImagesList = data.images || [];
    }
  } catch (err) {
    console.error('Error fetching gallery images list:', err);
  }
}

async function loadStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('statTotal').innerText = data.stats.totalTickets;
      document.getElementById('statActive').innerText = data.stats.activeTickets;
      document.getElementById('statReady').innerText = data.stats.readyTickets;
      document.getElementById('statInquiries').innerText = data.stats.unreadContacts;
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// =============================================================
// TICKETS
// =============================================================
async function loadTickets() {
  const tbody = document.getElementById('ticketsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/bookings', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (!data.success || !data.tickets) {
      tbody.innerHTML = `<tr><td colspan="8">Failed to load tickets.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.tickets.map(t => `
      <tr id="tr-ticket-${t.id}">
        <td><strong>${t.id}</strong></td>
        <td>
          <strong>${t.customerName}</strong><br>
          <span style="font-size:0.78rem; color:var(--color-text-muted);">${t.email || ''}</span>
        </td>
        <td>
          <a href="tel:${t.phone}">${t.phone}</a><br>
          <a href="https://wa.me/91${(t.phone || '').replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(t.customerName)}%2C%20this%20is%20Bytecare%20NJ%20Technology%20regarding%20your%20repair%20ticket%20${t.id}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:3px; color:#25D366; font-size:0.75rem; text-decoration:none; font-weight:600; margin-top:3px;">
            💬 WhatsApp
          </a>
        </td>
        <td>
          <strong>${t.serviceType}</strong><br>
          <span style="font-size:0.8rem; color:var(--color-text-muted);">${t.deviceModel || 'N/A'}</span>
        </td>
        <td>
          <div style="font-size:0.82rem; margin-bottom:0.4rem; max-width:200px;">${t.problemDescription || ''}</div>
          <textarea id="notes-${t.id}" class="notes-input" placeholder="Technician Notes...">${t.techNotes || ''}</textarea>
        </td>
        <td>
          <select id="status-${t.id}" class="status-select">
            <option value="Pending" ${t.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Diagnosing" ${t.status === 'Diagnosing' ? 'selected' : ''}>Diagnosing</option>
            <option value="In Repair" ${t.status === 'In Repair' ? 'selected' : ''}>In Repair</option>
            <option value="Ready for Pickup" ${t.status === 'Ready for Pickup' ? 'selected' : ''}>Ready for Pickup</option>
            <option value="Completed" ${t.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <input type="number" id="cost-${t.id}" class="form-control" style="width:100px; padding:0.3rem;" value="${t.estimatedCost || 0}">
        </td>
        <td>
          <button class="btn-primary btn-sm" onclick="saveTicketUpdate('${t.id}')">Save</button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error loading tickets:', err);
  }
}

async function saveTicketUpdate(id) {
  const status = document.getElementById(`status-${id}`).value;
  const estimatedCost = parseFloat(document.getElementById(`cost-${id}`).value) || 0;
  const techNotes = document.getElementById(`notes-${id}`).value;

  try {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status, estimatedCost, techNotes })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Updated Ticket ${id}`, 'success');
      loadStats();

      // Direct client sync to Cloud Firestore
      if (window.BytecareFirebase && window.BytecareFirebase.isConfigured()) {
        try {
          const fsDb = window.BytecareFirebase.getDb();
          if (fsDb) {
            await fsDb.collection('tickets').doc(id).set({
              status,
              estimatedCost,
              techNotes,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log(`⚡ [Client Firestore] Ticket ${id} synced.`);
          }
        } catch (fsErr) {
          console.warn('Firestore ticket sync notice:', fsErr);
        }
      }
    } else {
      showToast(data.error || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Failed to save update', 'error');
  }
}

// =============================================================
// SERVICES & MULTI-IMAGE MANAGEMENT
// =============================================================
async function loadServicesAdmin() {
  const container = document.getElementById('servicesAdminContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/services', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (!data.success || !data.services) {
      container.innerHTML = `<div style="grid-column: 1/-1;">Failed to load services.</div>`;
      return;
    }

    container.innerHTML = data.services.map(s => {
      const images = Array.isArray(s.images) ? s.images : [];
      return `
        <div class="service-admin-card" id="service-card-${s.id}">
          <div class="service-admin-header">
            <div>
              <h4 style="margin:0 0 0.2rem; font-family:var(--font-title); font-size:1.15rem; color:var(--color-navy-brand);">${s.title}</h4>
              <span class="service-badge">${s.id}</span>
            </div>
            <span style="font-size:0.75rem; color:var(--color-text-muted); font-family:var(--font-mono);">${images.length} images</span>
          </div>

          <div style="font-size:0.82rem; color:var(--color-text-muted);">
            <strong>Tagline:</strong> ${s.tagline}
          </div>

          <!-- Current Images Grid -->
          <div>
            <div style="font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:var(--color-text-main);">
              Current Showcase Images:
            </div>
            ${images.length === 0 ? '<div style="font-size:0.8rem; color:var(--color-text-muted); font-style:italic;">No images assigned yet.</div>' : `
              <div class="service-img-preview-grid">
                ${images.map((img, idx) => `
                  <div class="service-thumb-wrap">
                    <img src="${img}" alt="${s.title} photo ${idx + 1}" onerror="this.src='/images/cracked-screen.jpg'">
                    <button type="button" class="thumb-delete-btn" title="Remove image" onclick="removeServiceImage('${s.id}', ${idx})">&times;</button>
                    ${idx === 0 ? '<span class="thumb-primary-tag">COVER</span>' : ''}
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Add Image Controls -->
          <div style="background:var(--color-bg-light); padding:0.9rem; border-radius:8px; border:1px solid var(--color-border);">
            <div style="font-size:0.8rem; font-weight:600; margin-bottom:0.4rem;">+ Add New Image:</div>
            <div class="add-img-row">
              <input type="text" id="add-img-url-${s.id}" class="form-control" placeholder="Image URL (e.g. /images/cctv-surveillance.jpg)" style="flex:1; min-width:180px; font-size:0.82rem;">
              <select id="add-img-picker-${s.id}" class="form-control" style="width:140px; font-size:0.82rem;" onchange="document.getElementById('add-img-url-${s.id}').value = this.value">
                <option value="">Pick asset...</option>
                <option value="/images/cctv-surveillance.jpg">CCTV Setup</option>
                <option value="/images/passport-photos.jpg">Passport Photos</option>
                <option value="/images/cracked-screen.jpg">Screen Repair</option>
                <option value="/images/dell-motherboard.jpg">Dell Board</option>
                <option value="/images/laptop-hinge.jpg">Hinge Repair</option>
                <option value="/images/laptop-keyboard.jpg">Keyboard</option>
                <option value="/images/pc-rgb-workbench.jpg">PC RGB Rig</option>
                <option value="/images/desktop-motherboard.jpg">Desktop Motherboard</option>
                <option value="/images/hp-disassembly.jpg">HP Disassembly</option>
                <option value="/images/storage-ram-upgrade.jpg">RAM / SSD</option>
                <option value="/images/technician-desk.jpg">Tech Desk</option>
              </select>
              <button class="btn-primary btn-sm" onclick="addServiceImage('${s.id}')">Add Image</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading services in admin:', err);
  }
}

async function addServiceImage(serviceId) {
  const input = document.getElementById(`add-img-url-${serviceId}`);
  const imageUrl = (input ? input.value : '').trim();

  if (!imageUrl) {
    showToast('Please enter or select an image URL', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/admin/services/${serviceId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ imageUrl })
    });
    const data = await res.json();

    if (data.success) {
      showToast('Image added successfully!', 'success');
      if (input) input.value = '';
      loadServicesAdmin();
    } else {
      showToast(data.error || 'Failed to add image', 'error');
    }
  } catch (err) {
    showToast('Network error while adding image', 'error');
  }
}

async function removeServiceImage(serviceId, index) {
  if (!confirm('Remove this image from the service?')) return;

  try {
    const res = await fetch(`/api/admin/services/${serviceId}/images/${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const data = await res.json();

    if (data.success) {
      showToast('Image removed.', 'success');
      loadServicesAdmin();
    } else {
      showToast(data.error || 'Failed to remove image', 'error');
    }
  } catch (err) {
    showToast('Network error while removing image', 'error');
  }
}

// =============================================================
// OWNER PROFILE (WHY US SECTION)
// =============================================================
async function loadOwnerProfile() {
  try {
    const res = await fetch('/api/owner');
    const data = await res.json();

    if (data.success && data.owner) {
      const o = data.owner;
      document.getElementById('ownerImgInput').value = o.image || '';
      document.getElementById('ownerNameInput').value = o.name || '';
      document.getElementById('ownerRoleInput').value = o.role || '';
      document.getElementById('ownerBioInput').value = o.bio || '';

      const previewImg = document.getElementById('ownerPreviewImg');
      if (previewImg && o.image) previewImg.src = o.image;

      const previewName = document.getElementById('ownerPreviewName');
      if (previewName && o.name) previewName.innerText = o.name;

      const previewRole = document.getElementById('ownerPreviewRole');
      if (previewRole && o.role) previewRole.innerText = o.role;
    }
  } catch (err) {
    console.error('Error loading owner profile:', err);
  }
}

function applyOwnerPreset(val) {
  if (!val) return;
  document.getElementById('ownerImgInput').value = val;
  const preview = document.getElementById('ownerPreviewImg');
  if (preview) preview.src = val;
}

async function saveOwnerProfile() {
  const payload = {
    image: document.getElementById('ownerImgInput').value.trim(),
    name: document.getElementById('ownerNameInput').value.trim(),
    role: document.getElementById('ownerRoleInput').value.trim(),
    bio: document.getElementById('ownerBioInput').value.trim()
  };

  try {
    const res = await fetch('/api/admin/owner', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Owner profile updated successfully!', 'success');
      loadOwnerProfile();
    } else {
      showToast(data.error || 'Failed to update owner profile', 'error');
    }
  } catch (err) {
    showToast('Network error saving owner profile', 'error');
  }
}

// =============================================================
// CONTACTS
// =============================================================
async function loadContacts() {
  const tbody = document.getElementById('contactsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/contacts', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.contacts) {
      tbody.innerHTML = data.contacts.map(c => `
        <tr>
          <td>${c.id}</td>
          <td><strong>${c.name}</strong></td>
          <td>
            <a href="tel:${c.phone}">${c.phone}</a><br>
            <a href="https://wa.me/91${(c.phone || '').replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(c.name)}%2C%20this%20is%20Bytecare%20NJ%20Technology%20following%20up%20on%20your%20inquiry." target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:3px; color:#25D366; font-size:0.75rem; text-decoration:none; font-weight:600; margin-top:2px;">
              💬 WhatsApp
            </a>
            ${c.email ? `<br><span style="font-size:0.75rem; color:var(--color-text-muted);">${c.email}</span>` : ''}
          </td>
          <td>${c.message}</td>
          <td style="font-size:0.78rem;">${new Date(c.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn-secondary btn-sm" onclick="toggleContactStatus('${c.id}', '${c.status === 'Unread' ? 'Replied' : 'Unread'}')">
              ${c.status}
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading contacts:', err);
  }
}

async function toggleContactStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/admin/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Contact updated', 'success');
      loadContacts();
      loadStats();
    }
  } catch (err) {
    showToast('Failed to update contact', 'error');
  }
}

// =============================================================
// REVIEWS
// =============================================================
async function loadReviews() {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/reviews', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    if (data.success && data.reviews) {
      tbody.innerHTML = data.reviews.map(r => `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.service || 'N/A'}<br><span style="font-size:0.78rem; color:var(--color-text-muted);">${r.location}</span></td>
          <td>${'⭐'.repeat(r.rating)}</td>
          <td style="font-size:0.85rem; max-width:250px;">"${r.comment}"</td>
          <td>
            <span class="badge ${r.approved ? 'badge-ready' : 'badge-pending'}">${r.approved ? 'Approved' : 'Pending'}</span>
          </td>
          <td>
            <button class="btn-secondary btn-sm" onclick="toggleReviewApproval('${r.id}', ${!r.approved})">
              ${r.approved ? 'Unapprove' : 'Approve'}
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

async function toggleReviewApproval(id, approved) {
  try {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ approved })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Review status updated', 'success');
      loadReviews();
    }
  } catch (err) {
    showToast('Failed to update review', 'error');
  }
}

function switchTab(tabName, evt) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

  if (evt && evt.target) {
    evt.target.classList.add('active');
  }

  const map = {
    'tickets': 'tabTickets',
    'services': 'tabServices',
    'owner': 'tabOwner',
    'contacts': 'tabContacts',
    'reviews': 'tabReviews'
  };

  const targetId = map[tabName];
  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) el.style.display = 'block';
  }
}
