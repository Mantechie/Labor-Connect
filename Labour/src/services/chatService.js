import axiosInstance from '../utils/axiosInstance';

class ChatService {
  // Get all user chats
  async getChats() {
    try {
      const response = await axiosInstance.get('/chats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get chat by ID
  async getChat(id) {
    try {
      const response = await axiosInstance.get(`/chats/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Create new chat
  async createChat(participantId) {
    try {
      const response = await axiosInstance.post('/chats', { participantId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get chat messages
  async getMessages(chatId) {
    try {
      const response = await axiosInstance.get(`/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send message
  async sendMessage(chatId, content, messageType = 'text') {
    try {
      const response = await axiosInstance.post(`/chats/${chatId}/messages`, {
        content,
        messageType
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Send file/image message
  async sendFileMessage(chatId, file, messageType) {
    try {
      const formData = new FormData();
      formData.append('content', file);
      formData.append('messageType', messageType);
      
      const response = await axiosInstance.post(`/chats/${chatId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Mark messages as read
  async markAsRead(chatId) {
    try {
      const response = await axiosInstance.patch(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete chat
  async deleteChat(chatId) {
    try {
      const response = await axiosInstance.delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Delete message
  async deleteMessage(chatId, messageId) {
    try {
      const response = await axiosInstance.delete(`/chats/${chatId}/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}

export default new ChatService(); 