const API_URL = '/api';

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const leadsTableBody = document.getElementById('leadsTableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

// CRM Elements
const statTotal = document.getElementById('statTotal');
const statNew = document.getElementById('statNew');
const statContacted = document.getElementById('statContacted');
const statCompleted = document.getElementById('statCompleted');

const searchQuery = document.getElementById('searchQuery');
const statusFilterContainer = document.getElementById('statusFilterContainer');
let activeStatus = 'all';

const leadModal = document.getElementById('leadModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const crmForm = document.getElementById('crmForm');
const deleteBtn = document.getElementById('deleteBtn');

const detailName = document.getElementById('detailName');
const detailPhone = document.getElementById('detailPhone');
const detailService = document.getElementById('detailService');
const detailDate = document.getElementById('detailDate');
const detailMessage = document.getElementById('detailMessage');
const leadStatus = document.getElementById('leadStatus');
const leadNotes = document.getElementById('leadNotes');

let allLeads = [];
let selectedLeadId = null;

// Check if already logged in
function checkAuth() {
  const token = localStorage.getItem('hunkar_admin_token');
  if (token) {
    showDashboard();
    fetchLeads();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginScreen.style.display = 'flex';
  dashboardScreen.style.display = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'grid';
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('hunkar_admin_token', data.token);
      loginError.textContent = '';
      showDashboard();
      fetchLeads();
    } else {
      loginError.textContent = data.error || 'Giriş başarısız';
    }
  } catch (err) {
    loginError.textContent = 'Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('hunkar_admin_token');
  showLogin();
  document.getElementById('adminPassword').value = '';
});

// Fetch Leads
async function fetchLeads() {
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  leadsTableBody.innerHTML = '';
  
  const token = localStorage.getItem('hunkar_admin_token');
  
  try {
    const res = await fetch(`${API_URL}/leads`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('hunkar_admin_token');
      showLogin();
      return;
    }
    
    const data = await res.json();
    loadingState.style.display = 'none';
    
    allLeads = data.leads || [];
    updateStats();
    filterAndRenderLeads();
    
  } catch (err) {
    loadingState.textContent = 'Veriler yüklenirken hata oluştu.';
  }
}

// Update Stats
function updateStats() {
  statTotal.textContent = allLeads.length;
  statNew.textContent = allLeads.filter(l => l.status === 'Yeni' || !l.status).length;
  statContacted.textContent = allLeads.filter(l => l.status === 'Görüşülüyor' || l.status === 'Teklif Verildi').length;
  statCompleted.textContent = allLeads.filter(l => l.status === 'Tamamlandı').length;
}

// Filter and Render Leads
function filterAndRenderLeads() {
  const query = searchQuery.value.toLowerCase().trim();
  const filter = activeStatus;
  
  const filtered = allLeads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(query) || 
                          lead.phone.includes(query);
    
    const leadStatusVal = lead.status || 'Yeni';
    const matchesFilter = filter === 'all' || leadStatusVal === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    leadsTableBody.innerHTML = '';
    return;
  }
  
  emptyState.style.display = 'none';
  leadsTableBody.innerHTML = filtered.map(lead => {
    const statusVal = lead.status || 'Yeni';
    let statusClass = 'status-tag new';
    if (statusVal === 'Görüşülüyor') statusClass = 'status-tag contacted';
    if (statusVal === 'Teklif Verildi') statusClass = 'status-tag proposal';
    if (statusVal === 'Tamamlandı') statusClass = 'status-tag completed';
    if (statusVal === 'İptal Edildi') statusClass = 'status-tag cancelled';

    return `
      <tr>
        <td>${new Date(lead.date).toLocaleString('tr-TR')}</td>
        <td><strong>${lead.fullName}</strong></td>
        <td><a href="tel:${lead.phone}" class="phone-link">${lead.phone}</a></td>
        <td>${lead.service}</td>
        <td><span class="${statusClass}">${statusVal}</span></td>
        <td>
          <button class="action-btn inspect" onclick="openLeadDetails(${lead.id})">İncele</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Details Modal
window.openLeadDetails = (id) => {
  const lead = allLeads.find(l => l.id === id);
  if (!lead) return;
  
  selectedLeadId = id;
  detailName.textContent = lead.fullName;
  detailPhone.innerHTML = `<a href="tel:${lead.phone}">${lead.phone}</a>`;
  detailService.textContent = lead.service;
  detailDate.textContent = new Date(lead.date).toLocaleString('tr-TR');
  detailMessage.textContent = lead.message || 'Mesaj bırakılmamış.';
  leadStatus.value = lead.status || 'Yeni';
  leadNotes.value = lead.notes || '';
  
  leadModal.style.display = 'flex';
};

// Close Modal
closeModalBtn.addEventListener('click', () => {
  leadModal.style.display = 'none';
  selectedLeadId = null;
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === leadModal) {
    leadModal.style.display = 'none';
    selectedLeadId = null;
  }
});

// Update Lead Status & Notes
crmForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!selectedLeadId) return;
  
  const status = leadStatus.value;
  const notes = leadNotes.value;
  const token = localStorage.getItem('hunkar_admin_token');
  
  try {
    const res = await fetch(`${API_URL}/leads?id=${selectedLeadId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes })
    });
    
    if (res.ok) {
      leadModal.style.display = 'none';
      fetchLeads();
    } else {
      alert('Güncelleme işlemi başarısız.');
    }
  } catch (err) {
    alert('Sunucu hatası.');
  }
});

// Delete Lead inside Modal
deleteBtn.addEventListener('click', async () => {
  if (!selectedLeadId) return;
  if (!confirm('Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
  
  const token = localStorage.getItem('hunkar_admin_token');
  
  try {
    const res = await fetch(`${API_URL}/leads?id=${selectedLeadId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.ok) {
      leadModal.style.display = 'none';
      fetchLeads();
    } else {
      alert('Silme işlemi başarısız.');
    }
  } catch (err) {
    alert('Sunucu hatası.');
  }
});

// Event listeners for filters
searchQuery.addEventListener('input', filterAndRenderLeads);

if (statusFilterContainer) {
  const tabButtons = statusFilterContainer.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-status');
      filterAndRenderLeads();
    });
  });
}
document.getElementById('refreshBtn').addEventListener('click', fetchLeads);

// Initial check
checkAuth();
