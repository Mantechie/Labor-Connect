// h:\Labour\backend\utils\jobApplicationLogger.js
import { logger } from './Logger.js';

const jobApplicationLogger = {
  apply: (userId, jobId, applicantId, success, details = {}) => {
    logger.info(`JOB_APPLICATION | User: ${userId} | Job: ${jobId} | Applicant: ${applicantId} | Success: ${success}`, {
      event: 'job_application',
      userId,
      jobId,
      applicantId,
      success,
      ...details
    });
  },
  
  statusChange: (userId, applicationId, oldStatus, newStatus, details = {}) => {
    logger.info(`JOB_APPLICATION_STATUS_CHANGE | User: ${userId} | Application: ${applicationId} | Status: ${oldStatus} -> ${newStatus}`, {
      event: 'job_application_status_change',
      userId,
      applicationId,
      oldStatus,
      newStatus,
      ...details
    });
  },
  
  list: (userId, filters, count, details = {}) => {
    logger.debug(`JOB_APPLICATION_LIST | User: ${userId} | Filters: ${JSON.stringify(filters)} | Count: ${count}`, {
      event: 'job_application_list',
      userId,
      filters,
      count,
      ...details
    });
  }
};

export { jobApplicationLogger };
