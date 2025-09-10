// src/data/seed.command.ts
import { Command, CommandRunner } from 'nest-commander';
import { createClient } from '@supabase/supabase-js';
import { seedData } from './seed-data';

@Command({ name: 'seed', description: 'Seed database with initial data' })
export class SeedCommand extends CommandRunner {
  async run(): Promise<void> {
    console.log('Starting to seed data...');

    // Khởi tạo Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );

    const result = await seedData(supabase);

    if (result.success) {
      console.log(result.message);
      process.exit(0);
    } else {
      console.error(result.message);
      process.exit(1);
    }
  }
}
