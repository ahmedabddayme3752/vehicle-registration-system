import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddPlate from './components/AddPlate';
import PlaqueList from './components/PlaqueList';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-plate" 
            element={
              <ProtectedRoute>
                <AddPlate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plaques"
            element={
              <ProtectedRoute>
                <PlaqueList />
              </ProtectedRoute>
            } 
          />
          {/* Legacy route for backward compatibility */}
          <Route 
            path="/vehicles"
            element={
              <ProtectedRoute>
                <PlaqueList />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
