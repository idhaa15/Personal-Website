const extracurricularsSection = document.querySelector('.extracurriculars');
const archiveCards = [...document.querySelectorAll('[data-archive-card]')];
const cardDecks = [...document.querySelectorAll('[data-card-deck]')];
const photoRotators = [...document.querySelectorAll('[data-photo-rotator]')];
const musicRotators = [...document.querySelectorAll('[data-music-rotator]')];
const archiveReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (extracurricularsSection) {
  const archiveObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) extracurricularsSection.classList.add('is-visible');
  }, { threshold: 0.08 });
  archiveObserver.observe(extracurricularsSection);
}

archiveCards.forEach(card => {
  card.addEventListener('pointermove', event => {
    if (archiveReducedMotion.matches || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--archive-rotate-x', `${(y * -1.4).toFixed(2)}deg`);
    card.style.setProperty('--archive-rotate-y', `${(x * 1.8).toFixed(2)}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--archive-rotate-x', '0deg');
    card.style.setProperty('--archive-rotate-y', '0deg');
  });
});

cardDecks.forEach(deck => {
  const slides = [...deck.querySelectorAll('[data-deck-slide]')];
  const next = deck.querySelector('[data-deck-next]');
  const count = deck.querySelector('[data-deck-count]');
  let activeIndex = 0;
  let turning = false;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.hidden = !active;
      slide.classList.toggle('is-active', active);
    });
    count.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  next.addEventListener('click', () => {
    if (turning) return;
    if (archiveReducedMotion.matches) {
      showSlide(activeIndex + 1);
      return;
    }
    turning = true;
    deck.classList.add('is-turning');
    window.setTimeout(() => {
      showSlide(activeIndex + 1);
      deck.classList.remove('is-turning');
      window.setTimeout(() => { turning = false; }, 190);
    }, 190);
  });
});

function startRotator(root, slideSelector, interval, onChange) {
  const slides = [...root.querySelectorAll(slideSelector)];
  if (slides.length < 2 || archiveReducedMotion.matches) return;
  let activeIndex = 0;
  let timer = 0;

  function advance() {
    activeIndex = (activeIndex + 1) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      if (slide.matches('[data-music-slide]')) slide.hidden = !active;
      slide.classList.toggle('is-active', active);
    });
    if (onChange) onChange(activeIndex);
  }

  function start() {
    window.clearInterval(timer);
    timer = window.setInterval(advance, interval);
  }

  start();
}

photoRotators.forEach(rotator => {
  const dots = [...rotator.querySelectorAll('.photo-rotator__dots span')];
  const card = rotator.closest('.archive-card--tennis');
  const primaryCopy = card?.querySelector('[data-tennis-copy-primary]');
  const secondaryCopy = card?.querySelector('[data-tennis-copy-secondary]');
  let secondaryCycle = false;
  startRotator(rotator, '[data-photo-slide]', 3600, activeIndex => {
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeIndex));
    if (activeIndex === 0) {
      secondaryCycle = !secondaryCycle;
      if (primaryCopy) primaryCopy.hidden = secondaryCycle;
      if (secondaryCopy) secondaryCopy.hidden = !secondaryCycle;
    }
  });
});

musicRotators.forEach(rotator => startRotator(rotator, '[data-music-slide]', 4200));
