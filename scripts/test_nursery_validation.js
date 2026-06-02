// Test script for Nursery DOB validation

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getAgeValidationError(dob, minAge = 4, maxAge = 120) {
  if (!dob) return null;
  try {
    const age = calculateAge(dob);
    if (age < minAge) return `Age must be at least ${minAge} years`;
    if (age > maxAge) return `Age must not exceed ${maxAge} years`;
    return null;
  } catch (e) {
    return 'Invalid date of birth';
  }
}

function getMaxDate(minAge = 4) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date.toISOString().split('T')[0];
}

function getMinDate(maxAge = 120) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - maxAge);
  return date.toISOString().split('T')[0];
}

function isNurseryClassName(className) {
  return /nur/i.test(className || '');
}

function testDobForClass(className, dob) {
  const isNursery = isNurseryClassName(className);
  const minAge = isNursery ? 1 : 4;
  const maxAge = isNursery ? 4 : 120;
  const err = getAgeValidationError(dob, minAge, maxAge);
  const min = getMinDate(isNursery ? 3 : 120);
  const max = getMaxDate(isNursery ? 1 : 4);
  return { className, dob, isNursery, minAge, maxAge, err, min, max };
}

// Prepare test DOBs (use June 1 of each year to avoid month/day edgecases)
const tests = [
  { year: 2024, dob: '2024-06-01' },
  { year: 2023, dob: '2023-06-01' },
  { year: 2022, dob: '2022-06-01' },
];

const classNames = ['Nur.', 'Nursery', 'J.K.G.', 'I'];

for (const cls of classNames) {
  console.log(`\\n--- Testing class: ${cls} ---`);
  for (const t of tests) {
    const res = testDobForClass(cls, t.dob);
    console.log(`DOB ${t.dob} | isNursery=${res.isNursery} | minAge=${res.minAge} maxAge=${res.maxAge} | err=${res.err || 'OK'} | minAttr=${res.min} maxAttr=${res.max}`);
  }
}

// Provide quick check for edge boundaries: today relative computation
console.log('\\nCurrent date:', new Date().toISOString().split('T')[0]);

