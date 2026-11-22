require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const College = require('../models/College');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Block = require('../models/Block');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Setting = require('../models/Setting');
const Announcement = require('../models/Announcement');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/notesguru';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Course.deleteMany({}),
      Semester.deleteMany({}),
      Subject.deleteMany({}),
      Block.deleteMany({}),
      Unit.deleteMany({}),
      Note.deleteMany({}),
      Setting.deleteMany({}),
      Announcement.deleteMany({}),
      Order.deleteMany({}),
      Purchase.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    console.log('Creating Admin & Student users...');
    const adminUser = await User.create({
      name: 'GenZNotes Administrator',
      email: 'rozar@notesguru.in',
      password: '73min@42373',
      phone: '+91 98765 00001',
      role: 'admin',
    });

    const studentUser = await User.create({
      name: 'Rohan Sharma',
      email: 'student@notesguru.in',
      password: 'Student@12345',
      phone: '+91 98765 43210',
      role: 'student',
    });

    console.log('Creating Colleges...');
    const dtu = await College.create({
      name: 'Delhi Technological University (DTU)',
      code: 'DTU',
      description: 'Premier government engineering university in New Delhi, formerly Delhi College of Engineering (DCE).',
      logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80',
      location: 'Delhi, India',
      order: 1,
      isActive: true,
    });

    const mu = await College.create({
      name: 'University of Mumbai (MU)',
      code: 'MU',
      description: 'One of the oldest state universities in Maharashtra offering top tier engineering and technology degrees.',
      logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&q=80',
      location: 'Mumbai, Maharashtra',
      order: 2,
      isActive: true,
    });

    const au = await College.create({
      name: 'Anna University',
      code: 'AU',
      description: 'Prestigious public state technical university in Tamil Nadu renowned for rigorous technical curriculum.',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=120&q=80',
      location: 'Chennai, Tamil Nadu',
      order: 3,
      isActive: true,
    });

    const ignou = await College.create({
      name: 'Indira Gandhi National Open University (IGNOU)',
      code: 'IGNOU',
      description: "India's premier national open university offering accredited distance and online degrees across multiple disciplines.",
      logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&q=80',
      location: 'New Delhi, India',
      order: 4,
      isActive: true,
    });

    console.log('Creating Courses...');
    const dtuCse = await Course.create({
      collegeId: dtu._id,
      name: 'B.Tech - Computer Science & Engineering',
      code: 'CSE',
      description: 'Core 4-year undergraduate engineering program covering computer algorithms, systems, networks, and software engineering.',
      durationYears: 4,
      order: 1,
      isActive: true,
    });

    const dtuIt = await Course.create({
      collegeId: dtu._id,
      name: 'B.Tech - Information Technology',
      code: 'IT',
      description: 'Specialized 4-year curriculum in cloud infrastructure, web architectures, cybersecurity, and databases.',
      durationYears: 4,
      order: 2,
      isActive: true,
    });

    const muCse = await Course.create({
      collegeId: mu._id,
      name: 'B.E. - Computer Engineering',
      code: 'CE',
      description: 'Four-year degree program in Mumbai University focused on systems design, software principles, and theory of computation.',
      durationYears: 4,
      order: 1,
      isActive: true,
    });

    const ignouBca = await Course.create({
      collegeId: ignou._id,
      name: 'Bachelor of Computer Applications',
      code: 'BCA',
      description: 'Three-year undergraduate program covering computer hardware, software fundamentals, programming in C/C++, DBMS, and web technologies.',
      durationYears: 3,
      academicStructure: 'semester',
      order: 1,
      isActive: true,
    });

    console.log('Creating Semesters for DTU CSE...');
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
      const sem = await Semester.create({
        courseId: dtuCse._id,
        collegeId: dtu._id,
        semesterNumber: i,
        name: `Semester ${i}`,
        price: i <= 2 ? 149 : 199,
        discountedPrice: i <= 2 ? 79 : 99,
        packageDescription: `Get complete exam-tested notes, model answers, and formula cheat-sheets for all subjects in Semester ${i}.`,
        order: i,
        isActive: true,
      });
      semesters.push(sem);
    }

    const sem3 = semesters[2]; // Semester 3

    // Set student's remembered preferences to DTU -> CSE -> Semester 3
    studentUser.college = dtu._id;
    studentUser.course = dtuCse._id;
    studentUser.semester = sem3._id;
    await studentUser.save();

    console.log('Creating Subjects for Semester 3...');
    const dsa = await Subject.create({
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      description: 'Master linear and non-linear data structures, time-space asymptotic complexities, trees, graphs, dynamic programming, and university exam patterns.',
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc677c7c00e?auto=format&fit=crop&w=400&q=80',
      price: 79,
      discountedPrice: 49,
      order: 1,
      isActive: true,
    });

    const dbms = await Subject.create({
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      name: 'Database Management Systems',
      code: 'CS203',
      description: 'Relational data models, ER diagrams, SQL & Relational Algebra, BCNF/3NF Normalization, ACID transactions, and Concurrency Control.',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80',
      price: 69,
      discountedPrice: 39,
      order: 2,
      isActive: true,
    });

    const os = await Subject.create({
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      name: 'Operating Systems',
      code: 'CS205',
      description: 'Processes, Threads, CPU Scheduling algorithms, Synchronization (Semaphores, Monitors), Deadlocks, Virtual Memory, and Page Replacement.',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      price: 79,
      discountedPrice: 49,
      order: 3,
      isActive: true,
    });

    const dm = await Subject.create({
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      name: 'Discrete Mathematics',
      code: 'CS207',
      description: 'Propositional and predicate logic, sets, relations, functions, recurrence relations, graph theory, trees, and algebraic structures.',
      thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
      price: 59,
      discountedPrice: 29,
      order: 4,
      isActive: true,
    });

    console.log('Creating Blocks for Subjects...');
    // DSA Blocks
    const dsaBlock1 = await Block.create({
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 1,
      name: 'Foundations & Algorithm Analysis',
      description: 'Master time-space complexities, asymptotic notations, Master theorem and recursion trees.',
      price: 39,
      discountedPrice: 25,
      order: 1,
      isActive: true,
    });

    const dsaBlock2 = await Block.create({
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 2,
      name: 'Linear Data Structures',
      description: 'Arrays, address calculations, Stacks, expression evaluations and Circular Queues.',
      price: 39,
      discountedPrice: 25,
      order: 2,
      isActive: true,
    });

    const dsaBlock3 = await Block.create({
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 3,
      name: 'Trees & Hierarchical Structures',
      description: 'Binary trees, traversals, binary search trees and balanced AVL trees.',
      price: 39,
      discountedPrice: 25,
      order: 3,
      isActive: true,
    });

    const dsaBlock4 = await Block.create({
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 4,
      name: 'Graphs & Advanced Algorithms',
      description: 'Graph representations, BFS, DFS, Dijkstra shortest path and Minimum Spanning Trees.',
      price: 39,
      discountedPrice: 25,
      order: 4,
      isActive: true,
    });

    // DBMS Blocks
    await Block.create({
      subjectId: dbms._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 1,
      name: 'Database Architecture & ER Modeling',
      description: 'Relational data models, ER diagrams and SQL relational algebra.',
      price: 35,
      discountedPrice: 22,
      order: 1,
      isActive: true,
    });
    await Block.create({
      subjectId: dbms._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 2,
      name: 'Normalization & Transaction Processing',
      description: 'Functional dependencies, BCNF, 3NF, ACID properties and concurrency control.',
      price: 35,
      discountedPrice: 22,
      order: 2,
      isActive: true,
    });

    // OS Blocks
    await Block.create({
      subjectId: os._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 1,
      name: 'Process Management & CPU Scheduling',
      description: 'Processes, threads, scheduling algorithms, semaphores and deadlocks.',
      price: 39,
      discountedPrice: 25,
      order: 1,
      isActive: true,
    });
    await Block.create({
      subjectId: os._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 2,
      name: 'Memory Management & Storage',
      description: 'Virtual memory, paging, page replacement and file systems.',
      price: 39,
      discountedPrice: 25,
      order: 2,
      isActive: true,
    });

    // DM Blocks
    await Block.create({
      subjectId: dm._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 1,
      name: 'Mathematical Logic & Set Theory',
      description: 'Propositional logic, predicate calculus, sets, relations and functions.',
      price: 30,
      discountedPrice: 19,
      order: 1,
      isActive: true,
    });
    await Block.create({
      subjectId: dm._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      blockNumber: 2,
      name: 'Combinatorics & Graph Theory',
      description: 'Recurrence relations, generating functions, graphs, trees and networks.',
      price: 30,
      discountedPrice: 19,
      order: 2,
      isActive: true,
    });

    console.log('Creating Units for DSA...');
    const dsaUnit1 = await Unit.create({
      blockId: dsaBlock1._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      unitNumber: 1,
      title: 'Introduction to Data Structures & Algorithm Analysis',
      description: 'Primitive vs non-primitive structures, Abstract Data Types (ADT), Asymptotic analysis (Big O, Omega, Theta), Master Theorem, and recursion trees.',
      price: 29,
      discountedPrice: 19,
      order: 1,
      isPublished: true,
    });

    const dsaUnit2 = await Unit.create({
      blockId: dsaBlock2._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      unitNumber: 2,
      title: 'Linear Data Structures: Arrays, Stacks & Queues',
      description: 'Memory mapping functions (Row/Col Major), Stack operations, Infix to Postfix/Prefix, Circular Queues, and Priority Queues.',
      price: 29,
      discountedPrice: 19,
      order: 2,
      isPublished: true,
    });

    const dsaUnit3 = await Unit.create({
      blockId: dsaBlock3._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      unitNumber: 3,
      title: 'Non-Linear Structures: Trees & Binary Search Trees',
      description: 'Binary trees, traversals (Inorder, Preorder, Postorder), BST insertion/deletion, AVL Tree rotations, and Red-Black properties.',
      price: 29,
      discountedPrice: 19,
      order: 3,
      isPublished: true,
    });

    const dsaUnit4 = await Unit.create({
      blockId: dsaBlock4._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      unitNumber: 4,
      title: 'Graph Algorithms & Minimum Spanning Trees',
      description: 'Graph representations (Adjacency Matrix/List), BFS, DFS, Dijkstra Shortest Path, Prim and Kruskal MST algorithms.',
      price: 29,
      discountedPrice: 19,
      order: 4,
      isPublished: true,
    });

    console.log('Creating Comprehensive HTML Notes for DSA Unit 1...');
    // Real, high-quality, professional academic notes rendered as structured HTML pages
    await Note.create({
      unitId: dsaUnit1._id,
      blockId: dsaBlock1._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      title: 'Complete Unit 1 Notes: Analysis & Foundations',
      type: 'normal',
      description: 'Full 5-page curriculum-mapped study guide with theoretical derivations, asymptotic proofs, master theorem, and university model exam solutions.',
      price: 25,
      discountedPrice: 15,
      previewPageCount: 2, // Pages 1 & 2 are free preview! Pages 3, 4, 5 are locked.
      pages: [
        {
          pageNumber: 1,
          title: 'Classification of Data Structures & Abstract Data Types (ADT)',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 1 • CHAPTER 1</span>
              <h1 class="chapter-title">Introduction to Data Structures & ADT</h1>
              <div class="meta-bar">
                <span>Subject: CS201 Data Structures</span> • <span>Expected Exam Weightage: 12-15 Marks</span>
              </div>

              <div class="callout callout-info">
                <strong>University Exam Definition:</strong> A <em>Data Structure</em> is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently for algorithmic operations.
              </div>

              <h2>1. Classification of Data Structures</h2>
              <p>Data structures in computer science are fundamentally divided into two major categories:</p>

              <div class="table-container">
                <table class="academic-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Definition</th>
                      <th>Key Characteristics</th>
                      <th>Standard Examples</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Primitive</strong></td>
                      <td>Basic data types directly supported by machine architecture and programming language compilers.</td>
                      <td>Operates on single values, fixed memory footprint, direct ALU operations.</td>
                      <td><code>int</code>, <code>float</code>, <code>char</code>, <code>pointer</code></td>
                    </tr>
                    <tr>
                      <td><strong>Non-Primitive (Linear)</strong></td>
                      <td>Elements form a sequential order where every item has a unique predecessor and successor (except endpoints).</td>
                      <td>Single level traversal, contiguous or pointer-linked memory layouts.</td>
                      <td>Arrays, Stacks, Queues, Linked Lists</td>
                    </tr>
                    <tr>
                      <td><strong>Non-Primitive (Non-Linear)</strong></td>
                      <td>Elements are arranged hierarchically or interconnected arbitrarily without single-sequence order.</td>
                      <td>Multi-level traversal, complex tree/graph topologies.</td>
                      <td>Binary Trees, BST, B-Trees, Graphs</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2>2. Abstract Data Type (ADT)</h2>
              <p>An <strong>Abstract Data Type (ADT)</strong> is a mathematical model for data types where a data type is defined by its behavior (semantics) from the point of view of a user of the data, specifically in terms of possible values, possible operations on data of this type, and the behavior of these operations.</p>
              
              <div class="diagram-box">
                <div class="diagram-title">Figure 1.1: ADT Black Box Architecture</div>
                <div class="diagram-content">
                  <code>[ Application Code ] &lt;=== Interface (Operations: push, pop, top) ===&gt; [ ADT Implementation / Private Memory Storage ]</code>
                </div>
              </div>

              <p><strong>Crucial Exam Takeaway:</strong> ADT specifies <em>WHAT</em> operations are to be performed, but NOT <em>HOW</em> those operations are implemented in memory. For instance, a <code>Stack ADT</code> specifies <code>push()</code> and <code>pop()</code>; whether it is backed by an array or a linked list is hidden by encapsulation.</p>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 2,
          title: 'Asymptotic Analysis & Growth of Functions (Big O, Omega, Theta)',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 1 • CHAPTER 2</span>
              <h1 class="chapter-title">Asymptotic Notations & Efficiency Analysis</h1>
              
              <p>When analyzing algorithms, hardware independent metrics are imperative. We express the computational time complexity \\(T(n)\\) as a function of input size \\(n\\) as \\(n \\to \\infty\\).</p>

              <h2>1. The Three Primary Asymptotic Notations</h2>

              <div class="concept-card">
                <h3>A. Big-Oh Notation: \\(O(g(n))\\) — Upper Bound</h3>
                <p>Represents the theoretical worst-case execution boundary. Formal mathematical definition:</p>
                <div class="math-formula">
                  \\(f(n) \\in O(g(n))\\) if and only if there exist positive constants \\(c &gt; 0\\) and \\(n_0 \\ge 1\\) such that:
                  <br/>
                  <strong>\\(0 \\le f(n) \\le c \\cdot g(n)\\) for all \\(n \\ge n_0\\)</strong>
                </div>
              </div>

              <div class="concept-card">
                <h3>B. Big-Omega Notation: \\(\\Omega(g(n))\\) — Lower Bound</h3>
                <p>Represents the theoretical best-case execution threshold. Formal mathematical definition:</p>
                <div class="math-formula">
                  \\(f(n) \\in \\Omega(g(n))\\) if and only if there exist positive constants \\(c &gt; 0\\) and \\(n_0 \\ge 1\\) such that:
                  <br/>
                  <strong>\\(0 \\le c \\cdot g(n) \\le f(n)\\) for all \\(n \\ge n_0\\)</strong>
                </div>
              </div>

              <div class="concept-card">
                <h3>C. Big-Theta Notation: \\(\\Theta(g(n))\\) — Tight Bound</h3>
                <p>Sandwiches the algorithm growth rate between constant multiples. Formal mathematical definition:</p>
                <div class="math-formula">
                  \\(f(n) \\in \\Theta(g(n))\\) if and only if there exist positive constants \\(c_1, c_2 &gt; 0\\) and \\(n_0 \\ge 1\\) such that:
                  <br/>
                  <strong>\\(0 \\le c_1 \\cdot g(n) \\le f(n) \\le c_2 \\cdot g(n)\\) for all \\(n \\ge n_0\\)</strong>
                </div>
              </div>

              <h2>2. Standard Rate of Growth Order (Ascending)</h2>
              <div class="complexity-strip">
                <code>O(1) &lt; O(\\log n) &lt; O(\\sqrt{n}) &lt; O(n) &lt; O(n \\log n) &lt; O(n^2) &lt; O(n^3) &lt; O(2^n) &lt; O(n!)</code>
              </div>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 3,
          title: 'Master Theorem for Divide & Conquer Recurrences',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 1 • CHAPTER 3</span>
              <h1 class="chapter-title">Master Theorem & Recurrence Relations</h1>

              <div class="callout callout-warning">
                <strong>Exam Alert:</strong> This derivation and formula carries a mandatory 6 to 10 marks numerical problem in university semester examinations.
              </div>

              <h2>General Form of Master Recurrence</h2>
              <div class="math-formula">
                \\(T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + f(n)\\)
                <br/>
                Where: \\(a \\ge 1\\) (number of subproblems), \\(b &gt; 1\\) (subproblem division factor), and \\(f(n)\\) is the combination cost.
              </div>

              <h3>Case 1: Heavy Leaves Dominated</h3>
              <p>If \\(f(n) = O(n^{\\log_b a - \\epsilon})\\) for some constant \\(\\epsilon &gt; 0\\), then:</p>
              <div class="math-formula"><strong>\\(T(n) = \\Theta(n^{\\log_b a})\\)</strong></div>

              <h3>Case 2: Balanced Work at All Levels</h3>
              <p>If \\(f(n) = \\Theta(n^{\\log_b a} \\log^k n)\\) where \\(k \\ge 0\\), then:</p>
              <div class="math-formula"><strong>\\(T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)\\)</strong></div>

              <h3>Case 3: Heavy Root Work Dominated</h3>
              <p>If \\(f(n) = \\Omega(n^{\\log_b a + \\epsilon})\\) and the regularity condition \\(a \\cdot f(n/b) \\le c \\cdot f(n)\\) holds for \\(c &lt; 1\\), then:</p>
              <div class="math-formula"><strong>\\(T(n) = \\Theta(f(n))\\)</strong></div>

              <h2>Worked Example: Merge Sort</h2>
              <p>Merge sort divides array into two halves, solves recursively, and merges in linear time:</p>
              <div class="code-block">
                <code>T(n) = 2T(n/2) + O(n)</code><br/>
                <code>Here: a = 2, b = 2, f(n) = n</code><br/>
                <code>Calculate n^(log_b a) = n^(log_2 2) = n^1 = n</code><br/>
                <code>Since f(n) = Theta(n^1), it falls under Case 2 (k = 0).</code><br/>
                <code>Therefore: T(n) = Theta(n log n) [Q.E.D.]</code>
              </div>
            </div>
          `,
          isLockedPreview: true,
        },
        {
          pageNumber: 4,
          title: 'Amortized Analysis Methods & Space-Time Tradeoffs',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 1 • CHAPTER 4</span>
              <h1 class="chapter-title">Amortized Analysis & Memory Bounds</h1>

              <p><strong>Amortized Analysis</strong> determines the average running time per operation over a worst-case sequence of operations. Unlike average-case analysis, probability is NOT involved; it guarantees the average performance of each operation in the worst case.</p>

              <h2>Three Classical Techniques</h2>
              <ol class="styled-list">
                <li>
                  <strong>Aggregate Method:</strong>
                  Show that a sequence of \\(n\\) operations takes total time \\(T(n)\\) in the worst case. The amortized cost per operation is \\(T(n) / n\\).
                </li>
                <li>
                  <strong>Accounting (Banker's) Method:</strong>
                  Assign different charges to different operations; some operations are charged more than they cost, and the excess is deposited into a credit bank to pay for future expensive operations.
                </li>
                <li>
                  <strong>Potential Function Method:</strong>
                  Define a potential function \\(\\Phi(D)\\) mapping data structure state \\(D\\) to a real number. Amortized cost \\(a_i = c_i + \\Phi(D_i) - \\Phi(D_{i-1})\\).
                </li>
              </ol>

              <h2>Classical Case: Dynamic Array Resizing (Vector doubling)</h2>
              <p>When an array of capacity \\(N\\) fills up, allocating \\(2N\\) and copying elements takes \\(O(N)\\) time. However, doubling happens infrequently. Over \\(n\\) push operations:</p>
              <div class="math-formula">
                \\(\\text{Total time} \\le n + 1 + 2 + 4 + \\dots + n = n + 2n = 3n = O(n)\\)
                <br/>
                \\(\\text{Amortized Cost per insert} = \\frac{3n}{n} = O(1)\\) constant time!
              </div>
            </div>
          `,
          isLockedPreview: true,
        },
        {
          pageNumber: 5,
          title: 'University Past 5-Year Questions & Model Answers',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 1 • EXAM CRACKER</span>
              <h1 class="chapter-title">High Probability University Exam Q&A</h1>

              <div class="qa-item">
                <div class="question-header">
                  <strong>Q1. (10 Marks):</strong> Compare Big-O, Big-Omega, and Big-Theta notations with formal graphical definitions and examples.
                </div>
                <div class="answer-body">
                  <em>Model Answer Summary:</em> Define each with their respective inequalities (\\(c \\cdot g(n)\\)), state the condition on constants \\(c, n_0\\), and draw the growth curve. Conclude with why Theta is preferred for exact algorithm analysis while Big-O is standard for worst-case bounds.
                </div>
              </div>

              <div class="qa-item">
                <div class="question-header">
                  <strong>Q2. (5 Marks):</strong> Solve the recurrence \\(T(n) = 4T(n/2) + n^2\\) using the Master Theorem.
                </div>
                <div class="answer-body">
                  <code>a = 4, b = 2, f(n) = n^2</code><br/>
                  <code>n^(log_b a) = n^(log_2 4) = n^2</code><br/>
                  <code>Since f(n) = Theta(n^(log_b a)) where k = 0, Case 2 applies.</code><br/>
                  <code>Result: T(n) = Theta(n^2 log n).</code>
                </div>
              </div>

              <div class="exam-tip-box">
                <strong>Guru Exam Tip:</strong> In semester papers, always mention the base conditions of recurrence relations (e.g. \\(T(1) = 1\\)) to secure full marks on 10-marker questions.
              </div>
            </div>
          `,
          isLockedPreview: true,
        },
      ],
      status: 'published',
      isPublished: true,
      order: 1,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    console.log('Creating Quick Notes for DSA Unit 1...');
    // Quick Note with previewPageCount = 0 (first page is locked / paid-only preview by default)
    await Note.create({
      unitId: dsaUnit1._id,
      blockId: dsaBlock1._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      title: 'Night-Before-Exam Quick Revision Sheet: Unit 1',
      type: 'quick',
      description: 'Ultra condensed 3-page high-yield formula cheatsheet, viva voce definitions, and common tricky exam traps.',
      price: 15,
      discountedPrice: 9,
      previewPageCount: 0, // Quick notes are locked from page 1!
      pages: [
        {
          pageNumber: 1,
          title: 'Complexity Hierarchy & Master Formula Quick Reference Table',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">QUICK NOTES • REVISION CARD</span>
              <h1 class="chapter-title">Complexity Hierarchy & Formulas</h1>
              <p>Everything you need to write in the first 10 minutes of your exam:</p>
              <div class="table-container">
                <table class="academic-table">
                  <thead>
                    <tr><th>Notation</th><th>Inequality</th><th>Significance</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>O(g(n))</td><td>f(n) &le; c &bull; g(n)</td><td>Worst Case Upper Bound</td></tr>
                    <tr><td>&Omega;(g(n))</td><td>f(n) &ge; c &bull; g(n)</td><td>Best Case Lower Bound</td></tr>
                    <tr><td>&Theta;(g(n))</td><td>c1 &bull; g(n) &le; f(n) &le; c2 &bull; g(n)</td><td>Exact Tight Bound</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          `,
          isLockedPreview: true,
        },
        {
          pageNumber: 2,
          title: 'Frequently Asked 2-Marker Definitions & Viva Voce',
          contentHtml: `
            <div class="note-chapter">
              <h1 class="chapter-title">Top 10 Viva & 2-Marker Questions</h1>
              <ul>
                <li><strong>What is an ADT?</strong> Set of data values and associated operations defined independently of any specific implementation.</li>
                <li><strong>Define Space Complexity:</strong> Memory required by an algorithm to execute as a function of the input size (Auxiliary + Input Space).</li>
              </ul>
            </div>
          `,
          isLockedPreview: true,
        },
      ],
      status: 'published',
      isPublished: true,
      order: 2,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    console.log('Creating Notes for DSA Unit 2...');
    await Note.create({
      unitId: dsaUnit2._id,
      blockId: dsaBlock2._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      title: 'Complete Unit 2 Notes: Linear Structures, Stacks & Queues',
      type: 'normal',
      description: 'Memory mapping formulas (Row/Col Major address calculation), Infix to Postfix algorithms, and Circular Queue boundary conditions.',
      price: 25,
      discountedPrice: 15,
      previewPageCount: 2,
      pages: [
        {
          pageNumber: 1,
          title: 'Arrays & Memory Address Calculation Formulas',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 2 • CHAPTER 1</span>
              <h1 class="chapter-title">Arrays & Memory Address Calculations</h1>
              <p>Elements in an array are stored in contiguous memory addresses. In 2D arrays \\(A[M][N]\\):</p>
              
              <h2>1. Row Major Order (RMO)</h2>
              <div class="math-formula">
                \\(\\text{Address}(A[i][j]) = B + W \\times [(i - L_1) \\times N + (j - L_2)]\\)
                <br/>
                Where \\(B\\) = Base Address, \\(W\\) = Size of element, \\(N\\) = Number of columns, \\(L_1, L_2\\) = Lower bounds.
              </div>

              <h2>2. Column Major Order (CMO)</h2>
              <div class="math-formula">
                \\(\\text{Address}(A[i][j]) = B + W \\times [(j - L_2) \\times M + (i - L_1)]\\)
                <br/>
                Where \\(M\\) = Number of rows.
              </div>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 2,
          title: 'Stack Operations & Infix-to-Postfix Algorithm',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 2 • CHAPTER 2</span>
              <h1 class="chapter-title">Stack ADT & Expression Conversion</h1>
              <p>A stack is a LIFO (Last In First Out) linear structure. Primary operations are <code>push()</code> and <code>pop()</code>.</p>
              
              <div class="code-block">
                <strong>Shunting-Yard Infix to Postfix Algorithm:</strong><br/>
                1. Initialize an empty operator stack.<br/>
                2. Scan operand: Output immediately to postfix string.<br/>
                3. Scan '(': Push to operator stack.<br/>
                4. Scan ')': Pop and output until '(' is encountered.<br/>
                5. Scan operator: Pop operators of greater or equal precedence, then push scanned operator.
              </div>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 3,
          title: 'Circular Queues & Priority Queue Algorithms',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">UNIT 2 • CHAPTER 3</span>
              <h1 class="chapter-title">Circular Queues & Priority Queues</h1>
              <p>In a linear array queue, empty slots before <code>front</code> cannot be reused when <code>rear == MAX - 1</code>. A circular queue connects end to beginning using modulo arithmetic:</p>
              <div class="math-formula">
                <code>rear = (rear + 1) % MAX</code><br/>
                <code>front = (front + 1) % MAX</code><br/>
                <code>Full condition: (rear + 1) % MAX == front</code>
              </div>
            </div>
          `,
          isLockedPreview: true,
        },
      ],
      status: 'published',
      isPublished: true,
      order: 1,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    console.log('Creating Block-level Note for Block 1...');
    await Note.create({
      unitId: null,
      blockId: dsaBlock1._id,
      subjectId: dsa._id,
      semesterId: sem3._id,
      courseId: dtuCse._id,
      collegeId: dtu._id,
      title: 'Block 1 Complete Formula & Master Theorem Cheatsheet',
      type: 'quick',
      description: 'Block-level reference guide covering all asymptotic notations, summation formulas, and recursion patterns.',
      price: 19,
      discountedPrice: 12,
      previewPageCount: 1,
      pages: [
        {
          pageNumber: 1,
          title: 'Master Theorem Summary & Asymptotic Classes',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">BLOCK 1 EXCLUSIVE</span>
              <h1 class="chapter-title">Master Theorem Reference Guide</h1>
              <p>Standard recurrence form: <code>T(n) = aT(n/b) + f(n)</code></p>
              <div class="math-formula">
                Case 1: If f(n) = O(n^(log_b a - epsilon)), then T(n) = Theta(n^(log_b a))<br/>
                Case 2: If f(n) = Theta(n^(log_b a) log^k n), then T(n) = Theta(n^(log_b a) log^(k+1) n)<br/>
                Case 3: If f(n) = Omega(n^(log_b a + epsilon)), then T(n) = Theta(f(n))
              </div>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 2,
          title: 'Advanced Recursion Trees',
          contentHtml: `
            <div class="note-chapter">
              <h1 class="chapter-title">Recursion Tree Analysis</h1>
              <p>Locked premium block content for advanced divide-and-conquer recurrences.</p>
            </div>
          `,
          isLockedPreview: true,
        },
      ],
      status: 'published',
      isPublished: true,
      order: 1,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    console.log('Creating IGNOU BCA Semesters, Subjects, Blocks & Notes...');
    const ignouSemesters = [];
    for (let i = 1; i <= 6; i++) {
      const iSem = await Semester.create({
        courseId: ignouBca._id,
        collegeId: ignou._id,
        semesterNumber: i,
        name: `Semester ${i}`,
        price: 199,
        discountedPrice: 99,
        packageDescription: `Complete unit-wise study notes and solved assignments for IGNOU BCA Semester ${i}.`,
        order: i,
        isActive: true,
      });
      ignouSemesters.push(iSem);
    }

    const bcs011 = await Subject.create({
      semesterId: ignouSemesters[0]._id,
      courseId: ignouBca._id,
      collegeId: ignou._id,
      name: 'Computer Basics and PC Software',
      code: 'BCS-011',
      description: 'Foundational computer hardware architecture, operating system concepts, word processing, spreadsheets, presentation software, and internet basics.',
      price: 99,
      discountedPrice: 49,
      order: 1,
      isActive: true,
    });

    const bcs012 = await Subject.create({
      semesterId: ignouSemesters[0]._id,
      courseId: ignouBca._id,
      collegeId: ignou._id,
      name: 'Basic Mathematics',
      code: 'BCS-012',
      description: 'Determinants, matrices, mathematical induction, sequence and series, coordinate geometry, vectors, and differential/integral calculus.',
      price: 99,
      discountedPrice: 49,
      order: 2,
      isActive: true,
    });

    const ignouBlock1 = await Block.create({
      subjectId: bcs011._id,
      semesterId: ignouSemesters[0]._id,
      courseId: ignouBca._id,
      collegeId: ignou._id,
      blockNumber: 1,
      name: 'Basics of Computer Hardware',
      description: 'Computer fundamentals, CPU organization, memory hierarchy, and peripherals.',
      price: 39,
      discountedPrice: 29,
      order: 1,
      isActive: true,
    });

    const ignouUnit1 = await Unit.create({
      blockId: ignouBlock1._id,
      subjectId: bcs011._id,
      semesterId: ignouSemesters[0]._id,
      courseId: ignouBca._id,
      collegeId: ignou._id,
      unitNumber: 1,
      title: 'Computer Fundamentals & Hardware Architecture',
      description: 'Von Neumann architecture, CPU components, system buses, and computer classifications.',
      price: 29,
      discountedPrice: 19,
      order: 1,
      isPublished: true,
    });

    await Note.create({
      unitId: ignouUnit1._id,
      blockId: ignouBlock1._id,
      subjectId: bcs011._id,
      semesterId: ignouSemesters[0]._id,
      courseId: ignouBca._id,
      collegeId: ignou._id,
      title: 'BCS-011 Unit 1: Computer Fundamentals & Architecture Notes',
      type: 'normal',
      description: 'Complete high-yield revision notes covering von Neumann architecture, CPU registers, system buses, and computer classifications.',
      price: 19,
      discountedPrice: 9,
      previewPageCount: 2,
      pageCount: 3,
      pages: [
        {
          pageNumber: 1,
          title: 'Von Neumann Architecture & CPU Organization',
          contentHtml: `
            <div class="note-chapter">
              <span class="chapter-badge">IGNOU BCS-011 • UNIT 1</span>
              <h1 class="chapter-title">Von Neumann Computer Model</h1>
              <p>The von Neumann architecture describes a theoretical computer design where instructions and data share a common memory space and bus system.</p>
              <h3>Core Subsystems:</h3>
              <ul>
                <li><strong>Central Processing Unit (CPU)</strong>: Contains the Arithmetic Logic Unit (ALU) and Control Unit (CU).</li>
                <li><strong>Memory Unit</strong>: Holds data and instructions sequentially.</li>
                <li><strong>Input/Output Mechanism</strong>: Interfaces external devices with internal registers.</li>
              </ul>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 2,
          title: 'System Bus Architecture',
          contentHtml: `
            <div class="note-chapter">
              <h1 class="chapter-title">System Bus Structures</h1>
              <p>A bus is a collection of parallel wires that transmits electrical signals between computer components.</p>
              <h3>Three Primary System Buses:</h3>
              <ol>
                <li><strong>Data Bus</strong>: Bidirectional bus carrying raw data values between CPU and memory.</li>
                <li><strong>Address Bus</strong>: Unidirectional bus specifying memory addresses to read from or write to.</li>
                <li><strong>Control Bus</strong>: Coordinates read/write timing signals, clock pulses, and interrupts.</li>
              </ol>
            </div>
          `,
          isLockedPreview: false,
        },
        {
          pageNumber: 3,
          title: 'Instruction Cycle Execution',
          contentHtml: `
            <div class="note-chapter">
              <h1 class="chapter-title">The Fetch-Decode-Execute Cycle</h1>
              <p>Locked preview section covering detailed register transfer operations during instruction fetch and decode.</p>
            </div>
          `,
          isLockedPreview: true,
        },
      ],
      status: 'published',
      isPublished: true,
      order: 1,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    });

    console.log('Creating Settings and Announcements...');
    await Setting.create({
      key: 'platformName',
      value: 'GenZNotes',
      description: 'Main brand name',
    });
    await Setting.create({
      key: 'tagline',
      value: 'Exam Tomorrow? GenZNotes Today.',
      description: 'Platform tagline',
    });
    await Setting.create({
      key: 'defaultCurrency',
      value: 'INR',
      description: 'Default store currency',
    });
    await Setting.create({
      key: 'supportEmail',
      value: 'support@genznotes.in',
      description: 'Customer contact email',
    });

    await Announcement.create({
      title: 'Mid-Sem Revision Bundles Active!',
      content: 'Exclusive unit-wise summary sheets and past 5-year solved university questions are now live for all major engineering streams.',
      type: 'info',
      isActive: true,
    });

    console.log('✅ GenZNotes database seeded successfully!');
    console.log('==============================================');
    console.log('Admin Account: rozar@notesguru.in / 73min@42373');
    console.log('Student Account: student@notesguru.in / Student@12345');
    console.log('Sample College: DTU -> CSE -> Semester 3 -> DSA, DBMS, OS, DM');
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
