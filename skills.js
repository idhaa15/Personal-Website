const arsenalSection = document.querySelector('.arsenal');
const arsenalWindow = document.querySelector('[data-arsenal-window]');
const skillTabs = [...document.querySelectorAll('[data-skill-tab]')];
const skillPanels = [...document.querySelectorAll('[data-skill-panel]')];
const reducedSkillsMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (arsenalSection) {
  const revealObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) arsenalSection.classList.add('is-visible');
  }, { threshold: 0.18 });
  revealObserver.observe(arsenalSection);
}

function selectSkillPanel(id, focusTab = false) {
  skillTabs.forEach(tab => {
    const active = tab.dataset.skillTab === id;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    if (active && focusTab) tab.focus();
  });

  skillPanels.forEach(panel => {
    const active = panel.dataset.skillPanel === id;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
}

skillTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSkillPanel(tab.dataset.skillTab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
    const next = (index + direction + skillTabs.length) % skillTabs.length;
    selectSkillPanel(skillTabs[next].dataset.skillTab, true);
  });
});

if (arsenalWindow) {
  arsenalWindow.addEventListener('pointermove', event => {
    const content = event.target.closest('[data-arsenal-content]');
    if (content) {
      const rect = content.getBoundingClientRect();
      content.style.setProperty('--arsenal-x', `${event.clientX - rect.left}px`);
      content.style.setProperty('--arsenal-y', `${event.clientY - rect.top}px`);
    }

    const tile = event.target.closest('[data-skill-tile]');
    if (!tile || reducedSkillsMotion.matches) return;
    const rect = tile.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 7;
    tile.style.setProperty('--skill-x', `${x.toFixed(2)}px`);
    tile.style.setProperty('--skill-y', `${y.toFixed(2)}px`);
  });

  arsenalWindow.addEventListener('pointerout', event => {
    const tile = event.target.closest('[data-skill-tile]');
    if (!tile || tile.contains(event.relatedTarget)) return;
    tile.style.setProperty('--skill-x', '0px');
    tile.style.setProperty('--skill-y', '0px');
  });
}
