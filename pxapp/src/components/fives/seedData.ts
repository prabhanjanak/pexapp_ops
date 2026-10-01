import { FiveSUnitConfig, FiveSCheckpoint, FiveSUser, FiveSAudit, FiveSNonConformity } from './types';

export const FIVE_S_UNITS: FiveSUnitConfig[] = [
  {
    code: 'CBE',
    name: 'Sankara Eye Hospital Coimbatore',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    establishedYear: 1977,
    bedCapacity: 250,
    unitHeadName: 'Ms. Binitha Harish',
    unitHeadEmail: 'unithead.cbe@sankaraeye.com',
    zones: {
      'Zone 1': [
        'Registration area',
        'Refraction lounges',
        'Waiting lounges',
        'Doctor consultation rooms',
        'Counselling rooms',
        'Investigation rooms (OCT/FFA/Laser room/B scan room)',
        'Appointment desk, Unit Head and Administrator room',
        'Contact lens Room, Pharmacy, Cash counter',
        'Stores, MRD'
      ],
      'Zone 2': [
        'Community ward (Ground floor)',
        'Fitness room Lab (ground floor), Sample collection room',
        'Minor OT (Ground floor)',
        'Community outreach',
        'Cafeteria',
        'Community dining area',
        'House keeping storage areas',
        'Common washrooms (Ground floor)'
      ],
      'Zone 3': [
        'Pediatric OPD',
        'Mind matters consultation room',
        'Myopia clinic',
        'Orthoptics',
        'Oculyzer',
        'Eye bank',
        'ERG/VEP',
        'Recovery room',
        'Brachytherapy Room',
        'IP Ward (paying) including Nursing station',
        'Common washrooms (first floor)'
      ],
      'Zone 4': [
        'Community ward (first floor)',
        'Sankaram ward',
        'Community patient dress changing area',
        'ETO room',
        'Speciality OT',
        'Community OT',
        'Lasik procedure Room',
        'IS department Room'
      ]
    }
  },
  {
    code: 'Bangalore',
    name: 'Sankara Eye Hospital Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    establishedYear: 2008,
    bedCapacity: 150,
    unitHeadName: 'Lt. Col. S. Guruprasad (Retd.)',
    unitHeadEmail: 'unithead.blr@sankaraeye.com',
    zones: {
      'Zone 1': [
        'Registration area',
        'Refraction lounges',
        'Waiting lounges',
        'Doctor consultation rooms',
        'Counselling rooms',
        'Investigation rooms (OCT/FFA/Laser room/B scan room)',
        'Appointment desk, Unit Head and Administrator room',
        'Contact lens Room, Pharmacy, Cash counter',
        'Stores, MRD'
      ],
      'Zone 2': [
        'Community ward (Ground floor)',
        'Fitness room Lab (ground floor), Sample collection room',
        'Minor OT (Ground floor)',
        'Community outreach',
        'Cafeteria',
        'Community dining area',
        'House keeping storage areas',
        'Common washrooms (Ground floor)'
      ],
      'Zone 3': [
        'Pediatric OPD',
        'Mind matters consultation room',
        'Myopia clinic',
        'Orthoptics',
        'Oculyzer',
        'Eye bank',
        'ERG/VEP',
        'Recovery room',
        'Brachytherapy Room',
        'IP Ward (paying) including Nursing station',
        'Common washrooms (first floor)'
      ],
      'Zone 4': [
        'Community ward (first floor)',
        'Sankaram ward',
        'Community patient dress changing area',
        'ETO room',
        'Speciality OT',
        'Community OT',
        'Lasik procedure Room',
        'IS department Room'
      ],
      'Zone 5': [
        'Biomedical department Room',
        'Administration block',
        'Daycare',
        'Wetlab',
        'SAV Admin area',
        'Boardroom',
        'Clinical research room',
        'Library',
        'Common washrooms (second floor)'
      ],
      'Zone 6': [
        'Vision Rehab',
        'Vision Therapy clinic',
        'Ocularistry clinic',
        'Milestone Clinic',
        'Laundry',
        'Seminar hall',
        'Auditorium',
        'Pathology lab',
        'SCO college area'
      ],
      'Zone 7': [
        'Gas manifold area',
        'Sewage treatment plant',
        'Temple',
        'Fire systems',
        'Hospital general areas - scrap storage',
        'Security area entrance',
        'Engineering and maintenance',
        'Transport',
        'Scrapyard',
        'Hospital Vehicle parking area',
        'RO plant terrace'
      ]
    }
  },
  {
    code: 'CCH',
    name: 'Sankara Eye Hospital Coimbatore City (RS Puram)',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    establishedYear: 1985,
    bedCapacity: 80,
    unitHeadName: 'Ms. Kanmani S',
    unitHeadEmail: 'unithead.cch@sankaraeye.com',
    zones: {
      'Zone 1': ['Registration & Triage', 'Refraction suites', 'Consultant OPD Rooms', 'Pharmacy & Optical Store', 'Admin Desk'],
      'Zone 2': ['Daycare Ward', 'Minor Procedure Room', 'Diagnostics (OCT/Perimetry)', 'Staff Station'],
      'Zone 3': ['Modular Eye OT', 'Pre-op Preparation Lounge', 'Sterilization & CSSD', 'Biomedical Facility']
    }
  },
  {
    code: 'Guntur',
    name: 'Sankara Eye Hospital Guntur',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    establishedYear: 2014,
    bedCapacity: 115,
    unitHeadName: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    unitHeadEmail: 'unithead.gtr@sankaraeye.com',
    zones: {
      'Zone 1': ['Main Reception Desk', 'Refraction Cubicles', 'Doctor OPD Chambers', 'Pharmacy Counter', 'Patient Lounge'],
      'Zone 2': ['Community Outreach Ward', 'General Lab & Phlebotomy', 'Cafeteria & Dining', 'Housekeeping Supplies'],
      'Zone 3': ['Pediatric Clinic', 'Cornea & Laser Room', 'Paying IP Ward', 'Nursing Counter'],
      'Zone 4': ['Surgical Eye OT Complex', 'Post-Op Recovery', 'CSSD ETO Unit', 'Maintenance Yard']
    }
  },
  {
    code: 'Shimoga',
    name: 'Sankara Eye Hospital Shivamogga',
    city: 'Shivamogga',
    state: 'Karnataka',
    establishedYear: 2011,
    bedCapacity: 100,
    unitHeadName: 'Ms. Gayatri Shantharam',
    unitHeadEmail: 'unithead.shm@sankaraeye.com',
    zones: {
      'Zone 1': ['OPD Lounge & Refraction', 'Doctor Consultation Suites', 'Optical Dispensary & Billing'],
      'Zone 2': ['Inpatient Wards', 'Community Care Block', 'Laboratory & Sample Area'],
      'Zone 3': ['OT Complex', 'Recovery & Pre-Op', 'Central Linen & Housekeeping'],
      'Zone 4': ['Utility Block', 'Gas Manifold & Generator Station', 'Biomedical Waste Facility']
    }
  },
  {
    code: 'Anand',
    name: 'Sankara Eye Hospital Anand',
    city: 'Anand',
    state: 'Gujarat',
    establishedYear: 2017,
    bedCapacity: 100,
    unitHeadName: 'Col. Sudeepkumar D. Mehta (Retd.)',
    unitHeadEmail: 'unithead.and@sankaraeye.com',
    zones: {
      'Zone 1': ['Welcome Lobby & Reception', 'Refraction Unit', 'Doctor Examination Rooms', 'Pharmacy & Optical'],
      'Zone 2': ['Outpatient Diagnostics (FFA/OCT)', 'Community Screening Hall', 'Catering & Dining Lounge'],
      'Zone 3': ['Surgical Suites (OT 1 & OT 2)', 'Recovery & Daycare', 'Sterile Supply & ETO'],
      'Zone 4': ['Engineering Services', 'Scrap & Recycling Depot', 'Security Gate & Parking']
    }
  },
  {
    code: 'Ludhiana',
    name: 'Sankara Eye Hospital Ludhiana',
    city: 'Ludhiana',
    state: 'Punjab',
    establishedYear: 2012,
    bedCapacity: 100,
    unitHeadName: 'Mr. Ravinder Pal Singh',
    unitHeadEmail: 'unithead.ldh@sankaraeye.com',
    zones: {
      'Zone 1': ['Main Lobby & Billing Desks', 'Refraction & Visual Acuity Lounges', 'Consultation Chambers'],
      'Zone 2': ['Community Wards & Outreach Desk', 'Clinical Pathology & Micro Lab', 'Cafeteria'],
      'Zone 3': ['Specialty Eye Clinics', 'Post-Op IP Wards', 'Nursing Supervision Desk'],
      'Zone 4': ['Operating Theatres Complex', 'Autoclave & Pack Assembly Room', 'Maintenance Workshop']
    }
  },
  {
    code: 'Panvel',
    name: 'Sankara Eye Hospital Panvel',
    city: 'Panvel (Navi Mumbai)',
    state: 'Maharashtra',
    establishedYear: 2019,
    bedCapacity: 120,
    unitHeadName: 'Dr. Vivek Sharma',
    unitHeadEmail: 'unithead.pnv@sankaraeye.com',
    zones: {
      'Zone 1': ['Patient Reception & Token Lounge', 'Refraction Bays', 'Consultant Clinics', 'Pharmacy Counter'],
      'Zone 2': ['Lasik & Refractive Procedure Suite', 'Retina Diagnostics & Laser', 'Day Care Lounge'],
      'Zone 3': ['Modular Inpatient Wards', 'Community Surgical Prep', 'Central Sterilization Store'],
      'Zone 4': ['Main OT Complex', 'Bio-Medical Tech Lab', 'Facility Yard & Power Station']
    }
  },
  {
    code: 'Kanpur',
    name: 'Sankara Eye Hospital Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    establishedYear: 2014,
    bedCapacity: 120,
    unitHeadName: 'Mr. Rakesh Pandey',
    unitHeadEmail: 'unithead.knp@sankaraeye.com',
    zones: {
      'Zone 1': ['Registration & Triage Hall', 'Refraction Rooms', 'Consultation Pods', 'Medical Records Dept'],
      'Zone 2': ['Free Care Community Ward', 'Sample Collection & Blood Bank', 'Dining Hall'],
      'Zone 3': ['Glaucoma & Pediatric Wing', 'Private Inpatient Rooms', 'Ward Nursing Stations'],
      'Zone 4': ['Ophthalmic OT Complex', 'Sterilization Hub', 'Campus Maintenance & Scrap Depot']
    }
  },
  {
    code: 'Jaipur',
    name: 'Sankara Eye Hospital Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    establishedYear: 2017,
    bedCapacity: 110,
    unitHeadName: 'Dr. Neeraj Mathur',
    unitHeadEmail: 'unithead.jpr@sankaraeye.com',
    zones: {
      'Zone 1': ['Front Office & Registration', 'Optometry Clinic', 'Doctor Examination Chambers', 'Pharmacy Store'],
      'Zone 2': ['Community Eye Care Pavilion', 'Diagnostics & Ultrasound B-Scan', 'Staff Pantry & Canteen'],
      'Zone 3': ['Cataract & Cornea Care Wings', 'IP Wards & Recovery', 'Nursing Stations'],
      'Zone 4': ['Advanced OT Wings', 'CSSD Decontamination Room', 'Engineering & Fire Hydrant System']
    }
  },
  {
    code: 'Indore',
    name: 'Sankara Eye Hospital Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    establishedYear: 2018,
    bedCapacity: 110,
    unitHeadName: 'Mr. Sunil Sharma',
    unitHeadEmail: 'unithead.ind@sankaraeye.com',
    zones: {
      'Zone 1': ['Central Registration Lounge', 'Refraction Rooms', 'Doctor OPD Chambers', 'Pharmacy & Optical'],
      'Zone 2': ['Community Outreach Ward', 'Clinical Laboratory', 'Cafeteria & Restrooms'],
      'Zone 3': ['Retina Clinic & OCT Lounge', 'Paying Inpatient Rooms', 'Nurses Station'],
      'Zone 4': ['Surgical Operating Complex', 'CSSD Unit', 'Medical Gas & Plant Room']
    }
  },
  {
    code: 'Hyderabad',
    name: 'Sankara Eye Hospital Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    establishedYear: 2022,
    bedCapacity: 130,
    unitHeadName: 'Ms. Sridevi V',
    unitHeadEmail: 'unithead.hyd@sankaraeye.com',
    zones: {
      'Zone 1': ['Main Atrium & Helpdesk', 'Refraction Lanes', 'Senior Doctor OPD Suites', 'Dispensary'],
      'Zone 2': ['Community Outreach Screening', 'Pathology Lab', 'Dining Area & Coffee Station'],
      'Zone 3': ['Cornea & Lasik Center', 'Day Care Surgical Suite', 'Inpatient Ward Lounge'],
      'Zone 4': ['Laminar Flow Eye OTs', 'CSSD & Packaging Room', 'Engineering & BMS Center']
    }
  },
  {
    code: 'Varanasi',
    name: 'Sankara Eye Hospital Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    establishedYear: 2021,
    bedCapacity: 85,
    unitHeadName: 'Lt. Col. (Dr.) Bharat Singh',
    unitHeadEmail: 'unithead.vns@sankaraeye.com',
    zones: {
      'Zone 1': ['Entrance & Registration Desk', 'Refraction Area', 'Consultant Doctor Rooms', 'Pharmacy Counter'],
      'Zone 2': ['Outreach Patient Holding Ward', 'Pathology Sample Collection', 'Cafeteria'],
      'Zone 3': ['General Ward (Paying)', 'Nursing Center & Dressing Lounge', 'Diagnostics Room'],
      'Zone 4': ['Modular OT Suites', 'Autoclaving & Instrument Storage', 'Generator & Waste Segregation']
    }
  },
  {
    code: 'Krishnankoil',
    name: 'Sankara Eye Hospital Krishnankoil',
    city: 'Krishnankoil',
    state: 'Tamil Nadu',
    establishedYear: 2004,
    bedCapacity: 110,
    unitHeadName: 'Mr. Aswathaman R',
    unitHeadEmail: 'unithead.kk@sankaraeye.com',
    zones: {
      'Zone 1': ['Registration & Triage Hall', 'Optometry Refraction Lounges', 'Consultation Rooms', 'Optical Shop'],
      'Zone 2': ['Community Outreach Ward', 'Clinical Pathology', 'Housekeeping Station'],
      'Zone 3': ['Inpatient Nursing Ward', 'Eye Bank Facility', 'Minor Procedure Room'],
      'Zone 4': ['Surgical Eye OT Complex', 'CSSD Station', 'Campus Maintenance Yard']
    }
  }
];

