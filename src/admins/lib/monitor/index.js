import adminLogQueries from '../../api/queries/queries.log';
import { processNoneData } from '../../api/services/services.db';
import { operations } from './lib.monitor.operations';

const monitor = async(query, param, type, operation, admin_id) => {
  try {
    await processNoneData(query, param);
    return logger.info(`${type}: activity ${operation} for ${admin_id} tracked`);
  } catch (error) {
    logger.error(error);
    return logger.info(`${type}: activity ${operation} for ${admin_id} not tracked`);
  }
};

export const adminActivityTracking = (admin_id, op_code, activity_status, description) => {
  if (admin_id) {
    const operation = operations[op_code];
    return monitor(adminLogQueries.createAdminActivityLogs, [
      admin_id,
      operation,
      activity_status,
      description
    ], 'adminActivityTracking', operation, admin_id);
  }
};
