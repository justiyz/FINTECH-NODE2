import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';
import userRoute from '../../api/routes/routes.user';
import adminAuthRoute from '../../../admins/api/routes/routes.auth';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin/auth', adminAuthRoute);

export default router;
