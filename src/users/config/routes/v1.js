import { Router } from 'express';
import authRoute from '../../api/routes/routes.auth';
import userRoute from '../../api/routes/routes.user';
import paymentRoute from '../../api/routes/routes.payment';
import loanRoute from '../../api/routes/routes.loan';
import clusterRoute from '../../api/routes/routes.cluster';
import shopRoutes from '../../api/routes/routes.shop';
import adminRoute from '../../../admins/api/routes/routes.admin';
import adminAuthRoute from '../../../admins/api/routes/routes.auth';
import adminRoleRoute from '../../../admins/api/routes/routes.role';
import adminUserRoute from '../../../admins/api/routes/routes.user';
import adminLoanRoute from '../../../admins/api/routes/routes.loan';
import adminSettingsRoute from '../../../admins/api/routes/routes.settings';
import bvnRoute from '../../../admins/api/routes/routes.bvn';
import AdminClusterRoute from '../../../admins/api/routes/routes.cluster';
import adminShopRoutes from '../../../admins/api/routes/routes.shop';
import adminMerchantRoute from '../../../admins/api/routes/routes.merchant';
import recovaRoutes from '../../api/routes/routes.recova';
import merchantRoutes from '../../../merchant-admin/api/routes/routes.admin';
import merchantRoleRoutes from '../../../merchant-admin/api/routes/routes.role';

import merchantAdminAuthRoute from '../../../merchant-admin/api/routes/routes.auth';
import merchantAdminMerchantRoute from '../../../merchant-admin/api/routes/routes.merchant';

const router = Router();

router.use('/auth', authRoute);
router.use('/user', userRoute);
router.use('/payment', paymentRoute);
router.use('/loan', loanRoute);
router.use('/cluster', clusterRoute);
router.use('/admin', adminRoute);
router.use('/shop', shopRoutes);
router.use('/recova', recovaRoutes);
router.use('/admin/auth', adminAuthRoute);
router.use('/admin/role', adminRoleRoute);
router.use('/admin/user', adminUserRoute);
router.use('/admin/loan', adminLoanRoute);
router.use('/admin/settings', adminSettingsRoute);
router.use('/admin/bvn', bvnRoute);
router.use('/admin/cluster', AdminClusterRoute);
router.use('/admin/shop', adminShopRoutes);
router.use('/admin/merchant', adminMerchantRoute);
router.use('/merchant-admin/auth', merchantAdminAuthRoute);
router.use('/merchant-admin/merchant', merchantAdminMerchantRoute);
router.use('/merchant-admin/', merchantRoutes);
router.use('/merchant-role/', merchantRoleRoutes);

export default router;
