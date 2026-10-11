const glow = document.querySelector('.pointer-glow') || document.querySelector('.background__glow');
let frame = 0;
let pointerX = 0;
let pointerY = 0;

function reveal(event) {
  // Touch screens keep the grid without the hover glow.
  if (event.pointerType === 'touch') return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (frame) return;
  frame = requestAnimationFrame(() => {
    glow.style.setProperty('--pointer-x', `${pointerX}px`);
    glow.style.setProperty('--pointer-y', `${pointerY}px`);
    glow.classList.add('is-active');
    frame = 0;
  });
}

function hide() {
  cancelAnimationFrame(frame);
  frame = 0;
  glow.classList.remove('is-active');
}

window.addEventListener('pointermove', reveal, { passive: true });
document.documentElement.addEventListener('pointerleave', hide);
window.addEventListener('pointercancel', hide);
window.addEventListener('blur', hide);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hide();
});
