import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['plumber', 'electrician', 'mason', 'carpenter', 'painter', 'welder', 'other'],
    },
    location: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    media: [
      {
        type: String, // URLs for any uploaded job images or documents
      },
    ],
    contact: {
      phone: String,
      email: String,
    },
    assignedLaborer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Laborer' if using separate model
    },
    status: {
      type: String,
      enum: ['open', 'in progress', 'completed', 'cancelled'],
      default: 'open',
    },
    scheduledDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for frequently queried fields
jobSchema.index({ category: 1 });
jobSchema.index({ location: 'text' });
jobSchema.index({ budget: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ postedBy: 1 });

const Job = mongoose.model('Job', jobSchema)
export default Job
