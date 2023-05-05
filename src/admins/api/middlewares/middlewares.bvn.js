import adminQueries from '../queries/queries.admin';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';

/**
 * 
/**
 * check if bvn is already blacklisted  in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminBvnMifdleware
 */
export const isBvnAlreadyBlacklisted = async(req, res, next) => {
  try {
    const blacklistedBvn =  await processAnyData(adminQueries.fetchBlacklistedBvn, []);
    if (req.query.type === 'single' && blacklistedBvn) {
      await Promise.all(
        blacklistedBvn.map(async(data) => {
          const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
          data.bvn = decryptedBvn;
          return data;
        }));
    }
    if (req.query.type === 'single' && blacklistedBvn.find((data) => data.bvn === req.body.bvn)) { 
      return ApiResponse.error(res, enums.BLACKLIST_BVN_EXIST, enums.HTTP_CONFLICT, enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE;
    logger.error(`Is bvn already blacklisted middleware failed::${enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
  
  
