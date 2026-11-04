/**
 * ============================================================
 * BugTracker Pro — Production Seed Script
 * ============================================================
 *
 * Idempotent seed script. Safe to run multiple times.
 * Clears all demo data, then inserts in dependency order:
 *   1. Users (no dependencies)
 *   2. Projects (depends on Users for 'lead' + 'members')
 *   3. Bugs (depends on Projects + Users for 'project', 'reporter', 'assignedTo')
 *   4. Comments (depends on Bugs + Users for 'bug', 'author')
 *   5. Activities (depends on Users + Bugs + Projects)
 *
 * Usage:
 *   cd backend && npm run seed
 *
 * Schema Reference (auto-detected from models):
 * ─────────────────────────────────────────────
 * User:
 *   - firstName (String, required, max 50)
 *   - lastName (String, required, max 50)
 *   - email (String, required, unique, lowercase, email regex)
 *   - password (String, required, min 6) — hashed via pre-save hook
 *   - role (enum: admin | manager | developer | qa_engineer, default: developer)
 *   - avatar (String, default: '')
 *   - department (String, default: '')
 *   - phone (String, default: '')
 *   - isActive (Boolean, default: true)
 *   - lastLogin (Date)
 *   - timestamps: createdAt, updatedAt
 *
 * Project:
 *   - name (String, required, unique, max 100)
 *   - key (String, required, unique, uppercase, max 10)
 *   - description (String, max 500)
 *   - status (enum: planning | active | on_hold | completed | archived, default: active)
 *   - startDate (Date)
 *   - endDate (Date)
 *   - lead (ObjectId → User, required)
 *   - members ([ObjectId → User])
 *   - modules ([{ name: String (required), description: String }])
 *   - isActive (Boolean, default: true)
 *   - timestamps: createdAt, updatedAt
 *
 * Bug:
 *   - bugId (String, unique) — auto-generated via pre-save: PROJECT_KEY-NNNN
 *   - title (String, required, max 200)
 *   - description (String, required, max 5000)
 *   - project (ObjectId → Project, required)
 *   - module (String)
 *   - environment (enum: production | staging | development | testing | uat, default: development)
 *   - browser (enum: chrome | firefox | safari | edge | opera | other)
 *   - operatingSystem (enum: windows | macos | linux | android | ios | other)
 *   - priority (enum: critical | high | medium | low, default: medium)
 *   - severity (enum: blocker | critical | major | minor | trivial, default: major)
 *   - status (enum: open | assigned | in_progress | resolved | ready_for_testing | closed | reopened, default: open)
 *   - assignedTo (ObjectId → User)
 *   - reporter (ObjectId → User, required)
 *   - stepsToReproduce (String, max 3000)
 *   - expectedResult (String, max 1000)
 *   - actualResult (String, max 1000)
 *   - screenshots ([{ filename, path, uploadedAt }])
 *   - statusHistory ([{ status, changedBy: ObjectId → User, changedAt, comment }])
 *   - tags ([String])
 *   - timestamps: createdAt, updatedAt
 *
 * Comment:
 *   - bug (ObjectId → Bug, required)
 *   - author (ObjectId → User, required)
 *   - message (String, required, max 2000)
 *   - attachments ([{ filename, path }])
 *   - isEdited (Boolean, default: false)
 *   - timestamps: createdAt, updatedAt
 *
 * Activity:
 *   - user (ObjectId → User, required)
 *   - action (enum: created_bug | updated_bug | assigned_bug | status_changed | commented | uploaded_screenshot | created_project | updated_project, required)
 *   - bug (ObjectId → Bug)
 *   - project (ObjectId → Project)
 *   - details (String, max 500)
 *   - metadata (Mixed)
 *   - timestamps: createdAt, updatedAt
 * ─────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import all models
const User = require('../models/User');
const Project = require('../models/Project');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

// ── Utility Helpers ──────────────────────────────────────────

const log = {
  step: (msg) => console.log(`\n  ⏳ ${msg}...`),
  done: (msg) => console.log(`  ✔ ${msg}`),
  info: (msg) => console.log(`  ℹ ${msg}`),
  error: (msg) => console.error(`  ✖ ${msg}`),
  divider: () => console.log('  ─────────────────────────────────────────'),
};

/**
 * Clears all collections in the correct reverse-dependency order
 * to avoid orphan reference issues during deletion.
 */
