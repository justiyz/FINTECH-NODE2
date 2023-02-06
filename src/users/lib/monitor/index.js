import logQueries from '../../api/queries/queries.log';
import { processNoneData } from '../../api/services/services.db';
import { operations } from './lib.monitor.operations';

const monitor = async(query, param, type, operation, user_id) => {
  try {
    await processNoneData(query, param);
    return logger.info(`${type}: activity ${operation} for ${user_id} tracked`);
  } catch (error) {
    logger.error(error);
    return logger.info(`${type}: activity ${operation} for ${user_id} not tracked`);
  }
};

export const userActivityTracking = (user_id, op_code, activity_status) => {
  if (user_id) {
    const operation = operations[op_code];
    return monitor(logQueries.createUserActivityLogs, [
      user_id,
      operation,
      activity_status
    ], 'userActivityTracking', operation, user_id);
  }
};
