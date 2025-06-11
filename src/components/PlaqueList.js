import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, Table, Button, Form, Row, Col, Navbar, Nav, NavDropdown, 
  Alert, Spinner, Pagination, Modal, Badge 
} from 'react-bootstrap';
import ApiService from '../services/api';

const PlaqueList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [plaques, setPlaques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlaques, setTotalPlaques] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit] = useState(10);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [plaqueToDelete, setPlaqueToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!ApiService.isAuthenticated()) {
      navigate('/');
      return;
    }

    setUser(ApiService.getCurrentUser());
    loadPlaques();
  }, [navigate, currentPage, searchTerm, statusFilter]);

  const loadPlaques = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await ApiService.getPlaques(params);
      setPlaques(response.plaques || response.vehicles || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalPlaques(response.pagination?.total || 0);
    } catch (err) {
      setError('Erreur lors du chargement des plaques');
      console.error('Error loading plaques:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPlaques();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDeleteClick = (plaque) => {
    setPlaqueToDelete(plaque);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!plaqueToDelete) return;

    try {
      setDeleting(true);
      await ApiService.deletePlaque(plaqueToDelete.id);
      setSuccess(`Plaque ${plaqueToDelete.plate_number} supprimée avec succès`);
      setShowDeleteModal(false);
      setPlaqueToDelete(null);
      loadPlaques(); // Reload the list
    } catch (err) {
      setError('Erreur lors de la suppression de la plaque');
      console.error('Error deleting plaque:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlaqueToDelete(null);
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
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    return expiry <= thirtyDaysFromNow && expiry > today;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );

    return <Pagination className="justify-content-center">{items}</Pagination>;
  };

  return (
    <Container className="app-container p-0">
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

      <div className="mb-4"></div>
      <Navbar expand="lg" className="nav-menu">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Accueil</Nav.Link>
              <NavDropdown title="Plaques" id="basic-nav-dropdown">
                <NavDropdown.Item active>Consulter</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/add-plate">Ajouter</NavDropdown.Item>
                <NavDropdown.Item href="#plaques/search">Rechercher</NavDropdown.Item>
                {ApiService.isAdmin() && (
                  <NavDropdown.Item href="#admin">Administration</NavDropdown.Item>
                )}
              </NavDropdown>
              <Nav.Link as={Link} to="/dashboard">Tableau de bord</Nav.Link>
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Liste des plaques</h4>
          <Button as={Link} to="/add-plate" variant="success">
            ➕ Nouvelle plaque
          </Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Search and Filter */}
        <Row className="mb-4">
          <Col md={6}>
            <Form onSubmit={handleSearch}>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Rechercher par plaque, propriétaire, marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="outline-primary" className="ms-2">
                  🔍
                </Button>
              </div>
            </Form>
          </Col>
          <Col md={6}>
            <div className="d-flex gap-2">
              <Button
                variant={statusFilter === '' ? 'primary' : 'outline-primary'}
                onClick={() => handleStatusFilterChange('')}
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'success' : 'outline-success'}
                onClick={() => handleStatusFilterChange('active')}
                size="sm"
              >
                Actifs
              </Button>
              <Button
                variant={statusFilter === 'expired' ? 'danger' : 'outline-danger'}
                onClick={() => handleStatusFilterChange('expired')}
                size="sm"
              >
                Expirés
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'warning' : 'outline-warning'}
                onClick={() => handleStatusFilterChange('suspended')}
                size="sm"
              >
                Suspendus
              </Button>
            </div>
          </Col>
        </Row>

        {/* Results Summary */}
        <div className="mb-3">
          <small className="text-muted">
            Affichage de {plaques.length} plaques sur {totalPlaques} au total
            {searchTerm && ` (recherche: "${searchTerm}")`}
            {statusFilter && ` (statut: ${statusFilter})`}
          </small>
        </div>

        {/* Plaques Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
            <p className="mt-2">Chargement des plaques...</p>
          </div>
        ) : plaques.length > 0 ? (
          <>
            <Table responsive striped hover>
              <thead className="table-dark">
                <tr>
                  <th>Plaque</th>
                  <th>Propriétaire</th>
                  <th>Plaque Info</th>
                  <th>Type</th>
                  <th>Couleur</th>
                  <th>Statut</th>
                  <th>Expiration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plaques.map((plaque) => (
                  <tr key={plaque.id}>
                    <td>
                      <strong>{plaque.plate_number}</strong>
                      {isExpiringSoon(plaque.expiry_date) && (
                        <Badge bg="warning" className="ms-2">⚠️</Badge>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{plaque.owner_name}</strong>
                        <br />
                        <small className="text-muted">{plaque.owner_email}</small>
                      </div>
                    </td>
                    <td>
                      {plaque.plaque_make || plaque.vehicle_make} {plaque.plaque_model || plaque.vehicle_model}
                      <br />
                      <small className="text-muted">{plaque.plaque_year || plaque.vehicle_year}</small>
                    </td>
                    <td>{plaque.plaque_type || plaque.vehicle_type}</td>
                    <td>{plaque.plaque_color || plaque.vehicle_color}</td>
                    <td>{getStatusBadge(plaque.status)}</td>
                    <td>
                      {formatDate(plaque.expiry_date)}
                      {isExpiringSoon(plaque.expiry_date) && (
                        <small className="text-warning d-block">Expire bientôt</small>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline-info"
                          title="Voir détails"
                        >
                          👁️
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-warning"
                          title="Modifier"
                        >
                          ✏️
                        </Button>
                        {ApiService.isAdmin() && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            title="Supprimer"
                            onClick={() => handleDeleteClick(plaque)}
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-5">
            <h5>Aucune plaque trouvée</h5>
            <p className="text-muted">
              {searchTerm || statusFilter 
                ? 'Essayez de modifier vos critères de recherche.' 
                : 'Commencez par enregistrer votre première plaque.'
              }
            </p>
            <Button as={Link} to="/add-plate" variant="primary">
              Enregistrer une plaque
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {plaqueToDelete && (
            <div>
              <p>Êtes-vous sûr de vouloir supprimer cette plaque ?</p>
              <div className="bg-light p-3 rounded">
                <strong>Plaque:</strong> {plaqueToDelete.plate_number}<br />
                <strong>Propriétaire:</strong> {plaqueToDelete.owner_name}<br />
                <strong>Plaque:</strong> {plaqueToDelete.plaque_make || plaqueToDelete.vehicle_make} {plaqueToDelete.plaque_model || plaqueToDelete.vehicle_model}
              </div>
              <p className="text-danger mt-2">
                <small>⚠️ Cette action est irréversible.</small>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel} disabled={deleting}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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

export default PlaqueList; 