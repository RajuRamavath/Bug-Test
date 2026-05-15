import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Reporter',
      passwordHash: hash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Resolver',
      passwordHash: hash,
    },
  });

  const bugs = [
    { title: 'Login page crashes on Firefox', priority: 'High', status: 'Open' },
    { title: 'Button alignment off in Safari', priority: 'Low', status: 'In Progress' },
    { title: 'Database connection times out during peak hours', priority: 'Critical', status: 'Open' },
    { title: 'Typo in welcome email', priority: 'Low', status: 'Resolved' },
    { title: 'Cannot upload avatar images larger than 2MB', priority: 'Medium', status: 'Open' },
    { title: 'Reset password link expires too quickly', priority: 'High', status: 'In Progress' },
    { title: 'Search bar does not handle special characters', priority: 'Medium', status: 'Closed' },
    { title: 'Dashboard charts fail to render on mobile', priority: 'High', status: 'Open' },
    { title: 'Missing translation for "Submit" button in French', priority: 'Low', status: 'Open' },
    { title: 'API rate limit exceeded error for free tier users', priority: 'Critical', status: 'In Progress' },
    { title: 'Pagination shows wrong page numbers', priority: 'Medium', status: 'Resolved' },
    { title: 'Session cookie not marked secure', priority: 'High', status: 'Open' },
    { title: 'User profile picture aspect ratio distorted', priority: 'Low', status: 'Closed' },
    { title: 'Billing page shows incorrect currency symbol', priority: 'High', status: 'Open' },
    { title: 'Slow response time on settings page', priority: 'Medium', status: 'In Progress' },
  ];

  for (let i = 0; i < bugs.length; i++) {
    const b = bugs[i];
    const bug = await prisma.bug.create({
      data: {
        title: b.title,
        description: 'This is an auto-generated mock description for the issue: ' + b.title,
        priority: b.priority,
        status: b.status,
        reporterId: user1.id,
        assigneeId: i % 2 === 0 ? user2.id : null,
      }
    });

    await prisma.activity.create({
      data: {
        action: 'created',
        description: 'Bug created via seed script',
        actorId: user1.id,
        bugId: bug.id,
      }
    });
  }

  console.log('Database seeded with ' + bugs.length + ' mock bugs!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
