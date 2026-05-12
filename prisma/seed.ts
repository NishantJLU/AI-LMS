import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo1234!";
const COURSE_SLUG = "human-ai-interface-7xk2p9";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: "admin@nexalearn.edu" },
    update: { passwordHash },
    create: {
      email: "admin@nexalearn.edu",
      name: "Campus Admin",
      role: "ADMIN",
      passwordHash,
      studyStreak: 0,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@nexalearn.edu" },
    update: { passwordHash },
    create: {
      email: "teacher@nexalearn.edu",
      name: "Dr. Avery Kim",
      role: "TEACHER",
      passwordHash,
      department: "Information Science",
      studyStreak: 0,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@nexalearn.edu" },
    update: { passwordHash },
    create: {
      email: "student@nexalearn.edu",
      name: "Jordan Lee",
      role: "STUDENT",
      passwordHash,
      studyStreak: 12,
    },
  });

  if (await prisma.course.findUnique({ where: { slug: COURSE_SLUG } })) {
    // eslint-disable-next-line no-console
    console.log("Seed: demo course already exists. Passwords refreshed. Done.");
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: "Human–AI Interface Design",
      slug: COURSE_SLUG,
      code: "HCI 410",
      description:
        "Design interaction models for trustworthy, legible AI in education — affordances, feedback, and evaluation.",
      published: true,
      authorId: teacher.id,
      instructors: {
        create: { userId: teacher.id, isLead: true },
      },
    },
  });

  await prisma.enrollment.create({
    data: {
      courseId: course.id,
      userId: student.id,
      status: "ACTIVE",
      progress: 0.42,
    },
  });

  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Foundations",
      description: "Mental models and trust calibration for learning copilots.",
      sortOrder: 0,
      published: true,
      lessons: {
        create: [
          {
            title: "Why legibility beats raw accuracy",
            content:
              "Students rely on visible boundaries: when AI intervenes, show scope, limits, and provenance. Interfaces should make failure modes discussable.",
            sortOrder: 0,
            durationMin: 25,
          },
          {
            title: "Latency and cognitive flow",
            content:
              "Perceived responsiveness affects adoption. Chunk streaming feedback, preserve author intent, and keep edit histories reversible.",
            sortOrder: 1,
            durationMin: 20,
          },
        ],
      },
    },
    include: { lessons: true },
  });

  const module2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Applied workflows",
      description: "Summaries, retrieval practice, and retrieval-augmented course search.",
      sortOrder: 1,
      published: true,
      lessons: {
        create: [
          {
            title: "RAG in the classroom",
            content:
              "Ground answers in instructor uploads. Embeddings should honor course boundaries and user permissions.",
            sortOrder: 0,
            durationMin: 30,
          },
        ],
      },
    },
  });

  const assign = await prisma.assignment.create({
    data: {
      id: "demo-assignment-hci-001",
      courseId: course.id,
      moduleId: module1.id,
      title: "Design critique · trust & provenance",
      description:
        "Submit a 600–900 word critique of an AI study tool. Address scope disclosure, error surfacing, and one improvement grounded in course readings.",
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      latePenaltyPercent: 10,
      maxPoints: 100,
      status: "PUBLISHED",
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assign.id,
      userId: student.id,
      content:
        "Draft: The tool never shows sources by default. Students might over-trust summaries...",
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await prisma.quiz.create({
    data: {
      courseId: course.id,
      moduleId: module2.id,
      title: "RAG check-in",
      description: "Quick retrieval-augmented checks.",
      timeLimitMin: 15,
      published: true,
      questions: {
        create: [
          {
            type: "MCQ",
            question: "What does RAG primarily combine?",
            options: ["Transformers and Redis", "Retrieval and generation", "SQL and SVG", "P2P and DNS"],
            correctAnswer: "Retrieval and generation",
            points: 2,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const l0 = module1.lessons[0]!;

  const textForChunks =
    l0.content +
    "\n\n" +
    (module1.lessons[1]?.content ?? "") +
    "\n\n" +
    "Assessment integrity requires scoped tools: students should know when AI assistance is allowed and how submissions are verified.";

  const doc = await prisma.document.create({
    data: {
      courseId: course.id,
      lessonId: l0.id,
      title: "Module reader · excerpt",
      filename: "module-reader.txt",
      url: "/seed/module-reader.txt",
      mimeType: "text/plain",
      sizeBytes: textForChunks.length,
      textContent: textForChunks,
      uploadedById: teacher.id,
    },
  });

  const mid = Math.floor(textForChunks.length / 2);
  await prisma.documentChunk.createMany({
    data: [
      {
        documentId: doc.id,
        content: textForChunks.slice(0, mid),
        chunkIndex: 0,
        tokenCount: mid,
      },
      {
        documentId: doc.id,
        content: textForChunks.slice(mid),
        chunkIndex: 1,
        tokenCount: textForChunks.length - mid,
      },
    ],
  });

  await prisma.announcement.create({
    data: {
      courseId: course.id,
      authorId: teacher.id,
      title: "Week 3 · studio format",
      body: "Bring low-fi wireframes for your trust affordances. We will gallery-walk in 25 minutes.",
      pinned: true,
    },
  });

  await prisma.discussionThread.create({
    data: {
      courseId: course.id,
      authorId: student.id,
      title: "How do we show provenance without noisy UI?",
      pinned: false,
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    "Seed OK. Accounts: admin@nexalearn.edu, teacher@nexalearn.edu, student@nexalearn.edu · password:",
    DEMO_PASSWORD,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
