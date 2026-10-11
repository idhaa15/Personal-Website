const blueprintCanvases = [...document.querySelectorAll('[data-blueprint-grid]')];
const introRibbonCanvas = document.querySelector('[data-intro-ribbon]');
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointer = { x: -1000, y: -1000, active: false };
let blueprintFrame = 0;
let startTime = performance.now();

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const context = canvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { context, rect, width: rect.width, height: rect.height };
}

function warpedPoint(x, y, localPointer, time) {
  if (!pointer.active || motionReduced.matches) return { x, y };
  const dx = x - localPointer.x;
  const dy = y - localPointer.y;
  const distance = Math.hypot(dx, dy);
  const radius = 185;
  if (!distance || distance >= radius) return { x, y };
  const influence = Math.pow(1 - distance / radius, 2);
  const pulse = 1 + Math.sin(time * 0.003 + distance * 0.04) * 0.12;
  const force = influence * 28 * pulse;
  return { x: x + (dx / distance) * force, y: y + (dy / distance) * force };
}

function drawGrid(canvas, time) {
  const { context, rect, width, height } = fitCanvas(canvas);
  if (rect.bottom < -40 || rect.top > innerHeight + 40) return;
  context.clearRect(0, 0, width, height);
  const isLightGrid = Boolean(canvas.closest('.projects, .extracurriculars'));
  const shade = isLightGrid ? 22 : 178;
  const alpha = isLightGrid ? 0.2 : 0.27;
  context.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
  context.lineWidth = 1;
  const size = 30;
  const step = 12;
  const localPointer = { x: pointer.x - rect.left, y: pointer.y - rect.top };

  for (let x = 0; x <= width + size; x += size) {
    context.beginPath();
    for (let y = 0; y <= height + step; y += step) {
      const point = warpedPoint(x, y, localPointer, time);
      if (y === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
  }

  for (let y = 0; y <= height + size; y += size) {
    context.beginPath();
    for (let x = 0; x <= width + step; x += step) {
      const point = warpedPoint(x, y, localPointer, time);
      if (x === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    }
    context.stroke();
  }

  if (pointer.active && !motionReduced.matches) {
    const gradient = context.createRadialGradient(localPointer.x, localPointer.y, 0, localPointer.x, localPointer.y, 145);
    gradient.addColorStop(0, `rgba(${shade}, ${shade}, ${shade}, ${isLightGrid ? 0.13 : 0.18})`);
    gradient.addColorStop(1, `rgba(${shade}, ${shade}, ${shade}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(localPointer.x - 145, localPointer.y - 145, 290, 290);
  }
}

function drawIntroRibbon(time) {
  if (!introRibbonCanvas) return;
  const { context, width, height } = fitCanvas(introRibbonCanvas);
  context.clearRect(0, 0, width, height);

  const seconds = motionReduced.matches ? 3.4 : time * 0.001;
  const breathing = motionReduced.matches ? 0 : Math.sin(seconds * 0.28) * 5;
  const pointCount = 120;
  const centers = [];
  const baseHalfWidth = Math.max(24, Math.min(36, width * 0.035));

  for (let index = 0; index <= pointCount; index += 1) {
    const t = index / pointCount;
    const x = width * (-0.08 + t * 1.16);
    const y = height * (
      0.67 - t * 0.28
      + Math.sin(t * Math.PI * 2.05 + 0.3) * 0.064
      + Math.sin(t * Math.PI * 4.2 - 0.7) * 0.012
    ) + breathing;
    const halfWidth = baseHalfWidth * (0.96 + Math.sin(t * Math.PI * 2.4 + 0.45) * 0.1);
    centers.push({ x, y, halfWidth });
  }

  const ribbonPoints = centers.map((point, index) => {
    const previous = centers[Math.max(0, index - 1)];
    const next = centers[Math.min(centers.length - 1, index + 1)];
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const length = Math.hypot(dx, dy) || 1;
    return {
      ...point,
      nx: -dy / length,
      ny: dx / length,
    };
  });

  const body = new Path2D();
  ribbonPoints.forEach((point, index) => {
    const x = point.x + point.nx * point.halfWidth;
    const y = point.y + point.ny * point.halfWidth;
    if (index === 0) body.moveTo(x, y);
    else body.lineTo(x, y);
  });
  for (let index = ribbonPoints.length - 1; index >= 0; index -= 1) {
    const point = ribbonPoints[index];
    body.lineTo(point.x - point.nx * point.halfWidth, point.y - point.ny * point.halfWidth);
  }
  body.closePath();

  const gradient = context.createLinearGradient(0, height * 0.72, width, height * 0.26);
  gradient.addColorStop(0, 'rgba(255, 190, 220, 0.58)');
  gradient.addColorStop(0.2, 'rgba(240, 92, 165, 0.76)');
  gradient.addColorStop(0.43, 'rgba(215, 52, 149, 0.82)');
  gradient.addColorStop(0.66, 'rgba(164, 61, 161, 0.74)');
  gradient.addColorStop(0.84, 'rgba(235, 76, 164, 0.74)');
  gradient.addColorStop(1, 'rgba(255, 184, 216, 0.48)');

  context.save();
  context.shadowColor = 'rgba(236, 72, 168, 0.34)';
  context.shadowBlur = 26;
  context.fillStyle = gradient;
  context.fill(body);
  context.restore();

  context.save();
  context.clip(body);
  const travel = motionReduced.matches ? 0.48 : ((seconds * 0.055) % 1.4) - 0.2;
  const lightX = travel * width;
  const lightWidth = Math.max(90, width * 0.13);
  const travelingLight = context.createLinearGradient(lightX - lightWidth, 0, lightX + lightWidth, 0);
  travelingLight.addColorStop(0, 'rgba(255, 244, 249, 0)');
  travelingLight.addColorStop(0.34, 'rgba(255, 220, 239, 0.2)');
  travelingLight.addColorStop(0.5, 'rgba(255, 253, 254, 0.76)');
  travelingLight.addColorStop(0.66, 'rgba(255, 203, 232, 0.22)');
  travelingLight.addColorStop(1, 'rgba(255, 244, 249, 0)');
  context.globalCompositeOperation = 'screen';
  context.fillStyle = travelingLight;
  context.fillRect(0, 0, width, height);
  context.restore();

  function traceFold(offset, strokeStyle, lineWidth) {
    context.beginPath();
    ribbonPoints.forEach((point, index) => {
      const fold = offset + Math.sin(index * 0.095 + 0.7) * 0.025;
      const x = point.x + point.nx * point.halfWidth * fold;
      const y = point.y + point.ny * point.halfWidth * fold;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  traceFold(-0.62, 'rgba(255, 226, 239, 0.18)', 1.2);
  traceFold(-0.18, 'rgba(255, 235, 245, 0.28)', 1.6);
  traceFold(0.28, 'rgba(255, 164, 206, 0.2)', 1.1);
  traceFold(0.7, 'rgba(141, 47, 133, 0.22)', 1.4);
}

function renderBlueprint(time) {
  blueprintCanvases.forEach(canvas => drawGrid(canvas, time));
  drawIntroRibbon(time - startTime);
  blueprintFrame = requestAnimationFrame(renderBlueprint);
}

window.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => { pointer.active = false; });
window.addEventListener('blur', () => { pointer.active = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(blueprintFrame);
    blueprintFrame = 0;
  } else if (!blueprintFrame) {
    startTime = performance.now();
    blueprintFrame = requestAnimationFrame(renderBlueprint);
  }
});

blueprintFrame = requestAnimationFrame(renderBlueprint);
