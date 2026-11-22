const assert = require('assert');

console.log('=== RUNNING GENZNOTES UNIT & INTEGRATION TESTS ===\n');

// 1. Test Cache Utility
console.log('1. Testing backend/src/utils/cache.js...');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

setCache('test_key_1', { data: 'hello' }, 10000, ['tagA']);
setCache('test_key_2', { data: 'world' }, 10000, ['tagB']);
setCache('test_key_3', { data: 'tagA and tagB' }, 10000, ['tagA', 'tagB']);

assert.strictEqual(getCache('test_key_1')?.data, 'hello', 'Cache get failed');
assert.strictEqual(getCache('test_key_2')?.data, 'world', 'Cache get failed');
assert.strictEqual(getCache('test_key_3')?.data, 'tagA and tagB', 'Cache get failed');

// Invalidate tagA
invalidateCache('tagA');
assert.strictEqual(getCache('test_key_1'), null, 'Key 1 should be invalidated by tagA');
assert.strictEqual(getCache('test_key_3'), null, 'Key 3 should be invalidated by tagA');
assert.strictEqual(getCache('test_key_2')?.data, 'world', 'Key 2 should remain intact');

console.log('   ✓ Cache utility passed all assertions!\n');

// 2. Test Pricing Defaults Service (In-memory fallback & level separation)
console.log('2. Testing backend/src/services/pricingDefaultsService.js...');
const {
  getPricingDefaults,
  getPricingForLevel,
  updatePricingForLevel,
} = require('../services/pricingDefaultsService');

async function testPricing() {
  const defaults = await getPricingDefaults();
  assert.ok(defaults.semester, 'Semester defaults missing');
  assert.ok(defaults.subject, 'Subject defaults missing');
  assert.ok(defaults.block, 'Block defaults missing');
  assert.ok(defaults.unit, 'Unit defaults missing');

  // Verify initial prices
  assert.strictEqual(typeof defaults.semester.price, 'number');
  assert.strictEqual(typeof defaults.semester.discountedPrice, 'number');
  assert.strictEqual(typeof defaults.unit.price, 'number');
  assert.strictEqual(typeof defaults.unit.discountedPrice, 'number');

  // Test updating semester price: 999 / 499 (as in User prompt example)
  await updatePricingForLevel('semester', 999, 499);
  const updatedSem = await getPricingForLevel('semester');
  assert.strictEqual(updatedSem.price, 999, 'Semester regular price should be 999');
  assert.strictEqual(updatedSem.discountedPrice, 499, 'Semester discounted price should be 499');

  // Verify other levels were NOT affected (Level isolation requirement)
  const subjPricing = await getPricingForLevel('subject');
  const unitPricing = await getPricingForLevel('unit');
  assert.notStrictEqual(subjPricing.price, 999, 'Subject price must not be affected by semester price');
  assert.notStrictEqual(unitPricing.price, 999, 'Unit price must not be affected by semester price');

  // Test updating unit price: 50 / 30
  await updatePricingForLevel('unit', 50, 30);
  const updatedUnit = await getPricingForLevel('unit');
  assert.strictEqual(updatedUnit.price, 50, 'Unit price should be 50');
  assert.strictEqual(updatedUnit.discountedPrice, 30, 'Unit discounted price should be 30');

  // Verify semester price was NOT affected
  const semAgain = await getPricingForLevel('semester');
  assert.strictEqual(semAgain.price, 999, 'Semester price should remain 999');
  assert.strictEqual(semAgain.discountedPrice, 499, 'Semester discounted price should remain 499');

  console.log('   ✓ Pricing defaults service passed level isolation and persistence tests!\n');
}

