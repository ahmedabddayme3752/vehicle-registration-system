import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Nav, Navbar, NavDropdown, Button, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import ApiService from '../services/api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentVehicles, setRecentVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!ApiService.isAuthenticated()) {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user profile, stats, and recent vehicles in parallel
      const [userProfile, vehicleStats, vehiclesResponse] = await Promise.all([
        ApiService.getCurrentUserProfile(),
        ApiService.getVehicleStats(),
        ApiService.getVehicles({ page: 1, limit: 5 }) // Get latest 5 vehicles
      ]);

      setUser(userProfile);
      setStats(vehicleStats);
      setRecentVehicles(vehiclesResponse.vehicles || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    ApiService.logout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'success', text: 'Actif' },
      expired: { variant: 'danger', text: 'Expiré' },
      suspended: { variant: 'warning', text: 'Suspendu' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <Container className="app-container p-0">
        <div className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement du tableau de bord...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="app-container p-0">
      <div className="app-header py-2">
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

      <div className="mb-4"></div>
      <Navbar expand="lg" className="nav-menu">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#/dashboard">Accueil</Nav.Link>
              <NavDropdown title="Véhicules" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/add-plate">Ajouter</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/vehicles">Consulter</NavDropdown.Item>
                <NavDropdown.Item href="#vehicles/search">Rechercher</NavDropdown.Item>
                {ApiService.isAdmin() && (
                  <NavDropdown.Item href="#admin">Administration</NavDropdown.Item>
                )}
              </NavDropdown>
              <Nav.Link href="/dashboard">Tableau de bord</Nav.Link>
              <Nav.Link href="#statistics">Statistiques</Nav.Link>
            </Nav>
            <NavDropdown title={`👤 ${user?.username || 'Utilisateur'}`} id="user-nav-dropdown">
              <NavDropdown.Item href="#profile">Profil</NavDropdown.Item>
              <NavDropdown.Item href="#settings">Paramètres</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Se déconnecter</NavDropdown.Item>
            </NavDropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="p-4">
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Bienvenue, {user?.username}!</h4>
          <div>
            <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-primary'} me-2`}>
              {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title className="text-primary">{stats.total}</Card.Title>
                  <Card.Text>Total Véhicules</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title className="text-success">{stats.active}</Card.Title>
                  <Card.Text>Véhicules Actifs</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title className="text-danger">{stats.expired}</Card.Title>
                  <Card.Text>Véhicules Expirés</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title className="text-warning">{stats.expiring_soon}</Card.Title>
                  <Card.Text>Expire Bientôt</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Recent Vehicles */}
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Véhicules Récents</h5>
                <Button as={Link} to="/add-plate" variant="primary" size="sm">
                  Ajouter Véhicule
                </Button>
              </Card.Header>
              <Card.Body>
                {recentVehicles.length > 0 ? (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Plaque</th>
                        <th>Propriétaire</th>
                        <th>Marque</th>
                        <th>Modèle</th>
                        <th>Statut</th>
                        <th>Date d'expiration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentVehicles.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>
                            <strong>{vehicle.plate_number}</strong>
                          </td>
                          <td>{vehicle.owner_name}</td>
                          <td>{vehicle.vehicle_make}</td>
                          <td>{vehicle.vehicle_model}</td>
                          <td>{getStatusBadge(vehicle.status)}</td>
                          <td>{formatDate(vehicle.expiry_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">Aucun véhicule enregistré pour le moment.</p>
                    <Button as={Link} to="/add-plate" variant="primary">
                      Enregistrer le premier véhicule
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mt-4">
          <Col md={12}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Actions Rapides</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  <Button as={Link} to="/add-plate" variant="success">
                    ➕ Nouveau Véhicule
                  </Button>
                  <Button href="#vehicles/search" variant="info">
                    🔍 Rechercher
                  </Button>
                  <Button href="#statistics" variant="warning">
                    📊 Voir Statistiques
                  </Button>
                  {ApiService.isAdmin() && (
                    <Button href="#admin" variant="danger">
                      ⚙️ Administration
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
