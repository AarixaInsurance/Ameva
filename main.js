/**
 * AMEVA WEALTH MANAGEMENT — MAIN SCRIPT
 * ARN: 145058 | EUIN: E028717
 */

const AMC_SID_DATA = [
  { name: 'SBI Mutual Fund', url: 'https://www.sbimf.com/en-us/downloads/sid-kim-sai' },
  { name: 'HDFC Mutual Fund', url: 'https://www.hdfcfund.com/statutory-disclosure/scheme-related-documents' },
  { name: 'ICICI Prudential Mutual Fund', url: 'https://www.icicipruamc.com/downloads/sid-sai-kim' },
  { name: 'Nippon India Mutual Fund', url: 'https://mf.nipponindiaim.com/investor-services/downloads/scheme-documents' },
  { name: 'Kotak Mahindra Mutual Fund', url: 'https://www.kotakmf.com/downloads/sid-kim' },
  { name: 'Axis Mutual Fund', url: 'https://www.axismf.com/downloads/sid-sai-kim' },
  { name: 'Tata Mutual Fund', url: 'https://www.tatamutualfund.com/downloads' },
  { name: 'Mirae Asset Mutual Fund', url: 'https://www.miraeassetmf.co.in/downloads/regulatory' },
  { name: 'DSP Mutual Fund', url: 'https://www.dspim.com/mandatory-disclosures/sid-kim' },
  { name: 'PPFAS Mutual Fund (Parag Parikh)', url: 'https://amc.ppfas.com/downloads/scheme-related-documents/' },
  { name: 'Motilal Oswal Mutual Fund', url: 'https://www.motilaloswalmf.com/downloads/mutual-fund-forms/scheme-information-document' },
  { name: 'Quant Mutual Fund', url: 'https://quantmutual.com/statutory-disclosures' },
  { name: 'Bandhan Mutual Fund', url: 'https://bandhanmutual.com/downloads/sid-kim-sai' },
  { name: 'UTI Mutual Fund', url: 'https://www.utimf.com/downloads/sid-kim' },
  { name: 'Canara Robeco Mutual Fund', url: 'https://www.canararobeco.com/statutory-disclosures' },
  { name: 'Franklin Templeton Mutual Fund', url: 'https://www.franklintempletonindia.com/regulatory-information/scheme-related-documents' },
  { name: 'WhiteOak Capital Mutual Fund', url: 'https://mf.whiteoakamc.com/regulatory-disclosures' },
  { name: 'Groww Mutual Fund', url: 'https://growwmf.in/downloads' },
  { name: 'Aditya Birla Sun Life Mutual Fund', url: 'https://mutualfund.adityabirlacapital.com/forms-and-downloads/sid-sai-and-kim' }
];

document.addEventListener('DOMContentLoaded', () => {
  setupPreloader();
  setupSliders();
  setupSidModal();
  setupContactForm();
  setupParallax();
  setupScrollTop();
});

// ── PRELOADER ──
function setupPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloader-bar');
  const pct = document.getElementById('preloader-pct');

  if (!preloader) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress > 100) progress = 100;

    if (bar) bar.style.width = `${progress}%`;
    if (pct) pct.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 200);
    }
  }, 35);
}

// ── NAVBAR + SCROLL TOP ──
function setupScrollTop() {
  const navbar = document.getElementById('navbar');
  const stBtn = document.getElementById('stBtn');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
    if (stBtn) stBtn.classList.toggle('vis', window.scrollY > 400);
  });

  stBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
}

// ── PARALLAX (shapes) ──
function setupParallax() {
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', e => {
      const rx = (e.clientX / window.innerWidth - 0.5);
      const ry = (e.clientY / window.innerHeight - 0.5);

      document.querySelectorAll('.shape').forEach((s, i) => {
        const f = (i % 3 + 1) * 12;
        s.style.transform = `translateY(${ry * f}px) translateX(${rx * f}px)`;
      });
    });
  }
}

