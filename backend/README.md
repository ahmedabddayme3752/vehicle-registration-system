# Vehicle Registration System - Backend API

A comprehensive backend API for managing vehicle registrations with authentication, CRUD operations, and statistics.

## Features

- 🔐 **JWT Authentication** - Secure login/registration system
- 🚗 **Vehicle Management** - Complete CRUD operations for vehicle registrations
- 📊 **Statistics & Analytics** - Dashboard statistics and reporting
- 🔍 **Advanced Search** - Search and filter vehicles by multiple criteria
- 👥 **Role-based Access** - Admin and user role management
- 📱 **RESTful API** - Clean, well-documented API endpoints
- 🗄️ **SQLite Database** - Lightweight, file-based database
- ✅ **Input Validation** - Comprehensive request validation
- 🔄 **Pagination** - Efficient data pagination for large datasets

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs
- **CORS**: cors middleware

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

4. **Server will start on port 5000**:
   ```
   🚗 Vehicle Registration System API running on port 5000
   ```

## Environment Configuration

Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
DB_PATH=./database.sqlite
NODE_ENV=development
```

## Default Admin Account

The system creates a default admin account on first run:

- **Email**: `admin@example.com`
- **Password**: `password`

⚠️ **Important**: Change the default password in production!

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Vehicle Endpoints

#### Get All Vehicles
```http
GET /api/vehicles?page=1&limit=10&search=ABC123&status=active
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in plate number, owner name, make, model
- `status` (optional): Filter by status (active, expired, suspended)

#### Get Vehicle by ID
```http
GET /api/vehicles/1
Authorization: Bearer <jwt_token>
```

#### Get Vehicle by Plate Number
```http
GET /api/vehicles/plate/ABC123
Authorization: Bearer <jwt_token>
```

#### Register New Vehicle
```http
POST /api/vehicles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "plateNumber": "ABC123",
  "ownerName": "John Doe",
  "ownerEmail": "john@example.com",
  "ownerPhone": "+1234567890",
  "vehicleType": "Car",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2023,
  "vehicleColor": "Blue",
  "expiryDate": "2024-12-31T00:00:00Z"
}
```

#### Update Vehicle
```http
PUT /api/vehicles/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "expired",
  "expiryDate": "2025-12-31T00:00:00Z"
}
```

#### Delete Vehicle (Admin Only)
```http
DELETE /api/vehicles/1
Authorization: Bearer <jwt_token>
```

#### Get Statistics
```http
GET /api/vehicles/stats/overview
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "total": 150,
  "active": 120,
  "expired": 25,
  "suspended": 5,
  "expiring_soon": 8
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
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
);
```

## Error Handling

The API uses standard HTTP status codes and returns JSON error responses:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Common Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `500` - Internal server error

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 24 hours and need to be refreshed by logging in again.

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Project Structure

```
backend/
├── config.js              # Configuration management
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── database/
│   └── database.js        # Database setup and connection
├── middleware/
│   └── auth.js            # Authentication middleware
├── routes/
│   ├── auth.js            # Authentication routes
│   └── vehicles.js        # Vehicle management routes
└── README.md              # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 