import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['user_complaint', 'payment_dispute', 'system_issue', 'other'] 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'investigating', 'resolved', 'closed'] 
  },
  priority: { 
    type: String, 
    default: 'medium', 
    enum: ['low', 'medium', 'high', 'critical'] 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  reportedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  adminNotes: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);