// ── SLIDERS & SIP CALCULATION ──
function fmtINR(n) {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function fmtFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function updateSliderGradient(el) {
  const min = +el.min || 0;
  const max = +el.max || 100;
  const val = +el.value;
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background = `linear-gradient(90deg, var(--green-deep) ${pct}%, #E2E8F0 ${pct}%)`;
}

function calcSIP() {
  const slAmt = document.getElementById('slAmt');
  const slRate = document.getElementById('slRate');
  const slYrs = document.getElementById('slYrs');

  if (!slAmt || !slRate || !slYrs) return;

  const sip = parseFloat(slAmt.value);
  const r = parseFloat(slRate.value) / 100 / 12;
  const n = parseFloat(slYrs.value) * 12;

  document.getElementById('cAmt').textContent = '₹' + sip.toLocaleString('en-IN');
  document.getElementById('cRate').textContent = slRate.value + '%';
  document.getElementById('cYrs').textContent = slYrs.value + ' Years';

  const total = sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = sip * n;
  const gains = Math.max(0, total - invested);

  document.getElementById('dTotal').textContent = fmtINR(total);
  document.getElementById('rInv').textContent = fmtFull(invested);
  document.getElementById('rGain').textContent = fmtFull(gains);
  document.getElementById('rTotal').textContent = fmtFull(total);

  const C = 2 * Math.PI * 70; // Circumference ≈ 439.82
  const iA = C * (invested / total);
  const gA = C * (gains / total);

  const dInv = document.getElementById('dInv');
  const dGain = document.getElementById('dGain');

  if (dInv && dGain) {
    dInv.setAttribute('stroke-dasharray', `${iA} ${C - iA}`);
    dGain.setAttribute('stroke-dasharray', `${gA} ${C - gA}`);
    dGain.setAttribute('stroke-dashoffset', `-${iA}`);
  }
}

function setupSliders() {
  const rangeInputs = document.querySelectorAll('input[type=range]');
  rangeInputs.forEach(el => {
    updateSliderGradient(el);
    el.addEventListener('input', () => {
      updateSliderGradient(el);
      calcSIP();
    });
  });
  calcSIP();
}

// ── SID MODAL ──
function setupSidModal() {
  const modal = document.getElementById('sidModal');
  const openBtn = document.getElementById('openSidModalBtn');
  const closeBtn = document.getElementById('closeSidModalBtn');
  const list = document.getElementById('sidList');
  const search = document.getElementById('sidSearch');

  if (!modal) return;

  function render(query = '') {
    if (!list) return;
    list.innerHTML = '';
    const filtered = AMC_SID_DATA.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    
    if (filtered.length === 0) {
      list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-3); padding: 20px;">No matching AMC found.</div>`;
      return;
    }

    filtered.forEach(item => {
      const a = document.createElement('a');
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'sid-item-btn';
      a.innerHTML = `<span>${item.name}</span> <i class="bi bi-box-arrow-up-right"></i>`;
      list.appendChild(a);
    });
  }

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    render();
    modal.classList.add('active');
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  search?.addEventListener('input', (e) => {
    render(e.target.value);
  });
}

// ── CONTACT FORM ──
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMsg');
  const btn = document.getElementById('btnSubmit');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Transmitting...';
    }

    setTimeout(() => {
      if (msg) msg.style.display = 'block';
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Send Consultation Request';
      }
    }, 800);
  });
}

