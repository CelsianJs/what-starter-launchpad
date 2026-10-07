import { mount, useComputed, useEffect, useSignal } from 'what-framework';

const storageFallback = new Map();

function PricingCalculator() {
  const storageStatus = useSignal('persistent');
  const saved = safeJson(safeStorageGet('launchpad-pricing', storageStatus)) || {};
  const seats = useSignal(coerceRange(saved.seats, 2, 80, 12));
  const minutes = useSignal(coerceRange(saved.minutes, 1, 50, 8));
  const retention = useSignal(coerceRange(saved.retention, 7, 90, 30));

  const seatCost = useComputed(() => seats() * 20);
  const minuteCost = useComputed(() => minutes() * 6);
  const retentionCost = useComputed(() => Math.max(0, retention() - 14) * 2.5);
  const total = useComputed(() => seatCost() + minuteCost() + retentionCost());

  useEffect(() => {
    const state = { seats: seats(), minutes: minutes(), retention: retention(), total: total() };
    safeStorageSet('launchpad-pricing', JSON.stringify(state), storageStatus);
    window.dispatchEvent(new CustomEvent('launchpad:pricing-change', { detail: state }));
  });

  return (
    <>
      <div class="panel stack">
        <Range id="lp-seats" label="Seats" value={seats} min="2" max="80" suffix="" />
        <Range id="lp-minutes" label="Build minutes" value={minutes} min="1" max="50" suffix="k" />
        <Range id="lp-retention" label="Retention" value={retention} min="7" max="90" suffix=" days" />
      </div>
      <aside class="panel" aria-live="polite">
        <p class="eyeline">Estimated monthly</p>
        <div class="price">${() => Math.round(total()).toLocaleString()}</div>
        <table class="table">
          <tbody>
            <tr><td>Team seats</td><td>${() => seatCost().toLocaleString()}</td></tr>
            <tr><td>Build minutes</td><td>${() => minuteCost().toLocaleString()}</td></tr>
            <tr><td>Retention</td><td>${() => Math.round(retentionCost()).toLocaleString()}</td></tr>
          </tbody>
        </table>
        <p>{() => `${seats()} teammates, ${minutes()}k build minutes and ${retention()} days of history. Local estimate only.`}</p>
        <p class="rate-note">Sample rates: $20 per seat, $6 per 1,000 build minutes, and $2.50 per retention day beyond 14. No payment or account is created.</p>
        <p class="storage-note" hidden={() => storageStatus() === 'persistent'}>Storage is unavailable in this browser context, so this estimate will reset after the tab closes.</p>
      </aside>
    </>
  );
}

function Range({ id, label, value, min, max, suffix }) {
  const low = Number(min);
  const high = Number(max);
  return (
    <div class="slider-row">
      <label for={id}>{label}: {() => value()}{suffix}</label>
      <input id={id} type="range" min={min} max={max} value={value} onInput={(event) => value(coerceRange(event.target.value, low, high, value()))} />
    </div>
  );
}

function TourIsland({ steps }) {
  const active = useSignal(0);
  const current = useComputed(() => steps[active()] || steps[0]);

  return (
    <>
      <div class="stack">
        {steps.map((step, index) => (
          <button
            class="tour-button"
            type="button"
            aria-pressed={() => active() === index ? 'true' : 'false'}
            onClick={() => active(index)}
          >
            <strong>{step.title}</strong>
            <p>{step.body}</p>
          </button>
        ))}
      </div>
      <aside class="panel" aria-live="polite">
        <p class="eyeline">{() => current().key}</p>
        <h2>{() => current().title}</h2>
        <p>{() => current().body}</p>
        <div class="metric">{() => current().metric}</div>
        <ul class="build-list">{() => current().evidence.map(item => <li>{item}</li>)}</ul>
      </aside>
    </>
  );
}

function safeJson(value) {
  try { return value ? JSON.parse(value) : null; } catch { return null; }
}

function safeStorageGet(key, storageStatus) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    storageStatus('memory');
    return storageFallback.get(key) || null;
  }
}

function safeStorageSet(key, value, storageStatus) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    storageStatus('memory');
    storageFallback.set(key, value);
  }
}

function coerceRange(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

const pricing = document.querySelector('#pricing-calculator');
if (pricing) mount(<PricingCalculator />, pricing);

const tour = document.querySelector('#tour-island');
if (tour) mount(<TourIsland steps={safeJson(tour.dataset.steps) || []} />, tour);