async function clearDatabase() {
  log.step('Clearing existing demo data');

  // Delete in reverse dependency order
  await Activity.deleteMany({});
  await Comment.deleteMany({});
  await Bug.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  log.done('Database cleared (Users, Projects, Bugs, Comments, Activities)');
}

// ── Data Holders (populated by insert functions) ─────────────

const refs = {
  users: [],      // Array of Mongoose User documents
  projects: [],   // Array of Mongoose Project documents
  bugs: [],       // Array of Mongoose Bug documents
  comments: [],   // Array of Mongoose Comment documents
  activities: [], // Array of Mongoose Activity documents
};

// ── Insert Functions (to be called with actual data arrays) ──

/**
 * Insert users. Password is hashed automatically by the User pre-save hook.
 * @param {Array} userData - Array of user objects matching User schema
 */
async function insertUsers(userData) {
  log.step(`Inserting ${userData.length} users`);

  // Use User.create() to trigger pre-save password hashing
  refs.users = await User.create(userData);

  log.done(`Users inserted (${refs.users.length} records)`);
  return refs.users;
}

/**
 * Insert projects. Requires refs.users to be populated for 'lead' and 'members'.
 * @param {Function} projectDataFn - Function that receives refs.users and returns project data array
 */
async function insertProjects(projectDataFn) {
  const projectData = projectDataFn(refs.users);
  log.step(`Inserting ${projectData.length} projects`);

  refs.projects = await Project.create(projectData);

  log.done(`Projects inserted (${refs.projects.length} records)`);
  return refs.projects;
}

/**
 * Insert bugs one-by-one to trigger the pre-save bugId generation hook correctly.
 * Sequential insertion ensures the count increments properly per project.
 * @param {Function} bugDataFn - Function that receives (users, projects) and returns bug data array
 */
async function insertBugs(bugDataFn) {
  const bugData = bugDataFn(refs.users, refs.projects);
  log.step(`Inserting ${bugData.length} bugs (sequential for bugId generation)`);

  // Must insert one at a time so the pre-save hook counts correctly
  const inserted = [];
  for (const data of bugData) {
    const bug = await Bug.create(data);
    inserted.push(bug);
  }

  refs.bugs = inserted;
  log.done(`Bugs inserted (${refs.bugs.length} records)`);
  log.info(`Bug IDs generated: ${refs.bugs.slice(0, 10).map((b) => b.bugId).join(', ')}${refs.bugs.length > 10 ? ` ... +${refs.bugs.length - 10} more` : ''}`);
  return refs.bugs;
}

/**
 * Insert comments.
 * @param {Function} commentDataFn - Function that receives (users, bugs) and returns comment data array
 */
async function insertComments(commentDataFn) {
  const commentData = commentDataFn(refs.users, refs.bugs);
  log.step(`Inserting ${commentData.length} comments`);

  refs.comments = await Comment.create(commentData);

  log.done(`Comments inserted (${refs.comments.length} records)`);
  return refs.comments;
}

/**
 * Insert activities.
 * @param {Function} activityDataFn - Function that receives (users, projects, bugs) and returns activity data array
 */
async function insertActivities(activityDataFn) {
  const activityData = activityDataFn(refs.users, refs.projects, refs.bugs);
  log.step(`Inserting ${activityData.length} activities`);

  refs.activities = await Activity.create(activityData);

  log.done(`Activities inserted (${refs.activities.length} records)`);
  return refs.activities;
}

// ── Main Seed Orchestrator ───────────────────────────────────

