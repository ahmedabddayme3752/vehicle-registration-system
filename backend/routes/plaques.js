const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const database = require('../database/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// @route   GET /api/vehicles
// @desc    Get all plaques
// @access  Private
router.get('/', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM plaques WHERE 1=1';
  let params = [];

  if (search) {
    query += ' AND (plate_number LIKE ? OR owner_name LIKE ? OR plaque_make LIKE ? OR plaque_model LIKE ?)';
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, vehicles) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM plaques WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (plate_number LIKE ? OR owner_name LIKE ? OR plaque_make LIKE ? OR plaque_model LIKE ?)';
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    db.get(countQuery, countParams, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({
        vehicles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    });
  });
});

// @route   GET /api/vehicles/:id
// @desc    Get plaque by ID
// @access  Private
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

// @route   GET /api/vehicles/plate/:plateNumber
// @desc    Get plaque by plate number
// @access  Private
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

// @route   POST /api/vehicles
// @desc    Register a new plaque
// @access  Private
router.post('/', [
  authMiddleware,
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('ownerEmail').isEmail().withMessage('Valid owner email is required'),
  body('ownerPhone').trim().notEmpty().withMessage('Owner phone is required'),
  body('vehicleType').trim().notEmpty().withMessage('Plaque type is required'),
  body('vehicleMake').trim().notEmpty().withMessage('Plaque make is required'),
  body('vehicleModel').trim().notEmpty().withMessage('Plaque model is required'),
  body('vehicleYear').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid plaque year is required'),
  body('vehicleColor').trim().notEmpty().withMessage('Plaque color is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    plateNumber,
    ownerName,
    ownerEmail,
    ownerPhone,
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehicleColor,
    expiryDate
  } = req.body;

  const db = database.getDb();

  // Check if plate number already exists
  db.get('SELECT * FROM plaques WHERE plate_number = ?', [plateNumber], (err, existingVehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (existingVehicle) {
      return res.status(400).json({ message: 'Plaque with this plate number already exists' });
    }

    // Insert new plaque
    const query = `
      INSERT INTO plaques (
        plate_number, owner_name, owner_email, owner_phone,
        plaque_type, plaque_make, plaque_model, plaque_year,
        plaque_color, expiry_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        plateNumber, ownerName, ownerEmail, ownerPhone,
        vehicleType, vehicleMake, vehicleModel, vehicleYear,
        vehicleColor, expiryDate, req.user.id
      ],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }

        // Get the created plaque
        db.get('SELECT * FROM plaques WHERE id = ?', [this.lastID], (err, vehicle) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }

          res.status(201).json({
            message: 'Plaque registered successfully',
            vehicle
          });
        });
      }
    );
  });
});

// @route   PUT /api/vehicles/:id
// @desc    Update plaque
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('plateNumber').optional().trim().notEmpty().withMessage('Plate number cannot be empty'),
  body('ownerName').optional().trim().notEmpty().withMessage('Owner name cannot be empty'),
  body('ownerEmail').optional().isEmail().withMessage('Valid owner email is required'),
  body('ownerPhone').optional().trim().notEmpty().withMessage('Owner phone cannot be empty'),
  body('vehicleType').optional().trim().notEmpty().withMessage('Plaque type cannot be empty'),
  body('vehicleMake').optional().trim().notEmpty().withMessage('Plaque make cannot be empty'),
  body('vehicleModel').optional().trim().notEmpty().withMessage('Plaque model cannot be empty'),
  body('vehicleYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid plaque year is required'),
  body('vehicleColor').optional().trim().notEmpty().withMessage('Plaque color cannot be empty'),
  body('expiryDate').optional().isISO8601().withMessage('Valid expiry date is required'),
  body('status').optional().isIn(['active', 'expired', 'suspended']).withMessage('Status must be active, expired, or suspended')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updateFields = req.body;
  const db = database.getDb();

  // Check if plaque exists
  db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Plaque not found' });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        // Convert camelCase to snake_case for database fields
        let dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        // Map vehicle_* fields to plaque_* fields
        if (dbField.startsWith('vehicle_')) {
          dbField = dbField.replace('vehicle_', 'plaque_');
        }
        fields.push(`${dbField} = ?`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE plaques SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Get updated plaque
      db.get('SELECT * FROM plaques WHERE id = ?', [id], (err, updatedVehicle) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          message: 'Plaque updated successfully',
          vehicle: updatedVehicle
        });
      });
    });
  });
});

// @route   DELETE /api/vehicles/:id
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

// @route   GET /api/vehicles/stats/overview
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