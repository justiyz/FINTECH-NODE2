import express from 'express';

// Bootstrap express
import expressConfig from './config/express';

const port = process.env.PORT || 8080;
const app = express();
expressConfig(app);

app.listen(port);
logger.info(`Application started on port ${port}`);

export default app;
