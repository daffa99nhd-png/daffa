const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Tahun otomatis di footer
$('#year').textContent = new Date().getFullYear();

// Navigasi mobile
const menuToggle = $('#menuToggle');
const navLinks = $('#navLinks');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
$$('.nav-link').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Tema terang/gelap; pilihan disimpan selama sesi browser melalui localStorage
const themeToggle = $('#themeToggle');
try {
  if (localStorage.getItem('daffa-portfolio-theme') === 'light') document.body.classList.add('light-theme');
} catch (_) {}
function updateThemeIcon() {
  const light = document.body.classList.contains('light-theme');
  themeToggle.textContent = light ? '☾' : '☼';
  themeToggle.setAttribute('aria-label', light ? 'Gunakan tema gelap' : 'Gunakan tema terang');
}
updateThemeIcon();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
  try { localStorage.setItem('daffa-portfolio-theme', theme); } catch (_) {}
  updateThemeIcon();
});

// Animasi teks di hero
const typingText = $('#typingText');
const phrases = ['teknologi', 'website', 'server', 'elektronika'];
let phraseIndex = 0, charIndex = 0, deleting = false;
function typeLoop() {
  const phrase = phrases[phraseIndex];
  typingText.textContent = phrase.slice(0, charIndex);
  if (!deleting && charIndex < phrase.length) { charIndex++; setTimeout(typeLoop, 105); }
  else if (!deleting) { deleting = true; setTimeout(typeLoop, 1250); }
  else if (charIndex > 0) { charIndex--; setTimeout(typeLoop, 55); }
  else { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; setTimeout(typeLoop, 250); }
}
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(typeLoop, 700);

// Reveal saat elemen masuk ke layar
const revealItems = $$('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => revealObserver.observe(item));
} else revealItems.forEach(item => item.classList.add('in-view'));

// Progress bar dan navigasi aktif
const progressBar = $('#scrollProgress');
const navSections = $$('main section[id]');
function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  let current = 'home';
  navSections.forEach(section => { if (window.scrollY >= section.offsetTop - 170) current = section.id; });
  $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

// Filter kartu proyek
const filterButtons = $$('.filter-btn');
const projectCards = $$('.project-card');
const projectCount = $('#projectCount');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  let visible = 0;
  projectCards.forEach(card => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  projectCount.textContent = visible;
}));

// Modal detail proyek
const projectDialog = $('#projectDialog');
$$('.project-detail').forEach(button => button.addEventListener('click', () => {
  $('#dialogTitle').textContent = button.dataset.title;
  $('#dialogDescription').textContent = button.dataset.description;
  const stack = $('#dialogStack');
  stack.replaceChildren();
  button.dataset.stack.split(',').map(value => value.trim()).forEach(value => {
    const tag = document.createElement('span'); tag.textContent = value; stack.appendChild(tag);
  });
  if (typeof projectDialog.showModal === 'function') projectDialog.showModal();
}));
$('#dialogClose').addEventListener('click', () => projectDialog.close());
$('#dialogOk').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => { if (event.target === projectDialog) projectDialog.close(); });

// Salin alamat email
const emailAddress = 'daffa99nhd@gmail.com';
const toast = $('#toast');
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2400);
}
$('#copyEmail').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(emailAddress);
    $('#copyStatus').textContent = 'Email berhasil disalin.';
    showToast('Alamat email disalin ke clipboard.');
  } catch (_) {
    $('#copyStatus').textContent = `Silakan salin manual: ${emailAddress}`;
    showToast('Clipboard tidak tersedia. Email ditampilkan di bagian kontak.');
  }
});

// Form kontak menyiapkan draft email, tidak mengirim otomatis
$('#contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = $('#senderName').value.trim();
  const senderEmail = $('#senderEmail').value.trim();
  const message = $('#senderMessage').value.trim();
  if (!name || !senderEmail || !message) { showToast('Lengkapi semua kolom terlebih dahulu.'); return; }
  const subject = encodeURIComponent(`Pesan portofolio dari ${name}`);
  const body = encodeURIComponent(`Halo Daffa,\n\n${message}\n\nSalam,\n${name}\nEmail: ${senderEmail}`);
  window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
});
