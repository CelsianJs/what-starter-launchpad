import assert from 'node:assert/strict';
import { tourSteps, changelog } from '../src/content/site.mjs';
assert.ok(tourSteps.every(step => step.evidence?.length >= 3));
assert.equal(new Set(tourSteps.map(step => step.evidence.join(' '))).size, tourSteps.length);
assert.ok(changelog.every(entry => entry.date && entry.title && entry.body));
console.log('ok distinct tour evidence and dated product releases');
