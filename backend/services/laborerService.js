import Laborer from '../models/Laborer.js';
import { logger } from '../utils/Logger.js';
import { Parser } from 'json2csv';
import { Readable } from 'stream';

/**
 * Get laborers with pagination and filters
 * 
 * @param {Object} filter - MongoDB filter object
 * @param {Object} sort - MongoDB sort object
 * @param {Number} skip - Number of documents to skip
 * @param {Number} limit - Number of documents to return
 * @returns {Promise<Array>} Laborers array
 */
export const getLaborers = async (filter, sort, skip, limit) => {
  return Laborer.find(filter)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

/**
 * Get total count of laborers matching filter
 * 
 * @param {Object} filter - MongoDB filter object
 * @returns {Promise<Number>} Total count
 */
export const getLaborerCount = async (filter) => {
  return Laborer.countDocuments(filter);
};

/**
 * Get laborer statistics
 * 
 * @returns {Promise<Object>} Statistics object
 */
export const getLaborerStats = async () => {
  return Laborer.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        unverified: { $sum: { $cond: ['$isVerified', 0, 1] } },
        available: { $sum: { $cond: ['$isAvailable', 1, 0] } },
        unavailable: { $sum: { $cond: ['$isAvailable', 0, 1] } }
      }
    }
  ]);
};

/**
 * Get specialization statistics
 * 
 * @returns {Promise<Array>} Specialization statistics
 */
export const getSpecializationStats = async () => {
  return Laborer.aggregate([
    {
      $group: {
        _id: '$specialization',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);
};

/**
 * Get laborer by ID
 * 
 * @param {String} id - Laborer ID
 * @returns {Promise<Object>} Laborer object
 */
export const getLaborerById = async (id) => {
  return Laborer.findById(id)
    .select('-password')
    .lean();
};

/**
 * Update laborer status
 * 
 * @param {String} id - Laborer ID
 * @param {String} status - New status
 * @param {String} reason - Reason for status change
 * @returns {Promise<Object>} Updated laborer
 */
export const updateLaborerStatus = async (id, status, reason) => {
  const laborer = await Laborer.findById(id);
  
  if (!laborer) {
    throw new Error('Laborer not found');
  }

  const oldStatus = laborer.status;
  laborer.status = status;
  
  if (reason) {
    laborer.statusReason = reason;
  }
  
  await laborer.save();
  
  return {
    laborer,
    oldStatus
  };
};

/**
 * Update laborer verification status
 * 
 * @param {String} id - Laborer ID
 * @param {Boolean} isVerified - Verification status
 * @param {String} reason - Reason for verification change
 * @returns {Promise<Object>} Updated laborer
 */
export const updateLaborerVerification = async (id, isVerified, reason) => {
  const laborer = await Laborer.findById(id);
  
  if (!laborer) {
    throw new Error('Laborer not found');
  }

  const oldVerification = laborer.isVerified;
  laborer.isVerified = isVerified;
  
  if (reason) {
    laborer.verificationReason = reason;
  }
  
  await laborer.save();
  
  return {
    laborer,
    oldVerification
  };
};

/**
 * Soft delete laborer
 * 
 * @param {String} id - Laborer ID
 * @param {String} deletedBy - Admin ID who deleted
 * @returns {Promise<Object>} Deleted laborer
 */
export const softDeleteLaborer = async (id, deletedBy) => {
  const laborer = await Laborer.findById(id);
  
  if (!laborer) {
    throw new Error('Laborer not found');
  }

  laborer.isDeleted = true;
  laborer.deletedAt = new Date();
  laborer.deletedBy = deletedBy;
  await laborer.save();
  
  return laborer;
};

/**
 * Stream laborers export as CSV
 * 
 * @param {Object} res - Express response object
 * @param {Object} filter - MongoDB filter object
 * @param {Array} fields - Fields to include in export
 * @param {String} correlationId - Request correlation ID
 */
export const streamLaborersExport = async (res, filter, fields, correlationId) => {
  try {
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laborers_${Date.now()}.csv`);
    
    // Create CSV parser
    const json2csv = new Parser({ fields });
    
    // Create a readable stream
    const dataStream = new Readable({
      read() {}
    });
    
    // Pipe the data through the CSV parser and to the response
    dataStream.pipe(json2csv).pipe(res);
    
    // Query in batches to avoid memory issues
    const batchSize = 100;
    let skip = 0;
    let hasMore = true;
    
    while (hasMore) {
      const laborers = await Laborer.find(filter)
        .select(fields.join(' '))
        .skip(skip)
        .limit(batchSize)
        .lean();
      
      if (laborers.length === 0) {
        hasMore = false;
      } else {
        laborers.forEach(laborer => {
          dataStream.push(JSON.stringify(laborer) + '\n');
        });
        skip += batchSize;
      }
    }
    
    // End the stream
    dataStream.push(null);
    
    logger.info({
      message: 'Laborers export completed successfully',
      correlationId,
      filterCriteria: JSON.stringify(filter)
    });
  } catch (error) {
    logger.error({
      message: 'Error streaming laborers export',
      error: error.message,
      stack: error.stack,
      correlationId
    });
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to export laborers'
      });
    } else {
      // Otherwise, end the response
      res.end();
    }
  }
};
