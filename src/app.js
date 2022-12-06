import express from 'express';
import 'dotenv/config';
import config from './config/index.js';
import enums from './lib/enums/index.js';

// Bootstrap express
import expressConfig from '../src/config/express/index.js';

const port = config.SEEDFI_PORT || 8080;
const app = express();
expressConfig(app);

app.listen(port);
logger.info(`${enums.CURRENT_TIME_STAMP} Application started on port ${port}`);

export default app;
