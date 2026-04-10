// ═══════════════════════════════════════════════════════
//  ENCAP — Complete JS
//  main.js + scrollytelling canvas engine combined
// ═══════════════════════════════════════════════════════


// ─── CURSOR ───
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function animCursor() {
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
  if (ring)   { ring.style.left   = rx + 'px'; ring.style.top   = ry + 'px'; }
  requestAnimationFrame(animCursor);
})();

async function checkAuth() {
  try {
    const res = await fetch("/ENCAPproject/backend/api/me");
    if (res.status === 401) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── NAV SCROLL ───
const nav = document.getElementById('mainNav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── FOOTER YEAR ───
// const yrEl = document.getElementById('yr');
// if (yrEl) yrEl.textContent = new Date().getFullYear();

// ─── REVEAL ON SCROLL ───
const revealEls = document.querySelectorAll('.reveal, .process-step, .feature-card');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

// ─── SCORE DEMO ANIMATION ───
const scoreDemo = document.getElementById('scoreDemo');
let scoreDone = false;

if (scoreDemo) {
  const scoreObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !scoreDone) {
      scoreDone = true;
      animateScore();
    }
  }, { threshold: 0.4 });
  scoreObs.observe(scoreDemo);
}

function animateScore() {
  const target        = 78;
  const circle        = document.getElementById('scoreCircle');
  const numEl         = document.getElementById('scoreNum');
  const circumference = 251.2;
  if (!circle || !numEl) return;

  circle.style.strokeDashoffset = circumference - (target / 100) * circumference;

  let current = 0;
  const step = () => {
    current = Math.min(current + 1.5, target);
    numEl.textContent = Math.round(current);
    if (current < target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);

  document.querySelectorAll('.sl-fill').forEach(bar => {
    const val = parseInt(bar.dataset.val);
    setTimeout(() => { bar.style.width = val + '%'; }, 300);
  });
}

// Nav Bar Action Button


// ═══════════════════════════════════════════════════════
//  SCROLLYTELLING CANVAS ENGINE
// ═══════════════════════════════════════════════════════

(function initScrollStory() {

  const canvas        = document.getElementById('mainCanvas');
  const scrollSection = document.getElementById('scrollStory');
  if (!canvas || !scrollSection) return;

  const ctx = canvas.getContext('2d');

  // ─── CONFIG ───
  const TOTAL_FRAMES = 120;

  const LAYERS = [
    { label: 'SOURCE',      color: '#c8ff00' },
    { label: 'LINGUISTIC',  color: '#00d4ff' },
    { label: 'CLAIMS',      color: '#ff9500' },
    { label: 'SENTIMENT',   color: '#c8ff00' },
    { label: 'HEADLINE',    color: '#ff3c6e' },
    { label: 'PROPAGATION', color: '#00d4ff' },
  ];

  const SCORES = [88, 76, 62, 81, 90, 71];

  const TEXT_BEATS = [
    { id: 'st1', start: 0.00, end: 0.18 },
    { id: 'st2', start: 0.18, end: 0.38 },
    { id: 'st3', start: 0.38, end: 0.58 },
    { id: 'st4', start: 0.58, end: 0.78 },
    { id: 'st5', start: 0.80, end: 1.00 },
  ];

  // Resolve beat elements once
  const beats = TEXT_BEATS.map(b => ({
    el: document.getElementById(b.id),
    start: b.start,
    end: b.end,
  })).filter(b => b.el);

  const spbFill = document.getElementById('spbFill');

  // ─── STATE ───
  let lastFrame = 0;
  let rafId     = null;

  // ─── CANVAS RESIZE ───
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width        = window.innerWidth  * dpr;
    canvas.height       = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before re-scaling
    ctx.scale(dpr, dpr);
  }
  resizeCanvas();
  window.addEventListener('resize', () => { resizeCanvas(); drawFrame(lastFrame); });

  // ─── PARTICLES ───
  const PCOLS = ['#c8ff00', '#00d4ff', '#ff3c6e'];
  const particles = Array.from({ length: 60 }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    vx:    (Math.random() - 0.5) * 0.0008,
    vy:    (Math.random() - 0.5) * 0.0008,
    size:  Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.3 + 0.05,
    color: PCOLS[Math.floor(Math.random() * 3)],
  }));

  function tickParticles() {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
      if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
    });
  }

  // ─── MAIN DRAW ───
  function drawFrame(frame) {
    const w  = window.innerWidth;
    const h  = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const progress = frame / TOTAL_FRAMES; // 0 → 1

    ctx.clearRect(0, 0, w, h);

    // Background
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
    bg.addColorStop(0, '#0c0c14');
    bg.addColorStop(1, '#060608');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Particles
    tickParticles();
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Grid (fades in with scroll)
    const gridAlpha = Math.min(progress * 3, 0.08);
    if (gridAlpha > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${gridAlpha})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    // ── PHASE 1 (0 → 0.15): Article box materialises ──
    const p1 = Math.min(progress / 0.15, 1);
    if (p1 > 0) {
      const bw = Math.min(w * 0.5, 400) * p1;
      const bh = Math.min(h * 0.45, 320) * p1;

      ctx.save();
      ctx.globalAlpha = p1;

      // Glow behind box
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bw * 0.8);
      glow.addColorStop(0, 'rgba(200,255,0,0.07)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - bw, cy - bh, bw * 2, bh * 2);

      // Box border
      ctx.strokeStyle = 'rgba(200,255,0,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);

      // Simulated article text lines
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      // Use fixed offsets so lines don't jitter each frame
      const lineOffsets = [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82];
      lineOffsets.forEach((t, i) => {
        const lw  = bw * (i % 2 === 0 ? 0.82 : 0.55);
        const ly  = cy - bh / 2 + 20 + t * (bh - 40);
        ctx.beginPath();
        ctx.moveTo(cx - lw / 2, ly);
        ctx.lineTo(cx + lw / 2, ly);
        ctx.stroke();
      });

      // Label above box
      ctx.fillStyle = 'rgba(200,255,0,0.8)';
      ctx.font = `${Math.round(9 * p1)}px DM Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('ARTICLE SUBMITTED', cx, cy - bh / 2 - 14);

      ctx.restore();
    }

    // ── PHASE 2 (0.12 → 0.80): Detection layers expand ──
    if (progress > 0.12) {
      const lp  = Math.max(0, (progress - 0.12) / 0.68); // 0 → 1 across phase
      const num = Math.ceil(lp * LAYERS.length);

      LAYERS.slice(0, num).forEach((layer, i) => {
        // Each layer gets its own 0→1 progress
        const ip = Math.min(Math.max(lp * LAYERS.length - i, 0), 1);
        if (ip <= 0) return;

        const angle      = (i / LAYERS.length) * Math.PI * 2 - Math.PI / 2;
        const baseRadius = Math.min(w, h) * 0.28;
        const radius     = baseRadius * ip;
        const lx         = cx + Math.cos(angle) * radius;
        const ly         = cy + Math.sin(angle) * radius;

        // Dashed connection line from centre
        ctx.save();
        ctx.globalAlpha = ip * 0.35;
        ctx.strokeStyle = layer.color;
        ctx.lineWidth   = 0.5;
        ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(lx, ly); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Node glow
        ctx.save();
        ctx.globalAlpha = ip * 0.15;
        const ng = ctx.createRadialGradient(lx, ly, 0, lx, ly, 50);
        ng.addColorStop(0, layer.color); ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng;
        ctx.fillRect(lx - 50, ly - 50, 100, 100);
        ctx.restore();

        // Hexagon node
        const nodeR = 28 * ip;
        ctx.save();
        ctx.globalAlpha = ip;
        ctx.beginPath();
        for (let v = 0; v < 6; v++) {
          const va = (v / 6) * Math.PI * 2 - Math.PI / 6;
          const vx = lx + Math.cos(va) * nodeR;
          const vy = ly + Math.sin(va) * nodeR;
          v === 0 ? ctx.moveTo(vx, vy) : ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fillStyle   = 'rgba(6,6,8,0.92)';
        ctx.fill();
        ctx.strokeStyle = layer.color;
        ctx.lineWidth   = 1;
        ctx.stroke();

        // Score arc around node
        const scoreRatio = SCORES[i] / 100;
        ctx.beginPath();
        ctx.arc(lx, ly, nodeR - 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * scoreRatio * ip);
        ctx.strokeStyle = layer.color;
        ctx.lineWidth   = 2;
        ctx.stroke();

        // Layer label + score
        ctx.fillStyle = layer.color;
        ctx.font      = `bold ${Math.round(7 * ip)}px DM Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(layer.label, lx, ly - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font      = `${Math.round(6 * ip)}px DM Mono, monospace`;
        ctx.fillText(SCORES[i], lx, ly + 10);
        ctx.restore();
      });
    }

    // ── PHASE 3 (0.78 → 1.0): Verdict convergence ──
    if (progress > 0.78) {
      const p3 = Math.min((progress - 0.78) / 0.22, 1);

      // Outer pulse ring
      ctx.save();
      ctx.globalAlpha = p3 * 0.35;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) * 0.35 * p3, 0, Math.PI * 2);
      ctx.strokeStyle = '#c8ff00';
      ctx.lineWidth   = 0.5;
      ctx.stroke();
      ctx.restore();

      // Verdict box
      const vw = 200 * p3, vh = 72 * p3;
      ctx.save();
      ctx.globalAlpha = p3;
      ctx.fillStyle   = 'rgba(6,6,8,0.96)';
      ctx.fillRect(cx - vw / 2, cy - vh / 2, vw, vh);
      ctx.strokeStyle = '#c8ff00';
      ctx.lineWidth   = 1;
      ctx.strokeRect(cx - vw / 2, cy - vh / 2, vw, vh);
      ctx.fillStyle   = '#c8ff00';
      ctx.font        = `bold ${Math.round(11 * p3)}px Syne, sans-serif`;
      ctx.textAlign   = 'center';
      ctx.fillText('VERDICT: LOW RISK', cx, cy - 5);
      ctx.fillStyle   = 'rgba(255,255,255,0.4)';
      ctx.font        = `${Math.round(7 * p3)}px DM Mono, monospace`;
      ctx.fillText('CREDIBILITY SCORE · 78 / 100', cx, cy + 12);
      ctx.restore();
    }

    // ── SCANNING RING (always animates) ──
    const scanAngle = (Date.now() * 0.001) % (Math.PI * 2);
    const scanR     = Math.min(w, h) * 0.12;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#c8ff00';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, scanR, scanAngle, scanAngle + Math.PI * 0.45);
    ctx.stroke();
    ctx.restore();

    // Centre dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#c8ff00';
    ctx.fill();
    ctx.restore();
  }

  // ─── SCROLL PROGRESS ───
  function getScrollProgress() {
    const rect        = scrollSection.getBoundingClientRect();
    const totalScroll = scrollSection.offsetHeight - window.innerHeight;
    const scrolled    = -rect.top;
    return Math.max(0, Math.min(1, scrolled / totalScroll));
  }

  // ─── SCROLL HANDLER ───
  function onScroll() {
    const progress = getScrollProgress();

    // Text beat visibility
    beats.forEach(beat => {
      const inRange = progress >= beat.start && progress <= beat.end;
      beat.el.classList.toggle('visible', inRange);
    });

    // Progress bar
    if (spbFill) spbFill.style.height = (progress * 100) + '%';

    // Scroll → frame
    const frame = Math.round(progress * TOTAL_FRAMES);
    if (frame !== lastFrame) {
      lastFrame = frame;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawFrame(frame));
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── CONTINUOUS LOOP (particles + scan ring need live animation) ───
  function animLoop() {
    drawFrame(lastFrame);
    requestAnimationFrame(animLoop);
  }
  animLoop();

  // ─── INITIAL STATE ───
  drawFrame(0);
  const firstBeat = beats.find(b => b.id === 'st1') || beats[0];
  if (firstBeat) firstBeat.el.classList.add('visible');

})();


