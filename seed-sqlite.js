const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

async function seed() {
  const dbPath = path.resolve(__dirname, 'dev.db');
  const db = new sqlite3.Database(dbPath);

  const passwordHash = await bcrypt.hash('password123', 10);
  const securityAnswerHash = await bcrypt.hash('delhi', 10);

  const run = (query, params) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

  const get = (query, params) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  try {
    console.log('Seeding SQLite directly...');

    // Users
    await run(`INSERT OR IGNORE INTO "User" (id, email, name, passwordHash, role, securityQuestion, securityAnswerHash, loginAttempts, isSuspended, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`, 
      ['user_admin_123', 'admin@institute.edu', 'System Administrator', passwordHash, 'ADMIN', 'What city were you born in?', securityAnswerHash]
    );

    await run(`INSERT OR IGNORE INTO "User" (id, email, name, passwordHash, role, securityQuestion, securityAnswerHash, loginAttempts, isSuspended, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))`, 
      ['user_student_123', 'student@institute.edu', 'John Doe', passwordHash, 'USER', 'What city were you born in?', securityAnswerHash]
    );

    // Items
    const items = [
      ['item_1', 'LOST', 'Blue Backpack', 'Jansport blue backpack.', 'Accessories', 'Main Library', new Date().toISOString(), null, 'PUBLISHED', 'user_student_123'],
      ['item_2', 'FOUND', 'iPhone 13 Pro', 'Black iPhone 13 Pro.', 'Electronics', 'Cafeteria', new Date().toISOString(), null, 'PUBLISHED', 'user_admin_123'],
      ['item_3', 'FOUND', 'Student ID Card', 'ID card belonging to Sarah Jenkins.', 'Documents', 'Library Front Desk', new Date(Date.now() - 172800000).toISOString(), null, 'PENDING_VERIFICATION', 'user_student_123'],
      ['item_4', 'LOST', 'Silver Water Bottle', 'Milton silver thermal flask, 1 liter.', 'Other', 'Sports Complex', new Date(Date.now() - 259200000).toISOString(), null, 'PUBLISHED', 'user_student_123']
    ];

    for (const item of items) {
      await run(`INSERT OR IGNORE INTO "Item" (id, type, name, description, category, location, date, imagePath, status, reporterId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`, item);
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    db.close();
  }
}

seed();
