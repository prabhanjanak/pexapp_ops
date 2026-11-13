/**
 * 5S Audit Organizational Contact Directory
 * Contains verified contact mappings for Sankara Eye Hospital Units:
 * - Coimbatore (CBE)
 * - Bengaluru (BLR)
 * - Shivamogga (SMG)
 * - Krishnankoil (KK)
 * - Jaipur (JPR / JP)
 * - Ludhiana (LDH)
 * - Indore (IND)
 * 
 * Supports dynamic addition, editing, and removal of contacts for all existing and future units.
 */

export interface FiveSContact {
  id: string;
  unitCode: string;
  unitName: string;
  zoneName: string;
  zoneInchargeName: string;
  zoneInchargeEmail: string;
  zoneInchargeDesignation?: string;
  zoneInchargeEmpId?: string;
  departmentName: string;
  deptInchargeName: string;
  deptInchargeEmail: string;
  deptInchargeDesignation?: string;
  deptInchargeEmpId?: string;
}

export const FIVE_S_UNIT_HEAD_DIRECTORY: Record<string, { name: string; email: string; designation: string }> = {
  'CBE': {
    name: 'Ms. Binitha Harish',
    email: 'unithead.cbe@sankaraeye.com',
    designation: 'Unit Head & General Administrator • CBE Hospital'
  },
  'BLR': {
    name: 'Lt. Col. S. Guruprasad (Retd.)',
    email: 'guruprasad@sankaraeye.com',
    designation: 'Unit Head • Bengaluru Hospital'
  },
  'SMG': {
    name: 'Ms. Gayatri Shantharam',
    email: 'head.shimoga@sankaraeye.com',
    designation: 'Unit Head • Shivamogga Hospital'
  },
  'KK': {
    name: 'Mr. Aswathaman R',
    email: 'head.krishnankoil@sankaraeye.com',
    designation: 'Unit Head • Krishnankoil Hospital'
  },
  'JPR': {
    name: 'Dr. Nishant Jain',
    email: 'head.jaipur@sankaraeye.com',
    designation: 'Unit Head • Jaipur Hospital'
  },
  'JP': {
    name: 'Dr. Nishant Jain',
    email: 'head.jaipur@sankaraeye.com',
    designation: 'Unit Head • Jaipur Hospital'
  },
  'LDH': {
    name: 'Dr. Manoj Gupta',
    email: 'head.ludhiana@sankaraeye.com',
    designation: 'Unit Head • Ludhiana Hospital'
  },
  'IND': {
    name: 'Dr. Rituraj Sharma',
    email: 'head.indore@sankaraeye.com',
    designation: 'Unit Head • Indore Hospital'
  },
  'GNT': {
    name: 'Ms. Tripura / Ms. Madhavi',
    email: 'head.guntur@sankaraeye.com',
    designation: 'Unit Head • Guntur Hospital'
  },
  'AND': {
    name: 'Col. Sudeepkumar D. Mehta (Retd.)',
    email: 'head.anand@sankaraeye.com',
    designation: 'Unit Head • Anand Hospital'
  },
  'KNP': {
    name: 'Dr. Rahul Singh',
    email: 'head.kanpur@sankaraeye.com',
    designation: 'Unit Head • Kanpur Hospital'
  },
  'PNV': {
    name: 'Dr. Rajesh Kapse',
    email: 'head.panvel@sankaraeye.com',
    designation: 'Unit Head • Panvel Hospital'
  },
  'HYD': {
    name: 'Mr. Gannamraju Viswamohan',
    email: 'head.hyderabad@sankaraeye.com',
    designation: 'Unit Head • Hyderabad Hospital'
  },
  'VNS': {
    name: 'Lt. Col. (Dr.) Bharat Singh',
    email: 'head.varanasi@sankaraeye.com',
    designation: 'Unit Head • Varanasi Hospital'
  }
};