// Analyze News page
async function initAnalyzeForm() {
  const form = document.getElementById("analyzeForm");
  if (!form) return;

  // Check if user is logged in
  const user = await checkAuth();
  if (!user) {
    // Show login prompt over the form
    form.innerHTML = `
      <div style="
        text-align: center;
        padding: 3rem 2rem;
        font-family: var(--mono);
      ">
        <div style="
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1rem;
        ">Authentication Required</div>
        <h2 style="
          font-family: var(--display);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          margin-bottom: 0.8rem;
        ">Please log in to analyze articles.</h2>
        <p style="
          font-size: 0.78rem;
          color: var(--muted);
          margin-bottom: 2rem;
          line-height: 1.7;
        ">You need an ENCAP account to submit articles for credibility analysis.</p>
        <div style="display:flex; gap:1rem; justify-content:center;">
          <a href="login.html" class="btn">Log In</a>
          <a href="register.html" class="btn btn-outline">Register</a>
        </div>
      </div>
    `;
    return;
  }

  const headlineInput = document.getElementById("headlineInput");
  const sourceInput = document.getElementById("sourceInput");
  const contentInput = document.getElementById("contentInput");
  const pdfInput = document.getElementById("pdfInput");

  form.addEventListener("submit", async(event) => {
    event.preventDefault();
     if (form.dataset.submitting === 'true') return;
  form.dataset.submitting = 'true';

    clearErrors(form);
    const errors = [];

    const headline = (headlineInput && headlineInput.value.trim()) || "";
    const source = (sourceInput && sourceInput.value.trim()) || "";
    const content = (contentInput && contentInput.value.trim()) || "";
    const pdfFile = pdfInput && pdfInput.files && pdfInput.files[0];

    if (!headline && !content && !pdfFile) {
      errors.push({ field: headlineInput, message: "Provide a headline, article text, or PDF." });
    }

    if (pdfFile && pdfFile.type !== "application/pdf") {
      errors.push({ field: pdfInput, message: "Only PDF documents are supported." });
    }

    if (source && !isLikelyUrlOrDomain(source)) {
      errors.push({
        field: sourceInput,
        message: "Enter a valid domain or URL (e.g., example.com or https://example.com).",
      });
    }

    if (errors.length > 0) {
      errors.forEach((err) => showFieldError(err.field, err.message));
      return;
    }

    // Prepare payload for future backend integration
    const payload = {
      headline: headline || null,
      source: source || null,
      content: content || null,
      // PDF uploading will require FormData in a real integration
    };

    // Store in sessionStorage so the results page can illustrate a report
    try {
      sessionStorage.setItem("encap:lastRequest", JSON.stringify(payload));
    } catch (_) {
      // ignore
    }

    try {
      // Use FormData to support both text and PDF file uploads
      const formData = new FormData();
      if (headline) formData.append("headline", headline);
      if (source)   formData.append("source", source);
      if (content)  formData.append("content", content);
      if (pdfFile)  formData.append("pdf", pdfFile);

      const response = await fetch("/ENCAPproject/backend/api/analyze-news", {
        method: "POST",
        body: formData, // No Content-Type header — browser sets it automatically for FormData
      });

      const result = await response.json();

      if (!response.ok) {
        showFieldError(headlineInput, result.error || "Analysis failed.");
        return;
      }

      // Store real backend result for result.html to display
      try {
        sessionStorage.setItem("encap:lastResult", JSON.stringify({
          article_id:        result.article_id,
          credibility_score: result.credibility_score,
          risk_level:        result.risk_level,
          report:            result.report,
          headline:          headline || null,
          source:            source   || null,
        }));
      } catch (_) {
        // ignore
      }

      window.location.href = "result.html";

    } catch (err) {
      showFieldError(headlineInput, "Network error. Please try again.");
      form.dataset.submitting = 'false';
    }
    form.dataset.submitting = 'false';
  });
}

