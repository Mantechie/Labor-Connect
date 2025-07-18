import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import config from '../config/env.js'
import User from '../models/User.js'
import Message from '../models/Message.js'
import Chat from '../models/chat.js'

let io

// Initialize Socket.IO
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.CORS_ORIGIN,
      methods: ['GET', 'POST']
    }
  })

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, config.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      
      if (!user) {
        return next(new Error('User not found'))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error('Authentication error'))
    }
  })

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.user.name} (${socket.user._id})`)
    
    // Join user's personal room
    socket.join(socket.user._id.toString())

    // Handle joining chat rooms
    socket.on('join-chat', (chatId) => {
      socket.join(chatId)
      console.log(`💬 User ${socket.user.name} joined chat: ${chatId}`)
    })

    // Handle leaving chat rooms
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId)
      console.log(`👋 User ${socket.user.name} left chat: ${chatId}`)
    })

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, messageType = 'text' } = data

        // Create new message
        const newMessage = new Message({
          chat: chatId,
          sender: socket.user._id,
          content,
          messageType
        })

        await newMessage.save()

        // Populate sender info
        await newMessage.populate('sender', 'name email')

        // Emit to all users in the chat
        io.to(chatId).emit('new-message', {
          message: newMessage,
          chatId
        })

        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
          lastActivity: new Date()
        })

        console.log(`💬 Message sent in chat ${chatId} by ${socket.user.name}`)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing-start', (chatId) => {
      socket.to(chatId).emit('user-typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        chatId
      })
    })

    socket.on('typing-stop', (chatId) => {
      socket.to(chatId).emit('user-stop-typing', {
        userId: socket.user._id,
        chatId
      })
    })

    // Handle online status
    socket.on('set-online', async () => {
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: true,
          lastSeen: new Date()
        })
        
        // Notify contacts that user is online
        socket.broadcast.emit('user-online', {
          userId: socket.user._id,
          userName: socket.user.name
        })
      } catch (error) {
        console.error('Error setting online status:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          lastSeen: new Date()
        })
        
        console.log(`👤 User disconnected: ${socket.user.name}`)
        
        // Notify contacts that user is offline
        socket.broadcast.emit('user-offline', {
          userId: socket.user._id,
          userName: socket.user.name
        })
      } catch (error) {
        console.error('Error setting offline status:', error)
      }
    })
  })

  return io
}

// Get Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

// Send notification to specific user
export const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId.toString()).emit('notification', notification)
  }
}

// Send notification to multiple users
export const sendNotificationToUsers = (userIds, notification) => {
  if (io) {
    userIds.forEach(userId => {
      io.to(userId.toString()).emit('notification', notification)
    })
  }
} 