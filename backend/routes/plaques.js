/**
 * Plaque Routes - API Endpoints for Plaque Management
 * 
 * This module defines all API endpoints related to plaque registration
 * and management in the system. It provides CRUD operations, search,
 * filtering, pagination, and statistics functionality.
 * 
 * Endpoints:
 * - GET /api/plaques - List plaques with pagination and filtering
 * - GET /api/plaques/:id - Get specific plaque by ID
 * - GET /api/plaques/plate/:plateNumber - Get plaque by plate number
 * - POST /api/plaques - Create new plaque registration
 * - PUT /api/plaques/:id - Update existing plaque
 * - DELETE /api/plaques/:id - Delete plaque (admin only)
 * - GET /api/plaques/stats/overview - Get system statistics
 * 
 * @author Ahmed
 * @version 1.0.0
 * @since 2024
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const database = require('../database/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// ==================== ROUTE HANDLERS ====================

/**
 * GET /api/plaques
 * Get list of plaques with pagination, search, and filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search term for plate number, owner name, email
 * - status: Filter by status (active, expired, suspended)
 * 
 * @route GET /api/plaques
 * @access Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Parse query parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build dynamic WHERE clause for filtering
    let whereClause = '';
    let params = [];

    // Add search functionality
    if (search) {
      whereClause += ' WHERE (plate_number LIKE ? OR owner_name LIKE ? OR owner_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add status filter
    if (status) {
      whereClause += search ? ' AND status = ?' : ' WHERE status = ?';
      params.push(status);
    }

    const db = database.getDb();

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM plaques${whereClause}`;
    const totalResult = await new Promise((resolve, reject) => {
      db.get(countQuery, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get paginated plaque data
    const query = `
      SELECT id, plate_number, owner_name, owner_email, owner_phone,
             registration_date, expiry_date, status, created_at
      FROM plaques${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const plaques = await new Promise((resolve, reject) => {
      db.all(query, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      plaques,
      pagination: {
        page,
        limit,
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching plaques:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des plaques' });
  }
});

/**
 * GET /api/plaques/:id
 * Get specific plaque by ID
 * 
 * @route GET /api/plaques/:id
 * @access Private
 */
router.get('/:id', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

  db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Plaque not found' });
    }

    res.json(vehicle);
  });
});

/**
 * GET /api/plaques/plate/:plateNumber
 * Get specific plaque by plate number
 * 
 * @route GET /api/plaques/plate/:plateNumber
 * @access Private
 */
router.get('/plate/:plateNumber', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { plateNumber } = req.params;

  db.get('SELECT * FROM plaques WHERE plate_number = ?', [plateNumber], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Plaque not found' });
    }

    res.json(vehicle);
  });
});

/**
 * POST /api/plaques
 * Create new plaque registration
 * 
 * Required fields:
 * - plateNumber: Unique plate identifier
 * - ownerName: Full name of the owner
 * - ownerEmail: Owner's email address
 * 
 * Optional fields:
 * - ownerPhone: Owner's phone number
 * - expiryDate: Registration expiry date (defaults to 1 year from now)
 * 
 * @route POST /api/plaques
 * @access Private
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { plateNumber, ownerName, ownerEmail, ownerPhone, expiryDate } = req.body;

    // Validate required fields
    if (!plateNumber || !ownerName || !ownerEmail) {
      return res.status(400).json({ 
        message: 'Numéro de plaque, nom du propriétaire et email sont requis' 
      });
    }

    const db = database.getDb();

    // Check if plate number already exists
    const existingPlaque = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM plaques WHERE plate_number = ?',
        [plateNumber],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existingPlaque) {
      return res.status(400).json({ 
        message: 'Ce numéro de plaque existe déjà' 
      });
    }

    // Insert new plaque with default values
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO plaques (
          plate_number, owner_name, owner_email, owner_phone,
          registration_date, expiry_date, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          plateNumber,
          ownerName,
          ownerEmail,
          ownerPhone || null,
          new Date().toISOString(),
          expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          'active',
          req.user.id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    res.status(201).json({
      message: 'Plaque créée avec succès',
      plaque: {
        id: result.id,
        plate_number: plateNumber,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error creating plaque:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la plaque' });
  }
});

/**
 * PUT /api/plaques/:id
 * Update existing plaque registration
 * 
 * @route PUT /api/plaques/:id
 * @access Private
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { plateNumber, ownerName, ownerEmail, ownerPhone, expiryDate } = req.body;

    // Validate required fields
    if (!plateNumber || !ownerName || !ownerEmail) {
      return res.status(400).json({ 
        message: 'Numéro de plaque, nom du propriétaire et email sont requis' 
      });
    }

    const db = database.getDb();

    // Check if plaque exists
    const existingPlaque = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingPlaque) {
      return res.status(404).json({ message: 'Plaque non trouvée' });
    }

    // Check if new plate number conflicts with another plaque
    if (plateNumber !== existingPlaque.plate_number) {
      const conflictPlaque = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM plaques WHERE plate_number = ? AND id != ?', [plateNumber, id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (conflictPlaque) {
        return res.status(400).json({ message: 'Ce numéro de plaque existe déjà' });
      }
    }

    // Update plaque
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE plaques SET 
         plate_number = ?, owner_name = ?, owner_email = ?, owner_phone = ?, expiry_date = ?
         WHERE id = ?`,
        [plateNumber, ownerName, ownerEmail, ownerPhone, expiryDate, id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Get updated plaque
    const updatedPlaque = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Plaque mise à jour avec succès',
      plaque: updatedPlaque
    });
  } catch (error) {
    console.error('Error updating plaque:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la plaque' });
  }
});

// @route   DELETE /api/plaques/:id
// @desc    Delete plaque
// @access  Private (Admin only)
router.delete('/:id', [authMiddleware, adminMiddleware], (req, res) => {
  const { id } = req.params;
  const db = database.getDb();

  db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Plaque not found' });
    }

    db.run('DELETE FROM plaques WHERE id = ?', [id], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({ message: 'Plaque deleted successfully' });
    });
  });
});

// @route   GET /api/plaques/stats/overview
// @desc    Get plaque statistics
// @access  Private
router.get('/stats/overview', authMiddleware, (req, res) => {
  const db = database.getDb();

  // Use a single query with CASE statements for better performance and reliability
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
      SUM(CASE WHEN status = 'active' AND date(expiry_date) <= date('now', '+30 days') THEN 1 ELSE 0 END) as expiring_soon
    FROM plaques
  `;

  db.get(statsQuery, (err, result) => {
    if (err) {
      console.error('Statistics query error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    // Handle case where table is empty
    const stats = {
      total: result?.total || 0,
      active: result?.active || 0,
      expired: result?.expired || 0,
      suspended: result?.suspended || 0,
      expiring_soon: result?.expiring_soon || 0
    };

    res.json(stats);
  });
});

module.exports = router; 