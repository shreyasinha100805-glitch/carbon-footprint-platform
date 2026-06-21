const FACTORS = Object.freeze({
  carPerKm: 0.21,
  publicTransportPerKm: 0.05,
  flightPerFlight: 250,
  electricityPerUnit: 0.82,
  diet: {
    vegan: 1500 / 12,
    vegetarian: 1700 / 12,
    nonveg: 2500 / 12
  }
});

/**
 * Safely parses a numeric input, clamping to a valid non-negative range.
 */
function safeNumber(value, max = 100000) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, max);
}

function calculateFootprint(inputs) {
  const carKm = inputs.car * 4.33;
  const publicKm = inputs.publicTransport * 4.33;
  const flights = inputs.flights / 12;

  const carEmission = carKm * FACTORS.carPerKm;
  const publicEmission = publicKm * FACTORS.publicTransportPerKm;
  const flightEmission = flights * FACTORS.flightPerFlight;
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

function renderResult(result, diet) {
  document.getElementById('total-emission').textContent =
    `${result.total.toFixed(1)} kg CO₂ per month (~${(result.total * 12 / 1000).toFixed(2)} tons/year)`;

  document.getElementById('breakdown').innerHTML = `
    <div><span>🚗 Car travel</span><span>${result.carEmission.toFixed(1)} kg</span></div>
    <div><span>🚌 Public transport</span><span>${result.publicEmission.toFixed(1)} kg</span></div>
    <div><span>✈️ Flights</span><span>${result.flightEmission.toFixed(1)} kg</span></div>
    <div><span>⚡ Electricity</span><span>${result.electricityEmission.toFixed(1)} kg</span></div>
    <div><span>🍽️ Diet</span><span>${result.dietEmission.toFixed(1)} kg</span></div>
  `;

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

  const result = calculateFootprint(inputs);
  renderResult(result, inputs.diet);
});