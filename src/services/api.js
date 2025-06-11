/**
 * API Service for Plaque Registration System
 * 
 * This service handles all HTTP requests to the backend API.
 * It manages authentication, token storage, and provides methods
 * for all plaque-related operations.
 * 
 * @author Ahmed
 * @version 1.0.0
 * @since 2024
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * ApiService Class
 * 
 * Singleton service class that handles all API communications
 * with the backend server. Includes authentication management,
 * token handling, and CRUD operations for plaques.
 */
class ApiService {
  /**
   * Initialize the API service with base configuration
   */
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ==================== AUTHENTICATION MANAGEMENT ====================

  /**
   * Retrieve authentication token from browser's localStorage
   * @returns {string|null} JWT token or null if not found
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Store authentication token in browser's localStorage
   * @param {string} token - JWT authentication token
   */
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  /**
   * Remove authentication data from localStorage
   * Clears both token and user information
   */
  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user information from localStorage
   * @returns {Object|null} User object or null if not found
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Store current user information in localStorage
   * @param {Object} user - User object containing id, username, email, role
   */
  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ==================== HTTP REQUEST HANDLER ====================

  /**
   * Make authenticated HTTP request to the API
   * 
   * This is the core method that handles all API communications.
   * It automatically adds authentication headers and handles errors.
   * 
   * @param {string} endpoint - API endpoint (e.g., '/plaques', '/auth/login')
   * @param {Object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<Object>} Response data from the API
   * @throws {Error} If request fails or returns error status
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    // Configure request with default headers and authentication
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle HTTP error responses
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Auto-logout on authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        this.removeAuthToken();
        window.location.href = '/';
      }
      
      throw error;
    }
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================

  /**
   * Authenticate user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response with token and user data
   * @throws {Error} If login credentials are invalid
   */
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store authentication data on successful login
    if (data.token) {
      this.setAuthToken(data.token);
      this.setCurrentUser(data.user);
    }

    return data;
  }

  /**
   * Register new user account
   * 
   * @param {string} username - Desired username
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Registration response with token and user data
   * @throws {Error} If registration fails (e.g., email already exists)
   */
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    // Store authentication data on successful registration
    if (data.token) {
      this.setAuthToken(data.token);
      this.setCurrentUser(data.user);
    }

    return data;
  }

  /**
   * Get current user profile from server
   * 
   * @returns {Promise<Object>} Current user profile data
   * @throws {Error} If user is not authenticated
   */
  async getCurrentUserProfile() {
    return await this.request('/auth/me');
  }

  /**
   * Log out current user
   * Clears all authentication data and redirects to login page
   */
  logout() {
    this.removeAuthToken();
    window.location.href = '/';
  }

  // ==================== PLAQUE MANAGEMENT ENDPOINTS ====================

  /**
   * Get list of plaques with optional filtering and pagination
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number for pagination
   * @param {number} params.limit - Number of items per page
   * @param {string} params.search - Search term for filtering
   * @param {string} params.status - Filter by status (active, expired, suspended)
   * @returns {Promise<Object>} Paginated list of plaques
   */
  async getPlaques(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request(queryString ? `/plaques?${queryString}` : '/plaques');
    return response;
  }

  /**
   * Get specific plaque by ID
   * 
   * @param {number} id - Plaque ID
   * @returns {Promise<Object>} Plaque details
   * @throws {Error} If plaque not found
   */
  async getPlaqueById(id) {
    return this.request(`/plaques/${id}`);
  }

  /**
   * Get specific plaque by plate number
   * 
   * @param {string} plateNumber - Plate number to search for
   * @returns {Promise<Object>} Plaque details
   * @throws {Error} If plaque not found
   */
  async getPlaqueByPlateNumber(plateNumber) {
    return this.request(`/plaques/plate/${plateNumber}`);
  }

  /**
   * Create new plaque registration
   * 
   * @param {Object} plaqueData - Plaque registration data
   * @param {string} plaqueData.plateNumber - Generated plate number
   * @param {string} plaqueData.ownerName - Full name of the owner
   * @param {string} plaqueData.ownerEmail - Owner's email address
   * @param {string} plaqueData.ownerPhone - Owner's phone number
   * @param {string} plaqueData.expiryDate - Expiration date (ISO string)
   * @returns {Promise<Object>} Created plaque data
   * @throws {Error} If creation fails or plate number already exists
   */
  async createPlaque(plaqueData) {
    return this.request('/plaques', {
      method: 'POST',
      body: JSON.stringify(plaqueData)
    });
  }

  /**
   * Update existing plaque registration
   * 
   * @param {number} id - Plaque ID to update
   * @param {Object} plaqueData - Updated plaque data
   * @returns {Promise<Object>} Updated plaque data
   * @throws {Error} If update fails or plaque not found
   */
  async updatePlaque(id, plaqueData) {
    return this.request(`/plaques/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plaqueData)
    });
  }

  /**
   * Delete plaque registration (Admin only)
   * 
   * @param {number} id - Plaque ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} If deletion fails or user lacks permissions
   */
  async deletePlaque(id) {
    return this.request(`/plaques/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get plaque statistics and overview data
   * 
   * @returns {Promise<Object>} Statistics object with counts
   * @returns {number} returns.total - Total number of plaques
   * @returns {number} returns.active - Number of active plaques
   * @returns {number} returns.expired - Number of expired plaques
   * @returns {number} returns.expiring_soon - Number of plaques expiring within 30 days
   */
  async getPlaqueStats() {
    return this.request('/plaques/stats/overview');
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================
  // These methods maintain backward compatibility with old "vehicle" terminology

  /**
   * @deprecated Use getPlaqueStats() instead
   * Legacy method for backward compatibility
   */
  async getVehicleStats() {
    return this.getPlaqueStats();
  }

  /**
   * @deprecated Use getPlaques() instead
   * Legacy method for backward compatibility
   */
  async getVehicles(params = {}) {
    return this.getPlaques(params);
  }

  /**
   * @deprecated Use getPlaqueById() instead
   * Legacy method for backward compatibility
   */
  async getVehicleById(id) {
    return this.getPlaqueById(id);
  }

  /**
   * @deprecated Use getPlaqueByPlateNumber() instead
   * Legacy method for backward compatibility
   */
  async getVehicleByPlateNumber(plateNumber) {
    return this.getPlaqueByPlateNumber(plateNumber);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if current user is authenticated
   * 
   * @returns {boolean} True if user has valid token and user data
   */
  isAuthenticated() {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Check if current user has admin privileges
   * 
   * @returns {boolean} True if user is authenticated and has admin role
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}

// Export singleton instance
export default new ApiService(); 