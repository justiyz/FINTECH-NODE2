import { Router } from 'express';
import ApiResponse from '../../lib/http/lib.http.responses';

const router = Router();

router.get(
  // eslint-disable-next-line no-unused-vars
  '/', (req, res) => {
    return ApiResponse.success(res, 'Auth Route is reachable', 200);
  }
);

export default router;
