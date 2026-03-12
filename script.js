// ═══════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════
const API = 'https://rkg-portfolio-backend.onrender.com/api';
let authToken = localStorage.getItem('adminToken') || null;

// ═══════════════════════════════════════════════════════
//  THEME TOGGLE — dark / light
// ═══════════════════════════════════════════════════════
(function initTheme() {
  // Default is dark unless user explicitly chose light
  const saved = localStorage.getItem('theme');
  if (saved !== 'light') {
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = '☀️';
  }
})();

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('theme-toggle');
  btn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}



// ═══════════════════════════════════════════════════════
//  THREE.JS — FLOATING PARTICLES + CONNECTION LINES
// ═══════════════════════════════════════════════════════
(function () {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;
  const COUNT = 200;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const vel   = new Float32Array(COUNT * 3);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i*3]   = (Math.random()-0.5)*120; pos[i*3+1] = (Math.random()-0.5)*120; pos[i*3+2] = (Math.random()-0.5)*50;
    vel[i*3]   = (Math.random()-0.5)*0.02; vel[i*3+1] = (Math.random()-0.5)*0.02+0.005;
    sizes[i]   = Math.random()*2+0.5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes,1));
  const mat = new THREE.PointsMaterial({ color:0x1a73e8, size:0.6, transparent:true, opacity:0.45, sizeAttenuation:true });
  scene.add(new THREE.Points(geo, mat));
  const lineGeo  = new THREE.BufferGeometry();
  const maxLines = 300;
  const linePos  = new Float32Array(maxLines*6);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos,3));
  const lineMat  = new THREE.LineBasicMaterial({ color:0x4fc3f7, transparent:true, opacity:0.15 });
  scene.add(new THREE.LineSegments(lineGeo, lineMat));
  let mouse = {x:0,y:0};
  document.addEventListener('mousemove', e => { mouse.x=(e.clientX/window.innerWidth-0.5)*0.02; mouse.y=(e.clientY/window.innerHeight-0.5)*0.02; });
  let frame=0;
  function animate() {
    requestAnimationFrame(animate); frame++;
    const p = geo.attributes.position.array;
    for(let i=0;i<COUNT;i++){
      p[i*3]+=vel[i*3]; p[i*3+1]+=vel[i*3+1];
      if(p[i*3+1]>65) p[i*3+1]=-65; if(p[i*3+1]<-65) p[i*3+1]=65;
      if(p[i*3]>65)   p[i*3]=-65;   if(p[i*3]<-65)   p[i*3]=65;
    }
    geo.attributes.position.needsUpdate=true;
    if(frame%3===0){
      let lIdx=0;
      for(let i=0;i<COUNT&&lIdx<maxLines;i++) for(let j=i+1;j<COUNT&&lIdx<maxLines;j++){
        const dx=p[i*3]-p[j*3],dy=p[i*3+1]-p[j*3+1];
        if(Math.sqrt(dx*dx+dy*dy)<12){
          linePos[lIdx*6]=p[i*3]; linePos[lIdx*6+1]=p[i*3+1]; linePos[lIdx*6+2]=0;
          linePos[lIdx*6+3]=p[j*3]; linePos[lIdx*6+4]=p[j*3+1]; linePos[lIdx*6+5]=0;
          lIdx++;
        }
      }
      for(let k=lIdx;k<maxLines;k++) linePos[k*6]=linePos[k*6+1]=linePos[k*6+2]=linePos[k*6+3]=linePos[k*6+4]=linePos[k*6+5]=0;
      lineGeo.attributes.position.needsUpdate=true;
    }
    camera.position.x+=(mouse.x*5-camera.position.x)*0.05;
    camera.position.y+=(-mouse.y*5-camera.position.y)*0.05;
    renderer.render(scene,camera);
  }
  animate();
  window.addEventListener('resize',()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
})();

// ═══════════════════════════════════════════════════════
//  NAV
// ═══════════════════════════════════════════════════════
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMenu()  { document.getElementById('mobileMenu').classList.remove('open'); }
window.addEventListener('scroll', () => {
  const links    = document.querySelectorAll('.nav-links a');
  const sections = ['hero','about','skills','projects','achievements','training','internship','contact'];
  let current = 'hero';
  sections.forEach(id => { const el=document.getElementById(id); if(el&&window.scrollY>=el.offsetTop-100) current=id; });
  links.forEach(a => { a.classList.remove('active'); if(a.getAttribute('href')==='#'+current) a.classList.add('active'); });
});

// ═══════════════════════════════════════════════════════
//  SCROLL ANIMATIONS
// ═══════════════════════════════════════════════════════
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold:0.12 });

function observeAll() {
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}
observeAll(); // run on page load

// Re-observe when internship section comes into view (catches pre-existing cards)
const internshipSection = document.getElementById('internship');
if (internshipSection) {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('#internship-list .internship-card').forEach(card => {
          card.classList.add('visible');
        });
      }
    });
  }, { threshold: 0.05 }).observe(internshipSection);
}

const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.querySelectorAll('.skill-fill').forEach(b => b.style.width=b.getAttribute('data-width')); });
}, { threshold:0.3 });
document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

// ═══════════════════════════════════════════════════════
//  PAGE LOAD — load everything from MongoDB
// ═══════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', async () => {

  // Profile photo
  try {
    const res  = await fetch(`${API}/profile/photo`);
    const data = await res.json();
    if (data.success && data.url)
      document.getElementById('profile-img').src = `${data.url}`;
  } catch (_) {}

  // All sections from DB
  loadGallery();
  loadProjects();
  loadTraining();
  loadInternships();

  // Restore admin session
  if (authToken) {
    fetch(API + '/auth/me', { headers: { Authorization: 'Bearer ' + authToken } })
    .then(r => r.json())
    .then(data => { if (!data.success) { authToken = null; localStorage.removeItem('adminToken'); } })
    .catch(() => { authToken = null; localStorage.removeItem('adminToken'); });
  }
});