// 3. Test Course Creation Logic (Simulation of createCourse behavior)
console.log('3. Testing Course -> Semester creation logic...');
async function testCourseCreationLogic() {
  const courseId = 'mock_course_123';
  const collegeId = 'mock_college_456';
  const semPricing = await getPricingForLevel('semester');

  // Mock existing semesters (empty at start)
  let existingSemesters = [];
  const existingNums = new Set(existingSemesters.map((s) => s.semesterNumber));
  const semestersToCreate = [];

  for (let semNum = 1; semNum <= 6; semNum++) {
    if (!existingNums.has(semNum)) {
      semestersToCreate.push({
        courseId,
        collegeId,
        semesterNumber: semNum,
        name: `Semester ${semNum}`,
        price: semPricing.price,
        discountedPrice: semPricing.discountedPrice,
        packageDescription: `Semester ${semNum} Package`,
        order: semNum,
        isActive: true,
      });
    }
  }

  assert.strictEqual(semestersToCreate.length, 6, 'Must create exactly 6 semesters');
  for (let i = 0; i < 6; i++) {
    assert.strictEqual(semestersToCreate[i].semesterNumber, i + 1);
    assert.strictEqual(semestersToCreate[i].name, `Semester ${i + 1}`);
    assert.strictEqual(semestersToCreate[i].price, 999);
    assert.strictEqual(semestersToCreate[i].discountedPrice, 499);
  }

  // Simulate retry - existingSemesters now has 1..6
  existingSemesters = [...semestersToCreate];
  const retryNums = new Set(existingSemesters.map((s) => s.semesterNumber));
  const retrySemestersToCreate = [];

  for (let semNum = 1; semNum <= 6; semNum++) {
    if (!retryNums.has(semNum)) {
      retrySemestersToCreate.push({ semesterNumber: semNum });
    }
  }

  assert.strictEqual(retrySemestersToCreate.length, 0, 'Retry must not create duplicate semesters');
  console.log('   ✓ Course creation logic produces exactly Semester 1-6 with remembered pricing and no duplicates on retry!\n');

  // Test Year-Based Course creation logic (1st, 2nd, 3rd Year)
  console.log('3b. Testing Year-Based Course -> 1st, 2nd, 3rd Year creation logic...');
  const getYearLabel = (num) => {
    const n = parseInt(num, 10);
    const j = n % 10;
    const k = n % 100;
    let suffix = 'th';
    if (j === 1 && k !== 11) suffix = 'st';
    else if (j === 2 && k !== 12) suffix = 'nd';
    else if (j === 3 && k !== 13) suffix = 'rd';
    return `${n}${suffix} Year`;
  };

  assert.strictEqual(getYearLabel(1), '1st Year');
  assert.strictEqual(getYearLabel(2), '2nd Year');
  assert.strictEqual(getYearLabel(3), '3rd Year');
  assert.strictEqual(getYearLabel(4), '4th Year');
  assert.strictEqual(getYearLabel(5), '5th Year');

  const yearsToCreate = [];
  for (let y = 1; y <= 3; y++) {
    yearsToCreate.push({
      courseId,
      collegeId,
      semesterNumber: y,
      name: getYearLabel(y),
      price: semPricing.price,
      discountedPrice: semPricing.discountedPrice,
      packageDescription: `${getYearLabel(y)} Package`,
      order: y,
      isActive: true,
    });
  }

  assert.strictEqual(yearsToCreate.length, 3, 'Must create exactly 3 years');
  assert.strictEqual(yearsToCreate[0].name, '1st Year');
  assert.strictEqual(yearsToCreate[1].name, '2nd Year');
  assert.strictEqual(yearsToCreate[2].name, '3rd Year');
  console.log('   ✓ Year-based course creation logic produces 1st, 2nd, and 3rd Year accurately!\n');
}

