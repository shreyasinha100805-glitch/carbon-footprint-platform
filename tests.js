// Automated test suite for Carbon Footprint Calculator
// Runs automatically on page load; results appear in browser console (F12)

function assertEqual(actual, expected, label, tolerance = 0.5) {
  const pass = Math.abs(actual - expected) < tolerance;
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'}: ${label} (got ${actual}, expected ~${expected})`);
  return pass;
}

function runTests() {
  console.log('--- Running Carbon Footprint Tests ---');

  const t1 = calculateFootprint({ car: 0, publicTransport: 0, flights: 0, electricity: 0, diet: 'vegan' });
  assertEqual(t1.total, 125, 'Zero usage, vegan baseline');

  assertEqual(safeNumber(-10), 0, 'Negative input clamps to 0');
  assertEqual(safeNumber(99999, 5000), 5000, 'Value clamps to max bound');

  const t2 = calculateFootprint({ car: 0, publicTransport: 0, flights: 0, electricity: 0, diet: 'unknown' });
  assertEqual(t2.dietEmission, FACTORS.diet.nonveg, 'Unknown diet defaults to nonveg');

  const t3 = calculateFootprint({ car: 100, publicTransport: 0, flights: 0, electricity: 0, diet: 'vegan' });
  assertEqual(t3.carEmission, 100 * 4.33 * 0.21, 'Car emission calculation accuracy');

  const t4 = calculateFootprint({ car: 0, publicTransport: 0, flights: 0, electricity: 200, diet: 'vegan' });
  assertEqual(t4.electricityEmission, 200 * 0.82, 'Electricity emission calculation accuracy');

  console.log('--- Tests Complete ---');
}

runTests();