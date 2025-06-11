const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Set current user in localStorage
  setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Make HTTP request with auth headers
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

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

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // If unauthorized, clear auth data
      if (error.message.includes('unauthorized') || error.message.includes('token')) {
        this.removeAuthToken();
        window.location.href = '/';
      }
      
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setAuthToken(data.token);
      this.setCurrentUser(data.user);
    }

    return data;
  }

  async register(username, email, password) {
    const data = await this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (data.token) {
      this.setAuthToken(data.token);
      this.setCurrentUser(data.user);
    }

    return data;
  }

  async getCurrentUserProfile() {
    return await this.makeRequest('/auth/me');
  }

  logout() {
    this.removeAuthToken();
    window.location.href = '/';
  }

  // Plaque methods
  async getPlaques(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(queryString ? `/vehicles?${queryString}` : '/vehicles');
  }

  async getPlaqueById(id) {
    return this.makeRequest(`/vehicles/${id}`);
  }

  async getPlaqueByPlateNumber(plateNumber) {
    return this.makeRequest(`/vehicles/plate/${plateNumber}`);
  }

  async createPlaque(plaqueData) {
    return this.makeRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(plaqueData),
    });
  }

  // Legacy method names for backward compatibility
  async createVehicle(vehicleData) {
    return this.createPlaque(vehicleData);
  }

  async updatePlaque(id, plaqueData) {
    return this.makeRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plaqueData),
    });
  }

  // Legacy method names for backward compatibility
  async updateVehicle(id, vehicleData) {
    return this.updatePlaque(id, vehicleData);
  }

  async deletePlaque(id) {
    return this.makeRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Legacy method names for backward compatibility
  async deleteVehicle(id) {
    return this.deletePlaque(id);
  }

  async getPlaqueStats() {
    return this.makeRequest('/vehicles/stats/overview');
  }

  // Legacy method names for backward compatibility
  async getVehicleStats() {
    return this.getPlaqueStats();
  }

  async getVehicles(params = {}) {
    return this.getPlaques(params);
  }

  async getVehicleById(id) {
    return this.getPlaqueById(id);
  }

  async getVehicleByPlateNumber(plateNumber) {
    return this.getPlaqueByPlateNumber(plateNumber);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}

export default new ApiService(); 