export const FIVE_S_CHECKLIST: FiveSCheckpoint[] = [
  // 1S – Sort (6 Checkpoints)
  {
    id: 'q1',
    slNo: 1,
    section: '1S – Sort',
    area: 'Unnecessary Items',
    point: 'Unused, expired, damaged or duplicate items removed',
    evidence: 'No unnecessary items at workplace'
  },
  {
    id: 'q2',
    slNo: 2,
    section: '1S – Sort',
    area: 'Medical Supplies',
    point: 'Expired medicines, consumables and samples removed',
    evidence: 'Expiry checked and items disposed as per policy'
  },
  {
    id: 'q3',
    slNo: 3,
    section: '1S – Sort',
    area: 'Equipment',
    point: 'Non-functional equipment identified and removed from active area',
    evidence: 'Repair/disposal status identified with red-tag'
  },
  {
    id: 'q4',
    slNo: 4,
    section: '1S – Sort',
    area: 'Documents',
    point: 'Obsolete forms, registers and records removed',
    evidence: 'Only current documents available'
  },
  {
    id: 'q5',
    slNo: 5,
    section: '1S – Sort',
    area: 'Furniture',
    point: 'Unused chairs, tables, racks and other furniture removed',
    evidence: 'Only required furniture retained'
  },
  {
    id: 'q6',
    slNo: 6,
    section: '1S – Sort',
    area: 'Storage',
    point: 'Excess stock identified and returned or rationalized',
    evidence: 'Stock maintained according to defined requirement'
  },

  // 2S – Set in Order (8 Checkpoints)
  {
    id: 'q7',
    slNo: 7,
    section: '2S – Set in Order',
    area: 'Identification',
    point: 'Items have defined locations and labels',
    evidence: 'Easy to locate and return'
  },
  {
    id: 'q8',
    slNo: 8,
    section: '2S – Set in Order',
    area: 'Visual Management',
    point: 'Racks, drawers, cabinets and zones clearly identified',
    evidence: 'Standard labels/visual controls'
  },
  {
    id: 'q9',
    slNo: 9,
    section: '2S – Set in Order',
    area: 'Medical Supplies',
    point: 'Frequently used items positioned for easy access',
    evidence: 'Retrieval without unnecessary movement'
  },
  {
    id: 'q10',
    slNo: 10,
    section: '2S – Set in Order',
    area: 'Emergency Items',
    point: 'Emergency equipment and supplies clearly identified',
    evidence: 'Easily accessible and identifiable without obstruction'
  },
  {
    id: 'q11',
    slNo: 11,
    section: '2S – Set in Order',
    area: 'Equipment',
    point: 'Equipment has designated parking/storage location',
    evidence: 'Floor/shelf location marked'
  },
  {
    id: 'q12',
    slNo: 12,
    section: '2S – Set in Order',
    area: 'Cables',
    point: 'IT/electrical cables identified and organized',
    evidence: 'Colour coding/cable ties where applicable'
  },
  {
    id: 'q13',
    slNo: 13,
    section: '2S – Set in Order',
    area: 'Files & Records',
    point: 'Files arranged according to defined sequence',
    evidence: 'Easy retrieval within 30 seconds'
  },
  {
    id: 'q14',
    slNo: 14,
    section: '2S – Set in Order',
    area: 'Patient Flow',
    point: 'Frequently used areas/items arranged to support smooth workflow',
    evidence: 'Minimal unnecessary movement and clear pathways'
  },

  // 3S – Shine (6 Checkpoints)
  {
    id: 'q15',
    slNo: 15,
    section: '3S – Shine',
    area: 'General Cleanliness',
    point: 'Floors, surfaces, counters and work areas clean',
    evidence: 'No visible dirt/dust/spillage'
  },
  {
    id: 'q16',
    slNo: 16,
    section: '3S – Shine',
    area: 'Equipment',
    point: 'Equipment cleaned according to requirement',
    evidence: 'Cleaning responsibility defined & executed'
  },
  {
    id: 'q17',
    slNo: 17,
    section: '3S – Shine',
    area: 'High-Touch Areas',
    point: 'Frequently touched surfaces cleaned regularly',
    evidence: 'Defined cleaning frequency logged'
  },
  {
    id: 'q18',
    slNo: 18,
    section: '3S – Shine',
    area: 'Storage Areas',
    point: 'Racks, cabinets and storage areas clean',
    evidence: 'No accumulated dust or cobwebs'
  },
  {
    id: 'q19',
    slNo: 19,
    section: '3S – Shine',
    area: 'Waste Management',
    point: 'Waste bins clean, available and correctly segregated',
    evidence: 'Biomedical waste segregation strictly followed'
  },
  {
    id: 'q20',
    slNo: 20,
    section: '3S – Shine',
    area: 'Cleaning Tools',
    point: 'Cleaning equipment stored properly',
    evidence: 'Designated location and dry condition maintained'
  },

  // 4S – Standardize (8 Checkpoints)
  {
    id: 'q21',
    slNo: 21,
    section: '4S – Standardize',
    area: 'Standard Locations',
    point: 'Locations established and maintained consistently',
    evidence: 'Same standard across relevant hospital areas'
  },
  {
    id: 'q22',
    slNo: 22,
    section: '4S – Standardize',
    area: 'Labelling',
    point: 'Standard labelling and identification followed',
    evidence: 'Common format/font/colour where applicable'
  },
  {
    id: 'q23',
    slNo: 23,
    section: '4S – Standardize',
    area: 'Colour Coding',
    point: 'Approved colour coding system followed',
    evidence: 'Consistent across clinical & non-clinical zones'
  },
  {
    id: 'q24',
    slNo: 24,
    section: '4S – Standardize',
    area: 'Visual Standards',
    point: 'Visual controls displayed where required',
    evidence: 'Clear, laminated and understandable'
  },
  {
    id: 'q25',
    slNo: 25,
    section: '4S – Standardize',
    area: 'SOP / WI',
    point: 'Relevant SOPs/work instructions available',
    evidence: 'Current approved version readily accessible'
  },
  {
    id: 'q26',
    slNo: 26,
    section: '4S – Standardize',
    area: 'Responsibility',
    point: 'Responsibility for maintaining standards defined',
    evidence: 'Person/role clearly identified on 5S board'
  },
  {
    id: 'q27',
    slNo: 27,
    section: '4S – Standardize',
    area: 'Checklists',
    point: 'Routine checklists available and completed',
    evidence: 'Up-to-date records maintained'
  },
  {
    id: 'q28',
    slNo: 28,
    section: '4S – Standardize',
    area: 'Monitoring',
    point: 'Deviations identified and corrective action taken',
    evidence: 'Evidence available on audit logs'
  },

  // 5S – Sustain (8 Checkpoints)
  {
    id: 'q29',
    slNo: 29,
    section: '5S – Sustain',
    area: 'Adherence',
    point: 'Established 1S–4S standards consistently followed',
    evidence: 'Standards maintained without repeated reminders'
  },
  {
    id: 'q30',
    slNo: 30,
    section: '5S – Sustain',
    area: 'Ownership',
    point: 'Staff take responsibility for maintaining 5S standards',
    evidence: 'Staff independently maintain their assigned areas'
  },
  {
    id: 'q31',
    slNo: 31,
    section: '5S – Sustain',
    area: 'Consistency',
    point: '5S standards maintained across shifts and working days',
    evidence: 'No significant variation between morning and evening shifts'
  },
  {
    id: 'q32',
    slNo: 32,
    section: '5S – Sustain',
    area: 'Monitoring',
    point: '5S checks conducted at the defined frequency',
    evidence: 'Completed checklists/monitoring records available'
  },
  {
    id: 'q33',
    slNo: 33,
    section: '5S – Sustain',
    area: 'Corrective Action',
    point: 'Deviations identified and corrected within the defined timeframe',
    evidence: 'Corrective actions documented and closed'
  },
  {
    id: 'q34',
    slNo: 34,
    section: '5S – Sustain',
    area: 'Standard Maintenance',
    point: 'Labels, markings, visual controls and designated locations maintained',
    evidence: 'Standards remain clear, intact and functional'
  },
  {
    id: 'q35',
    slNo: 35,
    section: '5S – Sustain',
    area: 'Training & Awareness',
    point: 'Staff are aware of the established 5S standards',
    evidence: 'Staff can explain and follow applicable standards'
  },
  {
    id: 'q36',
    slNo: 36,
    section: '5S – Sustain',
    area: 'System Dependency',
    point: '5S continues when the designated champion or in-charge is absent',
    evidence: 'Standards maintained through the system, not an individual'
  }
];

