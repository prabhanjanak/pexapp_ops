import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';

dotenv.config();

console.log('====================================================');
console.log('  SANKARA EYE HOSPITAL - POSTGRESQL DB AUTOBUILD    ');
console.log('====================================================');

initializeDatabase()
  .then(() => {
    console.log('\n[SUCCESS] PostgreSQL schema verified, migrated & seeded successfully!');
    console.log('All 14 Hospital Units & Administrative accounts are ready for production.\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[FATAL] Database initialization failed:', err);
    process.exit(1);
  });
