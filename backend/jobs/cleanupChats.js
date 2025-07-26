import cron from 'node-cron';
import Chat from '../models/chat.js';
import { logger } from '../utils/Logger.js';

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const retentionPeriod = 90; // 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
    
    const result = await Chat.deleteMany({
      isDeleted: true,
      updatedAt: { $lt: cutoffDate }
    });
    
    logger.info(`Permanently deleted ${result.deletedCount} soft-deleted chat messages older than ${retentionPeriod} days`);
  } catch (error) {
    logger.error('Error in chat cleanup job:', error);
  }
});
