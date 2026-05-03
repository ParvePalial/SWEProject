import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const securityAnswerHash = await bcrypt.hash('delhi', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@institute.edu' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@institute.edu',
      passwordHash,
      role: 'ADMIN',
      securityQuestion: 'What city were you born in?',
      securityAnswerHash,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@institute.edu' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'student@institute.edu',
      passwordHash,
      role: 'USER',
      securityQuestion: 'What city were you born in?',
      securityAnswerHash,
    },
  });

  await prisma.item.createMany({
    data: [
      {
        type: 'LOST',
        name: 'Blue Backpack',
        description: 'Jansport blue backpack with a university keychain. Contains my physics notebook and a calculator.',
        category: 'Accessories',
        location: 'Main Library, 2nd Floor',
        date: new Date().toISOString(),
        status: 'PUBLISHED',
        reporterId: student.id,
      },
      {
        type: 'LOST',
        name: 'Casio Calculator',
        description: 'Scientific calculator fx-991EX, has my initials "JD" scratched on the back.',
        category: 'Electronics',
        location: 'Engineering Block, Room 304',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'PUBLISHED',
        reporterId: student.id,
      },
      {
        type: 'FOUND',
        name: 'iPhone 13 Pro',
        description: 'Found a black iPhone 13 Pro with a clear case. Lock screen has a picture of a dog.',
        category: 'Electronics',
        location: 'Cafeteria near the entrance',
        date: new Date().toISOString(),
        status: 'PUBLISHED',
        reporterId: admin.id,
      },
      {
        type: 'FOUND',
        name: 'Student ID Card',
        description: 'Found an ID card belonging to Sarah Jenkins. Handed it over to the library desk.',
        category: 'Documents',
        location: 'Library Front Desk',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'PENDING_VERIFICATION',
        reporterId: student.id,
      },
      {
        type: 'LOST',
        name: 'Silver Water Bottle',
        description: 'Milton silver thermal flask, 1 liter.',
        category: 'Other',
        location: 'Sports Complex',
        date: new Date(Date.now() - 259200000).toISOString(),
        status: 'PUBLISHED',
        reporterId: student.id,
      }
    ],
  });

  console.log('Seed completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
