// Academic catalog and curriculum data for IGNOU educational resources on GenZ Notes

export const IGNOU_INFO = {
  name: 'Indira Gandhi National Open University',
  shortName: 'IGNOU',
  code: 'IGNOU',
  established: 1985,
  description:
    'Indira Gandhi National Open University (IGNOU) is India\'s premier national open university, offering accredited distance and online degrees across multiple disciplines.',
  website: 'https://ignou.ac.in',
  disclaimer:
    'GenZ Notes is an independent educational platform providing student-curated study resources, chapter summaries, and exam preparation material. We are not officially affiliated with, endorsed by, or sponsored by Indira Gandhi National Open University (IGNOU). Official syllabus documents and study materials remain the intellectual property of IGNOU.',
};

export const IGNOU_COURSES = {
  bca: {
    slug: 'bca',
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    degreeType: 'Undergraduate Degree',
    duration: '3 Years (6 Semesters)',
    totalSemesters: 6,
    overview:
      'The IGNOU Bachelor of Computer Applications (BCA) program provides students with essential foundations in computer applications, programming paradigms, hardware systems, database management, web design, and software engineering.',
    searchIntent: 'IGNOU BCA Notes, study material, previous year question papers, unit summaries, and exam preparation guides',
    semesters: [
      {
        semesterNumber: 1,
        title: 'BCA Semester 1',
        description: 'First semester of IGNOU BCA focusing on foundational computer hardware, software fundamentals, and basic mathematics.',
        subjects: ['bcs-011', 'bcs-012'],
      },
      {
        semesterNumber: 2,
        title: 'BCA Semester 2',
        description: 'Second semester of IGNOU BCA covering C programming, computer organization, discrete mathematics, and communication skills.',
        subjects: ['mcs-011', 'mcs-012', 'mcs-013', 'mcs-015'],
      },
      {
        semesterNumber: 3,
        title: 'BCA Semester 3',
        description: 'Third semester of IGNOU BCA covering data structures, database management systems (DBMS), systems analysis, and C++ programming.',
        subjects: ['mcs-021', 'mcs-023', 'mcs-014', 'bcs-031'],
      },
      {
        semesterNumber: 4,
        title: 'BCA Semester 4',
        description: 'Fourth semester of IGNOU BCA covering statistical techniques, Java programming, computer networks, and algorithm design.',
        subjects: ['bcs-040', 'mcs-024', 'bcs-041', 'bcs-042'],
      },
      {
        semesterNumber: 5,
        title: 'BCA Semester 5',
        description: 'Fifth semester of IGNOU BCA covering software engineering, network administration, web programming, and numerical techniques.',
        subjects: ['bcs-051', 'bcs-052', 'bcs-053', 'bcs-054'],
      },
      {
        semesterNumber: 6,
        title: 'BCA Semester 6',
        description: 'Final semester of IGNOU BCA focusing on e-commerce concepts and major academic project development.',
        subjects: ['bcs-062', 'bcsp-064'],
      },
    ],
  },
  mca: {
    slug: 'mca',
    code: 'MCA',
    name: 'Master of Computer Applications',
    degreeType: 'Postgraduate Degree',
    duration: '2 Years (4 Semesters)',
    totalSemesters: 4,
    overview:
      'The IGNOU Master of Computer Applications (MCA) program provides advanced training in software architecture, algorithm design, cloud computing, artificial intelligence, and enterprise application development.',
    searchIntent: 'IGNOU MCA Notes, postgraduate study material, solved assignments, and advanced programming guides',
    semesters: [
      {
        semesterNumber: 1,
        title: 'MCA Semester 1',
        description: 'Advanced foundations in data structures, algorithms, discrete mathematics, and professional software communication.',
        subjects: ['mcs-211', 'mcs-212', 'mcs-213', 'mcs-214'],
      },
      {
        semesterNumber: 2,
        title: 'MCA Semester 2',
        description: 'Data communication, networking, operating system architecture, and object-oriented software engineering.',
        subjects: ['mcs-218', 'mcs-219', 'mcs-220', 'mcs-221'],
      },
      {
        semesterNumber: 3,
        title: 'MCA Semester 3',
        description: 'Artificial intelligence, web technologies, cloud computing, and mobile application development.',
        subjects: ['mcs-224', 'mcs-225', 'mcs-226', 'mcs-227'],
      },
      {
        semesterNumber: 4,
        title: 'MCA Semester 4',
        description: 'Industry project, advanced software electives, and comprehensive viva-voce.',
        subjects: ['mcsp-232'],
      },
    ],
  },
  bcom: {
    slug: 'bcom',
    code: 'BCOM',
    name: 'Bachelor of Commerce (BCOMG)',
    degreeType: 'Undergraduate Degree',
    duration: '3 Years (6 Semesters)',
    totalSemesters: 6,
    overview:
      'The IGNOU Bachelor of Commerce (BCOMG) covers financial accounting, business organization, corporate law, business taxation, principles of marketing, and economic analysis.',
    searchIntent: 'IGNOU BCOM Notes, financial accounting study resources, and business law summaries',
    semesters: [
      {
        semesterNumber: 1,
        title: 'B.Com Semester 1',
        description: 'Foundations in financial accounting, business communication, and environmental studies.',
        subjects: ['bcoc-131', 'bcoc-132'],
      },
      {
        semesterNumber: 2,
        title: 'B.Com Semester 2',
        description: 'Business law and corporate management foundations.',
        subjects: ['bcoc-133', 'bcoc-134'],
      },
    ],
  },
  ba: {
    slug: 'ba',
    code: 'BA',
    name: 'Bachelor of Arts (BAG)',
    degreeType: 'Undergraduate Degree',
    duration: '3 Years (6 Semesters)',
    totalSemesters: 6,
    overview:
      'The IGNOU Bachelor of Arts (BAG) program offers multidimensional humanities and social science education covering English literature, political science, history, economics, and sociology.',
    searchIntent: 'IGNOU BA Notes, humanities study material, and degree exam guides',
    semesters: [
      {
        semesterNumber: 1,
        title: 'BA Semester 1',
        description: 'Foundations in English communication and introductory humanities disciplines.',
        subjects: ['begc-131', 'bpsc-131'],
      },
      {
        semesterNumber: 2,
        title: 'BA Semester 2',
        description: 'Selections from Indian literature, historical perspectives, and constitutional politics.',
        subjects: ['begc-132', 'bpsc-132'],
      },
    ],
  },
};

