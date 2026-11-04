/**
 * Returns the 15 user records for seeding.
 * Extracted so autoSeed.js and seed.js can both use it.
 */
function getUserData() {
  const password = '1231231234';
  return [
    { firstName: 'Siva', lastName: 'Kumar', email: 'siva0225@gmail.com', password, role: 'admin', department: 'Engineering', phone: '+1-555-100-0001', isActive: true },
    { firstName: 'Rachel', lastName: 'Thompson', email: 'rachel.thompson@bugtracker.pro', password, role: 'manager', department: 'Product Management', phone: '+1-555-200-0001', isActive: true },
    { firstName: 'David', lastName: 'Martinez', email: 'david.martinez@bugtracker.pro', password, role: 'manager', department: 'Engineering Management', phone: '+1-555-200-0002', isActive: true },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-300-0001', isActive: true },
    { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-300-0002', isActive: true },
    { firstName: 'Mei', lastName: 'Chen', email: 'mei.chen@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-300-0003', isActive: true },
    { firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.rivera@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-400-0001', isActive: true },
    { firstName: 'Aisha', lastName: 'Patel', email: 'aisha.patel@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-400-0002', isActive: true },
    { firstName: 'Nathan', lastName: 'Brooks', email: 'nathan.brooks@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-400-0003', isActive: true },
    { firstName: 'Fatima', lastName: 'Hassan', email: 'fatima.hassan@bugtracker.pro', password, role: 'qa_engineer', department: 'Quality Assurance', phone: '+1-555-400-0004', isActive: true },
    { firstName: 'Alexander', lastName: 'Petrov', email: 'alexander.petrov@bugtracker.pro', password, role: 'developer', department: 'Backend Engineering', phone: '+1-555-500-0001', isActive: true },
    { firstName: 'Emily', lastName: 'Nguyen', email: 'emily.nguyen@bugtracker.pro', password, role: 'developer', department: 'Frontend Engineering', phone: '+1-555-500-0002', isActive: true },
    { firstName: 'Omar', lastName: 'Al-Rashid', email: 'omar.alrashid@bugtracker.pro', password, role: 'developer', department: 'Full Stack Engineering', phone: '+1-555-500-0003', isActive: true },
    { firstName: 'Sophie', lastName: 'Anderson', email: 'sophie.anderson@bugtracker.pro', password, role: 'developer', department: 'Mobile Engineering', phone: '+1-555-500-0004', isActive: true },
    { firstName: 'Kenji', lastName: 'Tanaka', email: 'kenji.tanaka@bugtracker.pro', password, role: 'developer', department: 'DevOps & Infrastructure', phone: '+1-555-600-0001', isActive: true },
  ];
}

module.exports = getUserData;