export const FIVE_S_DEFAULT_USERS: FiveSUser[] = [
  {
    id: 'usr-auditor-1',
    name: 'R. Kavitha',
    email: 'auditor01@sankaraeye.com',
    username: 'auditor01',
    role: 'auditor',
    roleLabel: 'Auditor',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    allowedUnits: ['CBE'],
    allowedZones: ['Zone 1'],
    allowedDepartments: [
      'Registration area',
      'Refraction lounges',
      'Waiting lounges',
      'Doctor consultation rooms',
      'Counselling rooms'
    ],
    designation: 'Internal Auditor • Quality Assurance',
    phone: '+91 98421 23450',
    avatarInitials: 'RK'
  },
  {
    id: 'usr-incharge-1',
    name: 'Dr. S. Sundaram',
    email: 'incharge01@sankaraeye.com',
    username: 'incharge01',
    role: 'incharge',
    roleLabel: 'Department In-Charge',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    designation: 'Senior Consultant & Area Owner • OPD Services',
    phone: '+91 94432 87612',
    avatarInitials: 'SS'
  },
  {
    id: 'usr-zonal-1',
    name: 'M. Priya',
    email: 'zonal01@sankaraeye.com',
    username: 'zonal01',
    role: 'zonal',
    roleLabel: 'Zonal In-Charge',
    unit: 'CBE',
    zone: 'Zone 1',
    allowedUnits: ['CBE'],
    allowedZones: ['Zone 1'],
    designation: 'Zonal Quality Coordinator • Zone 1 Lead',
    phone: '+91 98940 44321',
    avatarInitials: 'MP'
  },
  {
    id: 'usr-unithead-1',
    name: 'Ms. Binitha Harish',
    email: 'unithead01@sankaraeye.com',
    username: 'unithead01',
    role: 'unithead',
    roleLabel: 'Unit Head',
    unit: 'CBE',
    allowedUnits: ['CBE'],
    designation: 'Unit Head & General Administrator • CBE Unit',
    phone: '+91 98430 11223',
    avatarInitials: 'BH'
  },
  {
    id: 'usr-superadmin-saurabh',
    name: 'Saurabh Rai',
    email: 'saurabhrai@sankaraeye.com',
    username: 'saurabhrai',
    role: 'superadmin',
    roleLabel: 'Super Admin',
    unit: 'All 14 Units',
    designation: 'Central Operations Directorate • Admin',
    phone: '+91 99000 88771',
    avatarInitials: 'SR'
  },
  {
    id: 'usr-superadmin-sudarshan',
    name: 'Sudarshan',
    email: 'sudarshan@sankaraeye.com',
    username: 'sudarshan',
    role: 'superadmin',
    roleLabel: 'Super Admin',
    unit: 'All 14 Units',
    designation: 'Central Operations Directorate • Admin',
    phone: '+91 99000 88772',
    avatarInitials: 'SD'
  },
  {
    id: 'usr-superadmin-1',
    name: 'Prabhanjan',
    email: 'prabhanjan@sankaraeye.com',
    username: 'prabhanjan',
    role: 'superadmin',
    roleLabel: 'Super Admin',
    unit: 'All 14 Units',
    designation: 'Chief Information & Systems Administrator',
    phone: '+91 99000 88776',
    avatarInitials: 'PR'
  },
  {
    id: 'usr-president-1',
    name: 'Bharath Balasubramanian',
    email: 'president@sankaraeye.com',
    username: 'president',
    role: 'president',
    roleLabel: 'President',
    unit: 'All 14 Units',
    designation: 'President • Sankara Eye Foundation, India',
    phone: '+91 98400 99887',
    avatarInitials: 'BB'
  }
];