function isLikelyUrlOrDomain(value) {
  const domainRegex =
    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
  return domainRegex.test(value);
}

function clearErrors(form) {
  const errorTexts = form.querySelectorAll(".error-text");
  errorTexts.forEach((el) => el.remove());
  const errored = form.querySelectorAll(".input-error");
  errored.forEach((el) => el.classList.remove("input-error"));
}

function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.add("input-error");
  const error = document.createElement("div");
  error.className = "error-text";
  error.textContent = message;
  inputEl.insertAdjacentElement("afterend", error);
}
// Add this at the very bottom of script2.js
document.addEventListener("DOMContentLoaded", () => {
  initAnalyzeForm();
});

// Result Page
async function initResultsPage() {
  const container = document.getElementById("resultsContainer");
  if (!container) return;

  // Get article_id from sessionStorage
  let articleId = null;
  try {
    const raw = sessionStorage.getItem("encap:lastResult");
    if (raw) {
      const parsed = JSON.parse(raw);
      articleId = parsed.article_id;
    }
  } catch (_) {}

  if (!articleId) {
    document.getElementById("resultsHeadlineSlot").textContent = "No report found.";
    return;
  }

  // Fetch report from backend
  try {
    const response = await fetch(`/ENCAPproject/backend/api/report/${articleId}`);
    if (!response.ok) {
      document.getElementById("resultsHeadlineSlot").textContent = "Failed to load report.";
      return;
    }

    const data = await response.json();
    const article = data.article;
    const report  = data.report;

    // ── Headline + score ──
    document.getElementById("resultsHeadlineSlot").textContent = article.title || "Submitted article";

    const score = article.credibility_score;
    const scoreEl = document.getElementById("resultsScoreValue");
    const barEl   = document.getElementById("resultsScoreBarFill");
    const badgeEl = document.getElementById("resultsRiskBadge");

    if (scoreEl) scoreEl.textContent = Math.round(score);
    if (barEl)   barEl.style.width   = Math.round(score) + "%";
    if (badgeEl) {
      badgeEl.textContent = article.risk_level;
      badgeEl.className   = "results-risk " + getRiskClass(article.risk_level);
    }

    // ── Source module ──
    const sourceEl = document.getElementById("sourceDetail");
    if (sourceEl && report.source_credibility) {
      const s = report.source_credibility;
      sourceEl.innerHTML = `
        <strong>Trust level:</strong> ${s.level}<br/>
        <strong>Penalty applied:</strong> ${s.penalty} points<br/>
        <span>${s.explanation}</span>
      `;
    }

    // ── Language module ──
    const langEl = document.getElementById("languageDetail");
    if (langEl && report.sensational_language) {
      const l = report.sensational_language;
      langEl.innerHTML = `
        <strong>Suspicious keywords found:</strong> ${l.suspicious_count} out of ~${l.total_words} words<br/>
        <strong>Penalty applied:</strong> ${l.penalty} points<br/>
        <span>${l.explanation}</span>
      `;
    }

    // ── Headline module ──
    const headlineEl = document.getElementById("headlineDetail");
    if (headlineEl && report.headline_structure) {
      const h = report.headline_structure;
      headlineEl.innerHTML = `
        <strong>Penalty applied:</strong> ${h.penalty} points<br/>
        <span>${h.explanation}</span>
      `;
    }

    // ── Claims module ──
    const claimsEl = document.getElementById("claimsDetail");
    if (claimsEl && report.claim_repetition) {
      const c = report.claim_repetition;
      claimsEl.innerHTML = `
        <strong>Times flagged before:</strong> ${c.times_flagged}<br/>
        <strong>Penalty applied:</strong> ${c.penalty} points<br/>
        <span>${c.explanation}</span>
      `;
    }

  } catch (err) {
    document.getElementById("resultsHeadlineSlot").textContent = "Error loading report.";
    console.error("Report fetch error:", err);
  }
}

