const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const database = require('../database/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get('/', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { page = 1, limit = 10, search = '', status = '' } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM vehicles WHERE 1=1';
  let params = [];

  if (search) {
    query += ' AND (plate_number LIKE ? OR owner_name LIKE ? OR vehicle_make LIKE ? OR vehicle_model LIKE ?)';
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
    let countQuery = 'SELECT COUNT(*) as total FROM vehicles WHERE 1=1';
    let countParams = [];

    if (search) {
      countQuery += ' AND (plate_number LIKE ? OR owner_name LIKE ? OR vehicle_make LIKE ? OR vehicle_model LIKE ?)';
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
// @desc    Get vehicle by ID
// @access  Private
router.get('/:id', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

  db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  });
});

// @route   GET /api/vehicles/plate/:plateNumber
// @desc    Get vehicle by plate number
// @access  Private
router.get('/plate/:plateNumber', authMiddleware, (req, res) => {
  const db = database.getDb();
  const { plateNumber } = req.params;

  db.get('SELECT * FROM vehicles WHERE plate_number = ?', [plateNumber], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  });
});

// @route   POST /api/vehicles
// @desc    Register a new vehicle
// @access  Private
router.post('/', [
  authMiddleware,
  body('plateNumber').trim().notEmpty().withMessage('Plate number is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('ownerEmail').isEmail().withMessage('Valid owner email is required'),
  body('ownerPhone').trim().notEmpty().withMessage('Owner phone is required'),
  body('vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
  body('vehicleMake').trim().notEmpty().withMessage('Vehicle make is required'),
  body('vehicleModel').trim().notEmpty().withMessage('Vehicle model is required'),
  body('vehicleYear').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid vehicle year is required'),
  body('vehicleColor').trim().notEmpty().withMessage('Vehicle color is required'),
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
  db.get('SELECT * FROM vehicles WHERE plate_number = ?', [plateNumber], (err, existingVehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (existingVehicle) {
      return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
    }

    // Insert new vehicle
    const query = `
      INSERT INTO vehicles (
        plate_number, owner_name, owner_email, owner_phone,
        vehicle_type, vehicle_make, vehicle_model, vehicle_year,
        vehicle_color, expiry_date, created_by
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

        // Get the created vehicle
        db.get('SELECT * FROM vehicles WHERE id = ?', [this.lastID], (err, vehicle) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }

          res.status(201).json({
            message: 'Vehicle registered successfully',
            vehicle
          });
        });
      }
    );
  });
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private
router.put('/:id', [
  authMiddleware,
  body('plateNumber').optional().trim().notEmpty().withMessage('Plate number cannot be empty'),
  body('ownerName').optional().trim().notEmpty().withMessage('Owner name cannot be empty'),
  body('ownerEmail').optional().isEmail().withMessage('Valid owner email is required'),
  body('ownerPhone').optional().trim().notEmpty().withMessage('Owner phone cannot be empty'),
  body('vehicleType').optional().trim().notEmpty().withMessage('Vehicle type cannot be empty'),
  body('vehicleMake').optional().trim().notEmpty().withMessage('Vehicle make cannot be empty'),
  body('vehicleModel').optional().trim().notEmpty().withMessage('Vehicle model cannot be empty'),
  body('vehicleYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid vehicle year is required'),
  body('vehicleColor').optional().trim().notEmpty().withMessage('Vehicle color cannot be empty'),
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

  // Check if vehicle exists
  db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Build update query dynamically
    const fields = [];
    const values = [];

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        // Convert camelCase to snake_case for database fields
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = ?`);
        values.push(updateFields[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Get updated vehicle
      db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, updatedVehicle) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }

        res.json({
          message: 'Vehicle updated successfully',
          vehicle: updatedVehicle
        });
      });
    });
  });
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Admin only)
router.delete('/:id', [authMiddleware, adminMiddleware], (req, res) => {
  const { id } = req.params;
  const db = database.getDb();

  db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, vehicle) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    db.run('DELETE FROM vehicles WHERE id = ?', [id], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({ message: 'Vehicle deleted successfully' });
    });
  });
});

// @route   GET /api/vehicles/stats/overview
// @desc    Get vehicle statistics
// @access  Private
router.get('/stats/overview', authMiddleware, (req, res) => {
  const db = database.getDb();

  const queries = [
    'SELECT COUNT(*) as total FROM vehicles',
    'SELECT COUNT(*) as active FROM vehicles WHERE status = "active"',
    'SELECT COUNT(*) as expired FROM vehicles WHERE status = "expired"',
    'SELECT COUNT(*) as suspended FROM vehicles WHERE status = "suspended"',
    'SELECT COUNT(*) as expiring_soon FROM vehicles WHERE status = "active" AND date(expiry_date) <= date("now", "+30 days")'
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  })).then(results => {
    res.json({
      total: results[0].total,
      active: results[1].active,
      expired: results[2].expired,
      suspended: results[3].suspended,
      expiring_soon: results[4].expiring_soon
    });
  }).catch(err => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  });
});

module.exports = router; 