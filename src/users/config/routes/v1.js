import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';
import userRoute from '../../api/routes/routes.user';
import paymentRoute from '../../api/routes/routes.payment';
import loanRoute from '../../api/routes/routes.loan';
import adminRoute from '../../../admins/api/routes/routes.admin';
import adminAuthRoute from '../../../admins/api/routes/routes.auth';
import adminRoleRoute from '../../../admins/api/routes/routes.role';
import adminUserRoute from '../../../admins/api/routes/routes.user';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/payment', paymentRoute);
router.use('/loan', loanRoute);
router.use('/admin', adminRoute);
router.use('/admin/auth', adminAuthRoute);
router.use('/admin/role', adminRoleRoute);
router.use('/admin/user', adminUserRoute);

export default router;
