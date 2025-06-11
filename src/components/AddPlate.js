import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Navbar, Nav, NavDropdown, Alert, Spinner, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import ApiService from '../services/api';

const AddPlate = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [registeredVehicle, setRegisteredVehicle] = useState(null);

  const [formData, setFormData] = useState({
    plateNumber: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    expiryDate: ''
  });

  useEffect(() => {
    // Check authentication
    if (!ApiService.isAuthenticated()) {
      navigate('/');
      return;
    }

    setUser(ApiService.getCurrentUser());
    
    // Set default expiry date (1 year from now)
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormData(prev => ({
      ...prev,
      expiryDate: nextYear.toISOString().split('T')[0]
    }));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const generatePlateNumber = () => {
    // Generate a unique plate number (in real app, this would be from backend)
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `DRC-${randomNum}-${timestamp}`;
  };

  const handleGeneratePlate = () => {
    const newPlateNumber = generatePlateNumber();
    setFormData({
      ...formData,
      plateNumber: newPlateNumber
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'plateNumber', 'ownerName', 'ownerEmail', 'ownerPhone',
      'vehicleType', 'vehicleMake', 'vehicleModel', 'vehicleYear', 
      'vehicleColor', 'expiryDate'
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`Le champ ${field} est requis`);
        return false;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.ownerEmail)) {
      setError('Adresse email invalide');
      return false;
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (formData.vehicleYear < 1900 || formData.vehicleYear > currentYear + 1) {
      setError('Année du véhicule invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const vehicleData = {
        plateNumber: formData.plateNumber,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerPhone: formData.ownerPhone,
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: parseInt(formData.vehicleYear),
        vehicleColor: formData.vehicleColor,
        expiryDate: new Date(formData.expiryDate).toISOString()
      };

      const response = await ApiService.createVehicle(vehicleData);
      
      setRegisteredVehicle(response.vehicle);
      setSuccess('Véhicule enregistré avec succès!');
      
      // Reset form
      setFormData({
        plateNumber: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        vehicleType: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: new Date().getFullYear(),
        vehicleColor: '',
        expiryDate: ''
      });

      // Set new expiry date
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        expiryDate: nextYear.toISOString().split('T')[0]
      }));

    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement du véhicule');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
  };

  const handleCloseQR = () => {
    setShowQR(false);
  };

  const handleLogout = () => {
    ApiService.logout();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

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
              <Nav.Link onClick={handleBack}>Accueil</Nav.Link>
              <NavDropdown title="Véhicules" id="basic-nav-dropdown" show>
                <NavDropdown.Item href="#vehicles">Consulter</NavDropdown.Item>
                <NavDropdown.Item active>Ajouter</NavDropdown.Item>
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

      <div className="form-container">
        <h4 className="mb-4">Enregistrement d'un nouveau véhicule</h4>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Plate Number Section */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Numéro de plaque*</Form.Label>
            </Col>
            <Col xs={6}>
              <Form.Control 
                type="text" 
                name="plateNumber" 
                value={formData.plateNumber}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: DRC-123-456789"
              />
            </Col>
            <Col xs={3}>
              <Button 
                variant="outline-primary" 
                onClick={handleGeneratePlate}
                disabled={loading}
                className="w-100"
              >
                Générer
              </Button>
            </Col>
          </Row>

          {/* Owner Information */}
          <h5 className="mt-4 mb-3">Informations du propriétaire</h5>
          
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Nom complet*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="ownerName" 
                value={formData.ownerName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: Jean Baptiste Mukendi"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Email*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="email" 
                name="ownerEmail" 
                value={formData.ownerEmail}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: jean.mukendi@example.com"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Téléphone*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="tel" 
                name="ownerPhone" 
                value={formData.ownerPhone}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: +243 900 000 000"
              />
            </Col>
          </Row>

          {/* Vehicle Information */}
          <h5 className="mt-4 mb-3">Informations du véhicule</h5>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Type de véhicule*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleType" 
                value={formData.vehicleType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionner le type</option>
                <option value="Voiture">Voiture</option>
                <option value="Moto">Moto</option>
                <option value="Camion">Camion</option>
                <option value="Bus">Bus</option>
                <option value="Minibus">Minibus</option>
                <option value="SUV">SUV</option>
                <option value="Pickup">Pickup</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Marque*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="vehicleMake" 
                value={formData.vehicleMake}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: Toyota, Nissan, Honda"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Modèle*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="vehicleModel" 
                value={formData.vehicleModel}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ex: Corolla, Altima, Civic"
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Année*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleYear" 
                value={formData.vehicleYear}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Couleur*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleColor" 
                value={formData.vehicleColor}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionner la couleur</option>
                <option value="Blanc">Blanc</option>
                <option value="Noir">Noir</option>
                <option value="Gris">Gris</option>
                <option value="Rouge">Rouge</option>
                <option value="Bleu">Bleu</option>
                <option value="Vert">Vert</option>
                <option value="Jaune">Jaune</option>
                <option value="Marron">Marron</option>
                <option value="Argent">Argent</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Date d'expiration*</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="date" 
                name="expiryDate" 
                value={formData.expiryDate}
                onChange={handleChange}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </Col>
          </Row>

          {/* Submit Buttons */}
          <Row className="mt-4">
            <Col xs={3}></Col>
            <Col xs={9}>
              <div className="d-flex gap-2">
                <Button 
                  variant="success" 
                  type="submit"
                  disabled={loading}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer le véhicule'
                  )}
                </Button>
                
                {registeredVehicle && (
                  <Button 
                    variant="outline-primary" 
                    onClick={handleShowQR}
                    disabled={loading}
                  >
                    📱 Générer QR Code
                  </Button>
                )}
                
                <Button 
                  variant="secondary" 
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Retour
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>

      {/* QR Code Modal */}
      <Modal show={showQR} onHide={handleCloseQR} centered>
        <Modal.Header closeButton>
          <Modal.Title>Code QR du véhicule</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {registeredVehicle && (
            <>
              <h5>{registeredVehicle.plate_number}</h5>
              <div className="my-3">
                <QRCodeSVG 
                  value={JSON.stringify({
                    plateNumber: registeredVehicle.plate_number,
                    ownerName: registeredVehicle.owner_name,
                    vehicleMake: registeredVehicle.vehicle_make,
                    vehicleModel: registeredVehicle.vehicle_model,
                    expiryDate: registeredVehicle.expiry_date
                  })}
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-muted">
                Scannez ce code pour voir les détails du véhicule
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQR}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

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

export default AddPlate;
