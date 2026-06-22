/* VetScribe demo — light interactions only */

// Tabs (screen 2)
document.querySelectorAll('[data-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('active', t === tab));
    document.querySelectorAll('[data-pane]').forEach((p) => p.classList.toggle('active', p.dataset.pane === target));
    document.querySelector('.scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Recorder toggle (screen 1)
const rec = document.querySelector('[data-recorder]');
if (rec) {
  const btn = rec.querySelector('.rec-btn');
  const state = rec.querySelector('.rec-state');
  const wave = rec.querySelector('.wave');
  let running = true;
  const setRunning = (on) => {
    running = on;
    wave.style.animationPlayState = on ? 'running' : 'paused';
    wave.querySelectorAll('span').forEach((s) => (s.style.animationPlayState = on ? 'running' : 'paused'));
    state.innerHTML = on
      ? '<span class="blink"></span> Grabando'
      : '<span class="blink" style="background:var(--ink-ghost);animation:none"></span> En pausa';
    btn.style.background = on
      ? 'linear-gradient(155deg, var(--pine-bright), var(--pine-deep))'
      : 'linear-gradient(155deg, var(--amber), var(--amber-text))';
  };
  btn.addEventListener('click', () => setRunning(!running));
}

// Checklist (próximo control)
document.querySelectorAll('.check-list li').forEach((li) => {
  li.addEventListener('click', () => li.classList.toggle('done'));
});

// Suggested fields: clicking + marks as added
document.querySelectorAll('.suggest .s-add').forEach((add) => {
  add.addEventListener('click', (e) => {
    e.stopPropagation();
    const row = add.closest('.suggest');
    const wasAdded = row.dataset.added === 'true';
    row.dataset.added = wasAdded ? 'false' : 'true';
    add.innerHTML = wasAdded
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    add.style.background = wasAdded ? 'var(--pine-wash)' : 'var(--pine)';
    add.style.color = wasAdded ? 'var(--pine)' : 'var(--paper)';
  });
});

// Dismiss the low-audio notice (screen 1)
document.getElementById('dismissNoise')?.addEventListener('click', () => {
  document.getElementById('noiseNotice')?.remove();
});

// Toast helper
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' + msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// ---- Signing flow (P0): inline confirm -> signed state. No modal. ----
const signBtn = document.getElementById('signBtn');
if (signBtn) {
  const bar = document.getElementById('actionbar');
  const status = document.getElementById('signStatus');
  const grp = document.getElementById('signGrp');
  const statusHTML = status.innerHTML;
  const grpHTML = grp.innerHTML;

  const reset = () => {
    bar.classList.remove('confirming');
    status.innerHTML = statusHTML;
    grp.innerHTML = grpHTML;
    bindSign();
  };

  const askConfirm = () => {
    bar.classList.add('confirming');
    status.innerHTML =
      '<div class="confirm-msg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>' +
      '<span>Al firmar, la historia de <b>Toby</b> queda como registro oficial. Podrás agregar un addendum, no reescribirla.</span></div>';
    grp.innerHTML =
      '<button class="btn btn-ghost" id="cancelSign">Cancelar</button>' +
      '<button class="btn btn-primary" id="confirmSign"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg> Confirmar firma</button>';
    document.getElementById('cancelSign').addEventListener('click', reset);
    document.getElementById('confirmSign').addEventListener('click', doSign);
  };

  let signing = false;
  const doSign = (e) => {
    if (signing) return;            // prevent double-submission
    signing = true;
    const btn = e.currentTarget;
    btn.setAttribute('aria-disabled', 'true');
    btn.innerHTML = 'Firmando…';
    setTimeout(finishSign, 950);
  };

  const finishSign = () => {
    // 1. Signed banner (peak-end positive moment)
    const banner = document.getElementById('docBanner');
    if (banner) {
      banner.classList.add('signed');
      banner.innerHTML =
        '<span class="sig"><span class="seal seal-pop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span> Firmado</span>' +
        '<span class="who-sig">por Dra. Valeria Cruz</span>' +
        '<span class="meta">29 may 2026 · 18:42</span>';
    }
    // 2. Lock the document (hide edit affordances)
    document.getElementById('clinicalDoc')?.classList.add('locked');
    // 3. Enable gated actions
    document.querySelectorAll('[data-gated]').forEach((b) => {
      b.removeAttribute('aria-disabled');
      b.querySelector('.lock-note')?.remove();
    });
    // 4. Update status + actions
    bar.classList.remove('confirming');
    status.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--pine)"><path d="M9 11 12 14 22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
      '<span>Historia firmada · registro oficial de Toby</span>';
    grp.innerHTML =
      '<a class="btn btn-ghost" href="nueva-consulta.html"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Volver</a>' +
      '<button class="btn btn-ghost"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg> Generar addendum</button>';
    toast('Historia firmada');
    signing = false;
  };

  function bindSign() {
    document.getElementById('signBtn')?.addEventListener('click', askConfirm);
  }
  bindSign();
}

// ---- Tutor send (P3 flow): two-step confirm + sent state ----
document.querySelectorAll('[data-send]').forEach((btn) => {
  const channel = btn.dataset.send;
  const lbl = btn.querySelector('.lbl');
  const original = lbl.textContent;
  btn.addEventListener('click', () => {
    if (btn.dataset.sent) return;
    if (btn.dataset.confirm !== '1') {
      // first click: ask to confirm recipient
      document.querySelectorAll('[data-send]').forEach((o) => {
        if (o !== btn) { delete o.dataset.confirm; o.querySelector('.lbl').textContent = o.dataset.send; o.style.color = ''; }
      });
      btn.dataset.confirm = '1';
      lbl.textContent = '¿Enviar a María López?';
      btn.style.color = 'var(--amber-text)';
      return;
    }
    // second click: send
    delete btn.dataset.confirm;
    btn.dataset.sent = '1';
    btn.style.color = 'var(--pine-deep)';
    lbl.textContent = 'Enviado ✓';
    btn.setAttribute('aria-disabled', 'true');
    toast('Enviado a María López por ' + channel);
  });
});

// Generate button: micro affordance before navigating
document.querySelectorAll('[data-generate]').forEach((b) => {
  b.addEventListener('click', (e) => {
    const label = b.querySelector('.label');
    if (label && !b.dataset.go) {
      e.preventDefault();
      b.dataset.go = '1';
      label.textContent = 'Generando historia clínica…';
      b.style.opacity = '0.85';
      setTimeout(() => { window.location.href = b.getAttribute('href'); }, 1100);
    }
  });
});
