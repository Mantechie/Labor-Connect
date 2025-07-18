import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Laborer', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  message: { type: String },
  appliedAt: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
export default JobApplication; 