export const IGNOU_SUBJECTS = {
  // ==================== BCA SEMESTER 1 ====================
  'bcs-011': {
    code: 'BCS-011',
    courseSlug: 'bca',
    semesterNumber: 1,
    name: 'Computer Basics and PC Software',
    credits: 3,
    description:
      'IGNOU BCS-011 Computer Basics and PC Software covers foundational computer hardware architecture, operating system concepts, word processing, spreadsheets, presentation software, algorithm design, and networking basics for BCA students.',
    metaDescription:
      'Explore IGNOU BCS-011 Computer Basics and PC Software study material, unit-wise notes and learning resources for BCA students.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Basics of Computer Hardware',
        description: 'Fundamentals of computer architecture, internal hardware components, memory hierarchy, and peripheral interfacing.',
        units: [
          {
            unitNumber: 1,
            title: 'Computer Fundamentals & Hardware Architecture',
            summary:
              'Explores the fundamental architecture of modern digital computers, the von Neumann model, CPU components (ALU, CU, registers), system bus architecture (data, address, control), instruction cycles, and classification of computers from microcomputers to supercomputers.',
            keyTopics: [
              'Von Neumann Computer Architecture',
              'Central Processing Unit (CPU) Structure & Registers',
              'System Bus (Data Bus, Address Bus, Control Bus)',
              'Instruction Execution Cycle (Fetch, Decode, Execute)',
              'Generations and Classification of Computers',
            ],
          },
          {
            unitNumber: 2,
            title: 'Memory Hierarchy, Cache & Storage Devices',
            summary:
              'Detailed study of primary and secondary storage systems, RAM (SRAM vs DRAM), ROM types (PROM, EPROM, EEPROM), cache memory levels (L1, L2, L3) and mapping schemes, magnetic storage (HDD), solid-state drives (SSD), and optical media.',
            keyTopics: [
              'Memory Hierarchy & Speed-Cost Tradeoffs',
              'Primary Memory: RAM vs ROM Variations',
              'Cache Memory Principles & Hit/Miss Ratio',
              'Secondary Storage: HDDs, SSDs, and Flash Memory',
              'Virtual Memory Basics and Address Translation',
            ],
          },
          {
            unitNumber: 3,
            title: 'Input/Output Devices & Data Representation',
            summary:
              'Covers computer peripherals, display technologies (LCD, LED, OLED), printing technologies, I/O interfacing techniques, interrupt handling, and binary data representation including 2\'s complement, ASCII, and Unicode.',
            keyTopics: [
              'Input and Output Peripheral Technologies',
              'I/O Ports, USB Standards, and Interfacing',
              'Interrupts and Direct Memory Access (DMA)',
              'Binary, Octal, Hexadecimal Number Systems',
              'Character Encoding: ASCII, Unicode, UTF-8',
            ],
          },
        ],
      },
      {
        blockNumber: 2,
        name: 'Operating System & Software Concepts',
        description: 'Operating system functions, process management, file systems, and GUI operations.',
        units: [
          {
            unitNumber: 4,
            title: 'Introduction to Operating Systems & GUI',
            summary:
              'Introduction to system software and the operating system as a resource manager. Explores process scheduling, memory allocation, file systems, device drivers, and modern graphical user interface paradigms in Windows and Linux.',
            keyTopics: [
              'Functions and Objectives of Operating Systems',
              'Process Management & CPU Scheduling Overview',
              'Memory Management & Paging Principles',
              'File Systems (FAT32, NTFS, EXT4) & Directory Structures',
              'Command-Line Interface (CLI) vs GUI',
            ],
          },
          {
            unitNumber: 5,
            title: 'System Software, Application Software & Utilities',
            summary:
              'Categorization of software into system software (compilers, interpreters, assemblers, linkers, loaders) and application software. Covers disk management utilities, antivirus tools, and backup solutions.',
            keyTopics: [
              'Difference Between Compilers, Interpreters, and Assemblers',
              'Linkers, Loaders, and the Build Process',
              'System Utilities: Disk Defragmenter, Disk Cleanup',
              'Antivirus and Malware Defense Strategies',
              'Open-Source vs Proprietary Software Licences',
            ],
          },
        ],
      },
      {
        blockNumber: 3,
        name: 'Productivity Tools & Internet Essentials',
        description: 'Office productivity suites, spreadsheet analysis, algorithm design, and computer networking.',
        units: [
          {
            unitNumber: 6,
            title: 'Word Processing Fundamentals & Advanced Features',
            summary:
              'Comprehensive guide to digital word processors, text formatting, styles, templates, tables, headers/footers, mail merge workflows, reference management, and document security.',
            keyTopics: [
              'Document Creation, Layout, and Styling',
              'Table Creation and Data Alignment',
              'Mail Merge Automation & Data Sources',
              'Track Changes, Comments, and Collaboration',
              'Document Security and Export Standards (PDF, RTF)',
            ],
          },
          {
            unitNumber: 7,
            title: 'Spreadsheets, Formulas, Functions & Charts',
            summary:
              'Techniques for data modeling and analysis using spreadsheet software. Covers absolute vs relative cell references, mathematical, statistical, and logical functions (IF, VLOOKUP, SUMIF), and dynamic chart creation.',
            keyTopics: [
              'Cell Referencing: Relative, Absolute, and Mixed',
              'Mathematical & Statistical Functions',
              'Logical Functions (IF, AND, OR) & Lookup (VLOOKUP, XLOOKUP)',
              'Data Sorting, Filtering, and Conditional Formatting',
              'Chart Types (Bar, Line, Pie) and Visual Data Analysis',
            ],
          },
          {
            unitNumber: 8,
            title: 'Computer Networks, Internet Protocols & Web Browsing',
            summary:
              'Fundamentals of computer networking including LAN, MAN, WAN topologies, network transmission media, the TCP/IP and OSI reference models, IP addressing, DNS resolution, and web browsing security.',
            keyTopics: [
              'Network Classifications & Topologies (Star, Mesh, Bus)',
              'Transmission Media: Guided vs Wireless Media',
              'OSI Reference Model vs TCP/IP Protocol Stack',
              'IP Addressing (IPv4 vs IPv6) and Subnetting',
              'World Wide Web, HTTP/HTTPS, DNS, and Web Browsing',
            ],
          },
        ],
      },
    ],
  },

  'bcs-012': {
    code: 'BCS-012',
    courseSlug: 'bca',
    semesterNumber: 1,
    name: 'Basic Mathematics',
    credits: 4,
    description:
      'IGNOU BCS-012 Basic Mathematics provides mathematical foundations essential for computer science, including determinants, matrices, mathematical induction, sequence and series, coordinate geometry, vectors, and calculus fundamentals.',
    metaDescription:
      'Explore IGNOU BCS-012 Basic Mathematics study material, solved problems, unit notes and syllabus resources for BCA Semester 1.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Algebra - I: Determinants & Matrices',
        description: 'Matrix algebra, determinant properties, matrix inversion, and solving linear systems using Cramer\'s rule.',
        units: [
          {
            unitNumber: 1,
            title: 'Determinants and Applications',
            summary:
              'Introduction to determinants of order 2 and 3, properties of determinants, minors, cofactors, evaluation techniques, and solving systems of linear equations using Cramer\'s Rule.',
            keyTopics: [
              'Definition and Expansion of Determinants',
              'Properties of Determinants with Proofs',
              'Minors and Cofactors Calculation',
              'Cramer\'s Rule for 2 and 3 Variable Systems',
              'Consistency and Inconsistency of Linear Equations',
            ],
          },
          {
            unitNumber: 2,
            title: 'Matrices, Operations & Inversion',
            summary:
              'Matrix concepts, types of matrices (symmetric, skew-symmetric, orthogonal), algebraic operations, transpose, adjoint of a matrix, and computing matrix inverse for solving matrix equations.',
            keyTopics: [
              'Matrix Types and Equality',
              'Matrix Addition, Scalar Multiplication, and Matrix Product',
              'Transpose and Conjugate Transpose',
              'Adjoint of Matrix and Matrix Inversion Formula',
              'Matrix Method for Solving Systems of Linear Equations',
            ],
          },
          {
            unitNumber: 3,
            title: 'Principle of Mathematical Induction',
            summary:
              'The axiomatic foundation and application of the Principle of Mathematical Induction (PMI) to prove algebraic identities, divisibility statements, and inequalities.',
            keyTopics: [
              'Induction Hypothesis and Base Step',
              'Inductive Step and Rigorous Mathematical Proofs',
              'Divisibility Proofs Using Induction',
              'Summation of Series Proofs',
              'Strong Form of Mathematical Induction',
            ],
          },
        ],
      },
      {
        blockNumber: 2,
        name: 'Algebra - II: Sequences & Complex Numbers',
        description: 'Arithmetic, geometric, and harmonic progressions, complex number algebra, and De Moivre\'s theorem.',
        units: [
          {
            unitNumber: 4,
            title: 'Sequence and Series (AP, GP, HP)',
            summary:
              'Detailed study of progressions: Arithmetic Progression (AP), Geometric Progression (GP), Harmonic Progression (HP), their nth terms, sum of n terms, and arithmetic-geometric series.',
            keyTopics: [
              'Arithmetic Progression (AP) General Term & Summation',
              'Geometric Progression (GP) Finite & Infinite Sums',
              'Harmonic Progression (HP) & Harmonic Mean',
              'Arithmetic-Geometric Progression (AGP)',
              'Sum of First n Natural Numbers, Squares, and Cubes',
            ],
          },
          {
            unitNumber: 5,
            title: 'Complex Numbers & Quadratic Equations',
            summary:
              'Algebraic structure of complex numbers, modulus, argument, polar representation, De Moivre\'s theorem, and solving quadratic equations with complex roots.',
            keyTopics: [
              'Cartesian Form (a + ib) & Conjugates',
              'Modulus and Argument of Complex Numbers',
              'Polar and Exponential Representations',
              'De Moivre\'s Theorem and Finding Roots of Unity',
              'Roots and Discriminants of Quadratic Equations',
            ],
          },
        ],
      },
      {
        blockNumber: 3,
        name: 'Calculus & Coordinate Geometry',
        description: 'Limits, continuity, differentiation, integration, straight lines, circles, and 3D vectors.',
        units: [
          {
            unitNumber: 6,
            title: 'Differential Calculus & Limits',
            summary:
              'Concepts of limits, indeterminate forms, continuity, definition of derivatives, rules of differentiation (product, quotient, chain rule), and applications to tangents and normals.',
            keyTopics: [
              'Intuitive and Formal Definition of Limits',
              'Evaluation of Limits & L\'Hôpital\'s Rule Basics',
              'Continuity and Differentiability at a Point',
              'Differentiation Rules (Product, Quotient, Chain Rule)',
              'Applications: Tangents, Normals, and Maxima/Minima',
            ],
          },
          {
            unitNumber: 7,
            title: 'Integral Calculus & Applications',
            summary:
              'Integration as reverse of differentiation, standard integration formulas, integration by substitution, integration by parts, partial fractions, and definite integrals.',
            keyTopics: [
              'Indefinite Integrals and Standard Integrals',
              'Integration by Substitution Method',
              'Integration by Parts (ILATE Rule)',
              'Integration Using Partial Fractions',
              'Fundamental Theorem of Calculus and Definite Integrals',
            ],
          },
          {
            unitNumber: 8,
            title: 'Coordinate Geometry & Vectors',
            summary:
              'Two-dimensional coordinate geometry (equations of straight lines, distance formulas, circles) and three-dimensional vectors (dot product, cross product, and projections).',
            keyTopics: [
              'Straight Lines: Slope, Intercept, and Normal Forms',
              'Equations of Circles and Tangents',
              'Vector Operations: Addition, Scalar Multiplication',
              'Dot Product (Scalar) and Cross Product (Vector)',
              'Vector Projections and Applications in Geometry',
            ],
          },
        ],
      },
    ],
  },

  // ==================== BCA SEMESTER 2 ====================
  'mcs-011': {
    code: 'MCS-011',
    courseSlug: 'bca',
    semesterNumber: 2,
    name: 'Problem Solving and Programming',
    credits: 3,
    description:
      'Covers structured programming fundamentals in C, data types, control flow, functions, arrays, pointers, memory allocation, structures, unions, and file handling.',
    metaDescription:
      'IGNOU MCS-011 Problem Solving and Programming notes, C programming concepts, solved lab codes and study material.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Programming Fundamentals & C Basics',
        description: 'Problem-solving methodology, flowcharts, algorithms, and core C syntax.',
        units: [
          { unitNumber: 1, title: 'Problem Solving Techniques & Algorithms' },
          { unitNumber: 2, title: 'Introduction to C Language & Data Types' },
          { unitNumber: 3, title: 'Operators, Expressions & Control Structures' },
        ],
      },
      {
        blockNumber: 2,
        name: 'Arrays, Pointers & Functions',
        description: 'Modular programming, multidimensional arrays, and pointer arithmetic.',
        units: [
          { unitNumber: 4, title: 'Functions & Storage Classes' },
          { unitNumber: 5, title: 'Arrays & String Manipulation' },
          { unitNumber: 6, title: 'Pointers & Dynamic Memory Allocation' },
        ],
      },
      {
        blockNumber: 3,
        name: 'Structures, Unions & File Management',
        description: 'User-defined types, bit fields, file I/O operations, and preprocessor directives.',
        units: [
          { unitNumber: 7, title: 'Structures, Unions & Enumerations' },
          { unitNumber: 8, title: 'File Handling & Preprocessor Directives' },
        ],
      },
    ],
  },

  'mcs-012': {
    code: 'MCS-012',
    courseSlug: 'bca',
    semesterNumber: 2,
    name: 'Computer Organization and Assembly Language Programming',
    credits: 4,
    description:
      'Digital logic gates, Boolean algebra, combinational and sequential circuits, ALU architecture, microoperations, instruction formats, addressing modes, and 8086 assembly language.',
    metaDescription:
      'IGNOU MCS-012 Computer Organization notes, assembly language programming, digital logic circuits and CPU architecture study guide.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Digital Logic Circuits & Boolean Algebra',
        description: 'Logic gates, truth tables, Karnaugh maps, and combinational logic circuits.',
        units: [
          { unitNumber: 1, title: 'Logic Gates & Boolean Algebra Simplification' },
          { unitNumber: 2, title: 'Combinational Circuits (Adders, Multiplexers, Decoders)' },
          { unitNumber: 3, title: 'Sequential Circuits (Flip-Flops, Registers, Counters)' },
        ],
      },
      {
        blockNumber: 2,
        name: 'Central Processing Unit & Memory System',
        description: 'Register transfer language, microoperations, addressing modes, and memory hierarchy.',
        units: [
          { unitNumber: 4, title: 'Register Transfer Language & Microoperations' },
          { unitNumber: 5, title: 'Instruction Set Architecture & Addressing Modes' },
          { unitNumber: 6, title: 'Memory Hierarchy, Cache Mapping & Interleaved Memory' },
        ],
      },
      {
        blockNumber: 3,
        name: '8086 Assembly Language Programming',
        description: '8086 architecture, register set, interrupts, assembly directives, and programming techniques.',
        units: [
          { unitNumber: 7, title: '8086 Architecture & Register Organization' },
          { unitNumber: 8, title: 'Assembly Directives, Interrupts & Macro Programming' },
        ],
      },
    ],
  },

  'mcs-013': {
    code: 'MCS-013',
    courseSlug: 'bca',
    semesterNumber: 2,
    name: 'Discrete Mathematics',
    credits: 2,
    description:
      'Propositional logic, predicate calculus, set theory, relations, functions, graph theory, trees, and Boolean lattices.',
    metaDescription:
      'IGNOU MCS-013 Discrete Mathematics study notes, graph theory, propositional calculus, and solved exam problems.',
  },

  'mcs-015': {
    code: 'MCS-015',
    courseSlug: 'bca',
    semesterNumber: 2,
    name: 'Communication Skills',
    credits: 2,
    description:
      'Professional communication, presentation techniques, business letter writing, resume drafting, and interpersonal effectiveness.',
    metaDescription:
      'IGNOU MCS-015 Communication Skills study notes, business correspondence, and verbal communication guides.',
  },

  // ==================== BCA SEMESTER 3 ====================
  'bcs-031': {
    code: 'BCS-031',
    courseSlug: 'bca',
    semesterNumber: 3,
    name: 'Programming in C++',
    credits: 3,
    description:
      'Object-oriented principles in C++, classes, constructors, destructors, operator overloading, inheritance, polymorphism, virtual functions, templates, and exception handling.',
    metaDescription:
      'IGNOU BCS-031 Programming in C++ notes, OOP principles, inheritance, operator overloading, and solved lab exercises.',
    blocks: [
      {
        blockNumber: 1,
        name: 'Principles of Object Oriented Programming',
        description: 'OOP paradigm vs procedural programming, classes, objects, and constructors.',
        units: [
          { unitNumber: 1, title: 'Introduction to OOP Paradigm & C++ Basics' },
          { unitNumber: 2, title: 'Classes, Objects & Data Encapsulation' },
          { unitNumber: 3, title: 'Constructors, Destructors & Dynamic Memory' },
        ],
      },
      {
        blockNumber: 2,
        name: 'Inheritance, Polymorphism & Overloading',
        description: 'Class hierarchies, virtual functions, abstract classes, and operator overloading.',
        units: [
          { unitNumber: 4, title: 'Inheritance Types & Access Specifiers' },
          { unitNumber: 5, title: 'Operator Overloading & Type Conversions' },
          { unitNumber: 6, title: 'Polymorphism, Virtual Functions & Abstract Classes' },
        ],
      },
      {
        blockNumber: 3,
        name: 'Templates, Exceptions & STL',
        description: 'Generic programming, template functions, exception handling, and Standard Template Library.',
        units: [
          { unitNumber: 7, title: 'Function & Class Templates' },
          { unitNumber: 8, title: 'Exception Handling Mechanism' },
          { unitNumber: 9, title: 'Standard Template Library (STL) Containers & Iterators' },
        ],
      },
    ],
  },

  'mcs-021': {
    code: 'MCS-021',
    courseSlug: 'bca',
    semesterNumber: 3,
    name: 'Data and File Structures',
    credits: 4,
    description:
      'Linear data structures (stacks, queues, linked lists), non-linear data structures (trees, binary search trees, AVL trees, graphs), searching and sorting algorithms, and file organization.',
    metaDescription:
      'IGNOU MCS-021 Data and File Structures notes, trees, graphs, sorting algorithms, and stack/queue implementations.',
  },

  'mcs-023': {
    code: 'MCS-023',
    courseSlug: 'bca',
    semesterNumber: 3,
    name: 'Introduction to Database Management Systems',
    credits: 3,
    description:
      'Database architecture, ER modeling, relational model, SQL queries, relational algebra, normalization (1NF to BCNF), transaction processing, concurrency control, and recovery.',
    metaDescription:
      'IGNOU MCS-023 DBMS study notes, SQL queries, normalization, ER diagrams, and transaction management guides.',
  },

  // ==================== BCA SEMESTER 4 ====================
  'bcs-040': {
    code: 'BCS-040',
    courseSlug: 'bca',
    semesterNumber: 4,
    name: 'Statistical Techniques',
    credits: 4,
    description:
      'Descriptive statistics, probability distributions (Binomial, Poisson, Normal), sampling theory, estimation, hypothesis testing (z-test, t-test, Chi-square, F-test), and regression analysis.',
    metaDescription:
      'IGNOU BCS-040 Statistical Techniques study notes, probability distributions, hypothesis testing formulas, and solved problems.',
  },

  'mcs-024': {
    code: 'MCS-024',
    courseSlug: 'bca',
    semesterNumber: 4,
    name: 'Object Oriented Technologies and Java Programming',
    credits: 3,
    description:
      'Java platform architecture, OOP in Java, multithreading, exception handling, I/O streams, GUI programming with Swing, and JDBC connectivity.',
    metaDescription:
      'IGNOU MCS-024 Java Programming study notes, multithreading, JDBC, Swing, and OOP concepts in Java.',
  },

  // ==================== BCA SEMESTER 5 ====================
  'bcs-051': {
    code: 'BCS-051',
    courseSlug: 'bca',
    semesterNumber: 5,
    name: 'Introduction to Software Engineering',
    credits: 3,
    description:
      'Software process models (Waterfall, Agile, Spiral), requirements engineering (SRS), software design, UML modeling, software testing techniques, software metrics, and project estimation.',
    metaDescription:
      'IGNOU BCS-051 Software Engineering study notes, Agile methodology, SRS preparation, testing methods, and UML diagrams.',
  },

  'bcs-053': {
    code: 'BCS-053',
    courseSlug: 'bca',
    semesterNumber: 5,
    name: 'Web Programming',
    credits: 2,
    description:
      'HTML5 semantic structure, CSS3 styling, JavaScript client-side scripting, DOM manipulation, AJAX, PHP server scripting, MySQL connectivity, and web security essentials.',
    metaDescription:
      'IGNOU BCS-053 Web Programming notes, HTML5, CSS3, JavaScript, PHP, MySQL, and full-stack web basics.',
  },
};

