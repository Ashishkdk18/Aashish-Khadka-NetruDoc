import AuditLog from '../models/auditLogModel.js';

/**
 * Audit Service
 * Handles audit logging for system actions
 */
export class AuditService {
  /**
   * Log an action
   * @param {String} entityType - Type of entity (e.g., 'prescription')
   * @param {String} entityId - ID of the entity
   * @param {String} action - Action performed ('create', 'view', 'update', 'delete', 'download')
   * @param {String} userId - ID of user performing action
   * @param {String} userRole - Role of user
   * @param {Object} req - Express request object (for IP and user agent)
   * @param {Object} metadata - Additional metadata to store
   * @returns {Promise<Object>}
   */
  async logAction(entityType, entityId, action, userId, userRole, req = null, metadata = {}) {
    try {
      const ipAddress = req?.ip || req?.connection?.remoteAddress || req?.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown';
      const userAgent = req?.headers?.['user-agent'] || 'unknown';

      const auditLog = await AuditLog.create({
        entityType,
        entityId,
        action,
        userId,
        userRole,
        ipAddress,
        userAgent,
        metadata,
        timestamp: new Date()
      });

      return auditLog;
    } catch (error) {
      // Don't throw error - audit logging should not break main functionality
      console.error('Failed to log audit action:', error);
      return null;
    }
  }

  /**
   * Get audit logs for an entity
   * @param {String} entityType - Type of entity
   * @param {String} entityId - ID of the entity
   * @param {Object} options - Query options (limit, sort)
   * @returns {Promise<Array>}
   */
  async getEntityAuditLogs(entityType, entityId, options = {}) {
    const { limit = 100, sort = '-timestamp' } = options;
    
    return AuditLog.find({ entityType, entityId })
      .populate('userId', 'name email role')
      .sort(sort)
      .limit(limit)
      .lean();
  }

  /**
   * Get audit logs for a user
   * @param {String} userId - User ID
   * @param {Object} options - Query options (limit, sort)
   * @returns {Promise<Array>}
   */
  async getUserAuditLogs(userId, options = {}) {
    const { limit = 100, sort = '-timestamp' } = options;
    
    return AuditLog.find({ userId })
      .populate('userId', 'name email role')
      .sort(sort)
      .limit(limit)
      .lean();
  }
}
