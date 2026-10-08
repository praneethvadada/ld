import { useEffect, useRef } from 'react';
import './Confetti.css';

// Festival colours from the garland and the brand palette.
const COLORS = ['#e8b031', '#efca5b', '#f59e0b', '#c03b2a', '#dc2626', '#2a6d20', '#25af7e'];
const DURATION_MS = 4600;
const FADE_MS = 900;
const GRAVITY = 0.2;
const DRAG = 0.985;

const random = (min, max) => min + Math.random() * (max - min);

// Half the pieces are fired from the two bottom corners, the rest drift down from above.
function createPiece(index, width, height) {
  const piece = {
    size: random(6, 12),
    color: COLORS[index % COLORS.length],
    round: index % 3 === 0,
    rotation: random(0, Math.PI * 2),
    spin: random(-0.2, 0.2),
    flip: random(0, Math.PI * 2),
    flipSpeed: random(0.06, 0.16),
    sway: random(0.3, 1.1),
  };

  if (index % 2 === 0) {
    const fromLeft = index % 4 === 0;
    const angle = (fromLeft ? -Math.PI / 3 : (-2 * Math.PI) / 3) + random(-0.45, 0.45);
    const speed = random(10, 20) * Math.min(1.7, Math.max(1, width / 700));
    return {
      ...piece,
      x: fromLeft ? -10 : width + 10,
      y: height * random(0.6, 0.85),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  }

  return {
    ...piece,
    x: random(0, width),
    y: -random(20, height * 0.6),
    vx: random(-1, 1),
    vy: random(1.5, 4),
  };
}

/** A single burst of confetti over the whole viewport. Draws nothing for visitors who prefer reduced motion. */
export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const count = Math.round(Math.min(170, Math.max(90, width / 7)));
    const pieces = Array.from({ length: count }, (_, index) => createPiece(index, width, height));

    const startedAt = performance.now();
    let previous = startedAt;
    let frame = 0;

    function draw(now) {
      const elapsed = now - startedAt;
      // Step in units of one 60fps frame so the motion looks the same on every display.
      const step = Math.min((now - previous) / 16.67, 3);
      previous = now;

      context.clearRect(0, 0, width, height);
      if (elapsed > DURATION_MS + FADE_MS) return;

      context.globalAlpha = elapsed < DURATION_MS ? 1 : 1 - (elapsed - DURATION_MS) / FADE_MS;

      for (const piece of pieces) {
        piece.vy += GRAVITY * step;
        piece.vx *= DRAG ** step;
        piece.vy *= DRAG ** step;
        piece.flip += piece.flipSpeed * step;
        piece.rotation += piece.spin * step;
        piece.x += (piece.vx + Math.sin(piece.flip) * piece.sway) * step;
        piece.y += piece.vy * step;

        if (piece.y > height + 20) continue;

        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        if (piece.round) {
          context.beginPath();
          context.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          // Squash the height to make the paper appear to tumble.
          const tumble = Math.max(0.15, Math.abs(Math.cos(piece.flip)));
          context.fillRect(-piece.size / 2, (-piece.size * 0.6 * tumble) / 2, piece.size, piece.size * 0.6 * tumble);
        }
        context.restore();
      }

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />;
}