// ==================== HELPER LOOKUP FUNCTIONS ====================

export const getCourseBySlug = (slug) => {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  return IGNOU_COURSES[normalized] || null;
};

export const getSemesterSubjects = (courseSlug, semesterNum) => {
  const course = getCourseBySlug(courseSlug);
  if (!course) return [];
  const sem = course.semesters.find((s) => s.semesterNumber === Number(semesterNum));
  if (!sem) return [];
  return sem.subjects
    .map((code) => IGNOU_SUBJECTS[code.toLowerCase()])
    .filter(Boolean);
};

export const getSubjectByCode = (courseSlug, subjectCode) => {
  if (!subjectCode) return null;
  const normalized = subjectCode.toLowerCase().trim();
  const subject = IGNOU_SUBJECTS[normalized];
  if (!subject) return null;
  if (courseSlug && subject.courseSlug !== courseSlug.toLowerCase().trim()) {
    // Subject exists under this code
    return subject;
  }
  return subject;
};

export const getUnitData = (courseSlug, subjectCode, unitNum) => {
  const subject = getSubjectByCode(courseSlug, subjectCode);
  if (!subject || !subject.blocks) return null;
  const targetUnit = Number(unitNum);
  for (const block of subject.blocks) {
    if (block.units) {
      const matched = block.units.find((u) => u.unitNumber === targetUnit);
      if (matched) {
        return {
          unit: matched,
          block,
          subject,
        };
      }
    }
  }
  return null;
};