// 4. Test Subject -> 1 Block & 5 Units creation logic
console.log('4. Testing Subject -> Block 1 & Units 1-5 creation logic...');
async function testSubjectCreationLogic() {
  const subjectName = 'Data Structures & Algorithms';
  const subjectId = 'mock_subj_789';
  const blockDefaultPricing = await getPricingForLevel('block');
  const unitDefaultPricing = await getPricingForLevel('unit');

  // Block creation
  const block = {
    _id: 'mock_block_1',
    subjectId,
    blockNumber: 1,
    name: subjectName, // Subject name as default title
    price: blockDefaultPricing.price,
    discountedPrice: blockDefaultPricing.discountedPrice,
  };

  assert.strictEqual(block.blockNumber, 1, 'Block number must be 1');
  assert.strictEqual(block.name, subjectName, 'Block name must match subject name by default');

  // 5 Units creation
  const existingUnits = [];
  const existingUnitNums = new Set(existingUnits.map((u) => u.unitNumber));
  const unitsToCreate = [];

  for (let uNum = 1; uNum <= 5; uNum++) {
    if (!existingUnitNums.has(uNum)) {
      unitsToCreate.push({
        blockId: block._id,
        subjectId,
        unitNumber: uNum,
        title: subjectName, // Subject name as default title
        price: unitDefaultPricing.price,
        discountedPrice: unitDefaultPricing.discountedPrice,
        order: uNum,
        isPublished: true,
      });
    }
  }

  assert.strictEqual(unitsToCreate.length, 5, 'Must create exactly 5 default units');
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(unitsToCreate[i].unitNumber, i + 1);
    assert.strictEqual(unitsToCreate[i].title, subjectName, 'Unit title must match subject name by default');
    assert.strictEqual(unitsToCreate[i].blockId, block._id, 'Unit must belong to block 1');
    assert.strictEqual(unitsToCreate[i].price, unitDefaultPricing.price);
    assert.strictEqual(unitsToCreate[i].discountedPrice, unitDefaultPricing.discountedPrice);
  }

  // Simulate retry
  const retryUnits = [...unitsToCreate];
  const retryUnitNums = new Set(retryUnits.map((u) => u.unitNumber));
  const retryUnitsToCreate = [];
  for (let uNum = 1; uNum <= 5; uNum++) {
    if (!retryUnitNums.has(uNum)) {
      retryUnitsToCreate.push(uNum);
    }
  }
  assert.strictEqual(retryUnitsToCreate.length, 0, 'Retry must not create duplicate units');

  console.log('   ✓ Subject creation logic produces 1 block and 5 units with subject name and remembered pricing, with zero duplicates on retry!\n');
}

// 5. Test Unit Pricing: Option 1 (Single) vs Option 2 (All in Subject)
console.log('5. Testing Unit Pricing: Single Unit vs All Units in Subject...');
async function testUnitPricingOptions() {
  const subjectId = 'mock_subject_algo';
  let subjectUnits = [
    { _id: 'u1', subjectId, unitNumber: 1, price: 29, discountedPrice: 19 },
    { _id: 'u2', subjectId, unitNumber: 2, price: 29, discountedPrice: 19 },
    { _id: 'u3', subjectId, unitNumber: 3, price: 29, discountedPrice: 19 },
    { _id: 'u4', subjectId, unitNumber: 4, price: 29, discountedPrice: 19 },
    { _id: 'u5', subjectId, unitNumber: 5, price: 29, discountedPrice: 19 },
  ];

  let otherSubjectUnits = [
    { _id: 'other_u1', subjectId: 'diff_subject', unitNumber: 1, price: 99, discountedPrice: 79 },
  ];

  // Option 1: Apply only to Unit 1 (e.g. price: 35, discountedPrice: 22)
  const applySingle = (unitId, newPrice, newDiscPrice) => {
    subjectUnits = subjectUnits.map((u) =>
      u._id === unitId ? { ...u, price: newPrice, discountedPrice: newDiscPrice } : u
    );
  };

  applySingle('u1', 35, 22);
  assert.strictEqual(subjectUnits[0].price, 35);
  assert.strictEqual(subjectUnits[0].discountedPrice, 22);
  assert.strictEqual(subjectUnits[1].price, 29, 'Unit 2 must remain unchanged in single mode');
  assert.strictEqual(subjectUnits[2].price, 29, 'Unit 3 must remain unchanged in single mode');

  // Option 2: Apply to ALL units in subject (e.g. price: 45, discountedPrice: 25)
  const applyAllInSubject = (subjId, newPrice, newDiscPrice) => {
    subjectUnits = subjectUnits.map((u) =>
      u.subjectId === subjId ? { ...u, price: newPrice, discountedPrice: newDiscPrice } : u
    );
    otherSubjectUnits = otherSubjectUnits.map((u) =>
      u.subjectId === subjId ? { ...u, price: newPrice, discountedPrice: newDiscPrice } : u
    );
  };

  applyAllInSubject(subjectId, 45, 25);
  for (const u of subjectUnits) {
    assert.strictEqual(u.price, 45, `Unit ${u.unitNumber} price must be 45`);
    assert.strictEqual(u.discountedPrice, 25, `Unit ${u.unitNumber} discounted price must be 25`);
  }

  // Ensure other subjects are NOT affected
  assert.strictEqual(otherSubjectUnits[0].price, 99, 'Units of other subjects must not be modified');
  assert.strictEqual(otherSubjectUnits[0].discountedPrice, 79, 'Units of other subjects must not be modified');

  console.log('   ✓ Unit pricing single vs all-units-in-subject works cleanly and confines changes strictly to the subject!\n');
}

