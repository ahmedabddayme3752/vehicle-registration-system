import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Tab, Tabs } from 'react-bootstrap';
import ApiService from '../services/api';

const Login = () => {
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    if (ApiService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ApiService.login(loginData.email, loginData.password);
      setSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await ApiService.register(
        registerData.username,
        registerData.email,
        registerData.password
      );
      setSuccess('Registration successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setLoginData({
      email: 'admin@example.com',
      password: 'password'
    });
  };

  return (
    <Container className="app-container">
      <div className="app-header mt-3 mb-3">
        <h5 className="app-title">Vehicle Registration System</h5>
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

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        justify
      >
        <Tab eventKey="login" title="Se connecter">
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Email</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="email" 
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    disabled={loading}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Mot de passe</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    disabled={loading}
                  />
                </Col>
              </Row>
            </Form.Group>

            <div className="text-center mb-3">
              <Button 
                variant="danger" 
                type="submit" 
                className="px-4 me-2"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <Button 
                variant="outline-secondary" 
                type="button" 
                size="sm"
                onClick={fillDemoCredentials}
                disabled={loading}
              >
                Demo Admin
              </Button>
            </div>
          </Form>
        </Tab>

        <Tab eventKey="register" title="S'inscrire">
          <Form onSubmit={handleRegisterSubmit}>
            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Nom d'utilisateur</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="text" 
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                    disabled={loading}
                    minLength={3}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Email</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="email" 
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                    disabled={loading}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Mot de passe</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="password" 
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Row>
                <Col xs={4} className="text-end">
                  <Form.Label>Confirmer</Form.Label>
                </Col>
                <Col xs={8}>
                  <Form.Control 
                    type="password" 
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </Col>
              </Row>
            </Form.Group>

            <div className="text-center">
              <Button 
                variant="success" 
                type="submit" 
                className="px-4"
                disabled={loading}
              >
                {loading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </div>
          </Form>
        </Tab>
      </Tabs>

      <div className="text-center mb-3">
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
