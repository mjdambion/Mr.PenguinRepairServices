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

/* ===== Mobile carousel for .deck ===== */
(function(){
  const MOBILE = () => window.matchMedia('(max-width:560px)').matches;

  function makeCarousel(deck){
    if (deck.dataset.carousel === 'on') return;
    deck.dataset.carousel = 'on';

    // Wrap cards into a track
    const cards = Array.from(deck.querySelectorAll('.card'));
    const track = document.createElement('div');
    track.className = 'deck-track';
    cards.forEach(c => track.appendChild(c));
    deck.appendChild(track);

    // Nav + dots
    const nav = document.createElement('div');
    nav.className = 'nav';
    nav.innerHTML = `<button type="button" class="prev">‹</button><button type="button" class="next">›</button>`;
    const dots = document.createElement('div');
    dots.className = 'dots';
    cards.forEach((_,i)=>{
      const d=document.createElement('div'); d.className='dot'+(i===0?' active':'');
      dots.appendChild(d);
    });
    deck.append(nav, dots);

    let idx = 0, startX=0, cur=0, w=deck.querySelector('.card').getBoundingClientRect().width + 10;
    function update(){ track.style.transform = `translateX(${-idx*w}px)`; 
      dots.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active', i===idx));
    }
    function next(){ idx = Math.min(idx+1, cards.length-1); update(); }
    function prev(){ idx = Math.max(idx-1, 0); update(); }

    nav.querySelector('.next').addEventListener('click', next);
    nav.querySelector('.prev').addEventListener('click', prev);

    // Touch swipe
    track.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; cur = -idx*w; track.style.transition='none'; }, {passive:true});
    track.addEventListener('touchmove',  e=>{ const dx = e.touches[0].clientX-startX; track.style.transform=`translateX(${cur+dx}px)`; }, {passive:true});
    track.addEventListener('touchend',   e=>{
      track.style.transition='';
      const dx = e.changedTouches[0].clientX-startX;
      if (Math.abs(dx) > 40) (dx<0?next:prev)(); else update();
    });

    // Recompute width on resize
    window.addEventListener('resize', ()=>{ w = deck.querySelector('.card').getBoundingClientRect().width + 10; update(); });
    update();
  }

  function destroyCarousel(deck){
    if (deck.dataset.carousel !== 'on') return;
    deck.dataset.carousel = 'off';
    // unwrap: move cards out of track and remove nav/dots
    const track = deck.querySelector('.deck-track');
    if (track){
      const cards = Array.from(track.children);
      cards.forEach(c => deck.insertBefore(c, track));
      track.remove();
    }
    deck.querySelectorAll('.nav,.dots').forEach(n=>n.remove());
  }

  function apply(){
    document.querySelectorAll('.deck').forEach(deck=>{
      MOBILE() ? makeCarousel(deck) : destroyCarousel(deck);
    });
  }

  apply();
  window.addEventListener('resize', apply);
})();


/* ===== Build mailto with subject for Quick Quote form ===== */
(function(){
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const to = 'mr.pengrepairservices@gmail.com';  // change if needed
    const name   = (form.name?.value || '').trim();
    const phone  = (form.phone?.value || '').trim();
    const device = (form.device?.value || '').trim();
    const issue  = (form.issue?.value || '').trim();

    const subject = `Quotation request: ${device || 'Device'} — ${name || 'Client'}`;
    const body = [
      `Name: ${name}`, 
      `Phone/Messenger: ${phone}`,
      `Device: ${device}`,
      '', 
      'Issue:',
      issue
    ].join('\n');

    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // open default mail app
    window.location.href = href;
  });
})();



(() => {
  const lb = document.getElementById('lb');
  if (!lb) return; // page-safe

  const lbImg   = document.getElementById('lb-img');
  const lbClose = lb.querySelector('.lb-close');

  // Track the clicked image to repair it if some old code hides/moves it
  let activeCard = null;
  let activeParent = null;
  let activeNext = null;

  // Open lightbox by copying URL (do NOT move the node)
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.deck .card');
    if (!img) return;

    // prevent any other click handlers from hijacking the image
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    activeCard = img;
    activeParent = img.parentNode || null;
    activeNext = img.nextSibling || null;

    const src = img.currentSrc || img.src;
    lbImg.src = src;
    lbImg.alt = img.alt || '';

    // ensure original image stays visible
    img.hidden = false;
    img.style.display = '';
    img.style.visibility = '';
    img.classList.remove('hidden', 'invisible', 'is-hidden');

    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }, true); // capture phase

  function restoreActiveCard() {
    if (!activeCard) return;

    // if some script removed/moved it, put it back in place
    if (activeParent && !activeParent.contains(activeCard)) {
      if (activeNext) activeParent.insertBefore(activeCard, activeNext);
      else activeParent.appendChild(activeCard);
    }
    activeCard.hidden = false;
    activeCard.style.display = '';
    activeCard.style.visibility = '';
    activeCard.classList.remove('hidden', 'invisible', 'is-hidden');

    activeCard = activeParent = activeNext = null;
  }

  function closeLB() {
    lb.classList.remove('open');
    lbImg.src = ''; // free memory
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    restoreActiveCard();
  }

  lbClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('open')) closeLB();
  });
})();




