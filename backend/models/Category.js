import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // e.g. 'Mason'
  hindiTitle: { type: String }, // e.g. 'राज मिस्त्री'
  iconUrl: { type: String }, // URL or icon class
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);
export default Category; 