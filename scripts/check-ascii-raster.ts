import assert from 'node:assert/strict';
import {
  applyTone,
  bayerShouldDraw,
  bayerThreshold,
  CHAR_SET,
  charForLum,
  clamp01,
  globeLuminance,
  hash2,
  luminanceRgb,
  markScale,
  pulseScale,
} from '../src/lib/asciiRaster.ts';

assert.equal(clamp01(-1), 0);
assert.equal(clamp01(2), 1);
assert.equal(clamp01(0.4), 0.4);

assert.equal(applyTone(0.5, { brightness: 0, contrast: 158, invert: false }), 0.5);
assert.equal(applyTone(0.5, { brightness: 0, contrast: 100, invert: true }), 0.5);
assert.ok(applyTone(0.75, { brightness: 0, contrast: 158, invert: false }) > 0.75);
assert.ok(applyTone(0.25, { brightness: 0, contrast: 158, invert: false }) < 0.25);
assert.equal(applyTone(1, { brightness: 0, contrast: 158, invert: false }), 1);
assert.equal(applyTone(0, { brightness: 0, contrast: 158, invert: false }), 0);

assert.equal(luminanceRgb(0, 0, 0), 0);
assert.ok(Math.abs(luminanceRgb(255, 255, 255) - 1) < 1e-12);

assert.ok(bayerThreshold(0, 0) > 0 && bayerThreshold(0, 0) < 1);
assert.equal(bayerShouldDraw(1, 0, 0), true);
assert.equal(bayerShouldDraw(0, 0, 0), false);
assert.equal(bayerShouldDraw(bayerThreshold(3, 2) + 0.01, 3, 2), true);
assert.equal(bayerShouldDraw(bayerThreshold(3, 2) - 0.01, 3, 2), false);

assert.equal(charForLum(0), CHAR_SET[0]);
assert.equal(charForLum(1), CHAR_SET[CHAR_SET.length - 1]);

assert.equal(pulseScale(0, 100, 60), 1);
assert.ok(markScale(20) > 0.3 && markScale(20) < 0.6);

assert.equal(globeLuminance(1.1, 0, 0), null);
assert.equal(globeLuminance(0, 1.1, 0), null);
const front = globeLuminance(0, 0, 0);
assert.ok(front != null && front > 0.5, 'disk center faces the light at yaw 0');
const back = globeLuminance(0, 0, Math.PI);
assert.ok(back != null && back < front!, 'yaw π turns the front point away from the light');

assert.notEqual(hash2(1, 2), hash2(2, 1));
assert.equal(hash2(4, 7), hash2(4, 7));

/** Same math as AsciiPlates gutterStyle — card left/right inset in px from the overlay edge. */
function stickerGutterInset(viewportPx: number, widthPx: number, gapPx = 8, columnPx = 1280) {
  return viewportPx / 2 - Math.min(columnPx / 2, viewportPx / 2) - widthPx - gapPx;
}
assert.ok(stickerGutterInset(1076, 120) < 0, 'narrow viewports park stickers off-canvas, not on main');
assert.ok(
  stickerGutterInset(1920, 120) + 120 <= (1920 - 1280) / 2,
  'wide viewports keep stickers in the max-w-7xl gutter',
);
