/**
 * Login Component - User Authentication Interface
 * 
 * This component handles user authentication for the plaque registration system.
 * It provides both login and registration functionality with form validation
 * and error handling.
 * 
 * Features:
 * - Tabbed interface for login and registration
 * - Form validation with error messages
 * - Demo credentials button for easy testing
 * - Automatic redirect if already authenticated
 * - Loading states and success messages
 * - Bootstrap styling with responsive design
 * 
 * @author Ahmed
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

/**
 * Login Functional Component
 * 
 * Main authentication component that handles user login and registration.
 * Redirects authenticated users to dashboard automatically.
 * 
 * @returns {JSX.Element} The rendered Login component
 */
const Login = () => {
  // ==================== HOOKS AND STATE MANAGEMENT ====================
  
  const navigate = useNavigate();
  
  // Active tab state (login or register)
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Registration form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ==================== COMPONENT LIFECYCLE ====================

  /**
   * Component initialization effect
   * Redirects to dashboard if user is already authenticated
   */
  useEffect(() => {
    // Check if user is already logged in
    if (ApiService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle login form input changes
   * 
   * @param {Event} e - Input change event
   */
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  /**
   * Handle registration form input changes
   * 
   * @param {Event} e - Input change event
   */
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
  };

  /**
   * Handle login form submission
   * Validates input and authenticates user with backend API
   * 
   * @param {Event} e - Form submit event
   * @async
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!loginData.email || !loginData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Attempt login with API service
      await ApiService.login(loginData.email, loginData.password);
      
      // Show success message and redirect
      setSuccess('Connexion réussie! Redirection...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle registration form submission
   * Validates input and creates new user account
   * 
   * @param {Event} e - Form submit event
   * @async
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    // Password confirmation validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // Password strength validation
    if (registerData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Attempt registration with API service
      await ApiService.register(registerData.username, registerData.email, registerData.password);
      
      // Show success message and redirect
      setSuccess('Inscription réussie! Redirection...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fill login form with demo credentials
   * Useful for testing and demonstrations
   */
  const handleDemoLogin = () => {
    setLoginData({
      email: 'admin@example.com',
      password: 'password'
    });
    setError('');
    setSuccess('Identifiants de démonstration chargés');
  };

  /**
   * Handle tab change between login and registration
   * Clears form data and messages when switching tabs
   * 
   * @param {string} tab - Target tab key ('login' or 'register')
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
    
    // Clear form data when switching tabs
    if (tab === 'login') {
      setRegisterData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setLoginData({
        email: '',
        password: ''
      });
    }
  };

  // ==================== COMPONENT RENDER ====================

  return (
    <Container className="app-container p-0">
      {/* Application Header */}
      <div className="app-header py-2">
        <h5 className="app-title">Système d'Enregistrement des Plaques</h5>
        <div className="header-content">
          <div className="header-text">
            <p className="mb-0">République Démocratique du Congo</p>
            <p>Ministère de Transport</p>
          </div>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg" 
            alt="DRC Flag" 
            className="app-flag" 
          />
        </div>
      </div>

      {/* Main Login Container */}
      <div className="login-container">
        <div className="login-form">
          <h3 className="text-center mb-4">Connexion au Système</h3>
          
          {/* Status Messages */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Tabbed Interface for Login/Register */}
          <Tabs 
            activeKey={activeTab} 
            onSelect={handleTabChange}
            className="mb-3"
            justify
          >
            {/* Login Tab */}
            <Tab eventKey="login" title="Se connecter">
              <Form onSubmit={handleLoginSubmit}>
                {/* Email Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Adresse Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Entrez votre email"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Entrez votre mot de passe"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Login Button */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Demo Credentials Button */}
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={handleDemoLogin}
                  disabled={loading}
                >
                  Utiliser les identifiants de démonstration
                </Button>
                
                {/* Demo Credentials Info */}
                <div className="mt-3 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Identifiants de démonstration:</strong><br />
                    Email: admin@example.com<br />
                    Mot de passe: password
                  </small>
                </div>
              </Form>
            </Tab>

            {/* Registration Tab */}
            <Tab eventKey="register" title="S'inscrire">
              <Form onSubmit={handleRegisterSubmit}>
                {/* Username Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Nom d'utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Choisissez un nom d'utilisateur"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Email Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Adresse Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Entrez votre email"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Choisissez un mot de passe (min. 6 caractères)"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Confirm Password Input */}
                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirmez votre mot de passe"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                {/* Register Button */}
                <Button 
                  variant="success" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Inscription...
                    </>
                  ) : (
                    'S\'inscrire'
                  )}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Application Footer */}
      <div className="text-center mt-5 mb-3">
        <img 
          src="https://www.gov.cd/assets/img/armoiries.png" 
          alt="DRC Logo" 
          className="logo-small" 
        />
        <p className="app-footer">Copyright 2024. Tous droits réservés.</p>
      </div>
    </Container>
  );
};

export default Login;
