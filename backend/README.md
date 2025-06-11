# Système d'Enregistrement des Plaques - Backend API

A comprehensive Node.js/Express backend API for the DRC Vehicle Registration System with SQLite database, JWT authentication, and full CRUD operations for plaque management.

## 🚀 Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control
- 🚗 **Plaque Management** - Complete CRUD operations for plaque registrations
- 📊 **Statistics & Analytics** - Dashboard statistics and reporting
- 🔍 **Search & Filtering** - Advanced search capabilities with pagination
- 🛡️ **Security** - Password hashing, input validation, and CORS protection
- 📱 **RESTful API** - Clean, well-documented API endpoints
- 🗄️ **SQLite Database** - Lightweight, file-based database with migrations

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vehicle-registration-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-here
   DB_PATH=./database/plaques.db
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify installation**
   The server will start and display:
   ```
   🚗 Plaque Registration System API running on port 5000
   📊 Environment: development
   🗄️  Database: ./database/plaques.db
   🌐 CORS enabled for frontend on port 3000
   ```

## 🔗 API Endpoints

### Authentication Endpoints

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Plaque Endpoints

#### Get All Plaques
```http
GET /api/vehicles?page=1&limit=10&search=ABC123&status=active
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term for plate number, owner, make, or model
- `status` (optional): Filter by status (active, expired, suspended)

#### Get Plaque by ID
```http
GET /api/vehicles/123
Authorization: Bearer <jwt-token>
```

#### Get Plaque by Plate Number
```http
GET /api/vehicles/plate/ABC123
Authorization: Bearer <jwt-token>
```

#### Register New Plaque
```http
POST /api/vehicles
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "plateNumber": "ABC123",
  "ownerName": "John Doe",
  "ownerEmail": "john@example.com",
  "ownerPhone": "+243123456789",
  "vehicleType": "Car",
  "vehicleMake": "Toyota",
  "vehicleModel": "Camry",
  "vehicleYear": 2023,
  "vehicleColor": "Blue",
  "expiryDate": "2024-12-31T23:59:59.000Z"
}
```

#### Update Plaque
```http
PUT /api/vehicles/123
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "suspended",
  "expiryDate": "2025-12-31T23:59:59.000Z"
}
```

#### Delete Plaque (Admin Only)
```http
DELETE /api/vehicles/123
Authorization: Bearer <jwt-token>
```

#### Get Statistics
```http
GET /api/vehicles/stats/overview
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "total": 150,
  "active": 120,
  "expired": 20,
  "suspended": 10,
  "expiring_soon": 15
}
```

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing user ID |
| username | TEXT UNIQUE | Username |
| email | TEXT UNIQUE | Email address |
| password | TEXT | Hashed password |
| role | TEXT | User role (user/admin) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Plaques Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing plaque ID |
| plate_number | TEXT UNIQUE | Unique plate number |
| owner_name | TEXT | Owner's full name |
| owner_email | TEXT | Owner's email |
| owner_phone | TEXT | Owner's phone number |
| vehicle_type | TEXT | Type of vehicle |
| vehicle_make | TEXT | Vehicle manufacturer |
| vehicle_model | TEXT | Vehicle model |
| vehicle_year | INTEGER | Manufacturing year |
| vehicle_color | TEXT | Vehicle color |
| registration_date | DATETIME | Registration date |
| expiry_date | DATETIME | Expiration date |
| status | TEXT | Status (active/expired/suspended) |
| created_by | INTEGER | ID of user who created the record |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Default Admin Account
- **Email:** admin@example.com
- **Password:** password
- **Role:** admin

## 🛡️ Security Features

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Input Validation:** express-validator for request validation
- **CORS Protection:** Configured for frontend origin
- **Role-based Access:** Admin-only endpoints protected
- **SQL Injection Prevention:** Parameterized queries

## 📁 Project Structure

```
backend/
├── config.js              # Configuration settings
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── database/
│   ├── database.js        # Database connection and setup
│   └── plaques.db        # SQLite database file
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   └── plaques.js        # Plaque management routes
└── README.md             # This file
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secure-production-jwt-secret
DB_PATH=/path/to/production/database/plaques.db
```

### PM2 Deployment
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "plaque-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📝 API Response Format

### Success Response
```json
{
  "message": "Plaque registered successfully",
  "plaque": {
    "id": 123,
    "plate_number": "ABC123",
    "owner_name": "John Doe",
    "status": "active",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "plateNumber",
      "message": "Plate number is required"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository. 