async function seed() {
  const startTime = Date.now();

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   BugTracker Pro — Database Seeder       ║');
  console.log('╚══════════════════════════════════════════╝');

  try {
    // 1. Connect to database
    log.step('Connecting to database');
    await connectDB();
    log.done('Database connected');

    // 2. Clear existing data (idempotent)
    await clearDatabase();
    log.divider();

    // 3. Insert in dependency order
    await insertUsers(getUserData());
    await insertProjects(getProjectData);
    await insertBugs(getBugData);
    await insertComments(getCommentData);
    await insertActivities(getActivityData);

    // 4. Summary
    log.divider();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n  ✅ Seed completed successfully in ${elapsed}s\n`);
    console.log('  Login Credentials:');
    console.log('  ┌──────────────┬───────────────────────────┬──────────────┐');
    console.log('  │ Role         │ Email                     │ Password     │');
    console.log('  ├──────────────┼───────────────────────────┼──────────────┤');
    refs.users.forEach((u) => {
      const role = u.role.padEnd(12);
      const email = u.email.padEnd(25);
      console.log(`  │ ${role} │ ${email} │ 1231231234   │`);
    });
    console.log('  └──────────────┴───────────────────────────┴──────────────┘\n');

  } catch (error) {
    log.error(`Seed failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

// ── Data Generators (return raw arrays matching schemas) ─────
// These functions define WHAT data to insert.
// They strictly follow the schema constraints documented above.

function getUserData() {
  // 15 realistic enterprise users across 6 role categories
  // Roles mapping to schema enum: admin, manager, developer, qa_engineer
  // Note: DevOps maps to 'developer' role (closest match in schema)
  //       QA Leads map to 'qa_engineer' role
  const password = '1231231234'; // min 6 chars — hashed by pre-save hook

  return [
    // ─── 1 Admin ─────────────────────────────
    {
      firstName: 'Siva',
      lastName: 'Kumar',
      email: 'siva0225@gmail.com',
      password,
      role: 'admin',
      department: 'Engineering',
      phone: '+1-555-100-0001',
      isActive: true,
    },

    // ─── 2 Project Managers ──────────────────
    {
      firstName: 'Rachel',
      lastName: 'Thompson',
      email: 'rachel.thompson@bugtracker.pro',
      password,
      role: 'manager',
      department: 'Product Management',
      phone: '+1-555-200-0001',
      isActive: true,
    },
    {
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@bugtracker.pro',
      password,
      role: 'manager',
      department: 'Engineering Management',
      phone: '+1-555-200-0002',
      isActive: true,
    },

    // ─── 3 QA Leads ─────────────────────────
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-300-0001',
      isActive: true,
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-300-0002',
      isActive: true,
    },
    {
      firstName: 'Mei',
      lastName: 'Chen',
      email: 'mei.chen@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-300-0003',
      isActive: true,
    },

    // ─── 4 QA Engineers ─────────────────────
    {
      firstName: 'Carlos',
      lastName: 'Rivera',
      email: 'carlos.rivera@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-400-0001',
      isActive: true,
    },
    {
      firstName: 'Aisha',
      lastName: 'Patel',
      email: 'aisha.patel@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-400-0002',
      isActive: true,
    },
    {
      firstName: 'Nathan',
      lastName: 'Brooks',
      email: 'nathan.brooks@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-400-0003',
      isActive: true,
    },
    {
      firstName: 'Fatima',
      lastName: 'Hassan',
      email: 'fatima.hassan@bugtracker.pro',
      password,
      role: 'qa_engineer',
      department: 'Quality Assurance',
      phone: '+1-555-400-0004',
      isActive: true,
    },

    // ─── 4 Developers ───────────────────────
    {
      firstName: 'Alexander',
      lastName: 'Petrov',
      email: 'alexander.petrov@bugtracker.pro',
      password,
      role: 'developer',
      department: 'Backend Engineering',
      phone: '+1-555-500-0001',
      isActive: true,
    },
    {
      firstName: 'Emily',
      lastName: 'Nguyen',
      email: 'emily.nguyen@bugtracker.pro',
      password,
      role: 'developer',
      department: 'Frontend Engineering',
      phone: '+1-555-500-0002',
      isActive: true,
    },
    {
      firstName: 'Omar',
      lastName: 'Al-Rashid',
      email: 'omar.alrashid@bugtracker.pro',
      password,
      role: 'developer',
      department: 'Full Stack Engineering',
      phone: '+1-555-500-0003',
      isActive: true,
    },
    {
      firstName: 'Sophie',
      lastName: 'Anderson',
      email: 'sophie.anderson@bugtracker.pro',
      password,
      role: 'developer',
      department: 'Mobile Engineering',
      phone: '+1-555-500-0004',
      isActive: true,
    },

    // ─── 1 DevOps Engineer (mapped to 'developer' role) ──
    {
      firstName: 'Kenji',
      lastName: 'Tanaka',
      email: 'kenji.tanaka@bugtracker.pro',
      password,
      role: 'developer',
      department: 'DevOps & Infrastructure',
      phone: '+1-555-600-0001',
      isActive: true,
    },
  ];
}

function getProjectData(users) {
  // Helper to find user by index (order matches getUserData array)
  // Index mapping:
  //  0: Siva (admin)
  //  1: Rachel (manager)    2: David (manager)
  //  3: Priya (qa_lead)     4: James (qa_lead)      5: Mei (qa_lead)
  //  6: Carlos (qa)         7: Aisha (qa)           8: Nathan (qa)         9: Fatima (qa)
  // 10: Alexander (dev)    11: Emily (dev)         12: Omar (dev)         13: Sophie (dev)
  // 14: Kenji (devops)

  return [
    // 1. E-Commerce Platform
    {
      name: 'E-Commerce Platform',
      key: 'ECOM',
      description: 'Enterprise-grade e-commerce platform with microservices architecture, supporting multi-tenant storefronts, real-time inventory, payment gateway integrations (Stripe, PayPal), and AI-powered product recommendations. Tech: React, Node.js, PostgreSQL, Redis, Elasticsearch.',
      status: 'active',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      lead: users[1]._id, // Rachel Thompson
      members: [users[10]._id, users[11]._id, users[3]._id, users[6]._id, users[14]._id],
      modules: [
        { name: 'Cart & Checkout', description: 'Shopping cart, checkout flow, order management' },
        { name: 'Payment Gateway', description: 'Stripe/PayPal integration, refund processing' },
        { name: 'Product Catalog', description: 'Product CRUD, categories, search, filters' },
        { name: 'User Authentication', description: 'OAuth2, JWT, role-based access control' },
        { name: 'Inventory Management', description: 'Stock tracking, warehouse sync, low-stock alerts' },
        { name: 'Admin Dashboard', description: 'Analytics, reports, user management panel' },
      ],
      isActive: true,
    },

    // 2. Mobile Banking Application
    {
      name: 'Mobile Banking Application',
      key: 'MBANK',
      description: 'Mobile-first banking application for retail customers with biometric authentication, real-time transaction tracking, bill payments, fund transfers, and investment portfolio management. Tech: React Native, Node.js, MongoDB, AWS.',
      status: 'active',
      startDate: new Date('2025-10-15'),
      endDate: new Date('2026-08-31'),
      lead: users[2]._id, // David Martinez
      members: [users[13]._id, users[12]._id, users[4]._id, users[7]._id, users[14]._id],
      modules: [
        { name: 'Account Management', description: 'Account overview, statements, details' },
        { name: 'Fund Transfer', description: 'P2P, NEFT, RTGS, international transfers' },
        { name: 'Bill Payments', description: 'Utility bills, subscriptions, scheduled payments' },
        { name: 'Push Notifications', description: 'Transaction alerts, marketing, security notifications' },
        { name: 'Biometric Auth', description: 'Fingerprint, Face ID, PIN fallback' },
      ],
      isActive: true,
    },

    // 3. Hospital Management System
    {
      name: 'Hospital Management System',
      key: 'HMS',
      description: 'Comprehensive hospital management solution covering patient registration, appointment scheduling, electronic health records (EHR), billing, pharmacy management, and lab integration. HIPAA compliant. Tech: Angular, Java Spring Boot, Oracle DB.',
      status: 'active',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-10-30'),
      lead: users[1]._id, // Rachel Thompson
      members: [users[12]._id, users[10]._id, users[5]._id, users[8]._id],
      modules: [
        { name: 'Patient Registration', description: 'Demographics, insurance, medical history' },
        { name: 'Appointment Scheduling', description: 'Doctor availability, booking, reminders' },
        { name: 'Electronic Health Records', description: 'Clinical notes, prescriptions, lab results' },
        { name: 'Billing & Insurance', description: 'Invoice generation, insurance claims, payments' },
        { name: 'Pharmacy', description: 'Drug inventory, dispensing, interactions check' },
      ],
      isActive: true,
    },

    // 4. HR Management Portal
    {
      name: 'HR Management Portal',
      key: 'HRMS',
      description: 'End-to-end human resource management system with employee onboarding, payroll processing, leave management, performance reviews, recruitment pipeline, and compliance tracking. Tech: Vue.js, Python Django, PostgreSQL.',
      status: 'active',
      startDate: new Date('2025-08-15'),
      endDate: new Date('2026-04-30'),
      lead: users[2]._id, // David Martinez
      members: [users[11]._id, users[13]._id, users[3]._id, users[9]._id],
      modules: [
        { name: 'Employee Onboarding', description: 'Document collection, training assignments' },
        { name: 'Payroll', description: 'Salary calculation, tax deduction, payslips' },
        { name: 'Leave Management', description: 'Leave requests, approvals, balance tracking' },
        { name: 'Performance Reviews', description: '360-degree feedback, goal tracking, ratings' },
        { name: 'Recruitment', description: 'Job postings, applicant tracking, interviews' },
      ],
      isActive: true,
    },

    // 5. Inventory Management System
    {
      name: 'Inventory Management System',
      key: 'IMS',
      description: 'Real-time inventory tracking system with barcode scanning, warehouse management, purchase order automation, demand forecasting, and multi-location stock synchronization. Tech: React, Express.js, MongoDB, RabbitMQ.',
      status: 'planning',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-09-30'),
      lead: users[1]._id, // Rachel Thompson
      members: [users[10]._id, users[14]._id, users[4]._id, users[6]._id],
      modules: [
        { name: 'Stock Tracking', description: 'Real-time inventory levels, SKU management' },
        { name: 'Purchase Orders', description: 'Supplier management, PO creation, approvals' },
        { name: 'Warehouse Ops', description: 'Receiving, putaway, picking, shipping' },
        { name: 'Barcode Scanner', description: 'Mobile barcode/QR scanning integration' },
        { name: 'Reports & Analytics', description: 'Stock reports, demand forecasting, KPIs' },
      ],
      isActive: true,
    },

    // 6. Learning Management System
    {
      name: 'Learning Management System',
      key: 'LMS',
      description: 'Feature-rich LMS supporting video courses, live sessions, quizzes, certifications, progress tracking, and gamification. Built for corporate training and educational institutions. Tech: Next.js, Node.js, PostgreSQL, WebRTC.',
      status: 'active',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-03-31'),
      lead: users[2]._id, // David Martinez
      members: [users[11]._id, users[12]._id, users[5]._id, users[7]._id],
      modules: [
        { name: 'Course Builder', description: 'WYSIWYG course creation, video upload, modules' },
        { name: 'Student Portal', description: 'Enrollment, progress tracking, certificates' },
        { name: 'Assessments', description: 'Quizzes, assignments, grading, proctoring' },
        { name: 'Live Sessions', description: 'WebRTC video classes, screen sharing, chat' },
        { name: 'Gamification', description: 'Points, badges, leaderboards, streaks' },
      ],
      isActive: true,
    },

    // 7. Food Delivery Application
    {
      name: 'Food Delivery Application',
      key: 'FOOD',
      description: 'On-demand food delivery platform with restaurant management, real-time order tracking, route optimization, payment processing, and driver fleet management. Tech: React Native, Node.js, MongoDB, Google Maps API, Socket.io.',
      status: 'active',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-07-31'),
      lead: users[1]._id, // Rachel Thompson
      members: [users[13]._id, users[10]._id, users[3]._id, users[8]._id, users[14]._id],
      modules: [
        { name: 'Restaurant Portal', description: 'Menu management, order acceptance, analytics' },
        { name: 'Customer App', description: 'Browse, order, track, review, loyalty program' },
        { name: 'Driver App', description: 'Delivery assignments, navigation, earnings' },
        { name: 'Real-time Tracking', description: 'WebSocket-based live order/driver tracking' },
        { name: 'Payment Engine', description: 'Multi-gateway payments, wallet, refunds' },
      ],
      isActive: true,
    },

    // 8. Customer Relationship Management
    {
      name: 'Customer Relationship Management',
      key: 'CRM',
      description: 'Enterprise CRM platform with contact management, sales pipeline, marketing automation, customer support ticketing, and advanced analytics dashboards. Tech: React, Python FastAPI, PostgreSQL, Celery, Redis.',
      status: 'on_hold',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-02-28'),
      lead: users[2]._id, // David Martinez
      members: [users[12]._id, users[11]._id, users[4]._id, users[9]._id],
      modules: [
        { name: 'Contact Management', description: 'Companies, contacts, deals, custom fields' },
        { name: 'Sales Pipeline', description: 'Deal stages, forecasting, win/loss analysis' },
        { name: 'Marketing Automation', description: 'Email campaigns, sequences, lead scoring' },
        { name: 'Support Tickets', description: 'Customer issues, SLA tracking, knowledge base' },
        { name: 'Analytics', description: 'Revenue dashboards, team performance, funnel metrics' },
      ],
      isActive: true,
    },

    // 9. Travel Booking Platform
    {
      name: 'Travel Booking Platform',
      key: 'TRAVEL',
      description: 'Full-service travel booking platform integrating flights, hotels, car rentals, and experiences. Features dynamic pricing, loyalty rewards, multi-currency support, and itinerary planning. Tech: React, Go, PostgreSQL, Amadeus API.',
      status: 'planning',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-11-30'),
      lead: users[1]._id, // Rachel Thompson
      members: [users[10]._id, users[13]._id, users[5]._id, users[6]._id, users[14]._id],
      modules: [
        { name: 'Flight Search', description: 'Multi-airline search, fare comparison, booking' },
        { name: 'Hotel Reservations', description: 'Availability, room types, cancellation policies' },
        { name: 'Car Rentals', description: 'Vehicle search, pickup/dropoff, insurance options' },
        { name: 'Itinerary Planner', description: 'Trip builder, day-by-day scheduling, sharing' },
        { name: 'Loyalty Program', description: 'Points accrual, tier benefits, redemption' },
      ],
      isActive: true,
    },

    // 10. Smart Home IoT Dashboard
    {
      name: 'Smart Home IoT Dashboard',
      key: 'IOT',
      description: 'Centralized IoT dashboard for smart home device management supporting lighting, HVAC, security cameras, door locks, and energy monitoring. Features automation rules, voice assistant integration, and real-time telemetry. Tech: React, Node.js, MQTT, InfluxDB, Grafana.',
      status: 'active',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-05-31'),
      lead: users[2]._id, // David Martinez
      members: [users[14]._id, users[10]._id, users[11]._id, users[3]._id, users[7]._id],
      modules: [
        { name: 'Device Registry', description: 'Device pairing, status monitoring, firmware updates' },
        { name: 'Automation Rules', description: 'If-this-then-that rules, schedules, scenes' },
        { name: 'Security Cameras', description: 'Live feed, motion detection, recording playback' },
        { name: 'Energy Monitoring', description: 'Real-time consumption, cost tracking, optimization' },
        { name: 'Voice Integration', description: 'Alexa, Google Assistant, Siri shortcuts' },
      ],
      isActive: true,
    },
  ];
}

function getBugData(users, projects) {
  // Loads 120 realistic bugs from external data modules (60 + 60)
  const batch1 = require('./seedBugData');
  const batch2 = require('./seedBugData2');
  return [...batch1(users, projects), ...batch2(users, projects)];
}

function getCommentData(users, bugs) {
  const generateComments = require('./seedCommentData');
  return generateComments(users, bugs);
}

function getActivityData(users, projects, bugs) {
  const generateActivities = require('./seedActivityData');
  return generateActivities(users, projects, bugs);
}

// ── Execute ──────────────────────────────────────────────────

seed();
