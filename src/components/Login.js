import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would validate credentials against a backend
    // For this demo, we'll just navigate to the dashboard
    navigate('/dashboard');
  };

  return (
    <Container className="app-container">
      <div className="app-header mt-3 mb-3">
        <h5 className="app-title">App NEW TEC DRC</h5>
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

      <Form className="login-form" onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Row>
            <Col xs={4} className="text-end">
              <Form.Label>Matricule</Form.Label>
            </Col>
            <Col xs={8}>
              <Form.Control 
                type="text" 
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Col>
          </Row>
        </Form.Group>

        <div className="text-center">
          <Button 
            variant="danger" 
            type="submit" 
            className="px-4"
          >
            Se connecter
          </Button>
        </div>
      </Form>

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
