import Chat from '../models/chat.js' // Chat Model

// @desc    Send a new message
// @route   POST /api/chats/send
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message, media } = req.body
    
     // Ensure sender matches authenticated user
    if (sender !== req.user.id) {
      return res.status(403).json({ message: 'Sender ID must match authenticated user' });
    }

    const newChat = new Chat({
      sender, // User ID of sender
      receiver, // User ID of receiver
      message, // text content
      media, // optional image/video URL
      isRead: false // Unread
    })

    const saved = await newChat.save()
    // returns a 201 Created response with the saved message.
    res.status(201).json({ message: 'Message sent', chat: saved })
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message })
  }
}

// @desc    Get chat messages between two users
// Filters out messages where isDeleted: true
// @route   GET /api/chats/:user1/:user2
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { user1, user2 } = req.params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Ensure user is authorized to view these messages
    if (user1 !== req.user.id && user2 !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }
    
      // Count total messages
    const total = await Chat.countDocuments({
      isDeleted: false,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    });

    // Finds messages
    const messages = await Chat.find({
      isDeleted: false,
      // Between the two users (in either direction)
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      messages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get chat history', error: err.message })
  }
}

// @desc    Get all chats for a user (optional for future use)
// @route   GET /api/chats/user/:userId
export const getUserChatHistory = async (req, res) => {
  try {
    const userId = req.params.userId
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Ensure user is authorized to view these messages
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const total = await Chat.countDocuments({
      isDeleted: false,
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const chats = await Chat.find({
      isDeleted: false,
      $or: [{ sender: userId }, { receiver: userId }],
    })
    .sort({ createdAt: -1 })
    .skip(skip)  // Add the missing dot here
    .limit(limit);

    res.status(200).json({
      chats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user chats', error: err.message })
  }
}


// @desc Mark messages from a specific user as read
// @route PUT /api/chats/read/:senderId
export const markMessagesAsRead = async (req, res) => {
  try {
    const receiverId = req.user.id // assuming auth middleware sets req.user
    const senderId = req.params.senderId
    
    //  Updates all unread messages from senderId to receiverId as read 
    await Chat.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { $set: { isRead: true } }
    )

    res.status(200).json({ message: 'Messages marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read', error: err.message })
  }
}

// @desc Soft-delete a message
// @route DELETE /api/chats/:chatId
export const deleteMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId
    const chat = await Chat.findById(chatId)
    
    // Handles missing messages
    if (!chat) return res.status(404).json({ message: 'Message not found' })

    // Add owner check(Authorization check) - only sender can delete
    if (String(chat.sender) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' })
    }

    chat.isDeleted = true
    await chat.save()

    res.status(200).json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message', error: err.message })
  }
}
