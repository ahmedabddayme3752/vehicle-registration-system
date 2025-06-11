const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(config.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  initializeTables() {
    return new Promise((resolve, reject) => {
      // Users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Plaques table - completely fresh schema
      const createPlaquesTable = `
        CREATE TABLE IF NOT EXISTS plaques (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plate_number VARCHAR(50) UNIQUE NOT NULL,
          owner_name VARCHAR(255) NOT NULL,
          owner_email VARCHAR(255) NOT NULL,
          owner_phone VARCHAR(50),
          registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiry_date DATETIME NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `;

      // Drop ALL old tables to start completely fresh
      const dropAllOldTables = [
        'DROP TABLE IF EXISTS vehicles',
        'DROP TABLE IF EXISTS plaques'
      ];

      // Create default admin user
      const createDefaultAdmin = `
        INSERT OR IGNORE INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      `;

      this.db.serialize(() => {
        // Drop all old tables first
        dropAllOldTables.forEach(dropQuery => {
          this.db.run(dropQuery, (err) => {
            if (err && !err.message.includes('no such table')) {
              console.error('Error dropping table:', err);
            }
          });
        });

        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
          console.log('✓ Users table ready');
        });

        this.db.run(createPlaquesTable, (err) => {
          if (err) {
            console.error('Error creating plaques table:', err);
            reject(err);
            return;
          }
          console.log('✓ Plaques table ready (fresh schema)');
        });

        this.db.run(createDefaultAdmin, (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('Error creating default admin:', err);
            reject(err);
            return;
          }
          console.log('✓ Default admin user ready');
          console.log('🎯 Database initialized with clean person registration schema');
          resolve();
        });
      });
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database(); 