// ── RISK PROFILING LOGIC (EXCEL SCORING MATRIX) ──
function setupRiskProfiler() {
  const form = document.getElementById('riskProfileForm');
  const resultBox = document.getElementById('riskResultBox');
  const btnPrev = document.getElementById('btnRiskPrev');
  const btnNext = document.getElementById('btnRiskNext');
  const btnSubmit = document.getElementById('btnRiskSubmit');
  const btnRetake = document.getElementById('btnRetakeRisk');
  const steps = document.querySelectorAll('.risk-q-step');
  const progressBar = document.getElementById('riskProgressBar');
  const stepCounter = document.getElementById('riskStepCurrent');

  if (!form || !resultBox || !btnNext || steps.length === 0) return;

  let currentStep = 1;
  const totalSteps = steps.length; // 7 steps (6 questions + 1 lead)

  function showStep(stepIndex) {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === stepIndex);
    });

    // Update progress
    const pct = ((stepIndex - 1) / (totalSteps - 1)) * 100 || 16.6;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (stepCounter) {
      if (stepIndex <= 6) {
        stepCounter.textContent = `Question ${stepIndex}`;
      } else {
        stepCounter.textContent = `Final Step`;
      }
    }

    // Prev button
    if (btnPrev) btnPrev.style.display = stepIndex > 1 ? 'block' : 'none';

    // Next vs Submit
    if (stepIndex === totalSteps) {
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmit) btnSubmit.style.display = 'block';
    } else {
      if (btnNext) btnNext.style.display = 'block';
      if (btnSubmit) btnSubmit.style.display = 'none';
    }
  }

  btnNext.addEventListener('click', () => {
    // Validate current question
    const activeStepEl = document.querySelector('.risk-q-step.active');
    const checked = activeStepEl.querySelector('input[type="radio"]:checked');
    if (!checked && currentStep <= 6) {
      alert('Please select an option to proceed.');
      return;
    }

    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  });

  btnPrev?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Calculate score
    const qAge = parseInt(form.querySelector('input[name="q_age"]:checked')?.value || '3', 10);
    const qHorizon = parseInt(form.querySelector('input[name="q_horizon"]:checked')?.value || '3', 10);
    const qGoal = parseInt(form.querySelector('input[name="q_goal"]:checked')?.value || '3', 10);
    const qDrop = parseInt(form.querySelector('input[name="q_drop"]:checked')?.value || '3', 10);
    const qExp = parseInt(form.querySelector('input[name="q_exp"]:checked')?.value || '3', 10);
    const qStability = parseInt(form.querySelector('input[name="q_stability"]:checked')?.value || '3', 10);

    const totalScore = qAge + qHorizon + qGoal + qDrop + qExp + qStability;

    // Excel Matrix Categorization:
    // 6 - 13: Conservative
    // 14 - 21: Moderate
    // 22 - 30: Aggressive
    let tag = 'MODERATE INVESTOR';
    let title = 'Balanced Growth Profile';
    let desc = 'You seek a healthy blend of steady capital appreciation with controlled downside protection.';
    let alloc = [
      { name: 'Equity Funds (Large & Flexi Cap)', pct: 50, color: '#C3141B' },
      { name: 'Debt & Fixed Income Instruments', pct: 35, color: '#25475E' },
      { name: 'Hybrid & Dynamic Asset Allocation', pct: 15, color: '#FBAD15' }
    ];
    let funds = ['Flexi Cap Mutual Funds', 'Large & Mid Cap Funds', 'Balanced Advantage Funds', 'Short Duration Debt Funds', 'Sovereign Gold Bonds'];

    if (totalScore <= 13) {
      tag = 'CONSERVATIVE INVESTOR';
      title = 'Capital Preservation Profile';
      desc = 'Your primary priority is safety of capital with low volatility and regular, predictable yields.';
      alloc = [
        { name: 'Debt, Liquid & Arbitrage Funds', pct: 70, color: '#25475E' },
        { name: 'Large Cap Equity / Hybrid Funds', pct: 20, color: '#C3141B' },
        { name: 'Gold / Safe Liquid Buffer', pct: 10, color: '#FBAD15' }
      ];
      funds = ['Banking & PSU Debt Funds', 'Corporate Bond Funds', 'Arbitrage Funds', 'Conservative Hybrid Funds', 'Fixed Maturity Plans'];
    } else if (totalScore >= 22) {
      tag = 'AGGRESSIVE INVESTOR';
      title = 'High Wealth Compounding Profile';
      desc = 'You have a high risk appetite aiming for maximum inflation-beating alpha over long market cycles.';
      alloc = [
        { name: 'Mid Cap, Small Cap & Focused Equity', pct: 75, color: '#C3141B' },
        { name: 'Thematic / International Equity', pct: 15, color: '#FBAD15' },
        { name: 'Liquid Buffer & Multi-Asset', pct: 10, color: '#25475E' }
      ];
      funds = ['Small Cap Funds', 'Mid Cap Funds', 'Flexi & Multi Cap Funds', 'Sectoral/Thematic Funds', 'ELSS Tax Saver Funds'];
    }

    // Render results
    document.getElementById('resTag').textContent = tag;
    document.getElementById('resTitle').textContent = title;
    document.getElementById('resDesc').textContent = desc;
    document.getElementById('resScoreNum').textContent = totalScore;
    
    const meterPct = Math.min(100, Math.round(((totalScore - 6) / 24) * 100));
    document.getElementById('resScoreMeter').style.width = `${meterPct}%`;

    // Render Allocation Bars
    const allocContainer = document.getElementById('resAllocationBars');
    if (allocContainer) {
      allocContainer.innerHTML = alloc.map(a => `
        <div class="alloc-bar-item">
          <div class="alloc-bar-header">
            <span>${a.name}</span>
            <span>${a.pct}%</span>
          </div>
          <div class="alloc-track">
            <div class="alloc-fill" style="width:${a.pct}%; background:${a.color};"></div>
          </div>
        </div>
      `).join('');
    }

    // Render Fund Tags
    const fundContainer = document.getElementById('resFundTags');
    if (fundContainer) {
      fundContainer.innerHTML = funds.map(f => `<span class="fund-tag">${f}</span>`).join('');
    }

    form.style.display = 'none';
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  btnRetake?.addEventListener('click', () => {
    form.reset();
    currentStep = 1;
    showStep(1);
    resultBox.style.display = 'none';
    form.style.display = 'block';
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  setupNav();
  setupSliders();
  setupSidModal();
  setupContactForm();
  setupRiskProfiler();
});

