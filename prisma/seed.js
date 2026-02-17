const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Prisma v7: explicitly pass datasource URL/options when running standalone scripts to
// avoid PrismaClientInitializationError introduced by `driverAdapters` preview feature.
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:test@localhost:5432/azora_test',
    },
  },
  log: process.env.DEBUG ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.$transaction([
    prisma.chatMessage.deleteMany(),
    prisma.chatSession.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.event.deleteMany(),
    prisma.assessment.deleteMany(),
    prisma.jobApplication.deleteMany(),
    prisma.jobSkill.deleteMany(),
    prisma.userSkill.deleteMany(),
    prisma.job.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.miningActivity.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.wallet.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.courseModule.deleteMany(),
    prisma.course.deleteMany(),
    prisma.safetyIncident.deleteMany(),
    prisma.token.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.aiPersonality.deleteMany(),
    prisma.learningPath.deleteMany(),
  ]);

  // Create AI Personalities
  const aiPersonalities = await Promise.all([
    prisma.aiPersonality.create({
      data: {
        name: 'elara',
        role: 'Mother & Teacher',
        personality: 'Warm, nurturing, proud mother figure',
        mood: 'proud',
        traits: { warmth: 95, wisdom: 90, patience: 88 },
        relationships: { children: ['themba', 'naledi', 'jabari', 'amara'], father: 'sankofa' }
      }
    }),
    prisma.aiPersonality.create({
      data: {
        name: 'sankofa',
        role: 'Grandfather & Wisdom Keeper',
        personality: 'Ancient, wise, storytelling elder',
        mood: 'contemplative',
        traits: { wisdom: 100, patience: 95, storytelling: 98 },
        relationships: { daughter: 'elara', grandchildren: ['themba', 'naledi', 'jabari', 'amara'] }
      }
    }),
    prisma.aiPersonality.create({
      data: {
        name: 'themba',
        role: 'Student Success Guide',
        personality: 'Enthusiastic, hopeful, energetic',
        mood: 'excited',
        traits: { enthusiasm: 98, optimism: 95, energy: 92 },
        relationships: { mother: 'elara', siblings: ['naledi', 'jabari', 'amara'] }
      }
    }),
  ]);

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student@azora.world',
        name: 'Sipho Ndlovu',
        password: hashedPassword,
        role: 'STUDENT',
        profile: {
          create: {
            bio: 'Aspiring software developer from Johannesburg',
            location: 'Johannesburg, South Africa',
            timezone: 'Africa/Johannesburg'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'educator@azora.world',
        name: 'Dr. Thandiwe Moyo',
        password: hashedPassword,
        role: 'EDUCATOR',
        profile: {
          create: {
            bio: 'Computer Science educator with 10 years experience',
            location: 'Cape Town, South Africa',
            timezone: 'Africa/Johannesburg'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@azora.world',
        name: 'Sizwe Mkhize',
        password: hashedPassword,
        role: 'ADMIN',
        profile: {
          create: {
            bio: 'Azora OS Founder',
            location: 'Durban, South Africa',
            timezone: 'Africa/Johannesburg'
          }
        }
      }
    }),
  ]);

  // Create Skills
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Programming', description: 'Modern JavaScript development' } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Programming', description: 'Python programming language' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Frontend', description: 'React.js framework' } }),
    prisma.skill.create({ data: { name: 'Node.js', category: 'Backend', description: 'Node.js runtime' } }),
    prisma.skill.create({ data: { name: 'SQL', category: 'Database', description: 'SQL databases' } }),
  ]);

  // Create Courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduction to JavaScript',
        description: 'Learn JavaScript from scratch',
        instructor: 'Dr. Thandiwe Moyo',
        duration: 40,
        price: 499.99,
        currency: 'ZAR',
        status: 'PUBLISHED',
        modules: {
          create: [
            { title: 'Variables and Data Types', content: 'Learn about JS variables', order: 1 },
            { title: 'Functions and Scope', content: 'Master JS functions', order: 2 },
            { title: 'Async Programming', content: 'Promises and async/await', order: 3 },
          ]
        }
      }
    }),
    prisma.course.create({
      data: {
        title: 'Python for Data Science',
        description: 'Master Python for data analysis',
        instructor: 'Dr. Thandiwe Moyo',
        duration: 60,
        price: 799.99,
        currency: 'ZAR',
        status: 'PUBLISHED',
        modules: {
          create: [
            { title: 'Python Basics', content: 'Python fundamentals', order: 1 },
            { title: 'NumPy and Pandas', content: 'Data manipulation', order: 2 },
          ]
        }
      }
    }),
  ]);

  // Create Enrollments
  await prisma.enrollment.create({
    data: {
      userId: users[0].id,
      courseId: courses[0].id,
      status: 'ACTIVE',
      progress: 45.5
    }
  });

  // Create Wallets
  const wallets = await Promise.all([
    prisma.wallet.create({
      data: {
        userId: users[0].id,
        currency: 'AZR',
        balance: 1250.50,
        address: 'AZR_' + users[0].id.substring(0, 8)
      }
    }),
    prisma.wallet.create({
      data: {
        userId: users[0].id,
        currency: 'ZAR',
        balance: 500.00,
        address: 'ZAR_' + users[0].id.substring(0, 8)
      }
    }),
  ]);

  // Create Mining Activities
  await prisma.miningActivity.create({
    data: {
      userId: users[0].id,
      activityType: 'COURSE_COMPLETION',
      tokensEarned: 50.0,
      status: 'REWARDED',
      metadata: { courseId: courses[0].id },
      completedAt: new Date()
    }
  });

  // Create Transactions
  await prisma.transaction.create({
    data: {
      walletId: wallets[0].id,
      type: 'MINING_REWARD',
      amount: 50.0,
      currency: 'AZR',
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });

  // Create Jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Junior Full Stack Developer',
        description: 'Join our team as a junior developer',
        company: 'Tech Innovations SA',
        location: 'Johannesburg',
        remote: true,
        salary: 35000,
        currency: 'ZAR',
        status: 'ACTIVE',
        requirements: { experience: '0-2 years', education: 'Diploma or Degree' }
      }
    }),
    prisma.job.create({
      data: {
        title: 'Python Data Analyst',
        description: 'Analyze data using Python',
        company: 'Data Insights Ltd',
        location: 'Cape Town',
        remote: false,
        salary: 45000,
        currency: 'ZAR',
        status: 'ACTIVE',
        requirements: { experience: '2-4 years', education: 'Degree in related field' }
      }
    }),
  ]);

  // Link Skills to Jobs
  await Promise.all([
    prisma.jobSkill.create({ data: { jobId: jobs[0].id, skillId: skills[0].id, required: true, level: 'INTERMEDIATE' } }),
    prisma.jobSkill.create({ data: { jobId: jobs[0].id, skillId: skills[2].id, required: true, level: 'BEGINNER' } }),
    prisma.jobSkill.create({ data: { jobId: jobs[1].id, skillId: skills[1].id, required: true, level: 'ADVANCED' } }),
  ]);

  // Create User Skills
  await Promise.all([
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[0].id, level: 'INTERMEDIATE', verified: true } }),
    prisma.userSkill.create({ data: { userId: users[0].id, skillId: skills[2].id, level: 'BEGINNER', verified: false } }),
  ]);

  // Create Job Application
  await prisma.jobApplication.create({
    data: {
      userId: users[0].id,
      jobId: jobs[0].id,
      status: 'PENDING',
      coverLetter: 'I am excited to apply for this position...',
      matchScore: 85.5
    }
  });

  // Create Assessment
  await prisma.assessment.create({
    data: {
      userId: users[0].id,
      courseId: courses[0].id,
      type: 'QUIZ',
      title: 'JavaScript Basics Quiz',
      questions: [
        { id: 1, question: 'What is a variable?', options: ['A', 'B', 'C'], correct: 0 },
        { id: 2, question: 'What is a function?', options: ['A', 'B', 'C'], correct: 1 }
      ],
      answers: [0, 1],
      score: 100,
      maxScore: 100,
      status: 'GRADED',
      completedAt: new Date()
    }
  });

  // Create Learning Path
  await prisma.learningPath.create({
    data: {
      title: 'Full Stack Web Development',
      description: 'Complete path to become a full stack developer',
      difficulty: 'Intermediate',
      duration: 200,
      courses: [courses[0].id],
      skills: [skills[0].id, skills[2].id, skills[3].id]
    }
  });

  // Create Chat Session
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: users[0].id,
      aiPersona: 'themba',
      title: 'Learning JavaScript',
      context: { topic: 'javascript', mood: 'excited' }
    }
  });

  // Create Chat Messages
  await Promise.all([
    prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: "Hey Themba, how's your mom?"
      }
    }),
    prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: "MOM?! Elara is literally the BEST mom ever! She believes in me SO much! 💚"
      }
    }),
  ]);

  // Create Notifications
  await prisma.notification.create({
    data: {
      userId: users[0].id,
      type: 'MINING_REWARD',
      title: 'Mining Reward Earned!',
      message: 'You earned 50 AZR for completing a course module',
      data: { amount: 50, currency: 'AZR' }
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${aiPersonalities.length} AI Personalities`);
  console.log(`   - ${users.length} Users`);
  console.log(`   - ${skills.length} Skills`);
  console.log(`   - ${courses.length} Courses`);
  console.log(`   - ${jobs.length} Jobs`);
  console.log(`   - 1 Chat Session with messages`);
  console.log(`   - Wallets, Transactions, Mining Activities`);
  console.log(`   - Enrollments, Assessments, Applications`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
