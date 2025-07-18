import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  type: { type: String, enum: ['job', 'laborer', 'other'], default: 'other' },
  message: { type: String, required: true },
  referenceId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);
export default Report; 