export const INITIAL_FIVE_S_CONTACTS: FiveSContact[] = [
  // ==========================================
  // KRISHNANKOIL (KK)
  // ==========================================
  // Zone 1
  {
    id: 'kk-z1-reg',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Registration',
    deptInchargeName: 'Ms Devi',
    deptInchargeEmail: 'registration.kk@sankaraeye.com',
    deptInchargeDesignation: 'Receptionist',
    deptInchargeEmpId: '7547'
  },
  {
    id: 'kk-z1-ref',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Refraction',
    deptInchargeName: 'Ms Manjula',
    deptInchargeEmail: 'optometrist.kk@sankaraeye.com',
    deptInchargeDesignation: 'Optometrist',
    deptInchargeEmpId: '5567'
  },
  {
    id: 'kk-z1-doc',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Doctor Room',
    deptInchargeName: 'Ms Ponnuthai',
    deptInchargeEmail: 'pcm.kk@sankaraeye.com',
    deptInchargeDesignation: 'PC SPL CP',
    deptInchargeEmpId: '9198'
  },
  {
    id: 'kk-z1-couns',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Counseling',
    deptInchargeName: 'Mrs Maheswari',
    deptInchargeEmail: 'pc.kk@sankaraeye.com',
    deptInchargeDesignation: 'IC PCL',
    deptInchargeEmpId: '628'
  },
  {
    id: 'kk-z1-tpa',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Cashier / TPA',
    deptInchargeName: 'Mrs Athilakshmi',
    deptInchargeEmail: 'pcm.kk@sankaraeye.com',
    deptInchargeDesignation: 'Patient Counselor',
    deptInchargeEmpId: '1740'
  },
  {
    id: 'kk-z1-crm',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'CRM / Marketing',
    deptInchargeName: 'Mrs Manimegalai',
    deptInchargeEmail: 'crm.kk@sankaraeye.com',
    deptInchargeDesignation: 'Executive - Patient Service',
    deptInchargeEmpId: '6386'
  },
  {
    id: 'kk-z1-inv',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Investigation',
    deptInchargeName: 'Ms Mala',
    deptInchargeEmail: 'optometrist.kk@sankaraeye.com',
    deptInchargeDesignation: 'Optometrist',
    deptInchargeEmpId: '10093'
  },
  {
    id: 'kk-z1-mrd',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 1',
    zoneInchargeName: 'B. Muthumari',
    zoneInchargeEmail: 'pcm.kk@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '335',
    departmentName: 'Paying MRD',
    deptInchargeName: 'Maduraiveeran',
    deptInchargeEmail: 'tpa.kk@sankaraeye.com',
    deptInchargeDesignation: 'TPA',
    deptInchargeEmpId: '5837'
  },

  // KK Zone 2
  {
    id: 'kk-z2-accts',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Arunpandi',
    zoneInchargeEmail: 'arunpandi@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10684',
    departmentName: 'Accounts / Finance',
    deptInchargeName: 'Mrs. Shanmugapriya',
    deptInchargeEmail: 'accts.kk@sankaraeye.com',
    deptInchargeDesignation: 'Accountant',
    deptInchargeEmpId: '007397'
  },
  {
    id: 'kk-z2-hr',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Arunpandi',
    zoneInchargeEmail: 'arunpandi@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10684',
    departmentName: 'Unit HR',
    deptInchargeName: 'Mrs. Nagalakshmi',
    deptInchargeEmail: 'hr.kk@sankaraeye.com',
    deptInchargeDesignation: 'HR Executive',
    deptInchargeEmpId: '001377'
  },
  {
    id: 'kk-z2-outreach',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Arunpandi',
    zoneInchargeEmail: 'arunpandi@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10684',
    departmentName: 'Outreach Administration / Store',
    deptInchargeName: 'Mrs. Anathajothi',
    deptInchargeEmail: 'cbbf.kk@sankaraeye.com',
    deptInchargeDesignation: 'Data Entry Operator',
    deptInchargeEmpId: '009192'
  },
  {
    id: 'kk-z2-store',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Arunpandi',
    zoneInchargeEmail: 'arunpandi@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10684',
    departmentName: 'Store / Godown',
    deptInchargeName: 'Mrs. Kaleeswari',
    deptInchargeEmail: 'inventory.kk@sankaraeye.com',
    deptInchargeDesignation: 'Executive - Inventory',
    deptInchargeEmpId: '000287'
  },
  {
    id: 'kk-z2-canteen',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Arunpandi',
    zoneInchargeEmail: 'arunpandi@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10684',
    departmentName: 'Canteen',
    deptInchargeName: 'Mr. Rajkumar',
    deptInchargeEmail: 'cafetaria.kk@sankaraeye.com',
    deptInchargeDesignation: 'Cafeteria In-Charge',
    deptInchargeEmpId: '010249'
  },

  // KK Zone 3
  {
    id: 'kk-z3-lab',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Sankareeswari',
    zoneInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    zoneInchargeDesignation: 'Incharge - paying OT',
    zoneInchargeEmpId: '002642',
    departmentName: 'Laboratory',
    deptInchargeName: 'Mrs. Subathra',
    deptInchargeEmail: 'lab.kk@sankaraeye.com',
    deptInchargeDesignation: 'In-Charge - Laboratory',
    deptInchargeEmpId: '000320'
  },
  {
    id: 'kk-z3-vt',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Sankareeswari',
    zoneInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    zoneInchargeDesignation: 'Incharge - paying OT',
    zoneInchargeEmpId: '002642',
    departmentName: 'Vision Therapy',
    deptInchargeName: 'Mrs. Poomari',
    deptInchargeEmail: 'qa.kk@sankaraeye.com',
    deptInchargeDesignation: 'In-Charge Optometrist',
    deptInchargeEmpId: '001251'
  },
  {
    id: 'kk-z3-ipd',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Sankareeswari',
    zoneInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    zoneInchargeDesignation: 'Incharge - paying OT',
    zoneInchargeEmpId: '002642',
    departmentName: 'IPD Doctor Assessment / Deluxe Ward',
    deptInchargeName: 'Mrs. Malini',
    deptInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    deptInchargeDesignation: 'Patient Care - Specialty Ward',
    deptInchargeEmpId: '006006'
  },
  {
    id: 'kk-z3-ot',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Sankareeswari',
    zoneInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    zoneInchargeDesignation: 'Incharge - paying OT',
    zoneInchargeEmpId: '002642',
    departmentName: 'Paying OT',
    deptInchargeName: 'Ms. Vidya',
    deptInchargeEmail: 'spl.ot.kksankara@sankaraeye.com',
    deptInchargeDesignation: 'Specialty OT Technician',
    deptInchargeEmpId: '000276'
  },

  // KK Zone 4
  {
    id: 'kk-z4-preop',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Muthulakshmi / Kaleeswari',
    zoneInchargeEmail: 'comward.kk@sankaraeye.com',
    zoneInchargeDesignation: 'Patient Care - Corporate Ward',
    zoneInchargeEmpId: '000105',
    departmentName: 'Pre-Op Ward',
    deptInchargeName: 'Mrs Rajeshwari',
    deptInchargeEmail: 'comward.kk@sankaraeye.com',
    deptInchargeDesignation: 'In-Charge - Specialty Patient Care',
    deptInchargeEmpId: '000110'
  },
  {
    id: 'kk-z4-mrd',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Muthulakshmi / Kaleeswari',
    zoneInchargeEmail: 'comward.kk@sankaraeye.com',
    zoneInchargeDesignation: 'Patient Care - Corporate Ward',
    zoneInchargeEmpId: '000105',
    departmentName: 'Non-Paying MRD',
    deptInchargeName: 'Mr. Kaleeswaran',
    deptInchargeEmail: 'comward.kk@sankaraeye.com',
    deptInchargeDesignation: 'Data Entry Operator',
    deptInchargeEmpId: '008371'
  },

  // KK Zone 5
  {
    id: 'kk-z5-fm',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Thangapandi',
    zoneInchargeEmail: 'biomedical.kk@sankaraeye.com',
    zoneInchargeDesignation: 'Plumber',
    zoneInchargeEmpId: '005997',
    departmentName: 'Facility Manager Room',
    deptInchargeName: 'Mr Nagendren',
    deptInchargeEmail: 'facility.kk@sankaraeye.com',
    deptInchargeDesignation: 'Facility Manager',
    deptInchargeEmpId: '000146'
  },
  {
    id: 'kk-z5-eng',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Thangapandi',
    zoneInchargeEmail: 'biomedical.kk@sankaraeye.com',
    zoneInchargeDesignation: 'Plumber',
    zoneInchargeEmpId: '005997',
    departmentName: 'Engineering Room',
    deptInchargeName: 'Mr Rajeskumar',
    deptInchargeEmail: 'biomedical.kk@sankaraeye.com',
    deptInchargeDesignation: 'Electrician',
    deptInchargeEmpId: '006781'
  },
  {
    id: 'kk-z5-stp',
    unitCode: 'KK',
    unitName: 'Sankara Eye Hospital - Krishnankoil',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Thangapandi',
    zoneInchargeEmail: 'biomedical.kk@sankaraeye.com',
    zoneInchargeDesignation: 'Plumber',
    zoneInchargeEmpId: '005997',
    departmentName: 'STP & RO Plant',
    deptInchargeName: 'Mr Thangapandi',
    deptInchargeEmail: 'biomedical.kk@sankaraeye.com',
    deptInchargeDesignation: 'Plumber',
    deptInchargeEmpId: '005997'
  },

  // ==========================================
  // JAIPUR (JPR / JP)
  // ==========================================
  // Zone 1
  {
    id: 'jp-z1-reg',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Registration & Registration Waiting',
    deptInchargeName: 'Ms. Jiya Rathore',
    deptInchargeEmail: 'rathorejiya321@gmail.com',
    deptInchargeDesignation: 'Floor Coordinator',
    deptInchargeEmpId: '9011'
  },
  {
    id: 'jp-z1-ref',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Refraction',
    deptInchargeName: 'Mr. Suman Kumar',
    deptInchargeEmail: 'optometry.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Optometry',
    deptInchargeEmpId: '7875'
  },
  {
    id: 'jp-z1-opd',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Doctors’ Waiting Area & Consultation Rooms',
    deptInchargeName: 'Mrs. Sarita Dhayal',
    deptInchargeEmail: 'saritadhayal96@gmail.com',
    deptInchargeDesignation: 'IC - OPD',
    deptInchargeEmpId: '3229'
  },
  {
    id: 'jp-z1-pharm',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Pharmacy',
    deptInchargeName: 'Mr. Ankit Kumawat',
    deptInchargeEmail: 'pharmacy.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Pharmacy',
    deptInchargeEmpId: '7161'
  },
  {
    id: 'jp-z1-couns',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Counselling Area',
    deptInchargeName: 'Ms. Princi K. Yadav',
    deptInchargeEmail: 'pc.jp@sankaraeye.com',
    deptInchargeDesignation: 'Counsellor',
    deptInchargeEmpId: '7532'
  },
  {
    id: 'jp-z1-contactlens',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Ashima Gabgotra',
    zoneInchargeEmail: 'pcm.jp@sankaraeye.com',
    zoneInchargeDesignation: 'PCM',
    zoneInchargeEmpId: '5571',
    departmentName: 'Contact Lens',
    deptInchargeName: 'Mr. David',
    deptInchargeEmail: 'davidalung3@gmail.com',
    deptInchargeDesignation: 'IC - Contact Lens',
    deptInchargeEmpId: '7628'
  },

  // JP Zone 2
  {
    id: 'jp-z2-ipd',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'IPD (Admission area + POD)',
    deptInchargeName: 'Ms. Sangeeta',
    deptInchargeEmail: 'ipd.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - IPD',
    deptInchargeEmpId: '6115'
  },
  {
    id: 'jp-z2-ot',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'OT & Minor OT',
    deptInchargeName: 'Mr. Pukhraj',
    deptInchargeEmail: 'splot.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - OT',
    deptInchargeEmpId: '3173'
  },
  {
    id: 'jp-z2-admin',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'Administration (Seminar & Board Rooms)',
    deptInchargeName: 'Mr. Vinod Khandelwal',
    deptInchargeEmail: 'bdm.jp@sankaraeye.com',
    deptInchargeDesignation: 'BD',
    deptInchargeEmpId: '4169'
  },
  {
    id: 'jp-z2-vt',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'VT / ERG / Myopia Area',
    deptInchargeName: 'Mr. Bhanu Pratap Singh',
    deptInchargeEmail: 'bannabhanu84@gmail.com',
    deptInchargeDesignation: 'Optom',
    deptInchargeEmpId: '8642'
  },
  {
    id: 'jp-z2-eyebank',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'Eye Bank',
    deptInchargeName: 'Mr. Ashish',
    deptInchargeEmail: 'eyebank.jp@sankaraeye.com',
    deptInchargeDesignation: 'Eye Bank Technician',
    deptInchargeEmpId: '10218'
  },
  {
    id: 'jp-z2-lab',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Akshat Sharma',
    zoneInchargeEmail: 'akshat@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Associate',
    zoneInchargeEmpId: '10869',
    departmentName: 'Laboratory',
    deptInchargeName: 'Ms. Priya',
    deptInchargeEmail: 'qa.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Lab',
    deptInchargeEmpId: '8046'
  },

  // JP Zone 3
  {
    id: 'jp-z3-ward',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Vikram Saini',
    zoneInchargeEmail: 'outreach.jp@sankaraeye.com',
    zoneInchargeDesignation: 'ORA',
    zoneInchargeEmpId: '5799',
    departmentName: 'Ward',
    deptInchargeName: 'Mr. Mukesh Gurjar',
    deptInchargeEmail: 'mukeshkumarg206@gmail.com',
    deptInchargeDesignation: 'Ward - IC',
    deptInchargeEmpId: '3759'
  },
  {
    id: 'jp-z3-outreach-mrd',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Vikram Saini',
    zoneInchargeEmail: 'outreach.jp@sankaraeye.com',
    zoneInchargeDesignation: 'ORA',
    zoneInchargeEmpId: '5799',
    departmentName: 'Outreach MRD',
    deptInchargeName: 'Mr. Ashok Kumar Tank',
    deptInchargeEmail: 'outreach.jp@sankaraeye.com',
    deptInchargeDesignation: 'TL - CORP',
    deptInchargeEmpId: '3220'
  },
  {
    id: 'jp-z3-crash',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Vikram Saini',
    zoneInchargeEmail: 'outreach.jp@sankaraeye.com',
    zoneInchargeDesignation: 'ORA',
    zoneInchargeEmpId: '5799',
    departmentName: 'All Crash Carts',
    deptInchargeName: 'Mrs. Pooja Sain',
    deptInchargeEmail: 'nursing.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Nursing',
    deptInchargeEmpId: '7629'
  },

  // JP Zone 4
  {
    id: 'jp-z4-stores',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Ashwani Kumar Gupta',
    zoneInchargeEmail: 'ashwanikumar@sankaraeye.com',
    zoneInchargeDesignation: 'IC - Purchase',
    zoneInchargeEmpId: '3172',
    departmentName: 'Stores',
    deptInchargeName: 'Mr. Rohit Sharma',
    deptInchargeEmail: 'inventory.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Stores',
    deptInchargeEmpId: '4878'
  },
  {
    id: 'jp-z4-canteen',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Ashwani Kumar Gupta',
    zoneInchargeEmail: 'ashwanikumar@sankaraeye.com',
    zoneInchargeDesignation: 'IC - Purchase',
    zoneInchargeEmpId: '3172',
    departmentName: 'Canteen',
    deptInchargeName: 'Mr. Saurabh Singh Gaur',
    deptInchargeEmail: 'sourabhsingh1836@gmail.com',
    deptInchargeDesignation: 'IC - Cafeteria'
  },
  {
    id: 'jp-z4-tpa',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Ashwani Kumar Gupta',
    zoneInchargeEmail: 'ashwanikumar@sankaraeye.com',
    zoneInchargeDesignation: 'IC - Purchase',
    zoneInchargeEmpId: '3172',
    departmentName: 'TPA',
    deptInchargeName: 'Mr. Sourav Nath',
    deptInchargeEmail: 'souravnath@sankaraeye.com',
    deptInchargeDesignation: 'Admin Associate',
    deptInchargeEmpId: '10730'
  },
  {
    id: 'jp-z4-inv',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Ashwani Kumar Gupta',
    zoneInchargeEmail: 'ashwanikumar@sankaraeye.com',
    zoneInchargeDesignation: 'IC - Purchase',
    zoneInchargeEmpId: '3172',
    departmentName: 'Investigation Room - 51',
    deptInchargeName: 'Mr. Lalu Prasad',
    deptInchargeEmail: 'optometry.jp@sankaraeye.com',
    deptInchargeDesignation: 'Optom',
    deptInchargeEmpId: '6991'
  },

  // JP Zone 5
  {
    id: 'jp-z5-cam',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Amrish Kumar',
    zoneInchargeEmail: 'facility.jp@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Manager',
    zoneInchargeEmpId: '8581',
    departmentName: 'Camera Room',
    deptInchargeName: 'Mr. Rohit Kirodiwal',
    deptInchargeEmail: 'is.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - IT',
    deptInchargeEmpId: '7917'
  },
  {
    id: 'jp-z5-elec',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Amrish Kumar',
    zoneInchargeEmail: 'facility.jp@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Manager',
    zoneInchargeEmpId: '8581',
    departmentName: 'Electrical Room',
    deptInchargeName: 'Mr. Shubham',
    deptInchargeEmail: 'facility.jp@sankaraeye.com',
    deptInchargeDesignation: 'Electrician',
    deptInchargeEmpId: '4937'
  },
  {
    id: 'jp-z5-transport',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Amrish Kumar',
    zoneInchargeEmail: 'facility.jp@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Manager',
    zoneInchargeEmpId: '8581',
    departmentName: 'Transport',
    deptInchargeName: 'Mr. Kishan Singh Ranawat',
    deptInchargeEmail: 'facility.jp@sankaraeye.com',
    deptInchargeDesignation: 'Driver',
    deptInchargeEmpId: '7982'
  },
  {
    id: 'jp-z5-biomedical',
    unitCode: 'JPR',
    unitName: 'Sankara Eye Hospital Jaipur',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Amrish Kumar',
    zoneInchargeEmail: 'facility.jp@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Manager',
    zoneInchargeEmpId: '8581',
    departmentName: 'Biomedical & Facility Stores',
    deptInchargeName: 'Mr. Sukendra',
    deptInchargeEmail: 'facility.jp@sankaraeye.com',
    deptInchargeDesignation: 'IC - Biomedical',
    deptInchargeEmpId: '3311'
  },

  // ==========================================
  // LUDHIANA (LDH)
  // ==========================================
  // Zone 1
  {
    id: 'ldh-z1-stores',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Mr. Mayank Kumar',
    zoneInchargeEmail: 'bde.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'BDE',
    zoneInchargeEmpId: '10272',
    departmentName: 'Stores',
    deptInchargeName: 'Ms. Manpreet Kaur',
    deptInchargeEmail: 'stores.ldh@sankaraeye.com',
    deptInchargeDesignation: 'Store Incharge',
    deptInchargeEmpId: '3794'
  },
  {
    id: 'ldh-z1-pharm',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Mr. Mayank Kumar',
    zoneInchargeEmail: 'bde.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'BDE',
    zoneInchargeEmpId: '10272',
    departmentName: 'Pharmacy',
    deptInchargeName: 'Mr. Mohit Sharma',
    deptInchargeEmail: 'registration.ldh@sankaraeye.com',
    deptInchargeDesignation: 'Pharmacist',
    deptInchargeEmpId: '10006'
  },
  {
    id: 'ldh-z1-mrd',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Mr. Mayank Kumar',
    zoneInchargeEmail: 'bde.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'BDE',
    zoneInchargeEmpId: '10272',
    departmentName: 'MRD',
    deptInchargeName: 'Ms. Kirandep Kaur',
    deptInchargeEmail: 'registration.ldh@sankaraeye.com',
    deptInchargeDesignation: 'RECEPTIONIST',
    deptInchargeEmpId: '5917'
  },

  // LDH Zone 2
  {
    id: 'ldh-z2-opd',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Amritpal Singh',
    zoneInchargeEmail: 'bdedr.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'Outreach Administrator',
    zoneInchargeEmpId: '2849',
    departmentName: 'OPD & Patient Service Area',
    deptInchargeName: 'Ms. Harpreet Kaur',
    deptInchargeEmail: 'pc.ldh@sankaraeye.com',
    deptInchargeDesignation: 'VCT Staff',
    deptInchargeEmpId: '650'
  },
  {
    id: 'ldh-z2-ipd',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Amritpal Singh',
    zoneInchargeEmail: 'bdedr.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'Outreach Administrator',
    zoneInchargeEmpId: '2849',
    departmentName: 'Admin Block & IPD & SAV',
    deptInchargeName: 'Dr. Mohammad Nooruz Zaman',
    deptInchargeEmail: 'sco.ldh@sankaraeye.com',
    deptInchargeDesignation: 'FACULTY - OPTOMETRY',
    deptInchargeEmpId: '1557'
  },
  {
    id: 'ldh-z2-canteen',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Amritpal Singh',
    zoneInchargeEmail: 'bdedr.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'Outreach Administrator',
    zoneInchargeEmpId: '2849',
    departmentName: 'Canteen',
    deptInchargeName: 'Mr. Chandan',
    deptInchargeEmail: 'bdedr.ldh@sankaraeye.com',
    deptInchargeDesignation: 'Canteen Incharge',
    deptInchargeEmpId: 'OLDHCF027'
  },
  {
    id: 'ldh-z2-outreach',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr. Amritpal Singh',
    zoneInchargeEmail: 'bdedr.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'Outreach Administrator',
    zoneInchargeEmpId: '2849',
    departmentName: 'Community Outreach Area & Lab',
    deptInchargeName: 'Mr. Sandeep Singh / Ms. Hardeep Kaur',
    deptInchargeEmail: 'comward.ldh@sankaraeye.com',
    deptInchargeDesignation: 'Data Entry / VCT Staff',
    deptInchargeEmpId: '8816 / 640'
  },

  // LDH Zone 3
  {
    id: 'ldh-z3-fac',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Rajinder Verma',
    zoneInchargeEmail: 'facility.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'MGR-Maintenance',
    zoneInchargeEmpId: '1946',
    departmentName: 'Facility Engineering Service Area',
    deptInchargeName: 'Mr. Sukhdev Singh',
    deptInchargeEmail: 'ldhbiomedical@gmail.com',
    deptInchargeDesignation: 'Asst-BME',
    deptInchargeEmpId: '959'
  },
  {
    id: 'ldh-z3-transport',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Rajinder Verma',
    zoneInchargeEmail: 'facility.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'MGR-Maintenance',
    zoneInchargeEmpId: '1946',
    departmentName: 'Transport',
    deptInchargeName: 'Mr. Raghvir Singh',
    deptInchargeEmail: 'facility.ldh@sankaraeye.com',
    deptInchargeDesignation: 'SUPV-TRANS',
    deptInchargeEmpId: '958'
  },
  {
    id: 'ldh-z3-ot',
    unitCode: 'LDH',
    unitName: 'Sankara Eye Hospital Ludhiana',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Mr. Rajinder Verma',
    zoneInchargeEmail: 'facility.ldh@sankaraeye.com',
    zoneInchargeDesignation: 'MGR-Maintenance',
    zoneInchargeEmpId: '1946',
    departmentName: 'Operation Theatre Area, Eye Bank',
    deptInchargeName: 'Mr. Jagdeep Singh',
    deptInchargeEmail: 'splot.ldh@sankaraeye.com',
    deptInchargeDesignation: 'IC-SPL.OT',
    deptInchargeEmpId: '2026'
  },

  // ==========================================
  // BANGALORE (BLR)
  // ==========================================
  // Zone 1
  {
    id: 'blr-z1-reg',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Registration Counter',
    deptInchargeName: 'Ms. Shobha',
    deptInchargeEmail: 'registration.blr@sankaraeye.com',
    deptInchargeDesignation: 'Registration - IC',
    deptInchargeEmpId: '005553'
  },
  {
    id: 'blr-z1-reg-wait',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Registration - Waiting Area',
    deptInchargeName: 'Ms. Nagalakshmi',
    deptInchargeEmail: 'registration.blr@sankaraeye.com',
    deptInchargeDesignation: 'Registration',
    deptInchargeEmpId: '002028'
  },
  {
    id: 'blr-z1-couns',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Counselling rooms',
    deptInchargeName: 'Ms. Shruthi / Ms. Shanthi',
    deptInchargeEmail: 'pc.blr@sankaraeye.com',
    deptInchargeDesignation: 'Patient Counsellors',
    deptInchargeEmpId: '000484'
  },
  {
    id: 'blr-z1-inv',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Investigation rooms (OCT/FFA/Laser room/B scan/ HFA)',
    deptInchargeName: 'Ms. Thejashree K S / Mr. George',
    deptInchargeEmail: 'qc.blr@sankaraeye.com',
    deptInchargeDesignation: 'Optometrist & QC',
    deptInchargeEmpId: '009938'
  },
  {
    id: 'blr-z1-appt',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Appointment desk',
    deptInchargeName: 'Ms. Shakunthala',
    deptInchargeEmail: 'blr.appointments@sankaraeye.com',
    deptInchargeDesignation: 'Appointment Executive',
    deptInchargeEmpId: '002283'
  },
  {
    id: 'blr-z1-pharm',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Pharmacy',
    deptInchargeName: 'Ms. Usha',
    deptInchargeEmail: 'pharmacy.blr@sankaraeye.com',
    deptInchargeDesignation: 'Pharmacist',
    deptInchargeEmpId: '007001'
  },
  {
    id: 'blr-z1-stores',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'Stores',
    deptInchargeName: 'Ms. Nimy',
    deptInchargeEmail: 'stores.blr@sankaraeye.com',
    deptInchargeDesignation: 'Stores - Manager',
    deptInchargeEmpId: '005925'
  },
  {
    id: 'blr-z1-mrd',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'MRD (Basement)',
    deptInchargeName: 'Mr. Ashok',
    deptInchargeEmail: 'mrd.blr@sankaraeye.com',
    deptInchargeDesignation: 'Executive - MRD'
  },
  {
    id: 'blr-z1-tpa',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms Priya S / Dr Shalini',
    zoneInchargeEmail: 'admin.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Senior Administrator',
    zoneInchargeEmpId: '000477',
    departmentName: 'TPA / INSURANCE',
    deptInchargeName: 'Mr. Raju Nataraja Naik',
    deptInchargeEmail: 'blr.tpa@sankaraeye.com',
    deptInchargeDesignation: 'IC - TPA',
    deptInchargeEmpId: '004363'
  },

  // BLR Zone 2
  {
    id: 'blr-z2-comm-ward',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr Paramesh / Dr Niharika',
    zoneInchargeEmail: 'blr.nannakannu@sankaraeye.com',
    zoneInchargeDesignation: 'Administrator - Community Outreach',
    zoneInchargeEmpId: '000373',
    departmentName: 'Community ward (Ground floor) / Assessment Area',
    deptInchargeName: 'Mr. Manjunath / Ms. Shalini',
    deptInchargeEmail: 'deo.blr@sankaraeye.com',
    deptInchargeDesignation: 'IC-CORP.WD',
    deptInchargeEmpId: '009814'
  },
  {
    id: 'blr-z2-mrd-comm',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr Paramesh / Dr Niharika',
    zoneInchargeEmail: 'blr.nannakannu@sankaraeye.com',
    zoneInchargeDesignation: 'Administrator - Community Outreach',
    zoneInchargeEmpId: '000373',
    departmentName: 'MRD (Community Side)',
    deptInchargeName: 'Mr. Parasuram / Ms. Geetha',
    deptInchargeEmail: 'mrd.blr@sankaraeye.com',
    deptInchargeDesignation: 'MGR-MRD',
    deptInchargeEmpId: '000295'
  },
  {
    id: 'blr-z2-outreach',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr Paramesh / Dr Niharika',
    zoneInchargeEmail: 'blr.nannakannu@sankaraeye.com',
    zoneInchargeDesignation: 'Administrator - Community Outreach',
    zoneInchargeEmpId: '000373',
    departmentName: 'Community outreach (Entire Office)',
    deptInchargeName: 'Ms. Priya',
    deptInchargeEmail: 'outreach.blr@sankaraeye.com',
    deptInchargeDesignation: 'Coordinator - CORP',
    deptInchargeEmpId: '006009'
  },
  {
    id: 'blr-z2-cafeteria',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Mr Paramesh / Dr Niharika',
    zoneInchargeEmail: 'blr.nannakannu@sankaraeye.com',
    zoneInchargeDesignation: 'Administrator - Community Outreach',
    zoneInchargeEmpId: '000373',
    departmentName: 'Cafeteria',
    deptInchargeName: 'Mr. Sudheer',
    deptInchargeEmail: 'cafeteria.blr@sankaraeye.com',
    deptInchargeDesignation: 'MGR - Cafeteria',
    deptInchargeEmpId: '000294'
  },

  // BLR Zone 3
  {
    id: 'blr-z3-mind',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Dr Gokul / Dr. Divya Caculo',
    zoneInchargeEmail: 'gokul@sankaraeye.com',
    zoneInchargeDesignation: 'Psychologist / Consultant',
    zoneInchargeEmpId: '003858',
    departmentName: 'Mind matters consultation room',
    deptInchargeName: 'Ms. Rebecca',
    deptInchargeEmail: 'rebeccajo1995@gmail.com',
    deptInchargeDesignation: 'Psychologist',
    deptInchargeEmpId: '005557'
  },
  {
    id: 'blr-z3-eyebank',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Dr Gokul / Dr. Divya Caculo',
    zoneInchargeEmail: 'gokul@sankaraeye.com',
    zoneInchargeDesignation: 'Psychologist / Consultant',
    zoneInchargeEmpId: '003858',
    departmentName: 'Eye bank',
    deptInchargeName: 'Mr. Arun',
    deptInchargeEmail: 'eyebank.blr@sankaraeye.com',
    deptInchargeDesignation: 'TECH-EB',
    deptInchargeEmpId: '007691'
  },
  {
    id: 'blr-z3-ipward',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Dr Gokul / Dr. Divya Caculo',
    zoneInchargeEmail: 'gokul@sankaraeye.com',
    zoneInchargeDesignation: 'Psychologist / Consultant',
    zoneInchargeEmpId: '003858',
    departmentName: 'IP Ward (paying) including Nursing station & Rooms',
    deptInchargeName: 'Ms. Amitha / Ms. Sankari',
    deptInchargeEmail: 'payingward.blr@sankaraeye.com',
    deptInchargeDesignation: 'IC-SPL.WD',
    deptInchargeEmpId: '002777'
  },

  // BLR Zone 4
  {
    id: 'blr-z4-splot',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Ms. Sheela Bai / Dr Nidhi',
    zoneInchargeEmail: 'splot.blr@sankaraeye.com',
    zoneInchargeDesignation: 'OT Staff & HIC Coordinator',
    zoneInchargeEmpId: '000492',
    departmentName: 'Speciality OT',
    deptInchargeName: 'Ms. Roopa N',
    deptInchargeEmail: 'splot.blr@sankaraeye.com',
    deptInchargeDesignation: 'IC-SPL.OT',
    deptInchargeEmpId: '000125'
  },
  {
    id: 'blr-z4-is',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Ms. Sheela Bai / Dr Nidhi',
    zoneInchargeEmail: 'splot.blr@sankaraeye.com',
    zoneInchargeDesignation: 'OT Staff & HIC Coordinator',
    zoneInchargeEmpId: '000492',
    departmentName: 'IS department Room',
    deptInchargeName: 'Mr. Shekar',
    deptInchargeEmail: 'shekhar@sankaraeye.com',
    deptInchargeDesignation: 'MGR-IS',
    deptInchargeEmpId: '000299'
  },

  // BLR Zone 5
  {
    id: 'blr-z5-bme',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Ms Gulafsha / Mr. Naveen',
    zoneInchargeEmail: 'accs.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Manager F & A',
    zoneInchargeEmpId: '001936',
    departmentName: 'Biomedical department Room',
    deptInchargeName: 'Mr. Suresh',
    deptInchargeEmail: 'suresh@sankaraeye.com',
    deptInchargeDesignation: 'Executive - Bio-Medical Engineering',
    deptInchargeEmpId: '002446'
  },
  {
    id: 'blr-z5-hr',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Ms Gulafsha / Mr. Naveen',
    zoneInchargeEmail: 'accs.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Manager F & A',
    zoneInchargeEmpId: '001936',
    departmentName: 'Administration block',
    deptInchargeName: 'Ms. Nethravathi',
    deptInchargeEmail: 'hr.blr@sankaraeye.com',
    deptInchargeDesignation: 'Manager - HR',
    deptInchargeEmpId: '002381'
  },

  // BLR Zone 6
  {
    id: 'blr-z6-vr',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 6',
    zoneInchargeName: 'Ms. Sukanya / Dr. Rishikesh',
    zoneInchargeEmail: 'ocularist.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Ocularist / Pathologist',
    zoneInchargeEmpId: '001905',
    departmentName: 'Vision Rehab',
    deptInchargeName: 'Ms. Anitta Mary',
    deptInchargeEmail: 'vr.blr@sankaraeye.com',
    deptInchargeDesignation: 'Incharge - V. R',
    deptInchargeEmpId: '008835'
  },
  {
    id: 'blr-z6-vt',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 6',
    zoneInchargeName: 'Ms. Sukanya / Dr. Rishikesh',
    zoneInchargeEmail: 'ocularist.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Ocularist / Pathologist',
    zoneInchargeEmpId: '001905',
    departmentName: 'Vision Therapy clinic',
    deptInchargeName: 'Ms. Subbalakshmi',
    deptInchargeEmail: 'visiontherapy.blr@sankaraeye.com',
    deptInchargeDesignation: 'OPTOMETRIST',
    deptInchargeEmpId: '007004'
  },

  // BLR Zone 7
  {
    id: 'blr-z7-facility',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 7',
    zoneInchargeName: 'Mr Chandramouli',
    zoneInchargeEmail: 'facility.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Manager - Facility',
    zoneInchargeEmpId: '001518',
    departmentName: 'Engineering and maintenance',
    deptInchargeName: 'Mr. Balasubramanian / Mr. Mohan',
    deptInchargeEmail: 'facility.blr@sankaraeye.com',
    deptInchargeDesignation: 'Electrical Supervisor',
    deptInchargeEmpId: '000317'
  },
  {
    id: 'blr-z7-transport',
    unitCode: 'BLR',
    unitName: 'Sankara Eye Hospital Bengaluru',
    zoneName: 'Zone 7',
    zoneInchargeName: 'Mr Chandramouli',
    zoneInchargeEmail: 'facility.blr@sankaraeye.com',
    zoneInchargeDesignation: 'Manager - Facility',
    zoneInchargeEmpId: '001518',
    departmentName: 'Transport',
    deptInchargeName: 'Mr. Kanna',
    deptInchargeEmail: 'blr.transport@sankaraeye.com',
    deptInchargeDesignation: 'MGR - Transport',
    deptInchargeEmpId: '000311'
  },

  // ==========================================
  // SHIMOGA (SMG)
  // ==========================================
  {
    id: 'smg-za-opd',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone A',
    zoneInchargeName: 'Ms Ranjitha R',
    zoneInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    zoneInchargeDesignation: 'PCM Lead',
    departmentName: 'OPD Consultation Area',
    deptInchargeName: 'Ms Thara K G',
    deptInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-za-optom',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone A',
    zoneInchargeName: 'Ms Ranjitha R',
    zoneInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    zoneInchargeDesignation: 'PCM Lead',
    departmentName: 'Optometry',
    deptInchargeName: 'Ms Shilpa Rani J',
    deptInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-za-reg',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone A',
    zoneInchargeName: 'Ms Ranjitha R',
    zoneInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    zoneInchargeDesignation: 'PCM Lead',
    departmentName: 'Registration',
    deptInchargeName: 'Ms Sudha B E',
    deptInchargeEmail: 'pcm.shimoga@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-zb-ward',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone B',
    zoneInchargeName: 'Ms Savithramma K B',
    zoneInchargeEmail: 'comward.sme@sankaraeye.com',
    zoneInchargeDesignation: 'Corporate Ward Lead',
    departmentName: 'Community Ward Assessment',
    deptInchargeName: 'Ms Shobha D M',
    deptInchargeEmail: 'comward.sme@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-zc-ot',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone C',
    zoneInchargeName: 'Anitha K G',
    zoneInchargeEmail: 'comot.smg@sankaraeye.com',
    zoneInchargeDesignation: 'OT Lead',
    departmentName: 'Specialty OT & Orbit OT',
    deptInchargeName: 'Ms Anusha N',
    deptInchargeEmail: 'comot.smg@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-zd-facility',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone D',
    zoneInchargeName: 'Mr Kumaraswamy G',
    zoneInchargeEmail: 'facility.smg@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Lead',
    departmentName: 'Transport, Parking & Maintenance',
    deptInchargeName: 'Mr Bhuvanesh S',
    deptInchargeEmail: 'facility.smg@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-ze-stores',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone E',
    zoneInchargeName: 'Geetha H',
    zoneInchargeEmail: 'stores.smg@sankaraeye.com',
    zoneInchargeDesignation: 'Stores Lead',
    departmentName: 'Central Stores',
    deptInchargeName: 'Ms Kruthika S',
    deptInchargeEmail: 'stores.smg@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-zf-admin',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone F',
    zoneInchargeName: 'Avinash G',
    zoneInchargeEmail: 'avinash@sankaraeye.com',
    zoneInchargeDesignation: 'Admin Lead',
    departmentName: 'Administration Office',
    deptInchargeName: 'Mr Santhosh A',
    deptInchargeEmail: 'avinash@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },
  {
    id: 'smg-zg-power',
    unitCode: 'SMG',
    unitName: 'Sankara Eye Hospital Shivamogga',
    zoneName: 'Zone G',
    zoneInchargeName: 'Mr Arun Kumar',
    zoneInchargeEmail: 'eb.smg@sankaraeye.com',
    zoneInchargeDesignation: 'Engineering Lead',
    departmentName: 'Power House, Manifold & Facilities',
    deptInchargeName: 'Mr Yashwanth R',
    deptInchargeEmail: 'eb.smg@sankaraeye.com',
    deptInchargeDesignation: 'In charge'
  },

  // ==========================================
  // COIMBATORE (CBE)
  // ==========================================
  // Zone 1
  {
    id: 'cbe-z1-reg',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'Registration, MRD Paying & CRM Desk',
    deptInchargeName: 'Ms. Archana & Ms. Chandrakala',
    deptInchargeEmail: 'registration.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '005806'
  },
  {
    id: 'cbe-z1-optom',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'Optometry & Myopia clinic',
    deptInchargeName: 'Ms. Kowsalya & Ms. Saranya',
    deptInchargeEmail: 'optometry.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000004'
  },
  {
    id: 'cbe-z1-opd',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'OPD- Investigation Rooms & Dr\'s Rooms',
    deptInchargeName: 'Ms. Kalamani & Ms. Jancy',
    deptInchargeEmail: 'opd.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000016'
  },
  {
    id: 'cbe-z1-couns',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'Patient Counselling',
    deptInchargeName: 'Ms. Shyla Alex',
    deptInchargeEmail: 'pc.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000018'
  },
  {
    id: 'cbe-z1-tpa',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'TPA/ Cash counter',
    deptInchargeName: 'Mr. Murugesan & Ms. Beena',
    deptInchargeEmail: 'insurance.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '008370'
  },
  {
    id: 'cbe-z1-pharm',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Ms. Kowsalya',
    zoneInchargeEmail: 'optometry.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Optometry - IC',
    zoneInchargeEmpId: '000004',
    departmentName: 'Pharmacy',
    deptInchargeName: 'Ms. Pavithra',
    deptInchargeEmail: 'stores.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '009713'
  },

  // CBE Zone 2
  {
    id: 'cbe-z2-splward',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Ms. Vijayabharathi',
    zoneInchargeEmail: 'splot.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'OT - IC',
    zoneInchargeEmpId: '000315',
    departmentName: 'IP Paying wards & Washrooms',
    deptInchargeName: 'Ms. Shumalatha',
    deptInchargeEmail: 'splward.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000181'
  },
  {
    id: 'cbe-z2-ot',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Ms. Vijayabharathi',
    zoneInchargeEmail: 'splot.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'OT - IC',
    zoneInchargeEmpId: '000315',
    departmentName: 'OT- Paying, A1, DCT, Lasik, Community',
    deptInchargeName: 'Ms. Vijayabharathi',
    deptInchargeEmail: 'splot.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000315'
  },
  {
    id: 'cbe-z2-lab',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Ms. Vijayabharathi',
    zoneInchargeEmail: 'splot.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'OT - IC',
    zoneInchargeEmpId: '000315',
    departmentName: 'LAB',
    deptInchargeName: 'Ms. Jeeva',
    deptInchargeEmail: 'lab.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000013'
  },

  // CBE Zone 3
  {
    id: 'cbe-z3-ward',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Ms. Ananthi',
    zoneInchargeEmail: 'comward.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Camp Ward - IC',
    zoneInchargeEmpId: '000341',
    departmentName: 'Shifting & Assessment Area',
    deptInchargeName: 'Ms. Ananthi',
    deptInchargeEmail: 'comward.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000341'
  },
  {
    id: 'cbe-z3-eyebank',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 3',
    zoneInchargeName: 'Ms. Ananthi',
    zoneInchargeEmail: 'comward.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Camp Ward - IC',
    zoneInchargeEmpId: '000341',
    departmentName: 'Eye Bank / Wet lab',
    deptInchargeName: 'Mr. Suvaraj',
    deptInchargeEmail: 'eyebank.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '003021'
  },

  // CBE Zone 4
  {
    id: 'cbe-z4-facility',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Suvaraj',
    zoneInchargeEmail: 'eyebank.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Eye Bank - IC',
    zoneInchargeEmpId: '003021',
    departmentName: 'Engineering',
    deptInchargeName: 'Mr. Pandian',
    deptInchargeEmail: 'eb.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '000039'
  },
  {
    id: 'cbe-z4-stp',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Mr. Suvaraj',
    zoneInchargeEmail: 'eyebank.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Eye Bank - IC',
    zoneInchargeEmpId: '003021',
    departmentName: 'STP/BMW, Cowshed',
    deptInchargeName: 'Mr. Kennedy & Mr. Sathiya Kumar',
    deptInchargeEmail: 'facility.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '003960'
  },

  // CBE Zone 5
  {
    id: 'cbe-z5-transport',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Arun',
    zoneInchargeEmail: 'cafeteria.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Canteen - IC',
    zoneInchargeEmpId: '006332',
    departmentName: 'Transport',
    deptInchargeName: 'Mr. Markose',
    deptInchargeEmail: 'transport.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '010136'
  },
  {
    id: 'cbe-z5-stores',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Arun',
    zoneInchargeEmail: 'cafeteria.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Canteen - IC',
    zoneInchargeEmpId: '006332',
    departmentName: 'Stores- Main, Paying & Non Paying',
    deptInchargeName: 'Mr. Jabarani & Ms. Vishnu',
    deptInchargeEmail: 'stores.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '002881'
  },
  {
    id: 'cbe-z5-admin',
    unitCode: 'CBE',
    unitName: 'Sankara Eye Hospital Coimbatore',
    zoneName: 'Zone 5',
    zoneInchargeName: 'Mr. Arun',
    zoneInchargeEmail: 'cafeteria.cbe@sankaraeye.com',
    zoneInchargeDesignation: 'Canteen - IC',
    zoneInchargeEmpId: '006332',
    departmentName: 'Admin - HR, Accounts, IS, BD & FM Room',
    deptInchargeName: 'Ms. Divya, Mr. Nimal, Mr. Sathish Ethan',
    deptInchargeEmail: 'is.cbe@sankaraeye.com',
    deptInchargeDesignation: 'InCharge',
    deptInchargeEmpId: '002322'
  },

  // ==========================================
  // INDORE (IND)
  // ==========================================
  {
    id: 'ind-z1-opd',
    unitCode: 'IND',
    unitName: 'Sankara Eye Hospital Indore',
    zoneName: 'Zone 1',
    zoneInchargeName: 'Dr. Rituraj Sharma',
    zoneInchargeEmail: 'head.indore@sankaraeye.com',
    zoneInchargeDesignation: 'Unit Head / Zone 1 Lead',
    departmentName: 'Registration & Waiting Lounges',
    deptInchargeName: 'Registration In-Charge',
    deptInchargeEmail: 'head.indore@sankaraeye.com',
    deptInchargeDesignation: 'Supervisor'
  },
  {
    id: 'ind-z2-ward',
    unitCode: 'IND',
    unitName: 'Sankara Eye Hospital Indore',
    zoneName: 'Zone 2',
    zoneInchargeName: 'Nursing Supervisor Indore',
    zoneInchargeEmail: 'head.indore@sankaraeye.com',
    zoneInchargeDesignation: 'Ward Lead',
    departmentName: 'Inpatient Wards & Daycare',
    deptInchargeName: 'Ward In-Charge',
    deptInchargeEmail: 'head.indore@sankaraeye.com',
    deptInchargeDesignation: 'Nurse In-Charge'
  },
  {
    id: 'ind-z3-ot',
    unitCode: 'IND',
    unitName: 'Sankara Eye Hospital Indore',
    zoneName: 'Zone 3',
    zoneInchargeName: 'OT Coordinator Indore',
    zoneInchargeEmail: 'head.indore@sankaraeye.com',
    zoneInchargeDesignation: 'OT Supervisor',
    departmentName: 'Operation Theatre & Recovery',
    deptInchargeName: 'OT In-Charge',
    deptInchargeEmail: 'head.indore@sankaraeye.com',
    deptInchargeDesignation: 'Chief OT Technician'
  },
  {
    id: 'ind-z4-fac',
    unitCode: 'IND',
    unitName: 'Sankara Eye Hospital Indore',
    zoneName: 'Zone 4',
    zoneInchargeName: 'Facility Manager Indore',
    zoneInchargeEmail: 'head.indore@sankaraeye.com',
    zoneInchargeDesignation: 'Facility Lead',
    departmentName: 'Engineering & Biomedical',
    deptInchargeName: 'Engineering Lead',
    deptInchargeEmail: 'head.indore@sankaraeye.com',
    deptInchargeDesignation: 'Lead Technician'
  }
];

export const FIVE_S_CONTACTS_STORAGE_KEY = 'sankara_5s_contacts_override_v2';

export function getStoredFiveSContacts(): FiveSContact[] {
  try {
    const raw = localStorage.getItem(FIVE_S_CONTACTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return INITIAL_FIVE_S_CONTACTS;
}

export function saveStoredFiveSContacts(contacts: FiveSContact[]) {
  try {
    localStorage.setItem(FIVE_S_CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (_) {}
}

export function resolveFiveSRecipients(
  unitCode: string,
  zoneName: string,
  deptName: string,
  customContacts?: FiveSContact[]
): {
  deptInchargeEmail: string;
  deptInchargeName: string;
  zoneInchargeEmail: string;
  zoneInchargeName: string;
  unitHeadEmail: string;
  unitHeadName: string;
} {
  const allContacts = customContacts || getStoredFiveSContacts();
  const normalizedUnit = (unitCode || '').toUpperCase().trim();
  const cleanZone = (zoneName || '').toLowerCase().trim();
  const cleanDept = (deptName || '').toLowerCase().trim();

  // Unit Head details
  const uh = FIVE_S_UNIT_HEAD_DIRECTORY[normalizedUnit] || {
    name: 'Unit Head',
    email: `unithead.${normalizedUnit.toLowerCase()}@sankaraeye.com`,
    designation: 'Hospital Unit Head'
  };

  // Find exact department contact match
  const matchedContact = allContacts.find((c) => {
    const uMatch = c.unitCode.toUpperCase() === normalizedUnit;
    const zMatch = c.zoneName.toLowerCase().includes(cleanZone) || cleanZone.includes(c.zoneName.toLowerCase());
    const dMatch = c.departmentName.toLowerCase().includes(cleanDept) || cleanDept.includes(c.departmentName.toLowerCase());
    return uMatch && (dMatch || zMatch);
  }) || allContacts.find((c) => c.unitCode.toUpperCase() === normalizedUnit && c.zoneName.toLowerCase().includes(cleanZone));

  // Fallback zone incharge
  const zoneMatch = allContacts.find(
    (c) => c.unitCode.toUpperCase() === normalizedUnit && (c.zoneName.toLowerCase().includes(cleanZone) || cleanZone.includes(c.zoneName.toLowerCase()))
  );

  const deptEmail = matchedContact?.deptInchargeEmail || zoneMatch?.zoneInchargeEmail || uh.email;
  const deptNameResult = matchedContact?.deptInchargeName || 'Department Lead';

  const zoneEmail = zoneMatch?.zoneInchargeEmail || matchedContact?.zoneInchargeEmail || uh.email;
  const zoneNameResult = zoneMatch?.zoneInchargeName || 'Zone In-Charge';

  return {
    deptInchargeEmail: deptEmail,
    deptInchargeName: deptNameResult,
    zoneInchargeEmail: zoneEmail,
    zoneInchargeName: zoneNameResult,
    unitHeadEmail: uh.email,
    unitHeadName: uh.name
  };
}
