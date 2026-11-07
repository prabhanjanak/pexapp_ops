/**
 * Utility functions for authentication normalization and Unit Head email alias resolution.
 */

const ALIASES: Record<string, string> = {
  // Coimbatore (CBE)
  'cbe.unithead@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead.cbe@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead.coimbatore@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'coimbatore.unithead@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'cbe.unithead@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead.cbe@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead.coimbatore@sankara.com': 'head.coimbatore@sankaraeye.com',
  'unithead01@sankaraeye.com': 'head.coimbatore@sankaraeye.com',
  'unithead01': 'head.coimbatore@sankaraeye.com',

  // RS Puram City (CBC / CCH)
  'cch.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.cch@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'cbc.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.cbc@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'rspuram.unithead@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'unithead.rspuram@sankaraeye.com': 'head.cbccity@sankaraeye.com',
  'head.rspuram@sankaraeye.com': 'head.cbccity@sankaraeye.com',

  // Bangalore (BLR)
  'blr.unithead@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'unithead.blr@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'unithead.bangalore@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'bangalore.unithead@sankaraeye.com': 'head.bangalore@sankaraeye.com',
  'blr.unithead@sankara.com': 'head.bangalore@sankaraeye.com',
  'unithead.blr@sankara.com': 'head.bangalore@sankaraeye.com',

  // Shivamogga / Shimoga (SMG / SHM)
  'smg.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shm.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.smg@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shm@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shimoga@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shimoga.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'shivamogga.unithead@sankaraeye.com': 'head.shimoga@sankaraeye.com',
  'unithead.shivamogga@sankaraeye.com': 'head.shimoga@sankaraeye.com',

  // Indore (IND)
  'ind.unithead@sankaraeye.com': 'head.indore@sankaraeye.com',
  'unithead.ind@sankaraeye.com': 'head.indore@sankaraeye.com',
  'unithead.indore@sankaraeye.com': 'head.indore@sankaraeye.com',
  'indore.unithead@sankaraeye.com': 'head.indore@sankaraeye.com',

  // Guntur (GNT / GTR)
  'gnt.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'gtr.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.gnt@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.gtr@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'unithead.guntur@sankaraeye.com': 'head.guntur@sankaraeye.com',
  'guntur.unithead@sankaraeye.com': 'head.guntur@sankaraeye.com',

  // Anand (AND)
  'and.unithead@sankaraeye.com': 'head.anand@sankaraeye.com',
  'unithead.and@sankaraeye.com': 'head.anand@sankaraeye.com',
  'unithead.anand@sankaraeye.com': 'head.anand@sankaraeye.com',
  'anand.unithead@sankaraeye.com': 'head.anand@sankaraeye.com',

  // Kanpur (KNP)
  'knp.unithead@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'unithead.knp@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'unithead.kanpur@sankaraeye.com': 'head.kanpur@sankaraeye.com',
  'kanpur.unithead@sankaraeye.com': 'head.kanpur@sankaraeye.com',

  // Jaipur (JPR)
  'jpr.unithead@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'unithead.jpr@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'unithead.jaipur@sankaraeye.com': 'head.jaipur@sankaraeye.com',
  'jaipur.unithead@sankaraeye.com': 'head.jaipur@sankaraeye.com',

  // Ludhiana (LDH)
  'ldh.unithead@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'unithead.ldh@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'unithead.ludhiana@sankaraeye.com': 'head.ludhiana@sankaraeye.com',
  'ludhiana.unithead@sankaraeye.com': 'head.ludhiana@sankaraeye.com',

  // Panvel (PNV)
  'pnv.unithead@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'unithead.pnv@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'unithead.panvel@sankaraeye.com': 'head.panvel@sankaraeye.com',
  'panvel.unithead@sankaraeye.com': 'head.panvel@sankaraeye.com',

  // Hyderabad (HYD)
  'hyd.unithead@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'unithead.hyd@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'unithead.hyderabad@sankaraeye.com': 'head.hyderabad@sankaraeye.com',
  'hyderabad.unithead@sankaraeye.com': 'head.hyderabad@sankaraeye.com',

  // Varanasi (VNS)
  'vns.unithead@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'unithead.vns@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'unithead.varanasi@sankaraeye.com': 'head.varanasi@sankaraeye.com',
  'varanasi.unithead@sankaraeye.com': 'head.varanasi@sankaraeye.com',

  // Krishnankoil (KK / KKL)
  'kk.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'kkl.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.kk@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.kkl@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'unithead.krishnankoil@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
  'krishnankoil.unithead@sankaraeye.com': 'head.krishnankoil@sankaraeye.com',
};

export function normalizeLoginIdentifier(input: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase();

  if (ALIASES[clean]) {
    return ALIASES[clean];
  }

  // Dynamic regex fallback for unithead.<unit> or <unit>.unithead
  if (clean.includes('unithead') || clean.includes('head.')) {
    if (clean.includes('cbe') || clean.includes('coimbatore')) {
      if (clean.includes('city') || clean.includes('cch') || clean.includes('rspuram') || clean.includes('cbc')) {
        return 'head.cbccity@sankaraeye.com';
      }
      return 'head.coimbatore@sankaraeye.com';
    }
    if (clean.includes('blr') || clean.includes('bangalore') || clean.includes('bengaluru')) return 'head.bangalore@sankaraeye.com';
    if (clean.includes('smg') || clean.includes('shm') || clean.includes('shimoga') || clean.includes('shivamogga')) return 'head.shimoga@sankaraeye.com';
    if (clean.includes('ind') || clean.includes('indore')) return 'head.indore@sankaraeye.com';
    if (clean.includes('gnt') || clean.includes('gtr') || clean.includes('guntur')) return 'head.guntur@sankaraeye.com';
    if (clean.includes('and') || clean.includes('anand')) return 'head.anand@sankaraeye.com';
    if (clean.includes('knp') || clean.includes('kanpur')) return 'head.kanpur@sankaraeye.com';
    if (clean.includes('jpr') || clean.includes('jaipur')) return 'head.jaipur@sankaraeye.com';
    if (clean.includes('ldh') || clean.includes('ludhiana')) return 'head.ludhiana@sankaraeye.com';
    if (clean.includes('pnv') || clean.includes('panvel')) return 'head.panvel@sankaraeye.com';
    if (clean.includes('hyd') || clean.includes('hyderabad')) return 'head.hyderabad@sankaraeye.com';
    if (clean.includes('vns') || clean.includes('varanasi')) return 'head.varanasi@sankaraeye.com';
    if (clean.includes('kk') || clean.includes('krishnankoil')) return 'head.krishnankoil@sankaraeye.com';
  }

  return clean;
}