function getRiskClass(riskLevel) {
  if (!riskLevel) return '';
  const r = riskLevel.toLowerCase();
  if (r.includes('low'))      return 'risk-low';
  if (r.includes('moderate')) return 'risk-moderate';
  if (r.includes('high'))     return 'risk-high';
  return '';
}

function simulateScore(request) {
  if (!request) return 72;
  const { headline, source, content } = request;
  let base = 75;

  if (source && /twitter|tiktok|blogspot|medium/i.test(source)) {
    base -= 8;
  }
  if (headline && /won't believe|shocking|secret|cure|exposed/i.test(headline)) {
    base -= 12;
  }
  if (content && content.length > 2500) {
    base += 4;
  }
  if (!content && !source) {
    base -= 6;
  }

  return Math.max(15, Math.min(95, Math.round(base)));
}

function mapScoreToRisk(score) {
  if (score >= 80) {
    return { riskLabel: "Low Risk", riskClass: "risk-low" };
  }
  if (score >= 55) {
    return { riskLabel: "Moderate Risk", riskClass: "risk-moderate" };
  }
  return { riskLabel: "High Risk", riskClass: "risk-high" };
}

function populateResultsDetails(score, request) {
  const sourceDetail = document.getElementById("sourceDetail");
  const languageDetail = document.getElementById("languageDetail");
  const headlineDetail = document.getElementById("headlineDetail");
  const claimsDetail = document.getElementById("claimsDetail");

  if (sourceDetail) {
    const source = request && request.source;
    let trustText = "Source not provided. Treated as unverified for this analysis.";
    if (source) {
      trustText = `Source <strong>${escapeHtml(
        source
      )}</strong> is not yet mapped to a curated trust category in this demo. The backend can plug into one or more source credibility databases.`;
    }
    sourceDetail.innerHTML =
      trustText +
      " ENCAP records whether a domain is trusted, mixed, unverified, or repeatedly problematic and exposes that label in every report.";
  }

  if (languageDetail) {
    const suspiciousCount =
      score < 55 ? 18 : score < 80 ? 7 : 2;
    languageDetail.innerHTML = `
      <strong>${suspiciousCount}</strong> occurrences of potentially sensational or emotionally charged language were detected in the article text.
      These may include exaggerated claims, all‑caps emphasis, urgency framing, or fear‑based appeals. In the full system, each term is logged and can be inspected.
    `;
  }

  if (headlineDetail) {
    const headline = request && request.headline;
    const clickbaitDetected =
      headline && /!|\?|won't believe|shocking|secret|cure|this is what/i.test(headline);

    if (clickbaitDetected) {
      headlineDetail.innerHTML =
        "The headline exhibits clickbait patterns such as strong emotional hooks or excessive punctuation. " +
        "ENCAP highlights these cues so reviewers can distinguish between attention‑grabbing style and substantive reporting.";
    } else {
      headlineDetail.innerHTML =
        "No strong clickbait patterns were detected in the headline. The structure appears primarily descriptive, " +
        "but downstream modules may still flag risk based on content and source.";
    }
  }

  if (claimsDetail) {
    claimsDetail.innerHTML =
      "This demo does not yet connect to a claims database. In a full deployment, ENCAP would compare extracted claims " +
      "against previously flagged narratives and record whether the article amplifies known misinformation themes.";
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Dashboard page

function initDashboardPage() {
  const statsGrid = document.getElementById("dashboardStats");
  const recentTableBody = document.getElementById("dashboardRecentBody");
  if (!statsGrid || !recentTableBody) return;

  const history = loadHistory();
  const stats = computeStats(history);

  // Render stats
  const totalEl = document.getElementById("statTotal");
  const highEl = document.getElementById("statHigh");
  const moderateEl = document.getElementById("statModerate");
  const lowEl = document.getElementById("statLow");

  if (totalEl) totalEl.textContent = String(stats.total);
  if (highEl) highEl.textContent = String(stats.high);
  if (moderateEl) moderateEl.textContent = String(stats.moderate);
  if (lowEl) lowEl.textContent = String(stats.low);

  // Recent table
  const recent = history.slice(0, 5);
  recentTableBody.innerHTML = "";
  recent.forEach((item) => {
    recentTableBody.appendChild(buildHistoryRow(item));
  });
}

// History page

async function initHistoryPage() {
  const body = document.getElementById("historyTableBody");
  if (!body) return;
  // Check login first
  const user = await checkAuth();
  if (!user) {
    body.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 2rem; font-family: var(--mono); font-size: 0.8rem;">
          <span style="color: var(--muted)">Please </span>
          <a href="login.html" style="color: var(--accent)">log in</a>
          <span style="color: var(--muted)"> to view your analysis history.</span>
        </td>
      </tr>
    `;
    return;
  }

  // Show loading state
  body.innerHTML = `
    <tr>
      <td colspan="6" style="text-align:center; color: var(--muted); font-family: var(--mono); font-size:0.8rem; padding: 2rem;">
        Loading history...
      </td>
    </tr>
  `;

  try {
    const response = await fetch("/ENCAPproject/backend/api/history");

    if (response.status === 401) {
      body.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: var(--accent2); font-family: var(--mono); font-size:0.8rem; padding: 2rem;">
            Please <a href="login.html" style="color:var(--accent)">log in</a> to view your history.
          </td>
        </tr>
      `;
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to fetch history");
    }

    const articles = await response.json();

    if (!articles.length) {
      body.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: var(--muted); font-family: var(--mono); font-size:0.8rem; padding: 2rem;">
            No articles analyzed yet. <a href="analyze.html" style="color:var(--accent)">Analyze your first article.</a>
          </td>
        </tr>
      `;
      return;
    }

    body.innerHTML = "";
    articles.forEach(item => {
      body.appendChild(buildHistoryRowFromDB(item));
    });

  } catch (err) {
    body.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color: var(--accent2); font-family: var(--mono); font-size:0.8rem; padding: 2rem;">
          Error loading history. Please try again.
        </td>
      </tr>
    `;
    console.error("History fetch error:", err);
  }
}


function loadHistory() {
  try {
    const raw = localStorage.getItem("encap:history");
    if (!raw) return buildSampleHistory();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return buildSampleHistory();
    }
    return parsed;
  } catch (_) {
    return buildSampleHistory();
  }
}

function computeStats(items) {
  const stats = { total: items.length, high: 0, moderate: 0, low: 0 };
  items.forEach((item) => {
    if (item.risk === "High") stats.high++;
    else if (item.risk === "Moderate") stats.moderate++;
    else if (item.risk === "Low") stats.low++;
  });
  return stats;
}

function buildSampleHistory() {
  const today = new Date();
  const iso = (d) => d.toISOString().split("T")[0];
  return [
    {
      headline: "You won’t believe this secret cure spreading online",
      source: "unknown-health-blog.com",
      score: 42,
      risk: "High",
      date: iso(today),
    },
    {
      headline: "Government announces new transparency initiative",
      source: "trusted-news.example",
      score: 86,
      risk: "Low",
      date: iso(new Date(today.getTime() - 86400000)),
    },
    {
      headline: "Markets shocked by unexpected tech merger",
      source: "global-finance.example",
      score: 71,
      risk: "Moderate",
      date: iso(new Date(today.getTime() - 2 * 86400000)),
    },
    {
      headline: "Local community combats misinformation with workshops",
      source: "city-journal.example",
      score: 90,
      risk: "Low",
      date: iso(new Date(today.getTime() - 3 * 86400000)),
    },
    {
      headline: "Mysterious cure-all claims debunked by experts",
      source: "fact-checkers.example",
      score: 64,
      risk: "Moderate",
      date: iso(new Date(today.getTime() - 4 * 86400000)),
    },
  ];
}

function buildHistoryRow(item) {
  const tr = document.createElement("tr");
  const riskClass =
    item.risk === "Low" ? "low" : item.risk === "Moderate" ? "moderate" : "high";

  tr.innerHTML = `
    <td>${escapeHtml(item.headline)}</td>
    <td>${escapeHtml(item.source || "—")}</td>
    <td>${item.score}</td>
    <td>
      <span class="badge-risk ${riskClass}">${item.risk} Risk</span>
    </td>
    <td>${escapeHtml(item.date)}</td>
    <td>
      <button type="button" class="btn btn-table" data-view-report>View Report</button>
    </td>
  `;

  const btn = tr.querySelector("[data-view-report]");
  if (btn) {
    btn.addEventListener("click", () => {
      try {
        sessionStorage.setItem("encap:selectedItem", JSON.stringify(item));
      } catch (_) {
        // ignore
      }
      window.location.href = "result.html";
    });
  }

  return tr;
}
function buildHistoryRowFromDB(item) {
  const tr = document.createElement("tr");

  // Map risk_level string to CSS class
  const risk      = item.risk_level || "";
  const riskClass = risk.toLowerCase().includes("low")      ? "low"
                  : risk.toLowerCase().includes("moderate") ? "moderate"
                  : "high";

  // Format date
  const date = item.created_at
    ? item.created_at.split(" ")[0]
    : "—";

  tr.innerHTML = `
    <td>${escapeHtml(item.title || "—")}</td>
    <td>${escapeHtml(item.source || "—")}</td>
    <td>${Math.round(item.credibility_score)}</td>
    <td><span class="badge-risk ${riskClass}">${escapeHtml(risk)}</span></td>
    <td>${escapeHtml(date)}</td>
    <td>
      <button type="button" class="btn btn-table" data-article-id="${item.article_id}">
        View Report
      </button>
    </td>
  `;

  // View Report button — stores article_id and redirects
  tr.querySelector("button").addEventListener("click", () => {
    try {
      sessionStorage.setItem("encap:lastResult", JSON.stringify({
        article_id: item.article_id,
      }));
    } catch (_) {}
    window.location.href = "result.html";
  });

  return tr;
}
// ---------------------------------------------------------
// Authentication Page

// ----------------------------------------------------------

function initAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async(event) => {
      event.preventDefault();
      clearErrors(loginForm);
      

      const email = loginForm.querySelector("#loginEmail");
      const password = loginForm.querySelector("#loginPassword");

      const errors = [];
      if (!email.value.trim()) {
        errors.push({ field: email, message: "Email is required." });
      } else if (!isValidEmail(email.value.trim())) {
        errors.push({ field: email, message: "Enter a valid email address." });
      }
      if (!password.value) {
        errors.push({ field: password, message: "Password is required." });
      }

      if (errors.length) {
        errors.forEach((e) => showFieldError(e.field, e.message));
        return;
      }

            try {
        const response = await fetch("/ENCAPproject/backend/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          showFieldError(email, result.error || "Invalid credentials.");
          return;
        }

        window.location.href = "dashboard.html";

      } catch (err) {
        showFieldError(email, "Network error. Please try again.");
      }

    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit",  async(event) => {
      event.preventDefault();
      clearErrors(registerForm);

      const name = registerForm.querySelector("#registerName");
      const email = registerForm.querySelector("#registerEmail");
      const password = registerForm.querySelector("#registerPassword");
      const confirm = registerForm.querySelector("#registerConfirmPassword");

      const errors = [];
      if (!name.value.trim()) {
        errors.push({ field: name, message: "Name is required." });
      }
      if (!email.value.trim()) {
        errors.push({ field: email, message: "Email is required." });
      } else if (!isValidEmail(email.value.trim())) {
        errors.push({ field: email, message: "Enter a valid email address." });
      }
      if (!password.value) {
        errors.push({ field: password, message: "Password is required." });
      } else if (password.value.length < 8) {
        errors.push({
          field: password,
          message: "Use at least 8 characters for your password.",
        });
      }
      if (!confirm.value) {
        errors.push({ field: confirm, message: "Confirm your password." });
      } else if (confirm.value !== password.value) {
        errors.push({ field: confirm, message: "Passwords do not match." });
      }

      if (errors.length) {
        errors.forEach((e) => showFieldError(e.field, e.message));
        return;
      }

       try {
        const response = await fetch("/ENCAPproject/backend/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          showFieldError(email, result.error || "Registration failed.");
          return;
        }

        window.location.href = "login.html";

      } catch (err) {
        showFieldError(email, "Network error. Please try again.");
      }
    });
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Check auth and update nav
  const user = await checkAuth();
  updateNav(user);

  initAnalyzeForm();
  initResultsPage();
  initHistoryPage();
  initDashboardPage();
  initAuthForms();
});

function updateNav(user) {
  const loginLink = document.querySelector('.nav-links a[href="login.html"]');
  if (!loginLink) return;

  if (user) {
    // Replace Login link with user name + logout
    loginLink.textContent = user.name.split(" ")[0]; // first name
    loginLink.href = "#";
    loginLink.style.color = "var(--accent)";

    // Add logout on click
    loginLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch("/ENCAPproject/backend/api/logout", { method: "POST" });
      window.location.href = "login.html";
    });
  }
}