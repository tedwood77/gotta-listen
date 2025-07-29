#!/usr/bin/env node

const { Client } = require("pg")
require("dotenv").config()

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...")

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  })

  try {
    await client.connect()

    // Check if data already exists
    const { rows } = await client.query("SELECT COUNT(*) FROM users")
    if (Number.parseInt(rows[0].count) > 0) {
      console.log("✅ Database already has data, skipping seed")
      return
    }

    // Create sample users
    await client.query(`
      INSERT INTO users (id, email, username, display_name, bio, country, favorite_genres) VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'demo@gottalisten.com', 'demo_user', 'Demo User', 'Music lover and demo account', 'US', ARRAY['Rock', 'Pop']),
      ('550e8400-e29b-41d4-a716-446655440002', 'test@gottalisten.com', 'test_user', 'Test User', 'Another demo account for testing', 'CA', ARRAY['Electronic', 'Jazz'])
      ON CONFLICT (id) DO NOTHING;
    `)

    // Create sample posts
    await client.query(`
      INSERT INTO posts (user_id, title, artist, genre, explanation, tags) VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'Bohemian Rhapsody', 'Queen', 'Rock', 'This is a masterpiece that showcases the incredible range and creativity of Queen. The song takes you on a journey through different musical styles and emotions.', ARRAY['classic', 'epic']),
      ('550e8400-e29b-41d4-a716-446655440002', 'Clair de Lune', 'Claude Debussy', 'Classical', 'One of the most beautiful and peaceful pieces ever composed. Perfect for relaxation and contemplation.', ARRAY['peaceful', 'piano'])
      ON CONFLICT DO NOTHING;
    `)

    console.log("✅ Sample data seeded successfully")
  } catch (error) {
    console.error("❌ Seeding failed:", error.message)
    throw error
  } finally {
    await client.end()
  }
}

if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error("Seeding failed:", error)
    process.exit(1)
  })
}

module.exports = { seedDatabase }
