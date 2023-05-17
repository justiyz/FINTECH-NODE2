import bvnQueries from '../queries/queries.bvn';
import { processAnyData, processOneOrNoneData} from '../services/services.db';
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
    const { body } = req;
    const blacklistedBvn =  await processAnyData(bvnQueries.fetchBlacklistedBvn, []);
    await Promise.all(
      blacklistedBvn.map(async(data) => {
        const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
        data.bvn = decryptedBvn;
        return data;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully decrypted bvn coming from the database checkIfAminEmailAlreadyExist.admin.middlewares.bvn.js`);
    
    if (req.query.type === 'single' && blacklistedBvn.find((data) => data.bvn === req.body.bvn)) { 
      return ApiResponse.error(res, enums.BLACKLIST_BVN_EXIST, enums.HTTP_CONFLICT, enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE);
    }
    if (req.query.type === 'single') return next();
    
    const ids = new Set(blacklistedBvn.map(({ bvn }) => bvn));
    const addBvn = body.filter(({ bvn }) => !ids.has(bvn));

    if (!addBvn || !addBvn.length) {
      return ApiResponse.error(res, enums.BLACKLIST_BVN_EXIST, enums.HTTP_CONFLICT, enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE);
    }
    req.addBvn = addBvn;
    return next();
  } catch (error) {
    error.label = enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE;
    logger.error(`Is bvn already blacklisted middleware failed::${enums.IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
  
/**
 * 
/**
 * check if blacklisted bvn exist in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminBvnMifdleware
 */
export const checkIfBvnExist = async(req, res, next) => {
  try {
    const blacklistedBvn =  await processOneOrNoneData(bvnQueries.fetchBlacklistedBvnById, [ req.params.id ]);
    if (!blacklistedBvn) { 
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      decoded that blacklisted bvn id does not exist in the database checkIfBvnExist.admin.middlewares.bvn.js`);
      return ApiResponse.error(res, enums.BLACKLIST_BVN_DOES_NOT_EXIST, enums.HTTP_CONFLICT, enums.CHECK_IF_BVN_EXIST_MIDDLEWARE);
    }

    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_BVN_EXIST_MIDDLEWARE;
    logger.error(`Checking if bvn exist failed::${enums.CHECK_IF_BVN_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
