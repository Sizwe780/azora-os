/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

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

    // Seed courses
    const courses = [
      {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, JavaScript, and React for web development.',
        saqa_unit_standard: 'IT: End User Computing (NQF Level 3/4)',
        nqf_level: 4
      },
      {
        title: 'Practical AI for Small Business',
        description: 'Leverage AI tools for marketing, customer service, and data analysis.',
        saqa_unit_standard: 'Business Administration (NQF Level 4/5)',
        nqf_level: 4
      }
    ];

    for (const course of courses) {
      const result = await db.query(
        `INSERT INTO courses (title, description, saqa_unit_standard, nqf_level)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING RETURNING id`,
        [course.title, course.description, course.saqa_unit_standard, course.nqf_level]
      );
      if (result.rows.length > 0) {
        console.log(`✅ Course "${course.title}" seeded`);
      }
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();