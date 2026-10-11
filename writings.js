const writingsSection = document.querySelector('.writings');
const writingCards = [...document.querySelectorAll('[data-writing-card]')];
const writingReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (writingsSection) {
  const writingObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) writingsSection.classList.add('is-visible');
  }, { threshold: 0.16 });
  writingObserver.observe(writingsSection);
}

writingCards.forEach(card => {
  card.addEventListener('pointermove', event => {
    if (writingReducedMotion.matches || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--writing-x', `${(y * -3).toFixed(2)}deg`);
    card.style.setProperty('--writing-y', `${(x * 4).toFixed(2)}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--writing-x', '0deg');
    card.style.setProperty('--writing-y', '0deg');
  });
});
