import { db } from '../../../users/config/db';
import { queries } from '../../services/services.db';
import { operations } from './lib.monitor.operations';

const { adminLogQuery } = queries;

const monitor = (query, param, type, operation, admin_id) => {
  try {
    db.none(query, param);
    return logger.info(`${type}: activity ${operation} for ${admin_id} tracked`);
  } catch (error) {
    logger.error(error);
    return logger.info(`${type}: activity ${operation} for ${admin_id} not tracked`);
  }
};

export const adminActivityTracking = (admin_id, op_code, activity_status) => {
  if (admin_id) {
    const operation = operations[op_code];
    return monitor(adminLogQuery.createAdminActivityLogs, [
      admin_id,
      operation,
      activity_status
    ], 'adminActivityTracking', operation, admin_id);
  }
};
