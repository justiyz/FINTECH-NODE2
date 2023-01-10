import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';
import userRoute from '../../api/routes/routes.user';
import adminAuthRoute from '../../../admins/api/routes/routes.auth';
import adminRoleRoute from '../../../admins/api/routes/routes.role';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/admin/auth', adminAuthRoute);
router.use('/admin/role', adminRoleRoute);

export default router;