// ── Load Projects from DB ─────────────────────────────
async function loadProjects() {
  try {
    const res  = await fetch(`${API}/projects`);
    const data = await res.json();
    if (!data.success || !data.data.length) return;
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = data.data.map((p, i) => `
      <div class="project-card fade-in visible" data-proj-id="${p._id}" data-db-id="${p._id}">
        <div class="project-header">
          <div class="project-num">0${i+1}</div>
          <div class="project-icon">${p.icon || '💻'}</div>
          <div class="project-title">${p.title}</div>
          <div class="project-role">${p.role}</div>
        </div>
        <div class="project-body">
          <div class="project-tech">
            ${(p.tech||[]).map(t=>`<span class="tech-tag">${t}</span>`).join('')}
          </div>
          <p class="project-desc">${p.desc}</p>
          ${p.impact ? `<div class="project-impact">${p.impact}</div>` : ''}
        </div>
        <div class="project-footer">
          ${p.github ? `<a href="${p.github}" target="_blank" class="project-link">🐙 GitHub</a>` : ''}
        </div>
      </div>`).join('');
  } catch (_) {}
}

// ── Load Training from DB ─────────────────────────────
async function loadTraining() {
  try {
    const res  = await fetch(`${API}/training`);
    const data = await res.json();
    if (!data.success || !data.data.length) return;
    const list = document.getElementById('training-list');
    list.innerHTML = data.data.map(t => `
      <div class="training-card fade-in visible" data-train-id="${t._id}" data-db-id="${t._id}">
        <div class="training-icon">🏭</div>
        <div>
          <div class="training-org">${t.org}</div>
          <div class="training-topic">${t.topic}</div>
          <p class="training-desc">${t.desc}</p>
          <span class="training-badge">✅ ${t.badge}</span>
        </div>
      </div>`).join('');
  } catch (_) {}
}