export const INITIAL_NON_CONFORMITIES: FiveSNonConformity[] = [
  {
    id: 'NC-014',
    auditId: 'AUD-2026-001',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    checkpointId: 'q11',
    checkpointNumber: 11,
    section: '2S – Set in Order',
    area: 'Equipment Location',
    checkpointText: 'Equipment has designated parking/storage location',
    score: 1,
    auditorComment: 'Cleaning trolley and portable slit lamp stand left blocking the labelled walkway zone.',
    beforePhoto: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
    correctiveAction: 'Designated floor marking grid applied. Equipment parked strictly inside yellow demarcations.',
    status: 'In Progress',
    raisedDate: '2026-09-18',
    targetDays: 7,
    assignedInCharge: 'Dr. S. Sundaram',
    followUpNotes: [
      {
        id: 'f1',
        author: 'M. Priya',
        role: 'Zonal In-Charge',
        date: '2026-09-20',
        text: 'Followed up with housekeeping lead. Tape demarcations completed, awaiting final photo verification.'
      }
    ]
  },
  {
    id: 'NC-015',
    auditId: 'AUD-2026-001',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    checkpointId: 'q16',
    checkpointNumber: 16,
    section: '3S – Shine',
    area: 'Equipment Cleanliness',
    checkpointText: 'Equipment cleaned according to requirement with defined responsibility',
    score: 1,
    auditorComment: 'Ophthalmoscope lens and examination table rail had visible surface dust residue.',
    beforePhoto: 'https://images.unsplash.com/photo-1583912267550-d44d9c961f67?auto=format&fit=crop&w=400&q=80',
    status: 'Pending',
    raisedDate: '2026-09-22',
    targetDays: 5,
    assignedInCharge: 'Dr. S. Sundaram'
  },
  {
    id: 'NC-016',
    auditId: 'AUD-2026-001',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    checkpointId: 'q2',
    checkpointNumber: 2,
    section: '1S – Sort',
    area: 'Medical Supplies',
    checkpointText: 'Expired medicines, consumables and samples removed',
    score: 0,
    auditorComment: 'Expired diagnostic fluorescein strips (exp: Aug 2026) discovered in doctor drawer B-3.',
    beforePhoto: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
    correctiveAction: 'All expired strips handed over to pharmacy biomedical waste. Fresh batch verified and logged.',
    status: 'Closed',
    raisedDate: '2026-09-10',
    closedDate: '2026-09-13',
    daysToClose: 3,
    targetDays: 3,
    assignedInCharge: 'Dr. S. Sundaram'
  },
  {
    id: 'NC-017',
    auditId: 'AUD-2026-002',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Refraction lounges',
    checkpointId: 'q12',
    checkpointNumber: 12,
    section: '2S – Set in Order',
    area: 'Cables',
    checkpointText: 'IT/electrical cables identified and organized',
    score: 1,
    auditorComment: 'Phoropter power cables dangling near patient walkway presenting a trip hazard.',
    beforePhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    afterPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    correctiveAction: 'Cable management channel installed under the table desk. Conduit routed securely.',
    status: 'Closed',
    raisedDate: '2026-09-08',
    closedDate: '2026-09-12',
    daysToClose: 4,
    targetDays: 7,
    assignedInCharge: 'K. Ramesh (Optometry)'
  },
  {
    id: 'NC-018',
    auditId: 'AUD-2026-003',
    unit: 'CBE',
    zone: 'Zone 2',
    department: 'Minor OT (Ground floor)',
    checkpointId: 'q19',
    checkpointNumber: 19,
    section: '3S – Shine',
    area: 'Waste Management',
    checkpointText: 'Waste bins clean, available and correctly segregated as per BMW rules',
    score: 1,
    auditorComment: 'Red biomedical waste pedal bin lid cracked; foot mechanism not releasing smoothly.',
    beforePhoto: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80',
    status: 'Pending',
    raisedDate: '2026-09-24',
    targetDays: 5,
    assignedInCharge: 'Sister Sarala'
  },
  {
    id: 'NC-019',
    auditId: 'AUD-2026-004',
    unit: 'Bangalore',
    zone: 'Zone 1',
    department: 'Registration area',
    checkpointId: 'q13',
    checkpointNumber: 13,
    section: '2S – Set in Order',
    area: 'Files & Records',
    checkpointText: 'Files arranged according to defined sequence for rapid retrieval',
    score: 1,
    auditorComment: 'Patient paper case sheets piled unindexed on cashier counter top.',
    beforePhoto: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
    status: 'Pending',
    raisedDate: '2026-09-25',
    targetDays: 7,
    assignedInCharge: 'R. Anand'
  }
];

