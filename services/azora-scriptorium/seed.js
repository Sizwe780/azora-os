/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Seed sample learning data
 * @description Adds sample courses, modules, lessons, and quizzes to the database
 */

const { initializeDatabase, pool } = require('./database');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample learning data...');

    // Sample courses
    const courses = [
      {
        id: 'course-1',
        title: 'Introduction to Blockchain Technology',
        description: 'Learn the fundamentals of blockchain technology and its applications',
        saqa_unit_standard: 'US12345',
        nqf_level: 5
      },
      {
        id: 'course-2',
        title: 'Smart Contract Development',
        description: 'Master smart contract development with Solidity',
        saqa_unit_standard: 'US12346',
        nqf_level: 6
      },
      {
        id: 'course-3',
        title: 'Cryptocurrency Trading Fundamentals',
        description: 'Learn the basics of cryptocurrency trading and market analysis',
        saqa_unit_standard: 'US12347',
        nqf_level: 4
      }
    ];

    // Insert courses
    for (const course of courses) {
      await pool.query(`
        INSERT OR REPLACE INTO courses (id, title, description, saqa_unit_standard, nqf_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [course.id, course.title, course.description, course.saqa_unit_standard, course.nqf_level]);
    }

    // Sample modules for course 1
    const modules = [
      {
        id: 'module-1-1',
        course_id: 'course-1',
        title: 'What is Blockchain?',
        description: 'Understanding the core concepts of blockchain technology',
        order_index: 1
      },
      {
        id: 'module-1-2',
        course_id: 'course-1',
        title: 'Cryptographic Foundations',
        description: 'Learn about cryptography used in blockchain',
        order_index: 2
      }
    ];

    // Insert modules
    for (const module of modules) {
      await pool.query(`
        INSERT OR REPLACE INTO modules (id, course_id, title, description, order_index, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [module.id, module.course_id, module.title, module.description, module.order_index]);
    }

    // Sample lessons
    const lessons = [
      {
        id: 'lesson-1-1-1',
        module_id: 'module-1-1',
        title: 'Blockchain Basics',
        content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records called blocks...',
        order_index: 1
      },
      {
        id: 'lesson-1-1-2',
        module_id: 'module-1-1',
        title: 'How Blockchain Works',
        content: 'Each block contains a cryptographic hash of the previous block, creating an immutable chain...',
        order_index: 2
      }
    ];

    // Insert lessons
    for (const lesson of lessons) {
      await pool.query(`
        INSERT OR REPLACE INTO lessons (id, module_id, title, content, order_index, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [lesson.id, lesson.module_id, lesson.title, lesson.content, lesson.order_index]);
    }

    // Sample quizzes
    const quizzes = [
      {
        id: 'quiz-1-1-1',
        lesson_id: 'lesson-1-1-1',
        question: 'What is a blockchain?',
        options: JSON.stringify(['A type of cryptocurrency', 'A distributed ledger technology', 'A programming language', 'A database']),
        correct_answer: 'A distributed ledger technology'
      },
      {
        id: 'quiz-1-1-2',
        lesson_id: 'lesson-1-1-2',
        question: 'What connects blocks in a blockchain?',
        options: JSON.stringify(['WiFi', 'Cryptographic hashes', 'IP addresses', 'GPS coordinates']),
        correct_answer: 'Cryptographic hashes'
      }
    ];

    // Insert quizzes
    for (const quiz of quizzes) {
      await pool.query(`
        INSERT OR REPLACE INTO quizzes (id, lesson_id, question, options, correct_answer, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `, [quiz.id, quiz.lesson_id, quiz.question, quiz.options, quiz.correct_answer]);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = { seedDatabase };