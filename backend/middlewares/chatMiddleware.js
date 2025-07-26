import Chat from '../models/chat.js';

// Middleware to check if user is authorized to access a chat
export const isChatParticipant = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user.id;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is sender or receiver or admin
    if (String(chat.sender) !== userId && String(chat.receiver) !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }
    
    // Attach chat to request for later use
    req.chat = chat;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
