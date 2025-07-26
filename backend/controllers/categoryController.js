import Category from '../models/Category.js';
import { logger } from '../utils/Logger.js';
import config from '../config/env.js';

// Create a memory cache instance for categories
import { MemoryCache } from '../utils/cacheUtils.js';
export const categoryCache = new MemoryCache(600); // 10 minutes TTL

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = async (req, res) => {
  const cacheKey = 'all_categories';
  
  try {
    // Check cache first
    const cachedCategories = categoryCache.get(cacheKey);
    if (cachedCategories) {
      logger.info('Categories served from cache', { 
        count: cachedCategories.length,
        source: 'cache'
      });
      return res.json(cachedCategories);
    }

    // If not in cache, fetch from database
    let categories = await Category.find({});
    
    // Seed logic - only in development or test environments
    if (categories.length === 0 && ['development', 'test'].includes(config.NODE_ENV)) {
      logger.info('Seeding categories as none exist', { environment: config.NODE_ENV });
      
      categories = await Category.insertMany([
        { title: 'Mason', hindiTitle: 'राज मिस्त्री', iconUrl: 'https://cdn-icons-png.flaticon.com/128/7857/7857909.png' },
        { title: 'Construction Laborer', hindiTitle: 'निर्माण मजदूर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10036/10036255.png' },
        { title: 'Welder', hindiTitle: 'वेल्डर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/9439/9439182.png' },
        { title: 'Electrician', hindiTitle: 'बिजली मिस्त्री', iconUrl: 'https://cdn-icons-png.flaticon.com/128/307/307943.png' },
        { title: 'Plumber', hindiTitle: 'प्लंबर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10365/10365972.png' },
        { title: 'Painter', hindiTitle: 'पेंटर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/1995/1995491.png' },
        { title: 'Housekeeping Staff', hindiTitle: 'सफाई कर्मचारी', iconUrl: 'https://cdn-icons-png.flaticon.com/128/995/995066.png' },
        { title: 'Cook / Kitchen Helper', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/1830/1830839.png' },
        { title: 'Driver', hindiTitle: 'ड्राइवर', iconUrl: 'https://cdn-icons-png.flaticon.com/128/4900/4900915.png' },
        { title: 'Caretaker / Watchman', hindiTitle: 'चौकीदार', iconUrl: 'https://cdn-icons-png.flaticon.com/128/10047/10047446.png' },
        { title: 'AC / Appliance Technician', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/9936/9936516.png' },
        { title: 'Gardener', hindiTitle: 'माली', iconUrl:'https://cdn-icons-png.flaticon.com/128/1544/1544052.png' },
        { title: 'Furniture Carpenter', hindiTitle: 'बढ़ई',  iconUrl: 'https://cdn-icons-png.flaticon.com/128/307/307963.png' },
        { title: 'Crane Operator', hindiTitle: '', iconUrl: 'https://cdn-icons-png.flaticon.com/128/3129/3129531.png' },
        // ...add more as needed
      ]);
      
      logger.info('Categories seeded successfully', { count: categories.length });
    }
    
    // Store in cache for future requests
    categoryCache.set(cacheKey, categories);
    
    logger.info('Categories fetched successfully', { 
      count: categories.length,
      source: 'database'
    });
    
    res.json(categories);
  } catch (err) {
    logger.error('Failed to fetch categories', { 
      error: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred while fetching categories'
    });
  }
};

/**
 * Get a single category by ID
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      logger.warn('Category ID not provided');
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    // Check cache first
    const cacheKey = `category_${id}`;
    const cachedCategory = categoryCache.get(cacheKey);
    
    if (cachedCategory) {
      logger.info(`Category ${id} served from cache`);
      return res.json(cachedCategory);
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      logger.warn(`Category not found with ID: ${id}`);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Store in cache
    categoryCache.set(cacheKey, category);
    
    logger.info(`Category ${id} fetched successfully`);
    res.json(category);
  } catch (err) {
    logger.error(`Failed to fetch category by ID: ${req.params.id}`, { 
      error: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch category',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred while fetching the category'
    });
  }
};

/**
 * Create a new category
 * @route POST /api/categories
 * @access Private/Admin
 */
export const createCategory = async (req, res) => {
  try {
    const { title, hindiTitle, iconUrl } = req.body;
    
    // Basic validation
    if (!title) {
      logger.warn('Category creation failed: Title is required');
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ title });
    if (existingCategory) {
      logger.warn(`Category creation failed: Category with title "${title}" already exists`);
      return res.status(400).json({ error: 'Category with this title already exists' });
    }
    
    const category = await Category.create({
      title,
      hindiTitle: hindiTitle || '',
      iconUrl: iconUrl || ''
    });
    
    // Invalidate cache
    categoryCache.delete('all_categories');
    
    logger.info('New category created successfully', { 
      categoryId: category._id,
      title: category.title
    });
    
    res.status(201).json(category);
  } catch (err) {
    logger.error('Failed to create category', { 
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      error: 'Failed to create category',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred while creating the category'
    });
  }
};

/**
 * Update a category
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, hindiTitle, iconUrl } = req.body;
    
    if (!id) {
      logger.warn('Category update failed: ID is required');
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    // Find category
    const category = await Category.findById(id);
    
    if (!category) {
      logger.warn(`Category update failed: Category not found with ID: ${id}`);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if title is being changed and if it already exists
    if (title && title !== category.title) {
      const existingCategory = await Category.findOne({ title });
      if (existingCategory) {
        logger.warn(`Category update failed: Category with title "${title}" already exists`);
        return res.status(400).json({ error: 'Category with this title already exists' });
      }
    }
    
    // Update fields
    category.title = title || category.title;
    category.hindiTitle = hindiTitle !== undefined ? hindiTitle : category.hindiTitle;
    category.iconUrl = iconUrl || category.iconUrl;
    
    const updatedCategory = await category.save();
    
    // Invalidate cache
    categoryCache.delete('all_categories');
    categoryCache.delete(`category_${id}`);
    
    logger.info(`Category ${id} updated successfully`, {
      categoryId: id,
      updatedFields: Object.keys(req.body)
    });
    
    res.json(updatedCategory);
  } catch (err) {
    logger.error(`Failed to update category ${req.params.id}`, { 
      error: err.message,
      stack: err.stack,
      categoryId: req.params.id,
      requestBody: req.body
    });
    
    res.status(500).json({ 
      error: 'Failed to update category',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred while updating the category'
    });
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      logger.warn('Category deletion failed: ID is required');
      return res.status(400).json({ error: 'Category ID is required' });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      logger.warn(`Category deletion failed: Category not found with ID: ${id}`);
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await category.remove();
    
    // Invalidate cache
    categoryCache.delete('all_categories');
    categoryCache.delete(`category_${id}`);
    
    logger.info(`Category ${id} deleted successfully`, {
      categoryId: id,
      categoryTitle: category.title
    });
    
    res.json({ message: 'Category removed successfully' });
  } catch (err) {
    logger.error(`Failed to delete category ${req.params.id}`, { 
      error: err.message,
      stack: err.stack,
      categoryId: req.params.id
    });
    
    res.status(500).json({ 
      error: 'Failed to delete category',
      message: config.NODE_ENV === 'development' ? err.message : 'An error occurred while deleting the category'
    });
  }
};