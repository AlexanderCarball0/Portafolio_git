// PERSONAL PORTFOLIO — interactions (no button-triggered cobra animation)
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open menu");
  });
});

// Reveal each section as it enters the viewport.
const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

// Highlight the navigation link for the visible section.
const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach((section) => sectionObserver.observe(section));

// Form: validate and prepare an email. Replace the destination address.
const contactForm = document.querySelector("#contact-form");
const formNote = document.querySelector("#form-note");
const destinationEmail = "alexandermelquisedec18.0@gmail.com";

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get("name")).trim();
  const email = String(formData.get("email")).trim();
  const message = String(formData.get("message")).trim();

  if (!name || !email || !message) {
    formNote.textContent = "Please complete all fields before continuing.";
    return;
  }

  const subject = encodeURIComponent(`Message from your portfolio — ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  formNote.textContent = "Your email app will open with the message ready to send.";
  window.location.href = `mailto:${destinationEmail}?subject=${subject}&body=${body}`;
});

document.querySelector("#year").textContent = new Date().getFullYear();




// Green holographic cursor with a luminous trail (no snake shape).
(() => {
  if (!window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const trail = document.createElement('canvas');
  trail.className = 'holo-trail';
  trail.setAttribute('aria-hidden', 'true');
  document.body.appendChild(trail);
  const ctx = trail.getContext('2d');

  const pointer = document.createElement('div');
  pointer.className = 'holo-cursor';
  pointer.setAttribute('aria-hidden', 'true');
  pointer.innerHTML = `
    <svg viewBox="0 0 64 64" role="presentation">
      <circle class="cursor-glow" cx="32" cy="32" r="17" />
      <circle class="cursor-ring" cx="32" cy="32" r="14" />
      <path class="cursor-cross" d="M32 3v10 M32 51v10 M3 32h10 M51 32h10 M20 20l5 5 M44 20l-5 5 M20 44l5-5 M44 44l-5-5" />
      <circle class="cursor-core" cx="32" cy="32" r="3.2" />
    </svg>`;
  document.body.appendChild(pointer);
  document.body.classList.add('holo-cursor-enabled');

  const points = [];
  let width = 0, height = 0, dpr = 1, x = -100, y = -100;
  let frame = 0, lastDraw = 0;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth; height = window.innerHeight;
    trail.width = Math.round(width * dpr);
    trail.height = Math.round(height * dpr);
    trail.style.width = `${width}px`; trail.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);
    // Soft strokes gradually fade behind the pointer.
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      const age = (time - point.time) / 520;
      if (age >= 1) { points.splice(i, 1); continue; }
      const alpha = (1 - age) * .72;
      ctx.beginPath();
      ctx.arc(point.x, point.y, Math.max(1, 3.2 * (1 - age)), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(57,255,20,${alpha})`;
      ctx.shadowColor = '#39ff14';
      ctx.shadowBlur = 13 * (1 - age);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (points.length > 1) {
      ctx.beginPath();
      points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.strokeStyle = 'rgba(91,255,48,.22)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#39ff14'; ctx.shadowBlur = 10;
      ctx.stroke(); ctx.shadowBlur = 0;
    }
    if (points.length || pointer.classList.contains('is-visible')) frame = requestAnimationFrame(draw);
    else frame = 0;
    lastDraw = time;
  };

  window.addEventListener('mousemove', (event) => {
    x = event.clientX; y = event.clientY;
    pointer.style.transform = `translate3d(${x - 17}px,${y - 17}px,0)`;
    pointer.classList.add('is-visible');
    points.push({ x, y, time: performance.now() });
    if (points.length > 24) points.shift();
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    pointer.classList.remove('is-visible');
    points.length = 0;
    ctx.clearRect(0, 0, width, height);
  });
})();


// Interactive project cards: subtle pointer tilt on desktop and tap feedback on touch screens.
(() => {
  const cards = document.querySelectorAll("[data-tilt]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  cards.forEach((card) => {
    if (finePointer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 4;
        const rotateX = (0.5 - py) * 4;
        card.style.setProperty("--pointer-x", `${px * 100}%`);
        card.style.setProperty("--pointer-y", `${py * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    }
    card.addEventListener("pointerdown", () => {
      card.classList.add("is-touched");
      window.setTimeout(() => card.classList.remove("is-touched"), 450);
    }, { passive: true });
  });
})();