// ── Load Internships from DB ──────────────────────────
async function loadInternships() {
  try {
    const res  = await fetch(`${API}/internships`);
    const data = await res.json();
    if (!data.success || !data.data.length) return;
    const list = document.getElementById('internship-list');
    list.innerHTML = data.data.map(item => `
      <div class="internship-card fade-in visible" data-intern-id="${item._id}" data-db-id="${item._id}">
        <div class="internship-header">
          <div class="internship-org-wrap">
            <div class="internship-icon">🏛️</div>
            <div>
              <div class="internship-org">${item.org}</div>
              <div class="internship-role">${item.role}</div>
            </div>
          </div>
          <span class="internship-badge">✅ ${item.badge}</span>
        </div>
        <p class="internship-desc">${item.desc}</p>
        ${item.projects && item.projects.length ? `
          <div class="internship-projects">
            <div class="internship-proj-title">🔧 Projects Worked On:</div>
            ${item.projects.map(pr => `
              <div class="internship-proj-item">
                <div class="internship-proj-name">🔧 ${pr.name}</div>
                ${pr.desc ? `<div class="internship-proj-desc">${pr.desc}</div>` : ''}
              </div>`).join('')}
          </div>` : ''}
      </div>`).join('');
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════
//  CONTACT FORM — saves to MongoDB
// ═══════════════════════════════════════════════════════
async function submitContact() {
  const fname   = document.getElementById('fname').value.trim();
  const lname   = document.getElementById('lname').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const subject = document.getElementById('fsubject').value.trim();
  const message = document.getElementById('fmessage').value.trim();

  if (!fname || !email || !message) { alert('Please fill in Name, Email, and Message.'); return; }

  try {
    const btn = document.querySelector('#contact .btn-primary');
    btn.textContent = 'Sending…'; btn.disabled = true;

    const res  = await fetch(`${API}/messages`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: `${fname} ${lname}`.trim(), email, subject, message }),
    });
    const data = await res.json();

    if (data.success) {
      ['fname','lname','femail','fsubject','fmessage'].forEach(id => document.getElementById(id).value='');
      const s = document.getElementById('form-success');
      s.classList.add('show');
      setTimeout(() => s.classList.remove('show'), 5000);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    alert('Failed to send — please try again.');
  } finally {
    const btn = document.querySelector('#contact .btn-primary');
    btn.textContent = 'Send Message 🚀'; btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════
//  GALLERY — loads from backend
// ═══════════════════════════════════════════════════════
async function loadGallery() {
  try {
    const res  = await fetch(`${API}/gallery`);
    const data = await res.json();
    if (data.success) renderGallery(data.data);
  } catch (_) {}
}

function renderGallery(images = []) {
  const grid = document.getElementById('gallery-grid');

  if (!images || images.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;color:#4a5568;font-size:0.9rem;">
        📸 No gallery images yet — upload via Admin Panel
      </div>`;
    return;
  }

  grid.innerHTML = images.map(img => `
    <div class="gallery-item"
         onclick="openGallery(this)"
         data-src="${img.url}">
      <div class="gallery-img-wrap">
        <img src="${img.url}" alt="${img.caption || img.originalName}" />
      </div>
      <div class="gallery-card-body">
        <div class="gallery-card-title">${img.caption || img.originalName}</div>
        ${img.description ? `<div class="gallery-card-desc">${img.description}</div>` : ''}
      </div>
    </div>
  `).join('');
}

function openGallery(el) {
  const src = el.getAttribute('data-src'); if(!src) return;
  document.getElementById('galleryImg').src = src;
  document.getElementById('galleryOverlay').classList.add('open');
}
function closeGallery() { document.getElementById('galleryOverlay').classList.remove('open'); }

// ═══════════════════════════════════════════════════════
//  ADMIN — OTP ONLY LOGIN / LOGOUT
// ═══════════════════════════════════════════════════════
function openAdmin() {
  document.getElementById('adminOverlay').classList.add('open');
  // If token exists, show dashboard directly — no need to login again
  if (authToken) {
    document.getElementById('admin-email-view').style.display = 'none';
    document.getElementById('admin-otp-view').style.display   = 'none';
    document.getElementById('admin-dashboard').style.display  = 'block';
    loadAdminMessages();
    loadAdminGallery();
  } else {
    document.getElementById('admin-email-view').style.display = 'block';
    document.getElementById('admin-otp-view').style.display   = 'none';
    document.getElementById('admin-dashboard').style.display  = 'none';
  }
}
function closeAdmin() { document.getElementById('adminOverlay').classList.remove('open'); }
function closeAdminOnBg(e) { if(e.target===document.getElementById('adminOverlay')) closeAdmin(); }

// Step 1 — Send OTP to admin Gmail
async function sendLoginOTP(isResend = false) {
  const email = document.getElementById('admin-email-input').value.trim();
  const errEl = document.getElementById('admin-email-err');
  errEl.style.display = 'none';

  if (!email) {
    errEl.textContent  = '❌ Please enter your admin email';
    errEl.style.display = 'block';
    return;
  }

  try {
    const btn = document.querySelector('#admin-email-view .admin-btn');
    if (btn) { btn.textContent = '📧 Sending OTP...'; btn.disabled = true; }

    const res  = await fetch(`${API}/auth/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();

    if (btn) { btn.textContent = '📧 Send OTP to Gmail'; btn.disabled = false; }

    if (data.success) {
      // Show OTP input screen
      document.getElementById('admin-email-view').style.display = 'none';
      document.getElementById('admin-otp-view').style.display   = 'block';
      document.getElementById('otp-sent-to').textContent        = email;
      document.getElementById('admin-otp-input').value          = '';
      document.getElementById('admin-otp-err').style.display    = 'none';
      if (isResend) {
        const info = document.getElementById('admin-otp-err');
        info.textContent   = '✅ New OTP sent!';
        info.style.color   = '#059669';
        info.style.display = 'block';
        setTimeout(() => { info.style.display = 'none'; info.style.color = '#ef4444'; }, 3000);
      }
    } else {
      errEl.textContent   = '❌ ' + data.message;
      errEl.style.display = 'block';
    }
  } catch (_) {
    errEl.textContent   = '❌ Could not reach server — is the backend running?';
    errEl.style.display = 'block';
    const btn = document.querySelector('#admin-email-view .admin-btn');
    if (btn) { btn.textContent = '📧 Send OTP to Gmail'; btn.disabled = false; }
  }
}

// Step 2 — Verify OTP → login
async function verifyLoginOTP() {
  const email = document.getElementById('admin-email-input').value.trim();
  const otp   = document.getElementById('admin-otp-input').value.trim();
  const errEl = document.getElementById('admin-otp-err');
  errEl.style.display = 'none';

  if (!otp) {
    errEl.textContent  = '❌ Please enter the OTP';
    errEl.style.display = 'block';
    return;
  }

  try {
    const btn = document.querySelector('#admin-otp-view .admin-btn');
    if (btn) { btn.textContent = '⏳ Verifying...'; btn.disabled = true; }

    const res  = await fetch(`${API}/auth/verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (btn) { btn.textContent = '✅ Verify OTP & Login'; btn.disabled = false; }

    if (data.success) {
      authToken = data.token;
      localStorage.setItem('adminToken', authToken);
      // Show dashboard
      document.getElementById('admin-otp-view').style.display   = 'none';
      document.getElementById('admin-dashboard').style.display  = 'block';
      loadAdminMessages();
      loadAdminGallery();
      loadAdminProjects();
      loadAdminTraining();
      loadAdminInternship();
    } else {
      errEl.textContent   = '❌ ' + data.message;
      errEl.style.display = 'block';
    }
  } catch (_) {
    errEl.textContent   = '❌ Could not reach server';
    errEl.style.display = 'block';
    const btn = document.querySelector('#admin-otp-view .admin-btn');
    if (btn) { btn.textContent = '✅ Verify OTP & Login'; btn.disabled = false; }
  }
}

// Back to email screen
function backToEmail() {
  document.getElementById('admin-otp-view').style.display   = 'none';
  document.getElementById('admin-email-view').style.display = 'block';
}

// Logout
function adminLogout() {
  authToken = null;
  localStorage.removeItem('adminToken');
  document.getElementById('admin-dashboard').style.display  = 'none';
  document.getElementById('admin-otp-view').style.display   = 'none';
  document.getElementById('admin-email-view').style.display = 'block';
  document.getElementById('admin-email-input').value        = '';
  document.getElementById('admin-otp-input').value          = '';
  closeAdmin();
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab==='messages')   loadAdminMessages();
  if(tab==='gallery')    loadAdminGallery();
  if(tab==='projects')   loadAdminProjects();
  if(tab==='training')   loadAdminTraining();
  if(tab==='internship') loadAdminInternship();
}

// ═══════════════════════════════════════════════════════
//  ADMIN — INTERNSHIP MANAGER
// ═══════════════════════════════════════════════════════
// internship admin — see INTERNSHIP MANAGER section below

function deleteInternshipById(id) {
  if (!confirm('Delete this internship?')) return;
  const card = document.querySelector(`[data-intern-id="${id}"]`);
  if (card) {
    card.style.transition = 'all 0.3s';
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(-10px)';
    setTimeout(() => { card.remove(); loadAdminInternship(); }, 300);
  }
}

function addInternship() {
  const org      = document.getElementById('i-org').value.trim();
  const role     = document.getElementById('i-role').value.trim();
  const duration = document.getElementById('i-duration').value.trim();
  const desc     = document.getElementById('i-desc').value.trim();
  const projects = document.getElementById('i-projects').value.trim();

  if (!org || !role) { alert('Please fill in Organization and Role.'); return; }

  // Build project items HTML
  let projectsHTML = '';
  if (projects) {
    const lines = projects.split('\n').filter(l => l.trim());
    projectsHTML = `
      <div class="internship-projects-title">📁 Projects Worked On:</div>
      <div class="internship-projects">
        ${lines.map(line => {
          const [name, pdesc] = line.split('|').map(s => s.trim());
          return `<div class="internship-project-item">
            <div class="internship-project-name">${name}</div>
            ${pdesc ? `<div class="internship-project-desc">${pdesc}</div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
  }

  const id   = 'intern-' + Date.now();
  const card = document.createElement('div');
  card.className = 'internship-card fade-in visible';
  card.setAttribute('data-intern-id', id);
  card.innerHTML = `
    <div class="internship-header">
      <div class="internship-org-wrap">
        <div class="internship-icon">💼</div>
        <div>
          <div class="internship-org">${org}</div>
          <div class="internship-role">${role}</div>
          ${duration ? `<div class="internship-duration">📅 ${duration}</div>` : ''}
        </div>
      </div>
      <div class="internship-badge">💼 Internship</div>
    </div>
    ${desc ? `<p class="internship-desc">${desc}</p>` : ''}
    ${projectsHTML}
  `;

  document.getElementById('internship-list').appendChild(card);

  // Clear inputs
  ['i-org','i-role','i-duration','i-desc','i-projects'].forEach(id => {
    document.getElementById(id).value = '';
  });

  loadAdminInternship();
  alert('✅ Internship added!');
}

// ═══════════════════════════════════════════════════════
//  ADMIN — PROFILE
// ═══════════════════════════════════════════════════════
function saveProfile() {
  const name       = document.getElementById('a-name')?.value.trim();
  const role       = document.getElementById('a-role')?.value.trim();
  const tagline    = document.getElementById('a-tagline')?.value.trim();
  const degree     = document.getElementById('a-degree')?.value.trim();
  const location   = document.getElementById('a-location')?.value.trim();
  const projCount  = document.getElementById('a-projects-count')?.value.trim();
  const achievement= document.getElementById('a-achievement')?.value.trim();
  const email      = document.getElementById('a-email')?.value.trim();
  const bio        = document.getElementById('a-bio')?.value.trim();
  const quote      = document.getElementById('a-quote')?.value.trim();
  const github     = document.getElementById('a-github')?.value.trim();
  const linkedin   = document.getElementById('a-linkedin')?.value.trim();

  // Hero section
  if (name)    document.querySelector('.hero-name').textContent    = name;
  if (tagline) document.querySelector('.hero-title').textContent   = tagline;
  if (bio)     document.getElementById('hero-bio-text').textContent = bio;

  // About card
  if (name)    document.getElementById('about-name-card').textContent = name;
  if (role)    document.getElementById('about-role-card').textContent  = role;
  if (bio)     document.getElementById('about-bio-text').textContent   = bio;
  if (quote)   { const q = document.querySelector('.about-highlight'); if(q) q.textContent = `"${quote}"`; }

  // About stats
  const stats = document.querySelectorAll('.about-stat span');
  stats.forEach(span => {
    const text = span.textContent;
    if (degree    && (text.includes('B.Tech') || text.includes('AI & Data'))) span.textContent = degree;
    if (location  && (text.includes('Tamil Nadu') || text.includes('India')))  span.textContent = location;
    if (projCount && text.includes('Projects'))   span.textContent = projCount;
    if (achievement && text.includes('Award') || achievement && text.includes('Commendation')) span.textContent = achievement;
    if (email     && text.includes('@'))           span.textContent = email;
  });

  // Contact email
  if (email) {
    document.querySelectorAll('.contact-value').forEach(el => {
      if (el.textContent.includes('@')) el.textContent = email;
    });
    document.querySelectorAll('a.contact-item').forEach(a => {
      if (a.href.includes('mailto')) a.href = 'mailto:' + email;
    });
  }

  // GitHub & LinkedIn links
  if (github)   document.querySelectorAll('a[href*="github"]').forEach(a => { if(!a.classList.contains('project-link')) a.href = github; });
  if (linkedin) document.querySelectorAll('a[href*="linkedin"]').forEach(a => a.href = linkedin);

  alert('✅ Profile updated!');
}

async function updateProfileImage(event) {
  const file = event.target.files[0]; if(!file) return;
  const form = new FormData();
  form.append('photo', file);
  try {
    const res  = await fetch(`${API}/profile/photo`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body:    form,
    });
    const data = await res.json();
    if(data.success) {
      document.getElementById('profile-img').src = `${data.url}`;
      alert('✅ Profile photo updated!');
    } else {
      alert('Error: '+data.message);
    }
  } catch(_) { alert('Upload failed'); }
}

// ═══════════════════════════════════════════════════════
//  ADMIN — GALLERY
// ═══════════════════════════════════════════════════════
async function uploadGalleryImages(event) {
  const files   = Array.from(event.target.files); if(!files.length) return;
  const caption = document.getElementById('gallery-caption-input')?.value.trim() || '';
  const desc    = document.getElementById('gallery-desc-input')?.value.trim()    || '';
  const form    = new FormData();
  files.forEach(f => form.append('images', f));
  if(caption) form.append('caption',     caption);
  if(desc)    form.append('description', desc);
  try {
    const res  = await fetch(`${API}/gallery`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body:    form,
    });
    const data = await res.json();
    if(data.success) {
      // Clear inputs
      if(document.getElementById('gallery-caption-input')) document.getElementById('gallery-caption-input').value = '';
      if(document.getElementById('gallery-desc-input'))    document.getElementById('gallery-desc-input').value    = '';
      alert(`✅ ${data.count} image(s) uploaded!`);
      loadAdminGallery();
      loadGallery();
    }
    else alert('Error: '+data.message);
  } catch(_) { alert('Upload failed'); }
}

async function loadAdminGallery() {
  try {
    const res  = await fetch(`${API}/gallery`);
    const data = await res.json();
    const preview = document.getElementById('admin-gallery-preview');
    if (!data.data || data.data.length === 0) {
      preview.innerHTML = '<p style="color:#4a5568;font-size:0.85rem;margin-top:0.5rem;">No images yet.</p>';
      return;
    }
    preview.innerHTML = data.data.map(img => `
      <div style="background:#f0f6ff;border-radius:12px;margin-bottom:12px;border:2px solid #e2e8f0;overflow:hidden;">

        <!-- Image Row — preview + title + buttons -->
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;">
          <img src="${img.url}" alt="${img.caption||img.originalName}"
            style="width:72px;height:60px;object-fit:cover;border-radius:8px;flex-shrink:0;border:2px solid #e2e8f0;" />
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.92rem;color:#1a2540;margin-bottom:3px;
                        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              🖼️ ${img.caption || img.originalName}
            </div>
            <div style="font-size:0.78rem;color:#4a5568;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${img.description ? img.description : '<em>No description yet</em>'}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
            <button onclick="toggleEditGallery('${img._id}')"
              style="background:#1a73e8;color:white;border:none;padding:7px 16px;
                     border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;
                     white-space:nowrap;">
              ✏️ Edit
            </button>
            <button onclick="deleteGalleryImg('${img._id}')"
              style="background:#ef4444;color:white;border:none;padding:7px 16px;
                     border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;
                     white-space:nowrap;">
              🗑️ Delete
            </button>
          </div>
        </div>

        <!-- Edit Form — full width, hidden by default -->
        <div id="edit-gallery-${img._id}"
          style="display:none;padding:16px;border-top:2px solid #e2e8f0;background:#ffffff;">
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.82rem;font-weight:700;color:#1a2540;margin-bottom:6px;">
              📝 Caption / Title
            </label>
            <input class="admin-input" id="eg-caption-${img._id}"
              value="${img.caption || ''}"
              placeholder="e.g. SP Commendation Certificate"
              style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;
                     font-size:0.9rem;background:#fff;color:#1a2540;outline:none;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.82rem;font-weight:700;color:#1a2540;margin-bottom:6px;">
              💬 Description (shown on hover)
            </label>
            <textarea id="eg-desc-${img._id}"
              placeholder="e.g. Received from Superintendent of Police for CaseMaiyam System..."
              style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:10px;
                     font-size:0.9rem;background:#fff;color:#1a2540;outline:none;
                     height:90px;resize:vertical;font-family:inherit;box-sizing:border-box;">${img.description || ''}</textarea>
          </div>
          <div style="display:flex;gap:10px;">
            <button onclick="saveEditGallery('${img._id}')"
              style="flex:1;background:linear-gradient(135deg,#1a73e8,#0d47a1);color:white;
                     border:none;padding:10px;border-radius:10px;cursor:pointer;
                     font-size:0.9rem;font-weight:700;">
              💾 Save Changes
            </button>
            <button onclick="toggleEditGallery('${img._id}')"
              style="flex:1;background:#f1f5f9;color:#4a5568;border:2px solid #e2e8f0;
                     padding:10px;border-radius:10px;cursor:pointer;font-size:0.9rem;font-weight:600;">
              ✕ Cancel
            </button>
          </div>
        </div>

      </div>
    `).join('');
  } catch(_) {}
}

function toggleEditGallery(id) {
  const form = document.getElementById(`edit-gallery-${id}`);
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveEditGallery(id) {
  const caption = document.getElementById(`eg-caption-${id}`)?.value.trim() || '';
  const desc    = document.getElementById(`eg-desc-${id}`)?.value.trim()    || '';
  try {
    const res  = await fetch(`${API}/gallery/${id}`, {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ caption, description: desc }),
    });
    const data = await res.json();
    if (data.success) { loadAdminGallery(); loadGallery(); alert('✅ Image updated!'); }
    else alert('Error: ' + data.message);
  } catch(_) { alert('Update failed'); }
}

async function deleteGalleryImg(id) {
  if(!confirm('Delete this image?')) return;
  try {
    const res  = await fetch(`${API}/gallery/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if(data.success) { loadAdminGallery(); loadGallery(); }
    else alert('Error: '+data.message);
  } catch(_) { alert('Delete failed'); }
}

// ═══════════════════════════════════════════════════════
//  ADMIN — MESSAGES
// ═══════════════════════════════════════════════════════
async function loadAdminMessages() {
  try {
    const res  = await fetch(`${API}/messages`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    const list = document.getElementById('messages-list');
    if(!data.data || data.data.length===0) {
      list.innerHTML='<p style="color:var(--text2);font-size:0.9rem;">No messages yet.</p>'; return;
    }
    // Update badge
    const badge = document.getElementById('unread-badge');
    if(badge) badge.textContent = data.unreadCount > 0 ? ` (${data.unreadCount} new)` : '';

    list.innerHTML = data.data.map(m => `
      <div class="message-item" id="msg-${m._id}" style="${m.read ? '' : 'border-left:4px solid #1a73e8;'}">
        <div class="message-item-header">
          <span class="message-item-name">${m.name} ${m.read ? '' : '<span style="background:#1a73e8;color:white;font-size:0.7rem;padding:2px 7px;border-radius:10px;margin-left:6px;">NEW</span>'}</span>
          <span class="message-item-date">${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <div class="message-item-email">${m.email}</div>
        ${m.subject ? `<div style="font-size:0.82rem;font-weight:600;margin-bottom:4px;">📌 ${m.subject}</div>`:''}
        <div class="message-item-text">${m.message}</div>
        <div style="display:flex;gap:8px;margin-top:0.5rem;">
          ${!m.read ? `<button class="admin-btn" style="padding:5px 12px;font-size:0.8rem;" onclick="markRead('${m._id}')">✅ Mark Read</button>` : ''}
          <button class="admin-btn admin-btn-danger" style="padding:5px 12px;font-size:0.8rem;" onclick="deleteMsg('${m._id}')">🗑️ Delete</button>
        </div>
      </div>
    `).join('');
  } catch(_) {}
}

async function markRead(id) {
  await fetch(`${API}/messages/${id}/read`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  loadAdminMessages();
}

async function deleteMsg(id) {
  if(!confirm('Delete this message?')) return;
  await fetch(`${API}/messages/${id}`, {
    method:  'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  loadAdminMessages();
}



// ═══════════════════════════════════════════════════════
//  ADMIN — ADD PROJECT / TRAINING (frontend-only)
// ═══════════════════════════════════════════════════════
async function addProject() {
  const title  = document.getElementById('p-title').value.trim();
  const role   = document.getElementById('p-role').value.trim();
  const icon   = document.getElementById('p-icon').value.trim() || '💻';
  const tech   = document.getElementById('p-tech').value.trim();
  const desc   = document.getElementById('p-desc').value.trim();
  const impact = document.getElementById('p-impact').value.trim();
  const github = document.getElementById('p-github').value.trim();
  if (!title || !desc) { alert('Title and description are required'); return; }
  try {
    const res  = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, role, icon, tech: tech.split(',').map(t=>t.trim()).filter(Boolean), desc, impact, github }),
    });
    const data = await res.json();
    if (data.success) {
      ['p-title','p-role','p-icon','p-tech','p-desc','p-impact','p-github'].forEach(id => document.getElementById(id).value = '');
      await loadProjects();
      loadAdminProjects();
      alert('✅ Project saved to database!');
    } else { alert('Error: ' + data.message); }
  } catch (_) { alert('Failed to save project'); }
}

async function addTraining() {
  const org   = document.getElementById('t-org').value.trim();
  const topic = document.getElementById('t-topic').value.trim();
  const desc  = document.getElementById('t-desc').value.trim();
  const badge = document.getElementById('t-badge').value.trim() || 'Training';
  if (!org || !topic) { alert('Organization and Topic are required'); return; }
  try {
    const res  = await fetch(`${API}/training`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ org, topic, desc, badge }),
    });
    const data = await res.json();
    if (data.success) {
      ['t-org','t-topic','t-desc','t-badge'].forEach(id => document.getElementById(id).value = '');
      await loadTraining();
      loadAdminTraining();
      alert('✅ Training saved to database!');
    } else { alert('Error: ' + data.message); }
  } catch (_) { alert('Failed to save training'); }
}

// ═══════════════════════════════════════════════════════
//  ADMIN — PROJECTS MANAGER
// ═══════════════════════════════════════════════════════

// Load all existing projects into admin panel
function loadAdminProjects() {
  const cards  = document.querySelectorAll('#projects-grid .project-card');
  const listEl = document.getElementById('admin-projects-list');
  if (!listEl) return;
  if (cards.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text2);font-size:0.88rem;">No projects found.</p>';
    return;
  }
  listEl.innerHTML = Array.from(cards).map((card, i) => {
    const title  = card.querySelector('.project-title')?.textContent.trim()  || 'Project '+(i+1);
    const role   = card.querySelector('.project-role')?.textContent.trim()   || '';
    const desc   = card.querySelector('.project-desc')?.textContent.trim()   || '';
    const impact = card.querySelector('.project-impact')?.textContent.trim() || '';
    const github = card.querySelector('.project-link')?.href || '';
    const tech   = Array.from(card.querySelectorAll('.tech-tag')).map(t=>t.textContent.trim()).join(', ');
    const id     = 'proj-' + i;
    card.setAttribute('data-proj-id', id);
    return `
      <div style="background:#f0f6ff;border-radius:10px;margin-bottom:8px;border-left:4px solid #1a73e8;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
          <div>
            <div style="font-weight:700;color:#1a2540;font-size:0.95rem;">🚀 ${title}</div>
            <div style="font-size:0.82rem;color:#4a5568;margin-top:2px;">${role}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;margin-left:12px;">
            <button onclick="toggleEditProject('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              ✏️ Edit
            </button>
            <button onclick="deleteProjectById('${id}')"
              style="background:#ef4444;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              🗑️ Delete
            </button>
          </div>
        </div>
        <div id="edit-proj-${id}" style="display:none;padding:12px 16px;border-top:1px solid #e2e8f0;background:#fff;">
          <div class="admin-form-group">
            <label class="admin-label">Project Title</label>
            <input class="admin-input" id="ep-title-${id}" value="${title}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Your Role</label>
            <input class="admin-input" id="ep-role-${id}" value="${role}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Tech Stack (comma separated)</label>
            <input class="admin-input" id="ep-tech-${id}" value="${tech}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Description</label>
            <textarea class="admin-textarea" id="ep-desc-${id}">${desc}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Impact Line</label>
            <input class="admin-input" id="ep-impact-${id}" value="${impact}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">GitHub URL</label>
            <input class="admin-input" id="ep-github-${id}" value="${github}" />
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="saveEditProject('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;">
              💾 Save
            </button>
            <button onclick="toggleEditProject('${id}')"
              style="background:transparent;color:#4a5568;border:2px solid #e2e8f0;padding:8px 18px;border-radius:8px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleEditProject(id) {
  const form = document.getElementById(`edit-proj-${id}`);
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveEditProject(id) {
  const card   = document.querySelector(`[data-proj-id="${id}"]`);
  if (!card) return;
  const dbId   = card.getAttribute('data-db-id') || id;
  const title  = document.getElementById(`ep-title-${id}`)?.value.trim();
  const role   = document.getElementById(`ep-role-${id}`)?.value.trim();
  const tech   = document.getElementById(`ep-tech-${id}`)?.value.trim();
  const desc   = document.getElementById(`ep-desc-${id}`)?.value.trim();
  const impact = document.getElementById(`ep-impact-${id}`)?.value.trim();
  const github = document.getElementById(`ep-github-${id}`)?.value.trim();
  try {
    const res  = await fetch(`${API}/projects/${dbId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, role, tech: tech ? tech.split(',').map(t=>t.trim()) : undefined, desc, impact, github }),
    });
    const data = await res.json();
    if (data.success) { await loadProjects(); loadAdminProjects(); alert('✅ Project updated!'); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Update failed'); }
}

async function deleteProjectById(id) {
  const card = document.querySelector(`[data-proj-id="${id}"]`);
  if (!card) return;
  if (!confirm(`Delete "${card.querySelector('.project-title')?.textContent}"?`)) return;
  const dbId = card.getAttribute('data-db-id') || id;
  try {
    const res  = await fetch(`${API}/projects/${dbId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success) { await loadProjects(); loadAdminProjects(); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Delete failed'); }
}


// ═══════════════════════════════════════════════════════
//  ADMIN — TRAINING MANAGER
// ═══════════════════════════════════════════════════════

function loadAdminTraining() {
  const cards  = document.querySelectorAll('#training-list .training-card');
  const listEl = document.getElementById('admin-training-list');
  if (!listEl) return;

  if (cards.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text2);font-size:0.88rem;">No training found.</p>';
    return;
  }

  listEl.innerHTML = Array.from(cards).map((card, i) => {
    const org   = card.querySelector('.training-org')?.textContent.trim()   || 'Training ' + (i+1);
    const topic = card.querySelector('.training-topic')?.textContent.trim() || '';
    const desc  = card.querySelector('.training-desc')?.textContent.trim()  || '';
    const badge = card.querySelector('.training-badge')?.textContent.replace('✅','').trim() || '';
    const id    = 'train-' + i;
    card.setAttribute('data-train-id', id);
    return `
      <div style="background:#f0f6ff;border-radius:10px;margin-bottom:8px;border-left:4px solid #1a73e8;overflow:hidden;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
          <div>
            <div style="font-weight:700;color:#1a2540;font-size:0.95rem;">🏭 ${org}</div>
            <div style="font-size:0.82rem;color:#4a5568;margin-top:2px;">${topic}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;margin-left:12px;">
            <button onclick="toggleEditTraining('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              ✏️ Edit
            </button>
            <button onclick="deleteTrainingById('${id}')"
              style="background:#ef4444;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              🗑️ Delete
            </button>
          </div>
        </div>
        <div id="edit-train-${id}" style="display:none;padding:12px 16px;border-top:1px solid #e2e8f0;background:#fff;">
          <div class="admin-form-group">
            <label class="admin-label">Organization</label>
            <input class="admin-input" id="et-org-${id}" value="${org}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Topic / Course</label>
            <input class="admin-input" id="et-topic-${id}" value="${topic}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Description</label>
            <textarea class="admin-textarea" id="et-desc-${id}">${desc}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Badge Label</label>
            <input class="admin-input" id="et-badge-${id}" value="${badge}" />
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="saveEditTraining('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;">
              💾 Save
            </button>
            <button onclick="toggleEditTraining('${id}')"
              style="background:transparent;color:#4a5568;border:2px solid #e2e8f0;padding:8px 18px;border-radius:8px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleEditTraining(id) {
  const form = document.getElementById(`edit-train-${id}`);
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveEditTraining(id) {
  const card  = document.querySelector(`[data-train-id="${id}"]`);
  if (!card) return;
  const dbId  = card.getAttribute('data-db-id') || id;
  const org   = document.getElementById(`et-org-${id}`)?.value.trim();
  const topic = document.getElementById(`et-topic-${id}`)?.value.trim();
  const desc  = document.getElementById(`et-desc-${id}`)?.value.trim();
  const badge = document.getElementById(`et-badge-${id}`)?.value.trim();
  try {
    const res  = await fetch(`${API}/training/${dbId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ org, topic, desc, badge }),
    });
    const data = await res.json();
    if (data.success) { await loadTraining(); loadAdminTraining(); alert('✅ Training updated!'); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Update failed'); }
}

async function deleteTrainingById(id) {
  const card = document.querySelector(`[data-train-id="${id}"]`);
  if (!card) return;
  const org  = card.querySelector('.training-org')?.textContent || 'this training';
  if (!confirm(`Delete "${org}"?`)) return;
  const dbId = card.getAttribute('data-db-id') || id;
  try {
    const res  = await fetch(`${API}/training/${dbId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success) { await loadTraining(); loadAdminTraining(); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Delete failed'); }
}

// ═══════════════════════════════════════════════════════
//  INTERNSHIP MANAGER
// ═══════════════════════════════════════════════════════

function loadAdminInternship() {
  const list  = document.getElementById('admin-internship-list');
  const cards = document.querySelectorAll('[data-intern-id]');
  if (!list) return;
  if (!cards.length) {
    list.innerHTML = '<p style="color:#4a5568;font-size:0.88rem;">No internships yet.</p>';
    return;
  }
  list.innerHTML = Array.from(cards).map(card => {
    const id   = card.getAttribute('data-intern-id');
    const org  = card.querySelector('.internship-org')?.textContent.trim()  || 'Unknown';
    const role = card.querySelector('.internship-role')?.textContent.trim() || '';
    const desc = card.querySelector('.internship-desc')?.textContent.trim() || '';
    const badge= card.querySelector('.internship-badge')?.textContent.replace('✅','').trim() || 'Internship';
    const projs= Array.from(card.querySelectorAll('.internship-proj-item')).map(p => {
      const n = p.querySelector('.internship-proj-name')?.textContent.replace('🔧','').trim() || '';
      const d = p.querySelector('.internship-proj-desc')?.textContent.trim() || '';
      return d ? `${n} | ${d}` : n;
    }).join('\n');
    return `
      <div style="background:#f0f6ff;border-radius:10px;margin-bottom:8px;border-left:4px solid #1a73e8;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;">
          <div>
            <div style="font-weight:700;font-size:0.92rem;color:#1a2540;">💼 ${org}</div>
            <div style="font-size:0.82rem;color:#4a5568;margin-top:2px;">${role}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0;margin-left:12px;">
            <button onclick="toggleEditInternship('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              ✏️ Edit
            </button>
            <button onclick="deleteInternshipById('${id}')"
              style="background:#ef4444;color:white;border:none;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;">
              🗑️ Delete
            </button>
          </div>
        </div>
        <div id="edit-intern-${id}" style="display:none;padding:12px 16px;border-top:1px solid #e2e8f0;background:#fff;">
          <div class="admin-form-group">
            <label class="admin-label">Organization</label>
            <input class="admin-input" id="ei-org-${id}" value="${org}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Your Role</label>
            <input class="admin-input" id="ei-role-${id}" value="${role}" />
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Description</label>
            <textarea class="admin-textarea" id="ei-desc-${id}">${desc}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Projects (Name | Description, one per line)</label>
            <textarea class="admin-textarea" id="ei-projs-${id}" style="height:80px;">${projs}</textarea>
          </div>
          <div class="admin-form-group">
            <label class="admin-label">Badge</label>
            <input class="admin-input" id="ei-badge-${id}" value="${badge}" />
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button onclick="saveEditInternship('${id}')"
              style="background:#1a73e8;color:white;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:600;">
              💾 Save
            </button>
            <button onclick="toggleEditInternship('${id}')"
              style="background:transparent;color:#4a5568;border:2px solid #e2e8f0;padding:8px 18px;border-radius:8px;cursor:pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleEditInternship(id) {
  const form = document.getElementById(`edit-intern-${id}`);
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function saveEditInternship(id) {
  const card  = document.querySelector(`[data-intern-id="${id}"]`);
  if (!card) return;
  const dbId  = card.getAttribute('data-db-id') || id;
  const org   = document.getElementById(`ei-org-${id}`)?.value.trim();
  const role  = document.getElementById(`ei-role-${id}`)?.value.trim();
  const desc  = document.getElementById(`ei-desc-${id}`)?.value.trim();
  const badge = document.getElementById(`ei-badge-${id}`)?.value.trim();
  const projs = document.getElementById(`ei-projs-${id}`)?.value.trim();
  const projects = projs ? projs.split('\n').filter(l=>l.trim()).map(line => {
    const [name, d] = line.split('|').map(s=>s.trim());
    return { name, desc: d || '' };
  }) : [];
  try {
    const res  = await fetch(`${API}/internships/${dbId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ org, role, desc, badge, projects }),
    });
    const data = await res.json();
    if (data.success) { await loadInternships(); loadAdminInternship(); alert('✅ Internship updated!'); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Update failed'); }
}

async function deleteInternshipById(id) {
  const card = document.querySelector(`[data-intern-id="${id}"]`);
  if (!card) return;
  const org  = card.querySelector('.internship-org')?.textContent || 'this internship';
  if (!confirm(`Delete internship at "${org}"?`)) return;
  const dbId = card.getAttribute('data-db-id') || id;
  try {
    const res  = await fetch(`${API}/internships/${dbId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (data.success) { await loadInternships(); loadAdminInternship(); }
    else alert('Error: ' + data.message);
  } catch (_) { alert('Delete failed'); }
}

async function addInternship() {
  const org      = document.getElementById('i-org').value.trim();
  const role     = document.getElementById('i-role').value.trim();
  const desc     = document.getElementById('i-desc').value.trim();
  const projsRaw = document.getElementById('i-projects').value.trim();
  const badge    = document.getElementById('i-badge').value.trim() || 'Internship';
  if (!org || !role) { alert('Please fill in Organization and Role.'); return; }
  const projects = projsRaw ? projsRaw.split('\n').filter(l=>l.trim()).map(line => {
    const [name, d] = line.split('|').map(s=>s.trim());
    return { name, desc: d || '' };
  }) : [];
  try {
    const res  = await fetch(`${API}/internships`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ org, role, desc, badge, projects }),
    });
    const data = await res.json();
    if (data.success) {
      ['i-org','i-role','i-desc','i-projects'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
      const badge_el = document.getElementById('i-badge'); if(badge_el) badge_el.value = 'Internship';
      await loadInternships();
      loadAdminInternship();
      alert('✅ Internship saved to database!');
    } else { alert('Error: ' + data.message); }
  } catch (_) { alert('Failed to save internship'); }
}
