// ============ Sidebar toggle (mobile) ============
function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const hamburger = document.getElementById('hamburger');
  if (!sidebar || !hamburger) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }
  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);
  document.querySelectorAll('.nav-item:not(.has-sub)').forEach(el => {
    el.addEventListener('click', () => { if (window.innerWidth <= 900) close(); });
  });
}

// ============ Collapsible sub-nav groups ============
function initSubNav() {
  document.querySelectorAll('.nav-item.has-sub').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const sub = item.nextElementSibling;
      const isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      if (sub && sub.classList.contains('sub-nav')) sub.classList.toggle('open', !isOpen);
    });
  });
}

// ============ Toast for "coming soon" modules ============
function showToast(msg) {
  let toast = document.querySelector('.app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.style.cssText = `
      position: fixed; bottom: 26px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #0B2545; color: #fff; padding: 12px 22px; border-radius: 10px;
      font-size: 13.5px; font-weight: 500; box-shadow: 0 12px 30px rgba(11,37,69,0.3);
      z-index: 999; opacity: 0; transition: opacity 0.25s, transform 0.25s; font-family: 'Inter', sans-serif;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2200);
}

function initModuleLinks() {
  document.querySelectorAll('[data-soon]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showToast(el.getAttribute('data-soon') + ' — module coming soon');
    });
  });
}

// ============ Odontogram ============
const TOOTH_STATES = ['healthy', 'cavity', 'filled', 'crown', 'missing'];

function toothLabel(fdi) {
  return fdi;
}

function buildOdontogram(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const upperRight = [18,17,16,15,14,13,12,11];
  const upperLeft  = [21,22,23,24,25,26,27,28];
  const lowerLeft  = [31,32,33,34,35,36,37,38];
  const lowerRight = [48,47,46,45,44,43,42,41];

  function row(nums) {
    const wrap = document.createElement('div');
    wrap.className = 'odonto-arch';
    nums.forEach(n => {
      const b = document.createElement('button');
      b.className = 'tooth-btn healthy';
      b.textContent = toothLabel(n);
      b.dataset.tooth = n;
      b.dataset.state = 'healthy';
      b.title = 'Tooth ' + n + ' — click to cycle condition';
      b.addEventListener('click', () => {
        const cur = TOOTH_STATES.indexOf(b.dataset.state);
        const next = TOOTH_STATES[(cur + 1) % TOOTH_STATES.length];
        b.className = 'tooth-btn ' + next;
        b.dataset.state = next;
        updateOdontoSummary(containerId);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  const upperWrap = document.createElement('div');
  upperWrap.style.display = 'flex';
  upperWrap.appendChild(row(upperRight));
  upperWrap.appendChild(row(upperLeft));

  const lowerWrap = document.createElement('div');
  lowerWrap.style.display = 'flex';
  lowerWrap.appendChild(row(lowerRight));
  lowerWrap.appendChild(row(lowerLeft));

  container.appendChild(upperWrap);
  const divider = document.createElement('div');
  divider.style.cssText = 'width:80%;height:1px;background:var(--line,#E4EBEC);margin:6px 0;';
  container.appendChild(divider);
  container.appendChild(lowerWrap);
}

function updateOdontoSummary(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const counts = { healthy: 0, cavity: 0, filled: 0, crown: 0, missing: 0 };
  container.querySelectorAll('.tooth-btn').forEach(b => counts[b.dataset.state]++);
  const summary = document.getElementById(containerId + '-summary');
  if (summary) {
    summary.innerHTML = `
      <b>${counts.cavity}</b> cavities &nbsp;·&nbsp;
      <b>${counts.filled}</b> filled &nbsp;·&nbsp;
      <b>${counts.crown}</b> crowns &nbsp;·&nbsp;
      <b>${counts.missing}</b> missing
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebarToggle();
  initSubNav();
  initModuleLinks();
  if (document.getElementById('odontogram')) {
    buildOdontogram('odontogram');
    updateOdontoSummary('odontogram');
  }
});
