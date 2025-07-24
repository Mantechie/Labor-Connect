import axios from '../utils/axiosInstance';

const submitReport = async (reportData) => {
  const response = await axios.post('/support/report', reportData);
  return response.data;
};

export default {
  submitReport,
};
