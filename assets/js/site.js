/* ===== Generic helpers ===== */
function smoothScrollTo(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ===== Right-rail toggles (Quote / Form) ===== */
(function () {
  const rail = document.getElementById('right-rail');
  if (!rail) return;

  const buttons = rail.querySelectorAll('.togglebar [data-target]');
  const panels = rail.querySelectorAll('.panel');

  function closeAll() {
    panels.forEach(p => p.hidden = true);
    buttons.forEach(b => b.setAttribute('aria-expanded', 'false'));
  }

  buttons.forEach(btn => {
    const sel = btn.getAttribute('data-target');
    const panel = rail.querySelector(sel);
    btn.setAttribute('aria-controls', sel.replace('#', ''));
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = panel.hidden;
      closeAll();
      if (willOpen) { panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  // Close on outside click or ESC
  document.addEventListener('click', (e) => { if (!rail.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  // Google Form height toggle (inside Schedule panel)
  const wrap = rail.querySelector('.gform-wrap');
  const btnH = rail.querySelector('#gformToggle2');
  function setMobile() {
    if (!wrap) return;
    wrap.style.setProperty('--form-h',
      window.matchMedia('(max-width: 560px)').matches ? '85vh' : '780px');
  }
  setMobile();
  window.addEventListener('resize', setMobile);
  if (btnH && wrap) {
    btnH.addEventListener('click', function () {
      const cur = getComputedStyle(wrap).getPropertyValue('--form-h').trim();
      wrap.style.setProperty('--form-h', cur === '780px' ? '1270px' : '780px');
      this.textContent = cur === '780px' ? 'Collapse height' : 'Toggle height';
    });
  }

  // Make “Get a Quote” CTAs toggle the quote panel
  const quoteBtn = rail.querySelector('[data-target="#panel-quote"]');
  const quotePanel = document.getElementById('panel-quote');
  function toggleQuote() {
    if (!quoteBtn || !quotePanel) return;
    const isOpen = !quotePanel.hidden;
    if (isOpen) {
      quotePanel.hidden = true; quoteBtn.setAttribute('aria-expanded', 'false');
    } else {
      closeAll(); quotePanel.hidden = false; quoteBtn.setAttribute('aria-expanded', 'true');
    }
    smoothScrollTo(rail);
  }
  ['ctaQuoteNav', 'ctaQuoteHero'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleQuote(); });
  });
})();


(function(){
  const btn = document.getElementById('messengerBtn');
  if (!btn) return;
  btn.addEventListener('click', function(e){
    e.preventDefault();
    if (window.FB && FB.CustomerChat) {
      try { FB.CustomerChat.show(true); }
      catch (err) { window.open('https://m.me/Mr.Penguin36', '_blank'); }
    } else {
      window.open('https://m.me/Mr.Penguin36', '_blank');
    }
  });
})();

/* ===== Footer year ===== */
(function(){
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();


/* ===== Deck behavior (fan layout) + reuse lightbox ===== */
(function(){
  const decks = Array.from(document.querySelectorAll('.deck'));
  if (!decks.length) return;

  // Update --i for each card based on current order
  function reindex(deck){
    Array.from(deck.children).forEach((el, idx) => el.style.setProperty('--i', idx));
  }

  decks.forEach(deck => {
    reindex(deck);

    // Click a card: open lightbox AND move it to the end (front-most)
    deck.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      // Open lightbox (uses the lightbox you already added)
      const full = card.getAttribute('data-full') || card.currentSrc || card.src;
      const lb = document.querySelector('.lb-backdrop');
      if (lb) {
        lb.querySelector('img').src = full;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      // Move clicked card to front of the fan
      deck.appendChild(card);
      reindex(deck);
    });
  });

  // Also allow keyboard nav later if needed
})();


/* ===== Simple lightbox and deck click ===== */
(function(){
  const cards = Array.from(document.querySelectorAll('.deck .card, .gallery img'));
  if (!cards.length) return;

  // Build overlay once
  let lb = document.querySelector('.lb-backdrop');
  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lb-backdrop';
    lb.innerHTML = `
      <div class="lb-card">
        <button class="lb-close" type="button" aria-label="Close">Close ✕</button>
        <img alt="">
      </div>`;
    document.body.appendChild(lb);
  }
  const lbImg = lb.querySelector('img');
  const lbClose = lb.querySelector('.lb-close');

  function openLightbox(src){
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox(){
    lb.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.style.cursor = 'zoom-in';
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const full = card.getAttribute('data-full') || card.currentSrc || card.src;
      openLightbox(full);
      // bring clicked card to front within its deck
      const deck = card.closest('.deck');
      if (deck) { deck.appendChild(card); }
    });
  });

  lb.addEventListener('click', (e)=>{ if (e.target === lb) closeLightbox(); });
  lbClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
})();

