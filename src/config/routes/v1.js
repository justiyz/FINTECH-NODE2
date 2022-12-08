import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';

const router = Router();

router.use('/auth', authRoute);

export default router;
