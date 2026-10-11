const projectViewport = document.querySelector('.projects__viewport');
const projectCards = [...document.querySelectorAll('[data-project-card]')];
const projectPrev = document.querySelector('[data-project-prev]');
const projectNext = document.querySelector('[data-project-next]');
const projectCount = document.querySelector('[data-project-count]');
const projectsSection = document.querySelector('.projects');

if (projectsSection) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealFrame = 0;

  projectsSection.classList.add('has-scroll-transition');

  function updateProjectsReveal() {
    const rect = projectsSection.getBoundingClientRect();
    const revealDistance = window.innerHeight * 0.72;
    const progress = reducedMotion.matches
      ? 1
      : Math.max(0, Math.min(1, (window.innerHeight - rect.top) / revealDistance));
    const eased = 1 - Math.pow(1 - progress, 3);

    projectsSection.style.setProperty('--projects-opacity', eased.toFixed(3));
    projectsSection.style.setProperty('--projects-heading-offset', `${((1 - eased) * 70).toFixed(2)}px`);
    projectsSection.style.setProperty('--projects-card-offset', `${((1 - eased) * 130).toFixed(2)}px`);
    projectsSection.style.setProperty('--projects-tilt', `${((1 - eased) * 10).toFixed(2)}deg`);
    projectsSection.style.setProperty('--projects-scale', (0.92 + eased * 0.08).toFixed(3));
    projectsSection.style.setProperty('--projects-blur', `${((1 - eased) * 7).toFixed(2)}px`);
    projectsSection.style.setProperty('--projects-line', `${(eased * 100).toFixed(2)}%`);
    projectsSection.style.setProperty('--projects-glow-opacity', (eased * 0.2).toFixed(3));
    const darkThemeIncoming = [...document.querySelectorAll('.arsenal, .writings')]
      .some(section => {
        const sectionRect = section.getBoundingClientRect();
        return sectionRect.top <= 72 && sectionRect.bottom > 0;
      }) || [...document.querySelectorAll('.contact')]
      .some(section => {
        const sectionRect = section.getBoundingClientRect();
        return sectionRect.top <= 0 && sectionRect.bottom > 0;
      });
    const lightThemeActive = !darkThemeIncoming && [...document.querySelectorAll('.projects, .extracurriculars')]
      .some(section => {
        const sectionRect = section.getBoundingClientRect();
        const trigger = 0;
        return sectionRect.top <= trigger && sectionRect.bottom > trigger;
      });
    document.body.classList.toggle('is-projects-theme', lightThemeActive);
    revealFrame = 0;
  }

  function requestProjectsReveal() {
    if (!revealFrame) revealFrame = requestAnimationFrame(updateProjectsReveal);
  }

  window.addEventListener('scroll', requestProjectsReveal, { passive: true });
  window.addEventListener('resize', requestProjectsReveal, { passive: true });
  reducedMotion.addEventListener('change', requestProjectsReveal);
  updateProjectsReveal();
}

if (projectViewport && projectCards.length) {
  let animationFrame = 0;
  let activeIndex = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  const cardSprings = projectCards.map(() => ({
    x: 0, y: 0, lift: 0,
    targetX: 0, targetY: 0, targetLift: 0,
  }));
  let springFrame = 0;

  function animateCardSprings() {
    let moving = false;
    cardSprings.forEach((spring, index) => {
      ['x', 'y', 'lift'].forEach((key) => {
        const target = spring[`target${key[0].toUpperCase()}${key.slice(1)}`];
        spring[key] += (target - spring[key]) * 0.13;
        if (Math.abs(target - spring[key]) > 0.01) moving = true;
      });
      const card = projectCards[index];
      card.style.setProperty('--card-pointer-x', `${spring.x.toFixed(2)}deg`);
      card.style.setProperty('--card-pointer-y', `${spring.y.toFixed(2)}deg`);
      card.style.setProperty('--card-pointer-lift', `${spring.lift.toFixed(2)}px`);
    });
    springFrame = moving ? requestAnimationFrame(animateCardSprings) : 0;
  }

  function requestSpringFrame() {
    if (!springFrame) springFrame = requestAnimationFrame(animateCardSprings);
  }

  projectCards.forEach((card, index) => {
    card.addEventListener('pointermove', (event) => {
      if (dragging || event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const spring = cardSprings[index];
      spring.targetX = py * -7;
      spring.targetY = px * 9;
      spring.targetLift = -10;
      requestSpringFrame();
    });
    card.addEventListener('pointerleave', () => {
      const spring = cardSprings[index];
      spring.targetX = 0;
      spring.targetY = 0;
      spring.targetLift = 0;
      requestSpringFrame();
    });
  });

  function updateProjects() {
    const viewportRect = projectViewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    let closestDistance = Infinity;
    let nextActiveIndex = 0;

    projectCards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const rawDistance = (cardCenter - viewportCenter) / cardRect.width;
      const direction = Math.max(-1, Math.min(1, rawDistance));
      const distance = Math.min(1.8, Math.abs(rawDistance));

      card.style.setProperty('--card-distance', distance.toFixed(3));
      card.style.setProperty('--card-direction', direction.toFixed(3));
      card.style.zIndex = String(100 - Math.round(distance * 10));

      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    activeIndex = nextActiveIndex;
    projectCount.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(projectCards.length).padStart(2, '0')}`;
    animationFrame = 0;
  }

  function requestProjectUpdate() {
    if (!animationFrame) animationFrame = requestAnimationFrame(updateProjects);
  }

  function scrollToProject(index) {
    const boundedIndex = Math.max(0, Math.min(projectCards.length - 1, index));
    projectCards[boundedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  projectViewport.addEventListener('scroll', requestProjectUpdate, { passive: true });
  window.addEventListener('resize', requestProjectUpdate, { passive: true });

  projectViewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragging = true;
    dragStartX = event.clientX;
    dragStartScroll = projectViewport.scrollLeft;
    projectViewport.classList.add('is-dragging');
    projectViewport.setPointerCapture(event.pointerId);
  });

  projectViewport.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    projectViewport.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  });

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;
    projectViewport.classList.remove('is-dragging');
    if (projectViewport.hasPointerCapture(event.pointerId)) projectViewport.releasePointerCapture(event.pointerId);
    scrollToProject(activeIndex);
  }

  projectViewport.addEventListener('pointerup', endDrag);
  projectViewport.addEventListener('pointercancel', endDrag);
  projectViewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToProject(activeIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToProject(activeIndex - 1);
    }
  });

  projectPrev.addEventListener('click', () => scrollToProject(activeIndex - 1));
  projectNext.addEventListener('click', () => scrollToProject(activeIndex + 1));
  updateProjects();
}
