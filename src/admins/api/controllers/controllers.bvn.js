
import adminQueries from '../queries/queries.admin';
import { processAnyData } from '../services/services.db';
import AdminPayload from '../../lib/payloads/lib.payload.admin';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';



/**
 * adding blacklisted bvns to db
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns overview page details.
 * @memberof AdminBvnController
 */
export const addBlacklistedBvns = async(req, res, next) => {
  try {
    const { body, query }= req;
    const dataInfo = (!req.info) ? body : req.info;
    let processedData;
    if (query.type === 'single') {
      const hashedBvn = encodeURIComponent(await UserHash.encrypt(dataInfo.bvn));
      const payload = AdminPayload.blacklistedBvn(dataInfo, hashedBvn);
      processedData  = await processAnyData(adminQueries.blacklistedBvn, payload);
    } else {
      processedData = await Promise.all(dataInfo.map(async(data) => {
        const hashedBvn = encodeURIComponent(await UserHash.encrypt(data.bvn));
        const payload = AdminPayload.blacklistedBvn(data, hashedBvn);
        const result = await processAnyData(adminQueries.blacklistedBvn, payload);
        return result[0];
      }));
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::
      Info: have successfully added bvns in the DB blacklistedBvn.controllers.admin.admin.js`);
    return ApiResponse.success(res, enums.BLACKLISTED_BVN, enums.HTTP_CREATED, processedData);
  } catch (error) {
    error.label = enums.BLACKLIST_BVN_CONTROLLER;
    logger.error(`Failed to blacklist BVNs:::${enums.BLACKLIST_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};
  
/**
   * fetch blacklisted bvn
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @param {Next} next - Call the next operation.
   * @returns {object} - Returns overview page details.
   * @memberof AdminBvnController
   */
export const fetchBlacklistedBvn = async(req, res, next) => {
  try {
    const { query, admin } = req;
    if (query.export) {
      const payload = AdminPayload.fetchBlacklistedBvn(query);
      const blacklistBvns  = await processAnyData(adminQueries.fetchUserBlacklistedBvn, payload);
      await Promise.all(
        blacklistBvns.map(async(data) => {
          const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
          data.bvn = decryptedBvn;
          return data;
        }));
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched all blacklisted bvn in  the DB fetchBlacklistedBvn.admin.admin.js`);
      const data = {
        total_count: blacklistBvns.length,
        blacklistBvns
      };
      return ApiResponse.success(res, enums.USERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const  payload  = AdminPayload.fetchBlacklistedBvn(query);
    const [ blacklistBvns, [ blacklistBvnCount ] ] = await Promise.all([
      processAnyData(adminQueries.fetchUserBlacklistedBvn, payload),
      processAnyData(adminQueries.countBlacklistedBvn, payload)
    ]);
  
    await Promise.all(
      blacklistBvns.map(async(data) => {
        const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
        data.bvn = decryptedBvn;
        return data;
      }));
  
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched all blacklisted bvn in  the DB fetchBlacklistedBvn.admin.admin.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(blacklistBvnCount.total_count),
      total_pages: Helpers.calculatePages(Number(blacklistBvnCount.total_count), Number(req.query.per_page) || 10),
      blacklistBvns
    };
    return ApiResponse.success(res, enums.BLACKLIST_BVN_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.BLACKLIST_BVN_CONTROLLER;
    logger.error(`Failed to fetch blacklisted BVNs:::${enums.BLACKLIST_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};
  
