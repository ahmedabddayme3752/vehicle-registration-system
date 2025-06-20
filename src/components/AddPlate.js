/**
 * AddPlate Component - Person Registration Form
 * 
 * This component handles the registration of new persons in the system.
 * It collects personal information, generates plate numbers, and creates
 * QR codes containing all registration data.
 * 
 * Features:
 * - Personal information form with validation
 * - Automatic plate number generation (6-digit format)
 * - QR code generation with complete data
 * - Edit mode for updating existing registrations
 * - Form validation and error handling
 * 
 * @author Ahmed
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Navbar, Nav, NavDropdown, Alert, Spinner, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import ApiService from '../services/api';

/**
 * AddPlate Functional Component
 * 
 * Main component for person registration and plate generation.
 * Handles both new registrations and editing existing records.
 * 
 * @returns {JSX.Element} The rendered AddPlate component
 */
const AddPlate = () => {
  // ==================== HOOKS AND STATE MANAGEMENT ====================
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Edit mode detection from navigation state
  const editMode = location.state?.editMode || false;
  const existingPlaque = location.state?.plaqueData || null;

  /**
   * Form data state object
   * Contains all personal information fields for registration
   */
  const [formData, setFormData] = useState({
    // Personal identification
    nom: '',                    // Last name
    postNom: '',               // Middle name
    prenom: '',                // First name
    
    // Location information
    district: '',              // Administrative district
    territoire: '',            // Territory
    secteur: '',              // Sector
    village: '',              // Village
    province: '',             // Province name
    provinceCode: '10',       // Province code (default: Kongo Central)
    
    // Contact and personal details
    nationalite: '',          // Nationality
    adresse: '',              // Physical address
    telephone: '',            // Phone number
    email: ''                 // Email address
  });
  
  // Plate number and QR code states
  const [plateNumber, setPlateNumber] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  // ==================== COMPONENT LIFECYCLE ====================

  /**
   * Component initialization effect
   * Handles authentication check and edit mode setup
   */
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!ApiService.isAuthenticated()) {
      navigate('/');
      return;
    }

    // Pre-fill form in edit mode
    if (editMode && existingPlaque) {
      // Parse owner name into components (assuming "Last Middle First" format)
      const ownerNameParts = existingPlaque.owner_name?.split(' ') || ['', '', ''];
      
      setFormData({
        nom: ownerNameParts[0] || '',
        postNom: ownerNameParts[1] || '',
        prenom: ownerNameParts[2] || '',
        district: '',
        territoire: '',
        secteur: '',
        village: '',
        province: '',
        provinceCode: '10',
        nationalite: '',
        adresse: '',
        telephone: existingPlaque.owner_phone || '',
        email: existingPlaque.owner_email || ''
      });
      setPlateNumber(existingPlaque.plate_number || '');
    }
  }, [navigate, editMode, existingPlaque]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle form input changes
   * Updates the corresponding field in formData state
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * Generate random plate number
   * Creates a simple 6-digit plate number (e.g., "123456")
   * Resets QR code when new plate is generated
   */
  const handleGeneratePlate = () => {
    // Generate simple number like the old format
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6 digits
    const newPlateNumber = randomNum.toString();
    setPlateNumber(newPlateNumber);
    setQrCodeValue('');
  };

  /**
   * Generate QR code and submit registration
   * 
   * This function:
   * 1. Validates that all required fields are completed
   * 2. Creates complete data object for QR code
   * 3. Submits registration to backend API
   * 4. Generates QR code with all form data
   * 
   * @async
   */
  const handleGenerateQR = async () => {
    if (plateNumber && isFormComplete()) {
      // Complete data for QR code (includes all form fields)
      const completeData = {
        plateNumber: plateNumber,
        nom: formData.nom,
        postNom: formData.postNom,
        prenom: formData.prenom,
        district: formData.district,
        territoire: formData.territoire,
        secteur: formData.secteur,
        village: formData.village,
        province: formData.province,
        nationalite: formData.nationalite,
        adresse: formData.adresse,
        telephone: formData.telephone,
        email: formData.email,
        dateEnregistrement: new Date().toLocaleDateString('fr-FR')
      };

      try {
        setLoading(true);
        setError('');

        // Create plaque data for backend (keeping backend structure)
        const plaqueData = {
          plateNumber: plateNumber,
          ownerName: formData.nom + ' ' + formData.postNom + ' ' + formData.prenom,
          ownerEmail: formData.email,
          ownerPhone: formData.telephone,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        };

        let response;
        if (editMode && existingPlaque) {
          // Update existing plaque
          response = await ApiService.updatePlaque(existingPlaque.id, plaqueData);
          setSuccess('Plaque mise à jour avec succès!');
        } else {
          // Create new plaque
          response = await ApiService.createPlaque(plaqueData);
          setSuccess('Plaque enregistrée avec succès!');
        }
        
        // Generate QR code with ALL the form data
        setQrCodeValue(JSON.stringify(completeData));
      } catch (err) {
        setError(err.message || `Erreur lors de ${editMode ? 'la mise à jour' : 'l\'enregistrement'} de la plaque`);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Veuillez remplir tous les champs et générer un numéro de plaque');
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Check if all required form fields are completed
   * 
   * @returns {boolean} True if all required fields have values
   */
  const isFormComplete = () => {
    const requiredFields = [
      'nom', 'postNom', 'prenom', 'district', 'territoire', 
      'secteur', 'village', 'province', 'provinceCode', 'nationalite', 
      'adresse', 'telephone', 'email'
    ];
    
    return requiredFields.every(field => formData[field] && formData[field].trim() !== '') && plateNumber;
  };

  /**
   * Show QR code in modal
   */
  const handleShowQR = () => {
    setShowQR(true);
  };

  /**
   * Hide QR code modal
   */
  const handleCloseQR = () => {
    setShowQR(false);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    ApiService.logout();
  };

  /**
   * Navigate back to dashboard
   */
  const handleBack = () => {
    navigate('/dashboard');
  };

  // ==================== COMPONENT RENDER ====================

  return (
    <Container className="app-container p-0">
      {/* Application Header */}
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

      {/* Navigation Menu */}
      <div className="mb-4"></div>
      <Navbar expand="lg" className="nav-menu">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={handleBack}>Accueil</Nav.Link>
              <NavDropdown title="Plaques" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/add-plate" className="active">
                  {editMode ? 'Modifier' : 'Ajouter'}
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/plaques">Consulter</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#plaques/search">Modifier</NavDropdown.Item>
                <NavDropdown.Item href="#plaques/delete">Supprimer</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="/dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#department">Département</Nav.Link>
              <Nav.Link href="#statistics">Statistiques</Nav.Link>
            </Nav>
            <Button variant="dark" onClick={handleLogout}>Se déconnecter</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Form Container */}
      <div className="form-container">
        {/* Status Messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Person Registration Form */}
        <Form>
          {/* Personal Name Fields */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Nom</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="nom" 
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Kabila"
                disabled={loading}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Post-nom</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="postNom" 
                value={formData.postNom}
                onChange={handleChange}
                placeholder="Ex: Kabange"
                disabled={loading}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Prénom</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="prenom" 
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Ex: Joseph"
                disabled={loading}
              />
            </Col>
          </Row>

          {/* Location Information Fields */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>District</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="district" 
                value={formData.district}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner le district</option>
                <option value="Lukaya">Lukaya</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Bas-Congo">Bas-Congo</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Territoire</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="territoire" 
                value={formData.territoire}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner le territoire</option>
                <option value="Madimba">Madimba</option>
                <option value="Kasangulu">Kasangulu</option>
                <option value="Kimvula">Kimvula</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Secteur</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="secteur" 
                value={formData.secteur}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner le secteur</option>
                <option value="Secteur1">Secteur 1</option>
                <option value="Secteur2">Secteur 2</option>
                <option value="Secteur3">Secteur 3</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Village</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="village" 
                value={formData.village}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner le village</option>
                <option value="Ngeba">Ngeba</option>
                <option value="Kimpese">Kimpese</option>
                <option value="Mbanza-Ngungu">Mbanza-Ngungu</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Province</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="province" 
                value={formData.province}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner la province</option>
                <option value="Kongo-Central">Kongo-Central</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Kwilu">Kwilu</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Province Code Selection - All 26 DRC Provinces */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Code Province</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="provinceCode" 
                value={formData.provinceCode}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option value="01">01 - Kinshasa</option>
                <option value="02">02 - Bas-Uele</option>
                <option value="03">03 - Équateur</option>
                <option value="04">04 - Haut-Katanga</option>
                <option value="05">05 - Haut-Lomami</option>
                <option value="06">06 - Haut-Uele</option>
                <option value="07">07 - Ituri</option>
                <option value="08">08 - Kasaï</option>
                <option value="09">09 - Kasaï-Oriental</option>
                <option value="10">10 - Kongo Central</option>
                <option value="11">11 - Kwango</option>
                <option value="12">12 - Kwilu</option>
                <option value="13">13 - Lomami</option>
                <option value="14">14 - Lualaba</option>
                <option value="15">15 - Kasaï-Central</option>
                <option value="16">16 - Mai-Ndombe</option>
                <option value="17">17 - Maniema</option>
                <option value="18">18 - Mongala</option>
                <option value="19">19 - Nord-Kivu</option>
                <option value="20">20 - Nord-Ubangi</option>
                <option value="21">21 - Sankuru</option>
                <option value="22">22 - Sud-Kivu</option>
                <option value="23">23 - Sud-Ubangi</option>
                <option value="24">24 - Tanganyika</option>
                <option value="25">25 - Tshopo</option>
                <option value="26">26 - Tshuapa</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Personal Details */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Nationalité</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="nationalite" 
                value={formData.nationalite}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner la nationalité</option>
                <option value="Congolaise">Congolaise</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Adresse</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="adresse" 
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Ex: Avenue Kasa-Vubu, Commune de Gombe"
                disabled={loading}
              />
            </Col>
          </Row>

          {/* Contact Information */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Téléphone</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="telephone" 
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: +243 81 234 5678"
                disabled={loading}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>E-mail</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: joseph.kabila@email.com"
                disabled={loading}
              />
            </Col>
          </Row>

          {/* Plate Number Generation and QR Code Section */}
          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Numéro de plaque</Form.Label>
            </Col>
            <Col xs={4}>
              <Button 
                variant="success" 
                onClick={handleGeneratePlate}
                className="btn-generate-plate w-100"
                disabled={loading}
              >
                Générer numéro de plaque
              </Button>
            </Col>
            <Col xs={5}>
              <Button 
                variant="success" 
                onClick={handleGenerateQR}
                className="btn-generate-qr w-100"
                disabled={!plateNumber || !isFormComplete() || loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    {editMode ? 'Mise à jour...' : 'Génération...'}
                  </>
                ) : (
                  editMode ? 'Mettre à jour et générer QR' : 'Générer le code-barre'
                )}
              </Button>
            </Col>
          </Row>

          {/* Display Generated Plate Number and QR Code */}
          {plateNumber && (
            <Row className="mb-3">
              <Col xs={{span: 4, offset: 3}}>
                <div className="plate-number-display">
                  {plateNumber}
                </div>
              </Col>
              <Col xs={5}>
                {qrCodeValue && (
                  <div className="qr-code-container">
                    <QRCodeSVG 
                      value={qrCodeValue} 
                      size={120}
                      level="H"
                    />
                    <div className="mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleShowQR}
                      >
                        Agrandir QR Code
                      </Button>
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Form>
      </div>

      {/* QR Code Modal for Enlarged View */}
      <Modal show={showQR} onHide={handleCloseQR} centered>
        <Modal.Header closeButton>
          <Modal.Title>Code QR - {plateNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {qrCodeValue && (
            <>
              <div className="my-3">
                <QRCodeSVG 
                  value={qrCodeValue}
                  size={250}
                  level="H"
                />
              </div>
              <p className="text-muted">
                Numéro de plaque: <strong>{plateNumber}</strong>
              </p>
              <p className="text-muted">
                Propriétaire: <strong>{formData.nom} {formData.postNom} {formData.prenom}</strong>
              </p>
              <small className="text-info">
                Ce QR code contient toutes les informations de la plaque
              </small>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQR}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Application Footer */}
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
