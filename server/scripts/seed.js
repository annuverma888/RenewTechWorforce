require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const TechnicianProfile = require('../models/TechnicianProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Certificate = require('../models/Certificate');
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const Project = require('../models/Project');
const Application = require('../models/Application');
const WorkforceAssignment = require('../models/WorkforceAssignment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Skill = require('../models/Skill');
const { calculateMatchScore } = require('../services/matchingEngine');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renewtech';
    console.log(`[Seed Script]: Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed Script]: Connected to MongoDB. Clearing existing database...');

    // Clean all collections
    await Promise.all([
      User.deleteMany({}),
      TechnicianProfile.deleteMany({}),
      CompanyProfile.deleteMany({}),
      Certificate.deleteMany({}),
      Assessment.deleteMany({}),
      AssessmentResult.deleteMany({}),
      Project.deleteMany({}),
      Application.deleteMany({}),
      WorkforceAssignment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
      Skill.deleteMany({}),
    ]);

    console.log('[Seed Script]: Cleared old data. Seeding Skills catalog...');

    // 1. SEED SKILLS
    const skillsList = [
      { name: 'PV Installation', category: 'Solar', demandLevel: 'Critical' },
      { name: 'PV Wiring', category: 'Solar', demandLevel: 'Critical' },
      { name: 'Solar Panel Installation', category: 'Solar', demandLevel: 'High' },
      { name: 'Inverter Installation', category: 'Solar', demandLevel: 'Critical' },
      { name: 'Solar O&M', category: 'Solar', demandLevel: 'High' },
      { name: 'Site Survey', category: 'Solar', demandLevel: 'Moderate' },
      { name: 'Electrical Maintenance', category: 'Solar', demandLevel: 'High' },
      { name: 'Wind Turbine Installation', category: 'Wind', demandLevel: 'Critical' },
      { name: 'Turbine Maintenance', category: 'Wind', demandLevel: 'High' },
      { name: 'Blade Inspection', category: 'Wind', demandLevel: 'Critical' },
      { name: 'Tower Climbing', category: 'Wind', demandLevel: 'Critical' },
      { name: 'Electrical Safety', category: 'Other', demandLevel: 'Critical' },
      { name: 'Equipment Handling', category: 'Other', demandLevel: 'High' },
      { name: 'Site Safety', category: 'Other', demandLevel: 'Critical' },
    ];
    await Skill.insertMany(skillsList);

    console.log('[Seed Script]: Seeding Assessments...');

    // 2. SEED ASSESSMENTS
    const solarAssessment = await Assessment.create({
      title: 'Solar PV Technical Competency Assessment',
      category: 'Solar',
      description: 'Standardized competency evaluation covering Solar PV modules, DC string wiring, MPPT inverters, commissioning, and lockout-tagout electrical safety protocols.',
      durationMinutes: 20,
      totalQuestions: 6,
      passingPercentage: 70,
      topics: ['PV Components', 'Electrical Safety', 'Wiring & Connections', 'Inverter Installation', 'Solar O&M'],
      questions: [
        {
          questionText: 'What is the primary function of a bypass diode in a Solar PV module?',
          topicCategory: 'PV Components',
          options: [
            'To prevent battery bank discharge during cloudy weather',
            'To prevent hot-spot formation and minimize power loss when cells are shaded',
            'To step down DC voltage to 230V AC',
            'To measure current flow across strings',
          ],
          correctOptionIndex: 1,
          explanation: 'Bypass diodes allow string current to bypass shaded or damaged cells, mitigating hot spots and thermal stress.',
          difficulty: 'Intermediate',
        },
        {
          questionText: 'When carrying out Lockout/Tagout (LOTO) on a 500kW grid-tied solar inverter, which sequence is legally mandated for safety?',
          topicCategory: 'Electrical Safety',
          options: [
            'Disconnect AC breaker first, then disconnect DC isolators, verify zero voltage with calibrated multimeter',
            'Disconnect DC switch first while inverter is under full load',
            'Turn off display screen and pull ground wires',
            'No need to isolate if wearing rubber gloves',
          ],
          correctOptionIndex: 0,
          explanation: 'To quench arc flash hazard, always trip AC load breakers first, then disengage DC switches, and verify zero voltage before touching conductors.',
          difficulty: 'Advanced',
        },
        {
          questionText: 'Which connector standard is internationally mandatory for high-voltage DC string interconnections in utility solar plants?',
          topicCategory: 'Wiring & Connections',
          options: ['USB-C Industrial', 'MC4 (Multi-Contact 4mm)', 'Anderson Powerpole', 'Twist-on Wire Nuts'],
          correctOptionIndex: 1,
          explanation: 'MC4 connectors are the global utility benchmark for UV-resistant, IP68 waterproof DC connections up to 1500V.',
          difficulty: 'Beginner',
        },
        {
          questionText: 'What parameter does Maximum Power Point Tracking (MPPT) continuously adjust on a solar string inverter?',
          topicCategory: 'Inverter Installation',
          options: [
            'Utility grid frequency',
            'The operating DC voltage and current ratio to capture peak power curve',
            'Transformer core temperature',
            'PV module tilt angle automatically',
          ],
          correctOptionIndex: 1,
          explanation: 'MPPT dynamically tracks the knee of the I-V curve under fluctuating solar irradiance and temperature to extract maximum Watts.',
          difficulty: 'Advanced',
        },
        {
          questionText: 'Which test instrument is utilized during Solar O&M to identify cracked cells and localized resistive heating without interrupting power generation?',
          topicCategory: 'Solar O&M',
          options: ['Megohmmeter', 'Infrared Thermographic Camera', 'Sound Level Meter', 'Hydrometer'],
          correctOptionIndex: 1,
          explanation: 'Handheld or drone-mounted infrared thermal imaging rapidly detects hot-spots and bypass diode anomalies under sunlight.',
          difficulty: 'Intermediate',
        },
        {
          questionText: 'What is the minimum recommended gauge for grounding the metallic structural mounting frames of a ground-mount solar array?',
          topicCategory: 'Electrical Safety',
          options: ['0.5 sq mm copper', '6 to 10 sq mm copper conductor or 25x3mm GI strip', 'Plastic coated speaker wire', 'No grounding required for racking'],
          correctOptionIndex: 1,
          explanation: 'IEC 62548 and green building codes require substantial grounding (6-10 sq mm copper or 25x3mm GI strip) for surge and fault dissipation.',
          difficulty: 'Intermediate',
        },
      ],
    });

    const windAssessment = await Assessment.create({
      title: 'Wind Turbine Technical & Climbing Assessment',
      category: 'Wind',
      description: 'Assessment covering wind turbine nacelle mechanics, hydraulic yaw systems, blade inspections, and GWO compliant working-at-heights safety.',
      durationMinutes: 20,
      totalQuestions: 5,
      passingPercentage: 70,
      topics: ['Turbine Components', 'Tower Climbing & Safety', 'Blade Inspection', 'Maintenance'],
      questions: [
        {
          questionText: 'Before ascending an 80-meter wind turbine ladder, what piece of Fall Protection equipment must be inspected and anchored to the vertical guide rail?',
          topicCategory: 'Tower Climbing & Safety',
          options: [
            'Guided-type fall arrester (climber / cabloc trolley) attached to front sternal D-ring',
            'Standard leather waist belt',
            'Loose rope without shock absorber',
            'Gym climbing chalk bag',
          ],
          correctOptionIndex: 0,
          explanation: 'GWO standards strictly mandate a certified guided fall arrester tethered to the sternal attachment point of a full body harness.',
          difficulty: 'Intermediate',
        },
        {
          questionText: 'Leading edge erosion on utility-scale wind turbine blades is primarily caused by which environmental factor?',
          topicCategory: 'Blade Inspection',
          options: ['High altitude cosmic rays', 'Rain droplet, hail, and airborne particulate impact at high tip speeds', 'Bird perching', 'Solar thermal radiation only'],
          correctOptionIndex: 1,
          explanation: 'At tip speeds exceeding 250 km/h, rain and dust impact steadily erodes the aerodynamic gelcoat, reducing AEP (Annual Energy Production).',
          difficulty: 'Intermediate',
        },
        {
          questionText: 'What is the purpose of the yaw drive system in a horizontal-axis wind turbine?',
          topicCategory: 'Turbine Components',
          options: [
            'To adjust rotor blade pitch angle',
            'To rotate the entire nacelle to face directly into the prevailing wind direction',
            'To pump coolant through generator coils',
            'To apply emergency disc brakes on the low speed shaft',
          ],
          correctOptionIndex: 1,
          explanation: 'The yaw mechanism keeps the rotor perpendicular to the wind direction based on anemometer and wind vane readings.',
          difficulty: 'Beginner',
        },
        {
          questionText: 'During oil sampling and gearbox maintenance, what finding indicates severe internal gear mesh wear?',
          topicCategory: 'Maintenance',
          options: ['Clear golden fluid', 'Elevated iron/ferrous PPM particle count and dark particulate slurry on magnetic plugs', 'Presence of oxygen bubbles', 'Slight pleasant smell'],
          correctOptionIndex: 1,
          explanation: 'High ferrous debris detected via inline particle counters or magnetic chip detectors points to gear tooth micropitting or bearing spalling.',
          difficulty: 'Advanced',
        },
        {
          questionText: 'What is the maximum wind speed limit generally permitted by safety rules for technician personnel to conduct external blade rope-access maintenance?',
          topicCategory: 'Tower Climbing & Safety',
          options: ['25 m/s (Gale force)', '8 to 10 m/s', '40 m/s', 'Any wind speed if tethered'],
          correctOptionIndex: 1,
          explanation: 'Wind turbine maintenance rules restrict external rope-access blade work above 8 to 10 m/s due to uncontrolled swinging and pendulum hazards.',
          difficulty: 'Intermediate',
        },
      ],
    });

    console.log('[Seed Script]: Seeding Users (Admin, Companies, Technicians)...');

    // 3. SEED ADMIN USER
    const adminUser = await User.create({
      name: 'RenewTech Admin',
      email: 'admin@renewtech.com',
      phone: '+91 98765 00000',
      password: 'Admin@123',
      role: 'admin',
      profilePhoto: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=0f172a',
    });

    // 4. SEED EPC COMPANIES
    const epcCompany1User = await User.create({
      name: 'GreenVolt Energy',
      email: 'contact@greenvolt.in',
      phone: '+91 98111 22334',
      password: 'Company@123',
      role: 'epc_company',
      profilePhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
    });
    const epcProfile1 = await CompanyProfile.create({
      user: epcCompany1User._id,
      companyName: 'GreenVolt Energy EPC Private Limited',
      website: 'https://greenvolt.in',
      registrationNumber: '09AAACG1234F1Z5',
      contactPerson: 'Vikramaditya Sengupta',
      designation: 'Head of Project EPC',
      officeAddress: 'Expressway Tower, Sector 132',
      city: 'Noida',
      state: 'Uttar Pradesh',
      companySize: '200-500',
      primaryDomain: 'Solar Utility Scale',
      description: 'Leading utility-scale Solar EPC firm delivering 500MW+ cumulative solar plant assets across North India.',
      verifiedStatus: 'Verified',
      activeProjectsCount: 2,
      hiredTechniciansCount: 3,
    });

    const epcCompany2User = await User.create({
      name: 'SolarGrid EPC',
      email: 'projects@solargrid.in',
      phone: '+91 98222 33445',
      password: 'Company@123',
      role: 'epc_company',
      profilePhoto: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
    });
    const epcProfile2 = await CompanyProfile.create({
      user: epcCompany2User._id,
      companyName: 'SolarGrid EPC Solutions Ltd',
      website: 'https://solargrid.in',
      registrationNumber: '06AAACS5678B1Z2',
      contactPerson: 'Ananya Deshmukh',
      designation: 'Workforce Operations Lead',
      officeAddress: 'DLF CyberCity, Phase II',
      city: 'Gurugram',
      state: 'Haryana',
      companySize: '50-200',
      primaryDomain: 'Solar Rooftop',
      description: 'Specialists in commercial rooftop solar, captive renewable parks, and precision solar O&M.',
      verifiedStatus: 'Verified',
      activeProjectsCount: 1,
      hiredTechniciansCount: 2,
    });

    const epcCompany3User = await User.create({
      name: 'WindPower Solutions',
      email: 'workforce@windpowersolutions.in',
      phone: '+91 98333 44556',
      password: 'Company@123',
      role: 'epc_company',
      profilePhoto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    });
    const epcProfile3 = await CompanyProfile.create({
      user: epcCompany3User._id,
      companyName: 'WindPower Solutions India Pvt Ltd',
      website: 'https://windpowersolutions.in',
      registrationNumber: '29AAACW9988D1Z9',
      contactPerson: 'K. R. Natarajan',
      designation: 'Site Operations Director',
      officeAddress: 'Outer Ring Road Tech Enclave',
      city: 'Bengaluru',
      state: 'Karnataka',
      companySize: '200-500',
      primaryDomain: 'Wind EPC',
      description: 'Turnkey wind farm EPC contractor executing heavy-lift turbine installations, repowering, and blade service.',
      verifiedStatus: 'Verified',
      activeProjectsCount: 1,
      hiredTechniciansCount: 1,
    });

    // 5. SEED TECHNICIANS
    console.log('[Seed Script]: Seeding Technicians and Profiles...');

    // Tech 1: Rahul Kumar
    const tech1User = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul.kumar@gmail.com',
      phone: '+91 98761 11222',
      password: 'Tech@123',
      role: 'technician',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    });
    const tech1Profile = await TechnicianProfile.create({
      user: tech1User._id,
      profession: 'Certified Solar PV Wireman',
      yearsOfExperience: 4,
      currentAvailability: 'Available',
      expectedDailyRate: 1800,
      expectedMonthlyRate: 42000,
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      preferredWorkLocations: ['Kanpur', 'Lucknow', 'Uttar Pradesh', 'Rajasthan'],
      renewableSkills: [
        { name: 'PV Installation', category: 'Solar', proficiency: 'Expert', isVerified: true },
        { name: 'PV Wiring', category: 'Solar', proficiency: 'Expert', isVerified: true },
        { name: 'Inverter Installation', category: 'Solar', proficiency: 'Advanced', isVerified: true },
        { name: 'Electrical Safety', category: 'Other', proficiency: 'Expert', isVerified: true },
        { name: 'Electrical Maintenance', category: 'Solar', proficiency: 'Advanced', isVerified: false },
      ],
      previousProjects: [
        {
          title: '300kW Rooftop Solar Installation',
          projectType: 'Solar',
          capacity: '300kW',
          role: 'Lead PV Wireman',
          location: 'Kanpur, UP',
          durationMonths: 2,
          completionYear: 2024,
          description: 'Executed DC cable tray routing, combiner box termination, and inverter synchronisation.',
        },
        {
          title: '1.2MW Ground Mount Solar Park',
          projectType: 'Solar',
          capacity: '1.2MW',
          role: 'Solar Electrical Technician',
          location: 'Jhansi, UP',
          durationMonths: 4,
          completionYear: 2023,
          description: 'Carried out string voltage measurements, insulation resistance megger testing, and AC commissioning.',
        },
      ],
      overallSkillScore: 92,
      verifiedCertificatesCount: 2,
      projectsCompleted: 8,
      averageRating: 4.9,
      ratingsCount: 6,
      profileCompletion: 95,
      bio: 'NSDC Certified Solar Wireman with 4+ years of field experience in commercial & utility DC solar stringing and safety-first commissioning.',
    });

    // Tech 1 Certificates
    await Certificate.create([
      {
        technician: tech1User._id,
        certificateName: 'Solar PV Installer (Level 4)',
        issuingOrganization: 'National Skill Development Corporation (NSDC)',
        certificateNumber: 'NSDC-SPV-2022-8871',
        issueDate: new Date('2022-03-15'),
        expiryDate: new Date('2027-03-15'),
        category: 'Solar',
        documentUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-01-10'),
      },
      {
        technician: tech1User._id,
        certificateName: 'Electrical Safety & LOTO Specialist',
        issuingOrganization: 'Skill Council for Green Jobs (SCGJ)',
        certificateNumber: 'SCGJ-SAF-4412',
        issueDate: new Date('2022-06-20'),
        category: 'Safety',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-01-10'),
      },
    ]);

    // Tech 1 Assessment Result
    await AssessmentResult.create({
      technician: tech1User._id,
      assessment: solarAssessment._id,
      assessmentTitle: solarAssessment.title,
      category: 'Solar',
      totalQuestions: 6,
      correctAnswers: 6,
      scorePercentage: 100,
      skillLevel: 'Master',
      categoryBreakdown: [
        { category: 'PV Components', score: 1, total: 1, percentage: 100 },
        { category: 'Electrical Safety', score: 2, total: 2, percentage: 100 },
        { category: 'Wiring & Connections', score: 1, total: 1, percentage: 100 },
        { category: 'Inverter Installation', score: 1, total: 1, percentage: 100 },
        { category: 'Solar O&M', score: 1, total: 1, percentage: 100 },
      ],
      passed: true,
    });

    // Tech 2: Amit Sharma
    const tech2User = await User.create({
      name: 'Amit Sharma',
      email: 'amit.sharma@gmail.com',
      phone: '+91 98762 22333',
      password: 'Tech@123',
      role: 'technician',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    });
    const tech2Profile = await TechnicianProfile.create({
      user: tech2User._id,
      profession: 'Solar Panel Installer',
      yearsOfExperience: 3,
      currentAvailability: 'Available',
      expectedDailyRate: 1500,
      expectedMonthlyRate: 36000,
      city: 'Jaipur',
      state: 'Rajasthan',
      preferredWorkLocations: ['Jaipur', 'Jodhpur', 'Rajasthan', 'Gujarat'],
      renewableSkills: [
        { name: 'Solar Panel Installation', category: 'Solar', proficiency: 'Expert', isVerified: true },
        { name: 'PV Installation', category: 'Solar', proficiency: 'Advanced', isVerified: true },
        { name: 'Site Survey', category: 'Solar', proficiency: 'Advanced', isVerified: false },
        { name: 'Site Safety', category: 'Other', proficiency: 'Intermediate', isVerified: true },
      ],
      previousProjects: [
        {
          title: '500kW Industrial Rooftop Solar',
          projectType: 'Solar',
          capacity: '500kW',
          role: 'Solar Installer',
          location: 'Jaipur, Rajasthan',
          durationMonths: 2,
          completionYear: 2024,
          description: 'Assembled MMS module mounting structures, clamped 920 mono-PERC bifacial panels.',
        },
      ],
      overallSkillScore: 88,
      verifiedCertificatesCount: 1,
      projectsCompleted: 5,
      averageRating: 4.8,
      ratingsCount: 4,
      profileCompletion: 85,
      bio: 'Skilled solar structure and panel installation technician with expertise in high-wind zones and tin/RCC roof clamps.',
    });
    await Certificate.create({
      technician: tech2User._id,
      certificateName: 'Solar PV Installer Technician',
      issuingOrganization: 'Skill Council for Green Jobs (SCGJ)',
      certificateNumber: 'SCGJ-SPV-9012',
      issueDate: new Date('2023-01-18'),
      expiryDate: new Date('2028-01-18'),
      category: 'Solar',
      documentUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      status: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2024-02-14'),
    });

    // Tech 3: Vikas Singh
    const tech3User = await User.create({
      name: 'Vikas Singh',
      email: 'vikas.singh@gmail.com',
      phone: '+91 98763 33444',
      password: 'Tech@123',
      role: 'technician',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    });
    const tech3Profile = await TechnicianProfile.create({
      user: tech3User._id,
      profession: 'Solar O&M Technician',
      yearsOfExperience: 5,
      currentAvailability: 'Available',
      expectedDailyRate: 1900,
      expectedMonthlyRate: 45000,
      city: 'Ahmedabad',
      state: 'Gujarat',
      preferredWorkLocations: ['Ahmedabad', 'Surat', 'Gujarat', 'Madhya Pradesh'],
      renewableSkills: [
        { name: 'Solar O&M', category: 'Solar', proficiency: 'Expert', isVerified: true },
        { name: 'Electrical Maintenance', category: 'Solar', proficiency: 'Expert', isVerified: true },
        { name: 'Inverter Installation', category: 'Solar', proficiency: 'Advanced', isVerified: true },
        { name: 'Equipment Handling', category: 'Other', proficiency: 'Advanced', isVerified: false },
        { name: 'Electrical Safety', category: 'Other', proficiency: 'Expert', isVerified: true },
      ],
      previousProjects: [
        {
          title: '25MW Solar Park O&M Contract',
          projectType: 'Solar',
          capacity: '25MW',
          role: 'Field O&M Technician',
          location: 'Charanka, Gujarat',
          durationMonths: 12,
          completionYear: 2024,
          description: 'Routine thermography surveys, string inverter fan replacements, and tracker grease servicing.',
        },
      ],
      overallSkillScore: 91,
      verifiedCertificatesCount: 1,
      projectsCompleted: 11,
      averageRating: 4.7,
      ratingsCount: 7,
      profileCompletion: 90,
      bio: 'Seasoned Solar O&M specialist with 5 years experience in utility solar park troubleshooting, I-V curve tracing, and inverter maintenance.',
    });
    await Certificate.create({
      technician: tech3User._id,
      certificateName: 'Solar Plant O&M Specialist (Master Level)',
      issuingOrganization: 'National Institute of Solar Energy (NISE)',
      certificateNumber: 'NISE-OM-2021-331',
      issueDate: new Date('2021-08-10'),
      category: 'Solar',
      documentUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
      status: 'Verified',
      verifiedBy: adminUser._id,
      verifiedAt: new Date('2024-01-20'),
    });

    // Tech 4: Suresh Kumar (Wind)
    const tech4User = await User.create({
      name: 'Suresh Kumar',
      email: 'suresh.kumar@gmail.com',
      phone: '+91 98764 44555',
      password: 'Tech@123',
      role: 'technician',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    });
    const tech4Profile = await TechnicianProfile.create({
      user: tech4User._id,
      profession: 'Wind Turbine Technician',
      yearsOfExperience: 4,
      currentAvailability: 'Available',
      expectedDailyRate: 2200,
      expectedMonthlyRate: 52000,
      city: 'Jaisalmer',
      state: 'Rajasthan',
      preferredWorkLocations: ['Jaisalmer', 'Rajasthan', 'Gujarat', 'Tamil Nadu'],
      renewableSkills: [
        { name: 'Wind Turbine Installation', category: 'Wind', proficiency: 'Expert', isVerified: true },
        { name: 'Turbine Maintenance', category: 'Wind', proficiency: 'Expert', isVerified: true },
        { name: 'Electrical Maintenance', category: 'Wind', proficiency: 'Advanced', isVerified: true },
        { name: 'Electrical Safety', category: 'Other', proficiency: 'Expert', isVerified: true },
        { name: 'Tower Climbing', category: 'Wind', proficiency: 'Advanced', isVerified: true },
      ],
      previousProjects: [
        {
          title: '50MW Wind Farm Pitch System Overhaul',
          projectType: 'Wind',
          capacity: '50MW',
          role: 'Wind Mechanical Tech',
          location: 'Jaisalmer, Rajasthan',
          durationMonths: 6,
          completionYear: 2024,
          description: 'Replaced pitch cylinder seals, calibrated wind vanes, and carried out slip-ring maintenance on 2.1MW turbines.',
        },
      ],
      overallSkillScore: 89,
      verifiedCertificatesCount: 2,
      projectsCompleted: 7,
      averageRating: 4.8,
      ratingsCount: 5,
      profileCompletion: 90,
      bio: 'Certified Wind Technician with Global Wind Organisation (GWO) credentials. Experienced in Suzlon and Siemens Gamesa turbines.',
    });
    await Certificate.create([
      {
        technician: tech4User._id,
        certificateName: 'GWO Basic Safety Training (BST)',
        issuingOrganization: 'Global Wind Organisation (GWO)',
        certificateNumber: 'GWO-BST-IND-9021',
        issueDate: new Date('2022-04-12'),
        expiryDate: new Date('2026-04-12'),
        category: 'Wind',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-01-25'),
      },
      {
        technician: tech4User._id,
        certificateName: 'GWO Basic Technical Training (BTT - Mechanical & Electrical)',
        issuingOrganization: 'Global Wind Organisation (GWO)',
        certificateNumber: 'GWO-BTT-IND-4421',
        issueDate: new Date('2022-05-15'),
        category: 'Wind',
        documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-01-25'),
      },
    ]);

    // Tech 5: Priya Verma (Wind Climbing)
    const tech5User = await User.create({
      name: 'Priya Verma',
      email: 'priya.verma@gmail.com',
      phone: '+91 98765 55666',
      password: 'Tech@123',
      role: 'technician',
      profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    });
    const tech5Profile = await TechnicianProfile.create({
      user: tech5User._id,
      profession: 'Wind Turbine Climbing Technician',
      yearsOfExperience: 3,
      currentAvailability: 'Available',
      expectedDailyRate: 2400,
      expectedMonthlyRate: 56000,
      city: 'Tirunelveli',
      state: 'Tamil Nadu',
      preferredWorkLocations: ['Tamil Nadu', 'Karnataka', 'Rajasthan', 'Pan-India'],
      renewableSkills: [
        { name: 'Tower Climbing', category: 'Wind', proficiency: 'Expert', isVerified: true },
        { name: 'Blade Inspection', category: 'Wind', proficiency: 'Expert', isVerified: true },
        { name: 'Turbine Maintenance', category: 'Wind', proficiency: 'Advanced', isVerified: true },
        { name: 'Site Safety', category: 'Other', proficiency: 'Expert', isVerified: true },
      ],
      previousProjects: [
        {
          title: 'Muppandal Wind Farm Blade Repair',
          projectType: 'Wind',
          capacity: '100MW',
          role: 'Rope Access Blade Inspector',
          location: 'Tirunelveli, Tamil Nadu',
          durationMonths: 3,
          completionYear: 2024,
          description: 'Conducted rope-access internal and external blade shell inspections, leading-edge erosion repairs.',
        },
      ],
      overallSkillScore: 94,
      verifiedCertificatesCount: 2,
      projectsCompleted: 6,
      averageRating: 4.9,
      ratingsCount: 5,
      profileCompletion: 92,
      bio: 'GWO & IRATA Level 1 certified Wind Turbine Climbing Technician specializing in nacelle safety, high-angle rescue, and aerodynamic blade care.',
    });
    await Certificate.create([
      {
        technician: tech5User._id,
        certificateName: 'GWO Working at Heights & Hub Rescue',
        issuingOrganization: 'Global Wind Organisation (GWO)',
        certificateNumber: 'GWO-WAH-9921',
        issueDate: new Date('2023-02-10'),
        expiryDate: new Date('2027-02-10'),
        category: 'Wind',
        documentUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-02-01'),
      },
      {
        technician: tech5User._id,
        certificateName: 'Wind Turbine Blade Inspection Specialist',
        issuingOrganization: 'RenewableUK & GWO Accredited Center',
        certificateNumber: 'RUK-BLADE-8812',
        issueDate: new Date('2023-04-18'),
        category: 'Wind',
        documentUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        status: 'Verified',
        verifiedBy: adminUser._id,
        verifiedAt: new Date('2024-02-01'),
      },
    ]);

    // Tech 5 Wind Assessment Result
    await AssessmentResult.create({
      technician: tech5User._id,
      assessment: windAssessment._id,
      assessmentTitle: windAssessment.title,
      category: 'Wind',
      totalQuestions: 5,
      correctAnswers: 5,
      scorePercentage: 100,
      skillLevel: 'Master',
      categoryBreakdown: [
        { category: 'Tower Climbing & Safety', score: 2, total: 2, percentage: 100 },
        { category: 'Blade Inspection', score: 1, total: 1, percentage: 100 },
        { category: 'Turbine Components', score: 1, total: 1, percentage: 100 },
        { category: 'Maintenance', score: 1, total: 1, percentage: 100 },
      ],
      passed: true,
    });

    console.log('[Seed Script]: Seeding Projects (Solar & Wind)...');

    // 6. SEED PROJECTS
    // Project 1: 500kW Solar Plant Installation (Kanpur)
    const startDate1 = new Date();
    startDate1.setDate(startDate1.getDate() + 5);
    const endDate1 = new Date();
    endDate1.setDate(endDate1.getDate() + 35);

    const project1 = await Project.create({
      company: epcCompany1User._id,
      companyName: 'GreenVolt Energy EPC Private Limited',
      projectName: '500kW Solar Plant Installation',
      projectType: 'Solar',
      description: 'Turnkey erection and commissioning of 500kW ground-mounted solar PV plant at Panki Industrial Corridor. Scope includes DC string array wiring, inverter station placement, lightning protection, and pre-commissioning testing.',
      location: {
        city: 'Kanpur',
        state: 'Uttar Pradesh',
        address: 'Panki Industrial Area, Phase 3',
        siteName: 'Panki Clean Power Site',
      },
      startDate: startDate1,
      endDate: endDate1,
      durationDays: 30,
      numberWorkers: 7,
      hiredWorkersCount: 3,
      workerRoles: [
        { role: 'Solar Installers', count: 5, filledCount: 2 },
        { role: 'PV Wiremen', count: 2, filledCount: 1 },
      ],
      requiredSkills: ['PV Installation', 'PV Wiring', 'Inverter Installation', 'Electrical Safety'],
      minimumExperience: 2,
      requiredCertifications: ['Solar PV Installer'],
      budget: 450000,
      workType: 'Full-time Contract',
      projectStatus: 'In Progress',
      progressPercentage: 25,
    });

    // Project 2: 1MW Rooftop Solar Project (Jaipur)
    const project2 = await Project.create({
      company: epcCompany2User._id,
      companyName: 'SolarGrid EPC Solutions Ltd',
      projectName: '1MW Rooftop Solar Project',
      projectType: 'Solar',
      description: 'Designated industrial shed rooftop solar installation across 3 warehouse roofs in Sitapura Industrial Zone. Requires skilled panel mounting specialists with edge-safety credentials.',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'Sitapura Industrial Area, RIICO',
        siteName: 'Sitapura Logistics SunPark',
      },
      startDate: startDate1,
      endDate: endDate1,
      durationDays: 30,
      numberWorkers: 10,
      hiredWorkersCount: 1,
      workerRoles: [
        { role: 'Solar Panel Installers', count: 8, filledCount: 1 },
        { role: 'Electrical Technicians', count: 2, filledCount: 0 },
      ],
      requiredSkills: ['Solar Panel Installation', 'PV Installation', 'Site Safety', 'Site Survey'],
      minimumExperience: 2,
      requiredCertifications: ['Solar PV Installer'],
      budget: 950000,
      workType: 'Turnkey Milestone',
      projectStatus: 'Open',
      progressPercentage: 0,
    });

    // Project 3: Wind Turbine Maintenance Project (Jaisalmer)
    const project3 = await Project.create({
      company: epcCompany3User._id,
      companyName: 'WindPower Solutions India Pvt Ltd',
      projectName: 'Wind Turbine Maintenance Project',
      projectType: 'Wind',
      description: 'Scheduled preventive maintenance and composite blade inspection across twenty 2.1MW wind turbine generators at Jaisalmer Desert Wind Cluster.',
      location: {
        city: 'Jaisalmer',
        state: 'Rajasthan',
        address: 'Sodha Wind Farm, Pokhran Highway',
        siteName: 'Sodha Wind Cluster',
      },
      startDate: startDate1,
      endDate: endDate1,
      durationDays: 30,
      numberWorkers: 4,
      hiredWorkersCount: 2,
      workerRoles: [
        { role: 'Wind Turbine Technicians', count: 2, filledCount: 1 },
        { role: 'Wind Climbing Technicians', count: 2, filledCount: 1 },
      ],
      requiredSkills: ['Wind Turbine Installation', 'Turbine Maintenance', 'Blade Inspection', 'Tower Climbing'],
      minimumExperience: 3,
      requiredCertifications: ['GWO Working at Heights', 'GWO Basic Safety Training (BST)'],
      budget: 1200000,
      workType: 'Full-time Contract',
      projectStatus: 'In Progress',
      progressPercentage: 50,
    });

    // Project 4: Solar O&M Project (Gujarat)
    const project4 = await Project.create({
      company: epcCompany1User._id,
      companyName: 'GreenVolt Energy EPC Private Limited',
      projectName: 'Solar O&M Project',
      projectType: 'Solar',
      description: 'Quarterly maintenance and string audit for 5MW captive solar installation. Involves I-V curve tracing, combiner box diode inspection, and tracker alignment.',
      location: {
        city: 'Ahmedabad',
        state: 'Gujarat',
        address: 'Sanand Industrial Estate',
        siteName: 'Sanand Auto Solar Plant',
      },
      startDate: startDate1,
      endDate: endDate1,
      durationDays: 20,
      numberWorkers: 3,
      hiredWorkersCount: 0,
      workerRoles: [
        { role: 'Solar O&M Technicians', count: 3, filledCount: 0 },
      ],
      requiredSkills: ['Solar O&M', 'Electrical Maintenance', 'Inverter Installation'],
      minimumExperience: 3,
      requiredCertifications: ['Solar PV Installer'],
      budget: 350000,
      workType: 'Daily Basis',
      projectStatus: 'Open',
      progressPercentage: 0,
    });

    console.log('[Seed Script]: Seeding Applications and Workforce Assignments...');

    // 7. SEED APPLICATIONS & WORKFORCE
    // Rahul Kumar applied to 500kW Solar Plant (High match, Selected & Assigned)
    const match1 = await calculateMatchScore(project1, tech1User, tech1Profile, [
      { certificateName: 'Solar PV Installer (Level 4)', status: 'Verified', category: 'Solar' },
    ]);

    await Application.create({
      project: project1._id,
      technician: tech1User._id,
      status: 'Assigned',
      coverNote: 'Extensive hands-on experience in 500kW+ ground mount DC wiring and inverter connections.',
      matchScore: match1.matchScore,
      matchBreakdown: match1.breakdown,
      statusHistory: [
        { status: 'Applied', updatedAt: new Date(Date.now() - 4 * 86400000) },
        { status: 'Shortlisted', updatedAt: new Date(Date.now() - 3 * 86400000) },
        { status: 'Selected', updatedAt: new Date(Date.now() - 2 * 86400000) },
        { status: 'Assigned', updatedAt: new Date() },
      ],
    });

    // Create WorkforceAssignment for Rahul Kumar on Project 1
    await WorkforceAssignment.create({
      project: project1._id,
      technician: tech1User._id,
      roleAssigned: 'PV Wireman',
      assignmentStatus: 'Active',
      attendance: 'Present',
      workStatus: 'On Schedule',
      startDate: project1.startDate,
      endDate: project1.endDate,
      dailyRateAgreed: 1800,
      totalDaysWorked: 6,
      notes: 'Leading string cable dressing and junction box termination on Arrays A & B.',
    });

    // Amit Sharma applied to Project 2 (1MW Rooftop) - Shortlisted
    const match2 = await calculateMatchScore(project2, tech2User, tech2Profile, [
      { certificateName: 'Solar PV Installer Technician', status: 'Verified', category: 'Solar' },
    ]);
    await Application.create({
      project: project2._id,
      technician: tech2User._id,
      status: 'Shortlisted',
      coverNote: 'Local Jaipur resident specializing in commercial roof clamp installation.',
      matchScore: match2.matchScore,
      matchBreakdown: match2.breakdown,
      statusHistory: [
        { status: 'Applied', updatedAt: new Date(Date.now() - 2 * 86400000) },
        { status: 'Shortlisted', updatedAt: new Date() },
      ],
    });

    // Suresh Kumar applied to Project 3 (Wind Maintenance) - Assigned
    const match3 = await calculateMatchScore(project3, tech4User, tech4Profile, [
      { certificateName: 'GWO Basic Safety Training (BST)', status: 'Verified', category: 'Wind' },
      { certificateName: 'GWO Basic Technical Training (BTT)', status: 'Verified', category: 'Wind' },
    ]);
    await Application.create({
      project: project3._id,
      technician: tech4User._id,
      status: 'Assigned',
      coverNote: 'GWO certified technician based in Jaisalmer ready for immediate deployment.',
      matchScore: match3.matchScore,
      matchBreakdown: match3.breakdown,
      statusHistory: [
        { status: 'Applied', updatedAt: new Date(Date.now() - 5 * 86400000) },
        { status: 'Selected', updatedAt: new Date(Date.now() - 2 * 86400000) },
        { status: 'Assigned', updatedAt: new Date() },
      ],
    });
    await WorkforceAssignment.create({
      project: project3._id,
      technician: tech4User._id,
      roleAssigned: 'Wind Turbine Technician',
      assignmentStatus: 'Active',
      attendance: 'Present',
      workStatus: 'On Schedule',
      startDate: project3.startDate,
      endDate: project3.endDate,
      dailyRateAgreed: 2200,
      totalDaysWorked: 12,
      notes: 'Completed hydraulic yaw system leak checks on WTG 01 through 08.',
    });

    // Priya Verma applied to Project 3 (Wind Maintenance) - Assigned
    const match5 = await calculateMatchScore(project3, tech5User, tech5Profile, [
      { certificateName: 'GWO Working at Heights & Hub Rescue', status: 'Verified', category: 'Wind' },
    ]);
    await Application.create({
      project: project3._id,
      technician: tech5User._id,
      status: 'Assigned',
      coverNote: 'Experienced rope-access climbing technician for aerodynamic blade inspection.',
      matchScore: match5.matchScore,
      matchBreakdown: match5.breakdown,
      statusHistory: [
        { status: 'Applied', updatedAt: new Date(Date.now() - 4 * 86400000) },
        { status: 'Selected', updatedAt: new Date(Date.now() - 1 * 86400000) },
        { status: 'Assigned', updatedAt: new Date() },
      ],
    });
    await WorkforceAssignment.create({
      project: project3._id,
      technician: tech5User._id,
      roleAssigned: 'Wind Climbing Technician',
      assignmentStatus: 'Active',
      attendance: 'Present',
      workStatus: 'On Schedule',
      startDate: project3.startDate,
      endDate: project3.endDate,
      dailyRateAgreed: 2400,
      totalDaysWorked: 10,
      notes: 'External rope-access dye-penetrant inspection on WTG 03 blades.',
    });

    console.log('[Seed Script]: Seeding Contractor Reviews & Ratings...');

    // 8. SEED REVIEWS
    // Review for Rahul Kumar by GreenVolt Energy
    await Review.create({
      project: project1._id,
      company: epcCompany1User._id,
      technician: tech1User._id,
      technicalSkill: 5,
      safety: 5,
      punctuality: 5,
      qualityOfWork: 5,
      overallRating: 5.0,
      feedbackComment: 'Rahul displayed exceptional electrical craftsmanship on our 500kW solar plant. Zero safety infractions, clean wire dressing, and passed inverter synchronization on the first attempt.',
    });

    // Review for Suresh Kumar by WindPower Solutions
    await Review.create({
      project: project3._id,
      company: epcCompany3User._id,
      technician: tech4User._id,
      technicalSkill: 5,
      safety: 5,
      punctuality: 4,
      qualityOfWork: 5,
      overallRating: 4.8,
      feedbackComment: 'Suresh is an outstanding wind turbine mechanic. Thorough hydraulic diagnostic skills and exemplary working-at-heights discipline.',
    });

    console.log('[Seed Script]: Seeding Sample In-App Notifications...');

    // 9. SEED NOTIFICATIONS
    await Notification.create([
      {
        recipient: tech1User._id,
        title: 'Certificate Verified ✓',
        message: 'Your certificate "Solar PV Installer (Level 4)" from NSDC has been verified. The verified badge is active on your profile.',
        type: 'certificate',
        link: '/technician/certificates',
        isRead: true,
      },
      {
        recipient: tech1User._id,
        title: 'Assigned to Project Workforce',
        message: 'You have been deployed as PV Wireman on "500kW Solar Plant Installation".',
        type: 'workforce',
        link: '/technician/dashboard',
        isRead: false,
      },
      {
        recipient: epcCompany1User._id,
        title: 'New Technician Application Received',
        message: 'Rahul Kumar (96% match) applied for "500kW Solar Plant Installation".',
        type: 'application',
        link: `/epc/projects/${project1._id}`,
        isRead: true,
      },
    ]);

    console.log('====================================================');
    console.log('✓ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Demo Accounts:');
    console.log('Admin:       admin@renewtech.com / Admin@123');
    console.log('EPC Company: contact@greenvolt.in / Company@123');
    console.log('Technician:  rahul.kumar@gmail.com / Tech@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
