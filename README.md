# Système d'Enregistrement des Plaques - RDC

This is a React application for managing vehicle registration plates for the Democratic Republic of Congo (DRC) Ministry of Transport.

## Features

- User authentication (login/register)
- Plaque registration form
- Dashboard with statistics
- Plaque management (CRUD operations)
- QR code generation for plates
- Search and filtering capabilities
- Role-based access control (admin features)

## Technologies Used

### Frontend
- React 18
- React Router DOM
- React Bootstrap
- Bootstrap 5
- QR Code generation

### Backend
- Node.js
- Express.js
- SQLite database
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Frontend Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. The API will be available at [http://localhost:5000](http://localhost:5000)

## Default Admin Credentials
- Email: admin@example.com
- Password: password

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user

### Plaques
- GET `/api/vehicles` - Get all plaques (paginated)
- POST `/api/vehicles` - Register new plaque
- GET `/api/vehicles/:id` - Get plaque by ID
- PUT `/api/vehicles/:id` - Update plaque
- DELETE `/api/vehicles/:id` - Delete plaque (admin only)
- GET `/api/vehicles/stats/overview` - Get statistics

## Project Structure

```
vehicle-registration-system/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── AddPlate.js
│   │   ├── PlaqueList.js
│   │   └── ProtectedRoute.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── backend/
│   ├── config.js
│   ├── server.js
│   ├── database/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── auth.js
│       └── plaques.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