// Returns a complete array of all eligible SEO routes for sitemap and prerender
export const getAllIgnouRoutes = () => {
  const routes = [
    {
      path: '/ignou/',
      priority: '0.9',
      changefreq: 'weekly',
      title: 'IGNOU Notes & Study Material | GenZ Notes',
    },
  ];

  // Courses
  for (const [courseSlug, course] of Object.entries(IGNOU_COURSES)) {
    routes.push({
      path: `/ignou/${courseSlug}/`,
      priority: '0.85',
      changefreq: 'weekly',
      title: `IGNOU ${course.code} Notes – ${course.name} Study Material | GenZ Notes`,
    });

    // Semesters
    for (const sem of course.semesters) {
      routes.push({
        path: `/ignou/${courseSlug}/semester-${sem.semesterNumber}/`,
        priority: '0.8',
        changefreq: 'weekly',
        title: `IGNOU ${course.code} Semester ${sem.semesterNumber} Notes | GenZ Notes`,
      });
    }
  }

  // Subjects & Units
  for (const [codeKey, subject] of Object.entries(IGNOU_SUBJECTS)) {
    routes.push({
      path: `/ignou/${subject.courseSlug}/${subject.code.toLowerCase()}/`,
      priority: '0.85',
      changefreq: 'weekly',
      title: `IGNOU ${subject.code} Notes – ${subject.name} | GenZ Notes`,
    });

    if (subject.blocks) {
      for (const block of subject.blocks) {
        if (block.units) {
          for (const unit of block.units) {
            routes.push({
              path: `/ignou/${subject.courseSlug}/${subject.code.toLowerCase()}/unit-${unit.unitNumber}/`,
              priority: '0.75',
              changefreq: 'monthly',
              title: `IGNOU ${subject.code} Unit ${unit.unitNumber}: ${unit.title} Notes | GenZ Notes`,
            });
          }
        }
      }
    }
  }

  return routes;
};
