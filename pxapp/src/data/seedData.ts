import { HospitalUnit } from '../types';

export const CATEGORIES = [
  'OPD Wait Time',
  'Private Room Capacity',
  'Real-time Patient Tracking',
  'Dilation & Buzzer Alert System',
  'Lab Turnaround',
  'Surgical Redo Audits',
  'Registration Delays',
  'Counselling Wait Time',
  'Discharge Process',
  'Pharmacy Counter Delays',
  'Billing & Insurance Clearance',
  'Optometry & Triage Queue',
  'Pre-op Holding Area Flow',
  'Diagnostics Scheduling',
  'Post-op Care Briefing',
] as const;

// Clean canonical list of 14 Sankara Eye Hospital Units (Empty bottlenecks ready for production logging)
export const INITIAL_UNITS: HospitalUnit[] = [
  {
    id: 'unit-coimbatore',
    name: 'Sankara Eye Hospital Coimbatore',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    cmo: 'Dr. Shruthi Tara',
    unitHead: 'Ms. Binitha Harish',
    contactHead: 'Ms. Binitha Harish',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 1977,
    bedCapacity: 250
  },
  {
    id: 'unit-coimbatore-city',
    name: 'Sankara Eye Hospital Coimbatore (RS Puram)',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    cmo: 'Dr. Devi Priya',
    unitHead: 'Ms. Kanmani S',
    contactHead: 'Ms. Kanmani S',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 1985,
    bedCapacity: 80
  },
  {
    id: 'unit-guntur',
    name: 'Sankara Eye Hospital Guntur',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    cmo: 'Dr. Sudhakar Potti',
    unitHead: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    contactHead: 'Ms. Tripura / Ms. Madhavi Machavarapu',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2014,
    bedCapacity: 115
  },
  {
    id: 'unit-bangalore',
    name: 'Sankara Eye Hospital Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    cmo: 'Dr. Yeddula Umesh',
    unitHead: 'Lt. Col. S. Guruprasad (Retd.)',
    contactHead: 'Lt. Col. S. Guruprasad (Retd.)',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2008,
    bedCapacity: 150
  },
  {
    id: 'unit-shimoga',
    name: 'Sankara Eye Hospital Shivamogga',
    city: 'Shivamogga',
    state: 'Karnataka',
    cmo: 'Dr. S. Mahesha',
    unitHead: 'Ms. Gayatri Shantharam / Ms. Anitha',
    contactHead: 'Ms. Gayatri Shantharam / Ms. Anitha',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2011,
    bedCapacity: 100
  },
  {
    id: 'unit-anand',
    name: 'Sankara Eye Hospital Anand',
    city: 'Anand',
    state: 'Gujarat',
    cmo: 'Dr. Nisha Vadhyamal Ahuja',
    unitHead: 'Col. Sudeepkumar D. Mehta (Retd.)',
    contactHead: 'Col. Sudeepkumar D. Mehta (Retd.)',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2017,
    bedCapacity: 100
  },
  {
    id: 'unit-kanpur',
    name: 'Sankara Eye Hospital Kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    cmo: 'Dr. Puneet Johri',
    unitHead: 'Dr. Rahul Singh',
    contactHead: 'Dr. Rahul Singh',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2020,
    bedCapacity: 110
  },
  {
    id: 'unit-jaipur',
    name: 'Sankara Eye Hospital Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    cmo: 'Dr. Neeraj Shah',
    unitHead: 'Dr. Nishant Jain',
    contactHead: 'Dr. Nishant Jain',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2022,
    bedCapacity: 105
  },
  {
    id: 'unit-ludhiana',
    name: 'Sankara Eye Hospital Ludhiana',
    city: 'Ludhiana',
    state: 'Punjab',
    cmo: 'Dr. Manoj Gupta',
    unitHead: 'Dr. Manoj Gupta',
    contactHead: 'Dr. Manoj Gupta',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2019,
    bedCapacity: 100
  },
  {
    id: 'unit-indore',
    name: 'Sankara Eye Hospital Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    cmo: 'Dr. Ankit Deokar',
    unitHead: 'Dr. Rituraj Sharma',
    contactHead: 'Dr. Rituraj Sharma',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2021,
    bedCapacity: 95
  },
  {
    id: 'unit-panvel',
    name: 'Sankara Eye Hospital Panvel',
    city: 'Panvel',
    state: 'Maharashtra',
    cmo: 'Dr. Girish Budhrani',
    unitHead: 'Dr. Rajesh Kapse',
    contactHead: 'Dr. Rajesh Kapse',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2018,
    bedCapacity: 120
  },
  {
    id: 'unit-hyderabad',
    name: 'Sankara Eye Hospital Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    cmo: 'Dr. Simakurthy Sriram',
    unitHead: 'Mr. Gannamraju Viswamohan',
    contactHead: 'Mr. Gannamraju Viswamohan',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2023,
    bedCapacity: 130
  },
  {
    id: 'unit-varanasi',
    name: 'Sankara Eye Hospital Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    cmo: 'Dr. Saptagirish Rambhatla',
    unitHead: 'Lt. Col. (Dr.) Bharat Singh',
    contactHead: 'Lt. Col. (Dr.) Bharat Singh',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2021,
    bedCapacity: 85
  },
  {
    id: 'unit-krishnankoil',
    name: 'Sankara Eye Hospital Krishnankoil',
    city: 'Krishnankoil',
    state: 'Tamil Nadu',
    cmo: 'Dr. Sudha N',
    unitHead: 'Mr. Aswathaman R',
    contactHead: 'Mr. Aswathaman R',
    isAssessed: false,
    bottlenecks: [],
    establishedYear: 2004,
    bedCapacity: 110
  }
];

export const INITIAL_USERS: any[] = [
  {
    id: 'user-bharath-president',
    name: 'Bharath Balasubramanian',
    email: 'bharath@sankaraeye.com',
    empId: 'PRES-001',
    role: 'President',
    unitId: undefined,
    designation: 'President of Hospital Operations • Executive Directorate',
    avatarInitials: 'BB'
  },
  {
    id: 'user-saurabh-ops',
    name: 'Saurabh',
    email: 'saurabh@sankaraeye.com',
    empId: 'OPS-001',
    role: 'Operations Team',
    unitId: undefined,
    designation: 'Central Operations Lead • Patient Experience',
    avatarInitials: 'SB'
  },
  {
    id: 'user-arsh-ops',
    name: 'Arsh Mishra',
    email: 'arsh.mishra@sankaraeye.com',
    empId: 'OPS-002',
    role: 'Operations Team',
    unitId: undefined,
    designation: 'Operations & Quality Specialist',
    avatarInitials: 'AM'
  },
  {
    id: 'user-sudarshan-ops',
    name: 'Sudarshan',
    email: 'sudarshan@sankaraeye.com',
    empId: 'OPS-003',
    role: 'Operations Team',
    unitId: undefined,
    designation: 'Operations & Flow Lead',
    avatarInitials: 'SD'
  },
  {
    id: 'user-prabhanjan-itadmin',
    name: 'Prabhanjan',
    email: 'prabhanjan@sankaraeye.com',
    empId: '010177',
    role: 'IT Admin',
    unitId: undefined,
    designation: 'IT & Systems Admin • Central Directorate',
    avatarInitials: 'PR'
  },
  {
    id: 'user-saravanan-itadmin',
    name: 'Saravanan',
    email: 'saravanan@sankaraeye.com',
    empId: '010178',
    role: 'IT Admin',
    unitId: undefined,
    designation: 'IT & Systems Admin • Digital Infrastructure',
    avatarInitials: 'SR'
  }
];