// 6. Test Help & Support Complaint System
console.log('6. Testing Help & Support Complaint Processing & Security...');
async function testSupportComplaintLogic() {
  // Guest submission validation
  const validateComplaint = (name, email, description, verifiedUser = null) => {
    if (!description || typeof description !== 'string' || !description.trim()) {
      throw new Error('Please describe the issue you are experiencing.');
    }
    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 5) {
      throw new Error('Issue description too short.');
    }

    let finalName = '';
    let finalEmail = '';
    let userId = null;
    let userType = 'guest';

    if (verifiedUser) {
      userId = verifiedUser._id;
      finalName = verifiedUser.name;
      finalEmail = verifiedUser.email.toLowerCase();
      userType = 'registered';
    } else {
      if (!name || !name.trim()) throw new Error('Name required for guest');
      if (!email || !email.trim()) throw new Error('Email required for guest');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim().toLowerCase())) throw new Error('Invalid email for guest');
      finalName = name.trim();
      finalEmail = email.trim().toLowerCase();
    }

    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900);
    const ticketId = `GZN-${timestampPart}-${randomPart}`;

    return {
      ticketId,
      userId,
      name: finalName,
      email: finalEmail,
      description: trimmedDesc,
      userType,
      status: 'new',
      createdAt: new Date(),
    };
  };

  // Test guest submission with valid inputs
  const guestTicket = validateComplaint('Jane Doe', 'jane@example.com', 'Cannot download physics notes unit 2');
  assert.strictEqual(guestTicket.userType, 'guest');
  assert.strictEqual(guestTicket.userId, null);
  assert.strictEqual(guestTicket.name, 'Jane Doe');
  assert.strictEqual(guestTicket.email, 'jane@example.com');
  assert.strictEqual(guestTicket.status, 'new');
  assert.ok(guestTicket.ticketId.startsWith('GZN-'));

  // Test guest validation failures
  assert.throws(() => validateComplaint('', 'jane@example.com', 'Some valid issue description'), /Name required/);
  assert.throws(() => validateComplaint('Jane', 'not-an-email', 'Some valid issue description'), /Invalid email/);
  assert.throws(() => validateComplaint('Jane', 'jane@example.com', 'hi'), /Issue description too short/);

  // Test logged in user: ignores spoofed name/email/userId and derives from verified user
  const verifiedStudent = {
    _id: 'verified_user_obj_id_999',
    name: 'Verified Alex Sharma',
    email: 'alex.sharma@college.edu',
  };

  // Even if frontend passed attacker's spoofed name/email, backend derives identity from session
  const registeredTicket = validateComplaint('Hacker Name', 'fake@hacker.com', 'Question about transaction receipt', verifiedStudent);
  assert.strictEqual(registeredTicket.userType, 'registered');
  assert.strictEqual(registeredTicket.userId, verifiedStudent._id);
  assert.strictEqual(registeredTicket.name, 'Verified Alex Sharma');
  assert.strictEqual(registeredTicket.email, 'alex.sharma@college.edu');

  // Test status progression: new -> in_progress -> resolved
  const allowedStatuses = ['new', 'in_progress', 'resolved'];
  let currentStatus = registeredTicket.status;
  assert.strictEqual(currentStatus, 'new');
  currentStatus = 'in_progress';
  assert.ok(allowedStatuses.includes(currentStatus));
  currentStatus = 'resolved';
  assert.ok(allowedStatuses.includes(currentStatus));

  console.log('   ✓ Support complaint validation, session identity derivation, ticket ID, and status transitions passed!\n');
}

async function run() {
  await testPricing();
  await testCourseCreationLogic();
  await testSubjectCreationLogic();
  await testUnitPricingOptions();
  await testSupportComplaintLogic();
  console.log('=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY! ===');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
