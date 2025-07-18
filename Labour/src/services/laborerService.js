import axiosInstance from '../utils/axiosInstance';

class LaborerService {
  // Get laborer dashboard
  async getDashboard() {
    try {
      const response = await axiosInstance.get('/laborers/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get all laborers (for admin)
  async getAllLaborers() {
    try {
      const response = await axiosInstance.get('/laborers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get laborer by ID
  async getLaborer(id) {
    try {
      const response = await axiosInstance.get(`/laborers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update laborer profile
  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put('/laborers/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update specialization
  async updateSpecialization(specialization) {
    try {
      const response = await axiosInstance.put('/laborers/specialization', { specialization });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update availability
  async updateAvailability(isAvailable) {
    try {
      const response = await axiosInstance.patch('/laborers/availability', { isAvailable });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Upload portfolio
  async uploadPortfolio(files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('portfolio', file);
      });
      
      const response = await axiosInstance.post('/laborers/portfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Upload work media
  async uploadWorkMedia(files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('media', file);
      });
      
      const response = await axiosInstance.post('/laborers/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get assigned jobs
  async getAssignedJobs() {
    try {
      const response = await axiosInstance.get('/laborers/jobs');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Search laborers
  async searchLaborers(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axiosInstance.get(`/laborers/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new LaborerService(); 