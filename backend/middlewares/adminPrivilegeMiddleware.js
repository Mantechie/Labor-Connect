import { isValidObjectId } from '../utils/validationUtils.js';

/**
 * Middleware to prevent horizontal privilege escalation
 * Prevents non-super admins from accessing other admins' logs
 */
export const preventPrivilegeEscalation = (req, res, next) => {
  // If not a super_admin and trying to access another admin's logs
  if (
    req.admin && 
    req.admin.role !== 'super_admin' && 
    req.query.adminId && 
    isValidObjectId(req.query.adminId) && 
    req.query.adminId !== req.admin._id.toString()
  ) {
    return res.status(403).json({ 
      message: 'Not authorized to access other admins\' logs' 
    });
  }
  next();
};

/**
 * Middleware to check specific admin permissions
 * @param {string} permission - Required permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    // Super admins bypass permission checks
    if (req.admin && req.admin.role === 'super_admin') {
      return next();
    }
    
    if (
      req.admin && 
      req.admin.permissions && 
      req.admin.permissions.includes(permission)
    ) {
      next();
    } else {
      res.status(403).json({ 
        message: `Access denied: Missing required permission: ${permission}` 
      });
    }
  };
};
