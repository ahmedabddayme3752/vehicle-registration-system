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

      // Vehicles table
      const createVehiclesTable = `
        CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plate_number TEXT UNIQUE NOT NULL,
          owner_name TEXT NOT NULL,
          owner_email TEXT NOT NULL,
          owner_phone TEXT NOT NULL,
          vehicle_type TEXT NOT NULL,
          vehicle_make TEXT NOT NULL,
          vehicle_model TEXT NOT NULL,
          vehicle_year INTEGER NOT NULL,
          vehicle_color TEXT NOT NULL,
          registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiry_date DATETIME NOT NULL,
          status TEXT DEFAULT 'active',
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `;

      // Create default admin user
      const createDefaultAdmin = `
        INSERT OR IGNORE INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
      `;

      this.db.serialize(() => {
        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createVehiclesTable, (err) => {
          if (err) {
            console.error('Error creating vehicles table:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createDefaultAdmin, (err) => {
          if (err && !err.message.includes('UNIQUE constraint failed')) {
            console.error('Error creating default admin:', err);
            reject(err);
            return;
          }
          console.log('Database tables initialized successfully');
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