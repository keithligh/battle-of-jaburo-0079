/* =====================================================================
 *  flags.js: the Battle of Jaburo faction flags (pure canvas art, no image assets).
 *  ---------------------------------------------------------------------
 *  The `flags` registry maps a flag id (the string in data.js `unit.flag` /
 *  `faction.defaultFlag`) to a painter (ctx) => void drawn on a W x H canvas.
 *
 *  These are the period-correct (One Year War, U.C.0079) faction emblems of
 *  Mobile Suit Gundam, drawn as simple vector art:
 *    - eff  : Earth Federation: gold four-pointed compass-star above an upturned
 *             crescent (an anchor-like device), on a Federation-blue field.
 *    - zeon : Principality of Zeon: the gold "Sigil of Zeon" crest (a stylized
 *             organic sprout inside a broken spiked ring), on a red field.
 *  Both emblems are FICTIONAL insignia. Neither is or resembles any real-world
 *  prohibited symbol (see Research_Brief_BattleOfJaburo.md section 6). Colours:
 *  Zeon red #C8102E + gold #F2E10E; Federation blue #2139B1 + gold #FDD000.
 * ===================================================================== */
import { FAC } from "./config.js";   // only the unknown-flag fallback needs it; the painters are pure (per-battle) art
const W = 230, H = 150;

/* ---- reusable primitives ---- */
const fill = (c, color) => { c.fillStyle = color; c.fillRect(0, 0, W, H); };
const disc = (c, x, y, r, color) => { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
const star = (c, x, y, r, n, color) => { c.fillStyle = color; c.beginPath();   // an n-point star
  for (let i = 0; i < n * 2; i++) { const a = Math.PI / n * i - Math.PI / 2, rr = i % 2 ? r * 0.40 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.fill(); };
const tri = (c, x, y, r, color) => { c.fillStyle = color; c.beginPath();       // a solid triangle pointing up
  c.moveTo(x, y - r); c.lineTo(x + r * 0.86, y + r * 0.74); c.lineTo(x - r * 0.86, y + r * 0.74); c.closePath(); c.fill(); };

/* ---- the two faction flags ---- */
const flags = {
  // Earth Federation: gold star + upturned crescent (anchor-like) on Federation blue.
  eff: (c) => {
    fill(c, "#2139B1");
    const cx = W * 0.5, gold = "#FDD000", blue = "#2139B1";
    // upturned crescent: a gold disc with a field-blue disc carved out of its upper part
    disc(c, cx, H * 0.66, H * 0.30, gold);
    disc(c, cx, H * 0.52, H * 0.275, blue);
    // four-pointed compass star above, its lower ray reaching into the crescent (the "anchor")
    star(c, cx, H * 0.45, H * 0.24, 4, gold);
  },

  // Principality of Zeon: the gold Sigil of Zeon (organic sprout in a broken spiked ring) on red.
  zeon: (c) => {
    fill(c, "#C8102E");
    const cx = W * 0.5, cy = H * 0.5, R = H * 0.40, gold = "#F2E10E";
    c.fillStyle = gold; c.strokeStyle = gold;
    // broken spiked ring: outward thorns around a thin ring, with a gap at the bottom
    const spikes = 12;
    for (let i = 0; i < spikes; i++) {
      const a = -Math.PI / 2 + i / spikes * Math.PI * 2;
      const deg = (a * 180 / Math.PI + 360) % 360;
      if (deg > 70 && deg < 110) continue;                 // gap at the bottom -> the ring reads "broken"
      const tx = cx + Math.cos(a) * (R + H * 0.11), ty = cy + Math.sin(a) * (R + H * 0.11);
      const pa = a + 0.12, pb = a - 0.12;
      c.beginPath();
      c.moveTo(cx + Math.cos(pa) * R, cy + Math.sin(pa) * R);
      c.lineTo(tx, ty);
      c.lineTo(cx + Math.cos(pb) * R, cy + Math.sin(pb) * R);
      c.closePath(); c.fill();
    }
    // the thin ring itself, with a small gap at the bottom
    c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, R, Math.PI * 0.5 + 0.4, Math.PI * 0.5 + Math.PI * 2 - 0.4); c.stroke();
    // central sprout: two curved blades sweeping up and out from a common base
    c.fillStyle = gold;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx, cy + R * 0.42);
      c.quadraticCurveTo(cx + s * R * 0.72, cy + R * 0.05, cx + s * R * 0.44, cy - R * 0.55);
      c.quadraticCurveTo(cx + s * R * 0.14, cy - R * 0.05, cx, cy + R * 0.10);
      c.closePath(); c.fill();
    }
    // central stalk + spearhead piercing up through the top of the ring
    c.lineWidth = 5;
    c.beginPath(); c.moveTo(cx, cy + R * 0.50); c.lineTo(cx, cy - R * 0.42); c.stroke();
    tri(c, cx, cy - R * 0.58, H * 0.12, gold);
  },
};

const cache = {};
export function flagTexture(unit) {
  if (cache[unit.id]) return cache[unit.id];
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const draw = flags[unit.flag];
  if (!draw) console.warn(`unknown flag "${unit.flag}" for ${unit.id}; falling back by faction`);
  (draw || flags[FAC[unit.faction] && FAC[unit.faction].defaultFlag] || Object.values(flags)[0])(c);   // fall back to the faction's default flag, never a named faction
  // subtle hoist (pole-edge) shadow for depth, then a thin neutral edge so the cloth reads against the terrain
  const sh = c.createLinearGradient(0, 0, W * 0.18, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.26)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh; c.fillRect(0, 0, W * 0.18, H);
  c.strokeStyle = "rgba(0,0,0,0.45)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, W - 3, H - 3);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  cache[unit.id] = tex; return tex;
}
