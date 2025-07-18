import axiosInstance from '../utils/axiosInstance';

class JobService {
  // Get all jobs with filters
  async getJobs(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      const response = await axiosInstance.get(`/jobs?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get job by ID
  async getJob(id) {
    try {
      const response = await axiosInstance.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new job
  async createJob(jobData) {
    try {
      const response = await axiosInstance.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update job
  async updateJob(id, jobData) {
    try {
      const response = await axiosInstance.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete job
  async deleteJob(id) {
    try {
      const response = await axiosInstance.delete(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Assign laborer to job
  async assignLaborer(jobId, laborerId) {
    try {
      const response = await axiosInstance.patch(`/jobs/${jobId}/assign`, { laborerId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Update job status
  async updateJobStatus(jobId, status) {
    try {
      const response = await axiosInstance.patch(`/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user's jobs
  async getUserJobs() {
    try {
      const response = await axiosInstance.get('/jobs/my-jobs');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new JobService(); 