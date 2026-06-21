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
  const badgeEl = document.getElementById('score-badge');
  badgeEl.textContent = badge.label;
  badgeEl.className = `score-badge ${badge.cls}`;

  document.getElementById('total-emission').textContent =
    `${result.total.toFixed(1)} kg CO₂/month (~${(result.total * 12 / 1000).toFixed(2)} tons/year)`;

  document.getElementById('breakdown').innerHTML = items.map(([label, val]) => `
    <div class="bar-row">
      <div class="bar-label"><span>${label}</span><span>${val.toFixed(1)} kg</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(val / max * 100).toFixed(0)}%"></div></div>
    </div>
  `).join('');

  document.getElementById('tips').innerHTML =
    getTips({ ...result, diet }).map(t => `<li>${t}</li>`).join('');

  document.getElementById('result').classList.remove('hidden');
}

document.getElementById('footprint-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const inputs = {
    car: safeNumber(document.getElementById('car').value, 5000),
    publicTransport: safeNumber(document.getElementById('public-transport').value, 5000),
    flights: safeNumber(document.getElementById('flights').value, 100),
    electricity: safeNumber(document.getElementById('electricity').value, 10000),
    diet: document.getElementById('diet').value
  };
  renderResult(calculateFootprint(inputs), inputs.diet);
});