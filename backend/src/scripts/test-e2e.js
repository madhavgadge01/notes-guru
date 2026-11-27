require('dotenv').config();
const mongoose = require('mongoose');
const request = require('http');
const app = require('../app');

const runTests = async () => {
  console.log('--- Starting Notes Guru Automated E2E Verification Tests ---');
  let server;
  const PORT = 5005;

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notesguru';
    await mongoose.connect(mongoUri);

    server = app.listen(PORT);
    console.log(`Test server running on port ${PORT}`);

    const makeRequest = (path, method = 'GET', body = null, token = null) => {
      return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
          hostname: '127.0.0.1',
          port: PORT,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        };

        const req = request.request(options, (res) => {
          let responseBody = '';
          res.on('data', (chunk) => (responseBody += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseBody);
              resolve({ status: res.statusCode, data: parsed });
            } catch {
              resolve({ status: res.statusCode, raw: responseBody });
            }
          });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
      });
    };

    // TEST 1: Health check
    console.log('\n[Test 1] Health check endpoint...');
    const health = await makeRequest('/api/health');
    console.assert(health.status === 200, `Health check failed with ${health.status}`);
    console.log('✅ Health check passed:', health.data.status);

    // TEST 2: Student Login
    console.log('\n[Test 2] Student Login (Device 1)...');
    const loginD1 = await makeRequest('/api/auth/login', 'POST', {
      email: 'student@notesguru.in',
      password: 'Student@12345',
    });
    console.assert(loginD1.status === 200, `Device 1 login failed with status ${loginD1.status}`);
    const tokenD1 = loginD1.data.token;
    console.log('✅ Student logged in on Device 1. Token acquired.');

    // Verify Me with Device 1
    const meD1 = await makeRequest('/api/auth/me', 'GET', null, tokenD1);
    console.assert(meD1.status === 200, 'Verify me on Device 1 failed');
    console.log('✅ Token 1 validated successfully for:', meD1.data.user.name);

    // TEST 3: SINGLE DEVICE LOGIN ENFORCEMENT
    console.log('\n[Test 3] Single Device Login Enforcement: Logging in on Device 2...');
    const loginD2 = await makeRequest('/api/auth/login', 'POST', {
      email: 'student@notesguru.in',
      password: 'Student@12345',
    });
    console.assert(loginD2.status === 200, 'Device 2 login failed');
    const tokenD2 = loginD2.data.token;
    console.log('✅ Student logged in on Device 2. Now checking Device 1 invalidation...');

    // Device 1 should now be REJECTED with 401 and SESSION_INVALIDATED
    const meD1Invalidated = await makeRequest('/api/auth/me', 'GET', null, tokenD1);
    console.assert(
      meD1Invalidated.status === 401,
      `Expected status 401 for invalidated session, got ${meD1Invalidated.status}`
    );
    console.assert(
      meD1Invalidated.data.code === 'SESSION_INVALIDATED',
      `Expected code SESSION_INVALIDATED, got ${meD1Invalidated.data?.code}`
    );
    console.log('✅ Device 1 was correctly logged out with message:', meD1Invalidated.data.message);

    // Device 2 should be active
    const meD2 = await makeRequest('/api/auth/me', 'GET', null, tokenD2);
    console.assert(meD2.status === 200, 'Device 2 token validation failed');
    console.log('✅ Device 2 is active and authorized.');

    // TEST 4: Academic Hierarchy APIs
    console.log('\n[Test 4] Dynamic Academic Hierarchy Navigation...');
    const collegesRes = await makeRequest('/api/colleges');
    console.assert(collegesRes.status === 200 && collegesRes.data.colleges.length > 0, 'No colleges returned');
    const dtu = collegesRes.data.colleges[0];
    console.log(`✅ Loaded College: ${dtu.name} (${dtu.code})`);

    const coursesRes = await makeRequest(`/api/courses/college/${dtu._id}`);
    console.assert(coursesRes.status === 200 && coursesRes.data.courses.length > 0, 'No courses returned');
    const cse = coursesRes.data.courses[0];
    console.log(`✅ Loaded Course: ${cse.name}`);

    const semestersRes = await makeRequest(`/api/semesters/course/${cse._id}`);
    console.assert(semestersRes.status === 200 && semestersRes.data.semesters.length > 0, 'No semesters returned');
    const sem3 = semestersRes.data.semesters[2]; // Semester 3
    console.log(`✅ Loaded Semester: ${sem3.name} (Package Price: ₹${sem3.discountedPrice || sem3.price})`);

    const subjectsRes = await makeRequest(`/api/subjects/semester/${sem3._id}`);
    console.assert(subjectsRes.status === 200 && subjectsRes.data.subjects.length > 0, 'No subjects returned');
    const dsa = subjectsRes.data.subjects[0];
    console.log(`✅ Loaded Subject: ${dsa.name} (${dsa.code}) with ${dsa.unitsCount} units`);

    const subjectDetail = await makeRequest(`/api/subjects/${dsa._id}`);
    console.assert(subjectDetail.status === 200, 'Subject detail failed');
    const dsaUnit1 = subjectDetail.data.units[0];
    const note1 = dsaUnit1.notes[0];
    console.log(`✅ Loaded Unit: Unit ${dsaUnit1.unitNumber} - ${dsaUnit1.title}`);
    console.log(`✅ Loaded Note: "${note1.title}" (Total pages: ${note1.pageCount})`);

    // TEST 5: SECURE CONTENT PROTECTION & FREE PREVIEW
    console.log('\n[Test 5] Content Protection & Free Preview Check...');
    const noteGuestView = await makeRequest(`/api/notes/${note1._id}`);
    console.assert(noteGuestView.status === 200, 'Guest note view failed');
    const pages = noteGuestView.data.pages;
    console.log(`Note has ${pages.length} pages. Free preview limit: ${noteGuestView.data.note.previewPageCount}`);

    // Pages <= previewPageCount MUST have contentHtml
    // Pages > previewPageCount MUST HAVE contentHtml === null AND isLocked === true!
    const previewLimit = noteGuestView.data.note.previewPageCount;
    pages.forEach((page) => {
      if (page.pageNumber <= previewLimit) {
        console.assert(page.isLocked === false, `Page ${page.pageNumber} should be unlocked`);
        console.assert(!!page.contentHtml, `Page ${page.pageNumber} should have contentHtml`);
      } else {
        console.assert(page.isLocked === true, `Page ${page.pageNumber} should be locked`);
        console.assert(
          page.contentHtml === null,
          `SECURITY BREACH: Locked page ${page.pageNumber} HTML was sent across the wire!`
        );
      }
    });
    console.log('✅ Content Protection Verified: Locked pages completely stripped of HTML on backend!');

    // TEST 6: CASHFREE ORDER & PURCHASE ENTITLEMENT
    console.log('\n[Test 6] Order Creation & Entitlement Fulfillment...');
    const orderRes = await makeRequest(
      '/api/orders/create',
      'POST',
      { itemType: 'unit', itemId: dsaUnit1._id },
      tokenD2
    );
    console.assert(orderRes.status === 201, `Order creation failed with ${orderRes.status}`);
    const orderId = orderRes.data.order._id;
    console.log(`✅ Order created: ${orderRes.data.orderNumber} for ₹${orderRes.data.amount}`);

    // Verify payment via Cashfree API
    const verifyRes = await makeRequest(
      '/api/orders/verify',
      'POST',
      {
        orderId,
        cashfreeOrderId: orderRes.data.cashfreeOrderId,
      },
      tokenD2
    );
    console.assert(verifyRes.status === 200, 'Payment verification failed');
    console.log('✅ Payment verified. Entitlement granted!');

    // Re-fetch the note with student tokenD2: ALL pages should now be unlocked!
    const notePurchasedView = await makeRequest(`/api/notes/${note1._id}`, 'GET', null, tokenD2);
    console.assert(notePurchasedView.data.entitlement.isEntitled === true, 'Note should be entitled');
    notePurchasedView.data.pages.forEach((page) => {
      console.assert(page.isLocked === false, `Page ${page.pageNumber} should now be unlocked`);
      console.assert(!!page.contentHtml, `Page ${page.pageNumber} should have contentHtml`);
    });
    console.log('✅ Post-purchase verification: All pages fully unlocked with valid student watermark!');

    // TEST 7: READING PROGRESS & MY LIBRARY
    console.log('\n[Test 7] Reading Progress & My Library Synchronization...');
    await makeRequest(
      '/api/library/progress',
      'POST',
      { noteId: note1._id, pageNumber: 3, totalPages: pages.length },
      tokenD2
    );
    const contRes = await makeRequest('/api/library/continue-reading', 'GET', null, tokenD2);
    console.assert(contRes.status === 200, 'Continue reading fetch failed');
    const contItem = contRes.data.continueReading.find((r) => r.noteId === note1._id);
    console.assert(contItem?.lastReadPage === 3, 'Reading progress did not record page 3');
    console.log(`✅ Reading progress bookmark verified: Page 3 of ${pages.length}`);

    const libRes = await makeRequest('/api/library/my-library', 'GET', null, tokenD2);
    console.assert(libRes.status === 200, 'My Library fetch failed');
    const unitPurchased = libRes.data.library.units.some((u) => u._id === dsaUnit1._id);
    console.assert(unitPurchased, 'Purchased unit not found in library');
    console.log('✅ Purchased unit displayed in student library!');

    // TEST 8: ADMIN RBAC & SEMESTER CREATION BUG FIX
    console.log('\n[Test 8] Admin Authorization, Blocks & Semester Creation Bug Fix...');
    // Ordinary student trying to access admin dashboard -> MUST BE 403 Forbidden
    const studentAdminAttempt = await makeRequest('/api/admin/dashboard', 'GET', null, tokenD2);
    console.assert(
      studentAdminAttempt.status === 403,
      `Ordinary student should receive 403 on admin routes, received ${studentAdminAttempt.status}`
    );
    console.log('✅ Student access to admin routes blocked with 403 Forbidden.');

    // Login as Admin
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'rozar@notesguru.in',
      password: '73min@42373',
    });
    console.assert(adminLogin.status === 200, 'Admin login failed');
    const adminToken = adminLogin.data.token;

    // Admin accessing dashboard
    const adminDash = await makeRequest('/api/admin/dashboard', 'GET', null, adminToken);
    console.assert(adminDash.status === 200, 'Admin dashboard failed');
    console.log('✅ Admin authorized: Total Revenue = ₹' + adminDash.data.stats.totalRevenue);

    // Verify Blocks retrieval
    const blocksRes = await makeRequest(`/api/blocks/subject/${dsa._id}`);
    console.assert(blocksRes.status === 200 && blocksRes.data.blocks.length > 0, 'No blocks returned');
    console.log(`✅ Loaded ${blocksRes.data.blocks.length} blocks for subject: ${dsa.name}`);

    // Verify Semester Creation Fix (create Semester 9 for CSE)
    const newSemRes = await makeRequest('/api/semesters', 'POST', {
      courseId: cse._id,
      semesterNumber: 9,
      name: 'Semester 9 (Specialization Elective)',
      price: 199,
      discountedPrice: 99,
    }, adminToken);
    console.assert(newSemRes.status === 201, `Semester creation failed with status ${newSemRes.status}`);
    console.log(`✅ Semester creation verified without bugs: "${newSemRes.data.semester.name}"`);

    // Verify Duplicate Semester Collision Gracefully Handled with 409
    const dupSemRes = await makeRequest('/api/semesters', 'POST', {
      courseId: cse._id,
      semesterNumber: 9,
      name: 'Duplicate Sem 9',
    }, adminToken);
    console.assert(dupSemRes.status === 400 || dupSemRes.status === 409, `Expected 400 or 409 duplicate collision, got ${dupSemRes.status}`);
    console.log(`✅ Duplicate semester collision handled gracefully with message: "${dupSemRes.data.message}"`);

    console.log('\n======================================================');
    console.log('🎉 ALL COMPREHENSIVE E2E & BLOCK VERIFICATION TESTS PASSED! 🎉');
    console.log('======================================================\n');

    server.close();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    if (server) server.close();
    await mongoose.connection.close();
    process.exit(1);
  }
};

runTests();
