import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Navbar, Nav, NavDropdown, Alert, Spinner, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import ApiService from '../services/api';

const AddPlate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    postNom: '',
    prenom: '',
    district: '',
    territoire: '',
    secteur: '',
    village: '',
    province: '',
    nationalite: '',
    adresse: '',
    telephone: '',
    email: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: ''
  });
  
  const [plateNumber, setPlateNumber] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    // Check authentication
    if (!ApiService.isAuthenticated()) {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGeneratePlate = () => {
    // Generate a unique plate number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const newPlateNumber = `${randomNum}/${timestamp.slice(0,2)}/${timestamp.slice(2,3)}`;
    setPlateNumber(newPlateNumber);
    setQrCodeValue('');
  };

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
        vehicleType: formData.vehicleType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        vehicleColor: formData.vehicleColor,
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
          vehicleType: formData.vehicleType || 'Automobile',
          vehicleMake: formData.vehicleMake || 'Toyota',
          vehicleModel: formData.vehicleModel || 'Corolla',
          vehicleYear: formData.vehicleYear || new Date().getFullYear(),
          vehicleColor: formData.vehicleColor || 'Blanc',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        };

        const response = await ApiService.createPlaque(plaqueData);
        
        // Generate QR code with ALL the form data
        setQrCodeValue(JSON.stringify(completeData));
        setSuccess('Plaque enregistrée avec succès!');
      } catch (err) {
        setError(err.message || 'Erreur lors de l\'enregistrement de la plaque');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Veuillez remplir tous les champs et générer un numéro de plaque');
    }
  };

  // Check if all form fields are filled
  const isFormComplete = () => {
    const requiredFields = [
      'nom', 'postNom', 'prenom', 'district', 'territoire', 
      'secteur', 'village', 'province', 'nationalite', 
      'adresse', 'telephone', 'email', 'vehicleType', 
      'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor'
    ];
    
    return requiredFields.every(field => formData[field] && formData[field].trim() !== '') && plateNumber;
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
              <Nav.Link onClick={handleBack}>Accueil</Nav.Link>
              <NavDropdown title="Plaques" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/add-plate" className="active">Ajouter</NavDropdown.Item>
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

      <div className="form-container">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form>
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

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Type de véhicule</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleType" 
                value={formData.vehicleType}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner le type de véhicule</option>
                <option value="Automobile">Automobile</option>
                <option value="SUV">SUV</option>
                <option value="Pick-up">Pick-up</option>
                <option value="Camion">Camion</option>
                <option value="Camionnette">Camionnette</option>
                <option value="Bus">Bus</option>
                <option value="Minibus">Minibus</option>
                <option value="Moto">Moto</option>
                <option value="Scooter">Scooter</option>
                <option value="Tricycle">Tricycle</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Marque</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleMake" 
                value={formData.vehicleMake}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner la marque</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Nissan">Nissan</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
                <option value="Mazda">Mazda</option>
                <option value="Mitsubishi">Mitsubishi</option>
                <option value="Ford">Ford</option>
                <option value="Chevrolet">Chevrolet</option>
                <option value="Peugeot">Peugeot</option>
                <option value="Renault">Renault</option>
                <option value="Volkswagen">Volkswagen</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Modèle</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Control 
                type="text" 
                name="vehicleModel" 
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="Ex: Corolla, Civic, Sentra..."
                disabled={loading}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Année</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleYear" 
                value={formData.vehicleYear}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner l'année</option>
                {Array.from({length: 30}, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={3} className="text-end pt-2">
              <Form.Label>Couleur</Form.Label>
            </Col>
            <Col xs={9}>
              <Form.Select 
                name="vehicleColor" 
                value={formData.vehicleColor}
                onChange={handleChange}
                className="select-with-icon"
                disabled={loading}
              >
                <option>Sélectionner la couleur</option>
                <option value="Blanc">Blanc</option>
                <option value="Noir">Noir</option>
                <option value="Gris">Gris</option>
                <option value="Argent">Argent</option>
                <option value="Rouge">Rouge</option>
                <option value="Bleu">Bleu</option>
                <option value="Vert">Vert</option>
                <option value="Jaune">Jaune</option>
                <option value="Orange">Orange</option>
                <option value="Marron">Marron</option>
                <option value="Violet">Violet</option>
                <option value="Rose">Rose</option>
                <option value="Beige">Beige</option>
                <option value="Doré">Doré</option>
                <option value="Autre">Autre</option>
              </Form.Select>
            </Col>
          </Row>

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
                    Génération...
                  </>
                ) : (
                  'Générer le code-barre'
                )}
              </Button>
            </Col>
          </Row>

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

      {/* QR Code Modal */}
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
