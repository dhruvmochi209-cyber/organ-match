const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, details) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action: action,
      details: details
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
};

module.exports = { logAudit };
