import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, isAdmin } from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/ratelimiter.js';

const router = express.Router();

// Public routes
router.get('/', apiLimiter, getCategories);
router.get('/:id', apiLimiter, getCategoryById);

// Admin routes
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router;
