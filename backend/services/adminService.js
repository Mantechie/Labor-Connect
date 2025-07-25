import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';
import Review from '../models/Review.js';

/**
 * Get admin dashboard statistics
 * @returns {Object} Dashboard statistics
 */
export const getAdminStatsService = async () => {
  // Use the optimized aggregation from above
  const statsResults = await User.aggregate([
    {
      $facet: {
        totalUsers: [
          { $match: { role: 'user' } },
          { $count: 'count' }
        ],
        verifiedLaborers: [
          { $match: { role: 'laborer', isVerified: true } },
          { $count: 'count' }
        ],
        pendingRequests: [
          { $match: { role: 'laborer', isVerified: false } },
          { $count: 'count' }
        ],
        activeLaborers: [
          { $match: { role: 'laborer', availability: 'available' } },
          { $count: 'count' }
        ],
        inactiveLaborers: [
          { $match: { role: 'laborer', availability: { $ne: 'available' } } },
          { $count: 'count' }
        ],
        avgRating: [
          { $match: { role: 'laborer', rating: { $gt: 0 } } },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]
      }
    }
  ]);

  const totalJobPosts = await Job.countDocuments();
  
  return {
    totalUsers: statsResults[0].totalUsers[0]?.count || 0,
    verifiedLaborers: statsResults[0].verifiedLaborers[0]?.count || 0,
    pendingRequests: statsResults[0].pendingRequests[0]?.count || 0,
    activeLaborers: statsResults[0].activeLaborers[0]?.count || 0,
    inactiveLaborers: statsResults[0].inactiveLaborers[0]?.count || 0,
    avgRating: statsResults[0].avgRating[0]?.avg || 0,
    totalJobPosts,
    complaintsReceived: 0 // To be implemented with actual Report model
  };
};

/**
 * Get users with pagination and filters
 * @param {Object} options - Query options
 * @returns {Object} Users and pagination data
 */
export const getUsersService = async (options) => {
  const { page = 1, limit = 10, search = '', role = '', status = '' } = options;
  
  // Build filter query
  const filter = {};
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;
  
  // Sanitize search input for regex
  if (search) {
    const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: sanitizedSearch, $options: 'i' } },
      { email: { $regex: sanitizedSearch, $options: 'i' } }
    ];
  }
  
  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Get users with pagination
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // Get total count
  const total = await User.countDocuments(filter);
  
  return {
    users,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit))
  };
};
