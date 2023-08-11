
import bvnQueries from '../queries/queries.bvn';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import BvnPayload from '../../lib/payloads/lib.payload.bvn';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

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
    const { addBvn, body, admin }= req;
    const bodyData = body.type === 'single' ? body : addBvn;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    let processedData;
    if (body.type === 'single') {
      const hashedBvn = encodeURIComponent(await UserHash.encrypt(bodyData.bvn.trim()));
      const payload = BvnPayload.blacklistedBvn(bodyData, hashedBvn);
      processedData  = await processOneOrNoneData(bvnQueries.blacklistedBvn, payload);
      await adminActivityTracking(req.admin.admin_id, 29, 'success', descriptions.upload_blacklisted_bvns(adminName,'single'));
    } else {
      processedData = await Promise.all(bodyData.map(async(data) => {
        const hashedBvn = encodeURIComponent(await UserHash.encrypt(data.bvn.trim()));
        const payload = BvnPayload.blacklistedBvn(data, hashedBvn);
        await processOneOrNoneData(bvnQueries.blacklistedBvn, payload);
        return data;
      }));
      await adminActivityTracking(req.admin.admin_id, 29, 'success', descriptions.upload_blacklisted_bvns(adminName,'bulk'));
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::
      Info: have successfully added bvns in the DB blacklistedBvn.controllers.admin.admin.js`);
    return ApiResponse.success(res, enums.BLACKLISTED_BVN, enums.HTTP_CREATED, processedData);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 29, 'success', descriptions.upload_blacklisted_bvns_failed(`${req.admin.first_name} ${req.admin.last_name}`,'bulk'));
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
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    const payload = BvnPayload.fetchBlacklistedBvn(query);
    const blacklistBvns = query.export ? await processAnyData(bvnQueries.fetchBlacklistedBvns, payload) 
      : await processAnyData(bvnQueries.fetchFilterBlacklistedBvn, payload);
  
    await Promise.all(
      blacklistBvns.map(async(data) => {
        const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
        data.bvn = decryptedBvn;
        return data;
      })
    );
    const responseMessage = `${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: 
    successfully fetched all blacklisted bvn in the DB fetchBlacklistedBvn.admin.admin.js`;
    const totalCount = blacklistBvns.length;
  
    if (query.export) {
      logger.info(responseMessage);
      const data = { total_count: totalCount, blacklistBvns };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'blacklisted bvns'));
      return ApiResponse.success(res, enums.USERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }

    if (req.query.bvn) {
      const filterBvn = blacklistBvns.find((data) => {
        return data.bvn === req.query.bvn;
      });
      if (!filterBvn) {
        return ApiResponse.success(res, enums.BLACKLIST_BVN_NOT_EXIST, enums.HTTP_NOT_FOUND);
      }
      return ApiResponse.success(res, enums.BLACKLIST_BVN_FETCHED_SUCCESSFULLY, enums.HTTP_OK, filterBvn);
    }

    const [ blacklistBvnCount ] = await processAnyData(bvnQueries.countFilterBlacklistedBvn, payload);
    const page = parseFloat(req.query.page) || 1;
    const perPage = Number(req.query.per_page) || 10;
    const total_pages = Helpers.calculatePages(Number(blacklistBvnCount.total_count), perPage);
  
    logger.info(responseMessage);
    const data = { page, total_count: Number(blacklistBvnCount.total_count), total_pages, blacklistBvns };
    return ApiResponse.success(res, enums.BLACKLIST_BVN_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.BLACKLIST_BVN_CONTROLLER;
    logger.error(`Failed to fetch blacklisted BVNs:::${enums.BLACKLIST_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
   * unblacklisted users bvn
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @param {Next} next - Call the next operation.
   * @returns {object} - Returns unblacklisted user details
   * @memberof AdminBvnController
   */
export const unblacklistBvn = async(req, res, next) => {
  const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
  try {
    const { blacklistedBvn } = req;
    const blacklistedUsers = await processAnyData(bvnQueries.getBlacklistedUsers, []);
    const decryptBlacklistedBvn = await UserHash.decrypt(decodeURIComponent(blacklistedBvn.bvn));
  
    if (blacklistedUsers.length > 0) {
      await Promise.all(
        blacklistedUsers.map(async(data) => {
          const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
          if (decryptedBvn === decryptBlacklistedBvn) {
            await processOneOrNoneData(bvnQueries.unblacklistExistingUserBvn, [ data.user_id, 'active' ]);
            return data;
          }
          return data;
        }));
    }

    const payload = BvnPayload.unBlacklistedBvn(blacklistedBvn);
    await Promise.all([
      processOneOrNoneData(bvnQueries.updateUnblackListedBvn, payload),
      processOneOrNoneData(bvnQueries.removeBlacklistedBvn, [ req.params.id ])
    ]);
    adminActivityTracking(req.admin.admin_id, 38, 'success', descriptions.unblacklist_bvn(adminName));
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully unblacklisted bvn the database unblacklistBvn.admin.controllers.bvn.js`);
    return ApiResponse.success(res, enums.UNBLACKLIST_BVN, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UNBLACKLIST_BVN_CONTROLLER;
    logger.error(`Unblacklist bvn failed:::${enums.UNBLACKLIST_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};
