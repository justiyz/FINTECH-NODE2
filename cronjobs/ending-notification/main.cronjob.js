import express from 'express';
import 'dotenv/config';

import { promoEndingSoonNotification } from '../../src/users/api/controllers/controller.cron';

import enums from '../../src/users/lib/enums/index';
import expressConfig from '../../src/users/config/express/index';

const app = express();
expressConfig(app);

logger.info(`${enums.CURRENT_TIME_STAMP} Cron job is active`);

promoEndingSoonNotification();
