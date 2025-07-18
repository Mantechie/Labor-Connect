import axiosInstance from '../utils/axiosInstance';

class ReviewService {
  // Get all reviews with filters
  async getReviews(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axiosInstance.get(`/reviews?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get review by ID
  async getReview(id) {
    try {
      const response = await axiosInstance.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new review
  async createReview(reviewData) {
    try {
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update review
  async updateReview(id, reviewData) {
    try {
      const response = await axiosInstance.put(`/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete review
  async deleteReview(id) {
    try {
      const response = await axiosInstance.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get reviews by laborer
  async getReviewsByLaborer(laborerId, filters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('laborerId', laborerId);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axiosInstance.get(`/reviews?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user's reviews
  async getUserReviews() {
    try {
      const response = await axiosInstance.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Check if user has reviewed laborer
  async hasReviewed(laborerId) {
    try {
      const response = await axiosInstance.get(`/reviews/check/${laborerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new ReviewService(); 