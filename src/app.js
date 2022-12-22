import express from 'express';
import 'dotenv/config';
import config from './users/config/index';
import enums from './users/lib/enums/index';
import expressConfig from './users/config/express/index';

const port = config.SEEDFI_PORT || 8080;
const app = express();
expressConfig(app);

app.listen(port);
logger.info(`${enums.CURRENT_TIME_STAMP} Application started on port ${port}`);

export default app;
