import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const AddPlate = () => {
  const navigate = useNavigate();
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
    email: ''
  });
  const [plateNumber, setPlateNumber] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleGeneratePlate = () => {
    // In a real app, this would call an API to generate a plate number
    // For this demo, we'll just generate a fixed number
    setPlateNumber(`0001/01/A`);
    setShowQR(false);
  };

  const handleGenerateQR = () => {
    if (plateNumber) {
      // Use the plate number for the QR code
      setQrCodeValue(plateNumber);
    }
  };

  const handleLogout = () => {
    navigate('/');
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
              <NavDropdown title="Plaques" id="basic-nav-dropdown" active>
                <NavDropdown.Item href="#action/3.1">Consulter</NavDropdown.Item>
                <NavDropdown.Item active>Ajouter</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Modifier</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.4">Supprimer</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="#dashboard">Dashboard</Nav.Link>
              <Nav.Link href="#department">Département</Nav.Link>
              <Nav.Link href="#statistics">Statistiques</Nav.Link>
            </Nav>
            <Button variant="dark" onClick={handleLogout}>Se déconnecter</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="form-container">
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
              >
                <option>Sélectionner le secteur</option>
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
              >
                <option>Sélectionner le secteur</option>
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
              >
                <option>Sélectionner le secteur</option>
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
              />
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
              >
                Générer numéro de plaque
              </Button>
            </Col>
            <Col xs={5}>
              <Button 
                variant="success" 
                onClick={handleGenerateQR}
                className="btn-generate-qr w-100"
                disabled={!plateNumber}
              >
                Générer le code-barre
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
                  </div>
                )}
              </Col>
            </Row>
          )}


        </Form>
      </div>

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
