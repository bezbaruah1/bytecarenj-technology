// =============================================================
// BYTECARE NJ TECHNOLOGY — ADMIN PORTAL SCRIPT
// =============================================================

let adminToken = localStorage.getItem('adminToken') || '';

document.addEventListener('DOMContentLoaded', () => {
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
});

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
    loadContacts(),
    loadReviews()
  ]);
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
        <td><a href="tel:${t.phone}">${t.phone}</a></td>
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
    } else {
      showToast(data.error || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Failed to save update', 'error');
  }
}

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
          <td>${c.phone}<br>${c.email || ''}</td>
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

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

  if (tabName === 'tickets') {
    document.getElementById('tabTickets').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'contacts') {
    document.getElementById('tabContacts').style.display = 'block';
    event.target.classList.add('active');
  } else if (tabName === 'reviews') {
    document.getElementById('tabReviews').style.display = 'block';
    event.target.classList.add('active');
  }
}
