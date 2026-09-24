import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePulseSocketUrl, createDemoPulseState } from './pulse.js';

test('production origin falls back to a simulated stream instead of localhost-only websocket', () => {
  const config = resolvePulseSocketUrl('https://citypulse0.netlify.app/traffic');
  assert.equal(config.socketUrl, 'wss://citypulse0.netlify.app/ws/pulse');
  assert.equal(config.useSimulation, true);
});

test('demo stream produces a valid pulse payload', () => {
  const payload = createDemoPulseState(0, 'storm');
  assert.equal(payload.type, 'PULSE_UPDATE');
  assert.ok(payload.status.chiScore >= 0);
  assert.ok(payload.narrative.length > 0);
});
