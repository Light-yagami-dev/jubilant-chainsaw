#!/usr/bin/env node

import { seedBiotechSyllabus } from "../seeds/biotech-syllabus";

async function main() {
  try {
    console.log("🚀 Starting database seeding process...");

    // Seed syllabus data
    await seedBiotechSyllabus();

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    process.exit(1);
  }
}

main();