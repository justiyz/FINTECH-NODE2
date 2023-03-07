import express from 'express';
import 'dotenv/config';
import { RunSchedules, scheduleList } from './users/api/cron';
import enums from './users/lib/enums/index';
import expressConfig from './users/config/express/index';

const app = express();
expressConfig(app);

logger.info(`${enums.CURRENT_TIME_STAMP} Cron job is active`);

RunSchedules(scheduleList);

