// Basic test cases for calculateFootprint logic
// Run manually in browser console or with a simple test runner

function assertEqual(actual, expected, label) {
  const pass = Math.abs(actual - expected) < 0.5;
  console.log(`${pass ? '✅' : '❌'} ${label}: got ${actual}, expected ~${expected}`);
}

// Test 1: zero inputs should produce only diet emission
const t1 = calculateFootprint({ car: 0, publicTransport: 0, flights: 0, electricity: 0, diet: 'vegan' });
assertEqual(t1.total, 125, 'Zero usage, vegan diet');

// Test 2: negative-safe parsing
assertEqual(safeNumber(-5), 0, 'Negative input clamps to 0');

// Test 3: max clamp
assertEqual(safeNumber(99999, 5000), 5000, 'Value clamps to max');

// Test 4: invalid diet falls back safely
const t4 = calculateFootprint({ car: 0, publicTransport: 0, flights: 0, electricity: 0, diet: 'unknown' });
assertEqual(t4.dietEmission, FACTORS.diet.nonveg, 'Unknown diet falls back to nonveg');