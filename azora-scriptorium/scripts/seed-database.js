/**
 * @file Database Seeding Script
 * @description Seeds the database with test data for development
 */

const db = require('../database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding Student Earnings Database...');

    // Seed test student wallets
    const testStudents = [
      {
        student_id: 'STU001',
        wallet_address: '0x1234567890123456789012345678901234567890',
        balance: 150.50,
        kyc_verified: true,
        tax_number: 'TAX001',
        email: 'student1@university.ac.za'
      },
      {
        student_id: 'STU002',
        wallet_address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        balance: 75.25,
        kyc_verified: false,
        email: 'student2@university.ac.za'
      }
    ];

    for (const student of testStudents) {
      await db.query(
        `INSERT INTO student_wallets 
         (student_id, wallet_address, balance, kyc_verified, tax_number, email)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id) DO NOTHING`,
        [student.student_id, student.wallet_address, student.balance, 
         student.kyc_verified, student.tax_number, student.email]
      );
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();