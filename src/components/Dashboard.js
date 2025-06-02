import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Button } from 'react-bootstrap';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <Container className="app-container p-0">
      <div className="app-header py-2">
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

      <div className="mb-4"></div>
      <Navbar expand="lg" className="nav-menu">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#">Accueil</Nav.Link>
              <NavDropdown title="Plaques" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/add-plate">Ajouter</NavDropdown.Item>
                <NavDropdown.Item href="#">Consulter</NavDropdown.Item>
                <NavDropdown.Item href="#">Modifier</NavDropdown.Item>
                <NavDropdown.Item href="#">Supprimer</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#">Département</Nav.Link>
              <Nav.Link href="#">Statistiques</Nav.Link>
            </Nav>
            <Button variant="dark" onClick={handleLogout}>Se déconnecter</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="p-4">
        <h4>Bienvenue dans le système de gestion des plaques d'immatriculation</h4>
        <p>Utilisez le menu ci-dessus pour naviguer dans l'application.</p>
      </div>

      <div className="text-center mb-3 mt-5">
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

export default Dashboard;
