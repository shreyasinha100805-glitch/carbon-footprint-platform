const FACTORS = Object.freeze({
  carPerKm: 0.21,
  publicTransportPerKm: 0.05,
  flightPerFlight: 250,
  electricityPerUnit: 0.82,
  diet: { vegan: 1500 / 12, vegetarian: 1700 / 12, nonveg: 2500 / 12 }
});

function safeNumber(value, max = 100000) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function calculateFootprint(inputs) {
  const carEmission = inputs.car * 4.33 * FACTORS.carPerKm;
  const publicEmission = inputs.publicTransport * 4.33 * FACTORS.publicTransportPerKm;
  const flightEmission = (inputs.flights / 12) * FACTORS.flightPerFlight;
  const electricityEmission = inputs.electricity * FACTORS.electricityPerUnit;
  const dietEmission = FACTORS.diet[inputs.diet] ?? FACTORS.diet.nonveg;
  return {
    carEmission, publicEmission, flightEmission, electricityEmission, dietEmission,
    total: carEmission + publicEmission + flightEmission + electricityEmission + dietEmission
  };
}

function getTips({ carEmission, electricityEmission, flightEmission, diet }) {
  const tips = [];
  if (carEmission > 50) tips.push("Try carpooling or using public transport more often.");
  if (electricityEmission > 100) tips.push("Switch to LED bulbs and energy-efficient appliances.");
  if (flightEmission > 50) tips.push("Consider offsetting flights or reducing air travel frequency.");
  if (diet === 'nonveg') tips.push("Reducing meat consumption even a few days a week lowers your footprint.");
  if (tips.length === 0) tips.push("Great job! Your footprint is relatively low — keep it up!");
  return tips;
}

function badgeFor(total) {
  if (total < 150) return { label: '🟢 Low Footprint', cls: 'low' };
  if (total < 300) return { label: '🟡 Moderate Footprint', cls: 'medium' };
  return { label: '🔴 High Footprint', cls: 'high' };
}

// Cache DOM lookups once for better runtime efficiency
const els = {
  form: document.getElementById('footprint-form'),
  car: document.getElementById('car'),
  publicTransport: document.getElementById('public-transport'),
  flights: document.getElementById('flights'),
  electricity: document.getElementById('electricity'),
  diet: document.getElementById('diet'),
  result: document.getElementById('result'),
  totalEmission: document.getElementById('total-emission'),
  breakdown: document.getElementById('breakdown'),
  tips: document.getElementById('tips'),
  scoreBadge: document.getElementById('score-badge')
};

function renderResult(result, diet) {
  const max = Math.max(result.carEmission, result.publicEmission, result.flightEmission, result.electricityEmission, result.dietEmission, 1);
  const items = [
    ['🚗 Car travel', result.carEmission],
    ['🚌 Public transport', result.publicEmission],
    ['✈️ Flights', result.flightEmission],
    ['⚡ Electricity', result.electricityEmission],
    ['🍽️ Diet', result.dietEmission]
  ];

  const badge = badgeFor(result.total);
  els.scoreBadge.textContent = badge.label;
  els.scoreBadge.className = `score-badge ${badge.cls}`;

  els.totalEmission.textContent =
    `${result.total.toFixed(1)} kg CO₂/month (~${(result.total * 12 / 1000).toFixed(2)} tons/year)`;

  els.breakdown.innerHTML = items.map(([label, val]) => `
    <div class="bar-row">
      <div class="bar-label"><span>${label}</span><span>${val.toFixed(1)} kg</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(val / max * 100).toFixed(0)}%"></div></div>
    </div>
  `).join('');

  els.tips.innerHTML = getTips({ ...result, diet }).map(t => `<li>${t}</li>`).join('');
  els.result.classList.remove('hidden');
}

els.form.addEventListener('submit', function (e) {
  e.preventDefault();
  const inputs = {
    car: safeNumber(els.car.value, 5000),
    publicTransport: safeNumber(els.publicTransport.value, 5000),
    flights: safeNumber(els.flights.value, 100),
    electricity: safeNumber(els.electricity.value, 10000),
    diet: els.diet.value
  };
  renderResult(calculateFootprint(inputs), inputs.diet);
});