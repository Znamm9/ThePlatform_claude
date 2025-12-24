import { PrismaClient, RequirementType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qa-platform.com' },
    update: {},
    create: {
      email: 'admin@qa-platform.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create instructor user
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@qa-platform.com' },
    update: {},
    create: {
      email: 'instructor@qa-platform.com',
      passwordHash: instructorPassword,
      name: 'Instructor User',
      role: 'INSTRUCTOR',
      emailVerified: true,
    },
  });

  console.log('✅ Created instructor user:', instructor.email);

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@qa-platform.com' },
    update: {},
    create: {
      email: 'student@qa-platform.com',
      passwordHash: studentPassword,
      name: 'Student User',
      role: 'STUDENT',
      emailVerified: true,
    },
  });

  console.log('✅ Created student user:', student.email);

  // Create course categories
  const categories = [
    {
      name: 'Programming Fundamentals',
      slug: 'programming-fundamentals',
      description: 'Learn the basics of programming - variables, functions, OOP, and algorithms',
      sortOrder: 1,
    },
    {
      name: 'Soft Skills',
      slug: 'soft-skills',
      description: 'Develop essential soft skills - communication, time management, and problem-solving',
      sortOrder: 2,
    },
    {
      name: 'QA Fundamentals',
      slug: 'qa-fundamentals',
      description: 'Master QA basics - testing types, test cases, and bug reports',
      sortOrder: 3,
    },
    {
      name: 'Manual Testing',
      slug: 'manual-testing',
      description: 'Learn manual testing - test planning, execution, and defect tracking',
      sortOrder: 4,
    },
    {
      name: 'Automation Basics',
      slug: 'automation-basics',
      description: 'Understand automation - benefits, tool selection, and frameworks',
      sortOrder: 5,
    },
    {
      name: 'Selenium WebDriver',
      slug: 'selenium-webdriver',
      description: 'Master Selenium - browser automation, locators, and interactions',
      sortOrder: 6,
    },
    {
      name: 'API Testing',
      slug: 'api-testing',
      description: 'Learn API testing - REST APIs, Postman, and status codes',
      sortOrder: 7,
    },
    {
      name: 'CI/CD Integration',
      slug: 'cicd-integration',
      description: 'Understand CI/CD - Jenkins, GitLab CI, and automated pipelines',
      sortOrder: 8,
    },
    {
      name: 'Advanced Automation',
      slug: 'advanced-automation',
      description: 'Advanced concepts - Page Object Model and data-driven testing',
      sortOrder: 9,
    },
    {
      name: 'Interview Preparation',
      slug: 'interview-preparation',
      description: 'Prepare for interviews - resume, portfolio, and interview questions',
      sortOrder: 10,
    },
  ];

  for (const category of categories) {
    const created = await prisma.courseCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`✅ Created category: ${created.name}`);
  }

  // Create sample milestones
  const milestones = [
    {
      name: 'First Steps',
      description: 'Complete your first lesson',
      requirementType: RequirementType.LESSONS_COMPLETED,
      requirementCount: 1,
    },
    {
      name: 'Getting Started',
      description: 'Complete 5 lessons',
      requirementType: RequirementType.LESSONS_COMPLETED,
      requirementCount: 5,
    },
    {
      name: 'Code Warrior',
      description: 'Complete 10 coding exercises',
      requirementType: RequirementType.EXERCISES_COMPLETED,
      requirementCount: 10,
    },
    {
      name: 'Quiz Master',
      description: 'Pass 5 quizzes',
      requirementType: RequirementType.QUIZZES_PASSED,
      requirementCount: 5,
    },
    {
      name: 'Course Completer',
      description: 'Complete your first course',
      requirementType: RequirementType.COURSES_COMPLETED,
      requirementCount: 1,
    },
  ];

  for (const milestone of milestones) {
    const created = await prisma.milestone.create({
      data: milestone,
    });
    console.log(`✅ Created milestone: ${created.name}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
