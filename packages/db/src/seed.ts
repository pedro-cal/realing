import { db } from './client';
import { users, userRoles, courses, lessons, exercises } from './schema';

export async function seed() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin User
  const [admin] = await db
    .insert(users)
    .values({
      email: 'admin@lingua.io',
      passwordHash: '$2b$10$mock_admin_hash_for_development_purposes',
      displayName: 'System Admin',
      nativeLanguage: 'en-US',
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    await db.insert(userRoles).values({
      userId: admin.id,
      role: 'admin',
    });
    console.log('✅ Seeded admin user:', admin.email);
  }

  // 2. Create Multi-Role Polyglot User (Teacher + Student + Monitor)
  const [alex] = await db
    .insert(users)
    .values({
      email: 'alex@lingua.io',
      passwordHash: '$2b$10$mock_alex_hash_for_development_purposes',
      displayName: 'Alex Polyglot',
      nativeLanguage: 'pt-BR',
    })
    .onConflictDoNothing()
    .returning();

  if (alex) {
    // Accumulate multiple roles!
    await db.insert(userRoles).values([
      { userId: alex.id, role: 'student', languageId: 'ja-JP' },
      { userId: alex.id, role: 'teacher', languageId: 'pt-BR' },
      { userId: alex.id, role: 'monitor' },
    ]);
    console.log('✅ Seeded accumulated multi-role user (Student + Teacher + Monitor):', alex.email);

    // 3. Create Sample Course
    const [frenchCourse] = await db
      .insert(courses)
      .values({
        creatorId: alex.id,
        title: 'Mastering Conversational French',
        description: 'Everyday dialogue, phonetics, and authentic French speech rhythm.',
        sourceLanguage: 'en-US',
        targetLanguage: 'fr-FR',
        level: 'A2',
        isPublished: true,
      })
      .returning();

    if (frenchCourse) {
      const [lesson1] = await db
        .insert(lessons)
        .values({
          courseId: frenchCourse.id,
          title: 'Lesson 1: Daily Greetings & Politeness',
          description: 'Learn the difference between Bonjour and Bonne journée with pitch cadence.',
          orderIndex: 1,
        })
        .returning();

      if (lesson1) {
        await db.insert(exercises).values([
          {
            lessonId: lesson1.id,
            type: 'pronunciation_drill',
            promptText: "Bonjour! Comment allez-vous aujourd'hui?",
            targetPhonemes: 'bɔ̃.ʒuʁ kɔ.mɑ̃ t‿a.le vu o.ʒuʁ.dɥi',
            orderIndex: 1,
          },
          {
            lessonId: lesson1.id,
            type: 'pronunciation_drill',
            promptText: 'Très bien, merci! Et vous?',
            targetPhonemes: 'tʁɛ bjɛ̃ mɛʁ.si e vu',
            orderIndex: 2,
          },
        ]);
        console.log('✅ Seeded French course, lessons, and speech drill exercises.');
      }
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
