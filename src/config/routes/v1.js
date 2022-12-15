import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';
import userRoute from '../../api/routes/routes.user';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);

export default router;