export const INITIAL_AUDITS: FiveSAudit[] = [
  {
    id: 'AUD-2026-001',
    auditNumber: 'AUD-2026-001',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Doctor consultation rooms',
    auditorId: 'usr-auditor-1',
    auditorName: 'R. Kavitha',
    auditorDesignation: 'Internal Auditor',
    auditDate: '2026-09-20',
    month: 'Sep',
    year: '2026',
    scores: {
      q1: 3, q2: 2, q3: 3, q4: 2, q5: 3, q6: 2,
      q7: 3, q8: 2, q9: 3, q10: 2, q11: 1, q12: 2, q13: 2, q14: 3,
      q15: 3, q16: 1, q17: 2, q18: 3, q19: 2, q20: 3,
      q21: 2, q22: 3, q23: 2, q24: 3, q25: 2, q26: 3, q27: 2, q28: 2,
      q29: 3, q30: 2, q31: 2, q32: 3, q33: 2, q34: 3, q35: 2, q36: 3
    },
    comments: {
      q11: 'Cleaning trolley left blocking storage aisle.',
      q16: 'Slit lamp surface residue noted.'
    },
    beforePhotos: {
      q11: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
      q16: 'https://images.unsplash.com/photo-1583912267550-d44d9c961f67?auto=format&fit=crop&w=400&q=80'
    },
    totalScore: 87,
    maxScore: 108,
    compliancePercent: 80.6,
    status: 'Submitted',
    submittedAt: '2026-09-20 16:45:00'
  },
  {
    id: 'AUD-2026-002',
    auditNumber: 'AUD-2026-002',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Registration area',
    auditorId: 'usr-auditor-1',
    auditorName: 'R. Kavitha',
    auditorDesignation: 'Internal Auditor',
    auditDate: '2026-09-21',
    month: 'Sep',
    year: '2026',
    scores: {
      q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3,
      q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, q12: 2, q13: 3, q14: 3,
      q15: 3, q16: 3, q17: 2, q18: 3, q19: 3, q20: 3,
      q21: 3, q22: 3, q23: 3, q24: 3, q25: 3, q26: 3, q27: 3, q28: 2,
      q29: 3, q30: 3, q31: 3, q32: 3, q33: 3, q34: 3, q35: 3, q36: 3
    },
    comments: {},
    beforePhotos: {},
    totalScore: 100,
    maxScore: 108,
    compliancePercent: 92.6,
    status: 'Submitted',
    submittedAt: '2026-09-21 11:30:00'
  },
  {
    id: 'AUD-2026-003',
    auditNumber: 'AUD-2026-003',
    unit: 'CBE',
    zone: 'Zone 1',
    department: 'Refraction lounges',
    auditorId: 'usr-auditor-1',
    auditorName: 'R. Kavitha',
    auditorDesignation: 'Internal Auditor',
    auditDate: '2026-09-22',
    month: 'Sep',
    year: '2026',
    scores: {
      q1: 3, q2: 3, q3: 2, q4: 3, q5: 2, q6: 3,
      q7: 3, q8: 2, q9: 3, q10: 2, q11: 3, q12: 1, q13: 3, q14: 2,
      q15: 3, q16: 2, q17: 3, q18: 2, q19: 3, q20: 3,
      q21: 3, q22: 2, q23: 3, q24: 2, q25: 3, q26: 2, q27: 3, q28: 3,
      q29: 3, q30: 2, q31: 3, q32: 2, q33: 3, q34: 3, q35: 2, q36: 3
    },
    comments: { q12: 'Phoropter cables dangling across floor.' },
    beforePhotos: { q12: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80' },
    totalScore: 95,
    maxScore: 108,
    compliancePercent: 88.0,
    status: 'Submitted',
    submittedAt: '2026-09-22 14:15:00'
  }
];

export const UNIT_BASE_SCORES: Record<string, number> = {
  Anand: 72,
  Bangalore: 78,
  CBE: 85,
  CCH: 69,
  Guntur: 61,
  Hyderabad: 80,
  Indore: 66,
  Jaipur: 74,
  Kanpur: 58,
  Krishnankoil: 71,
  Ludhiana: 76,
  Panvel: 63,
  Shimoga: 68,
  Varanasi: 60
};
