import dayjs from 'dayjs';
import settingsQueries from '../queries/queries.settings';
import  settingsPayload from '../../lib/payloads/lib.payload.settings';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { processAnyData, processNoneData, processOneOrNoneData } from '../services/services.db';
import { loanScoreCardBreakdown } from '../services/services.seedfiUnderwriting';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

/**
 * fetches admin env values settings
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const fetchEnvValues = async(req, res, next) => {
  try { 
    const { admin } = req;
    const envValues = await processAnyData(settingsQueries.fetchEnvValues);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched env values from the DB fetchEnvValues.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.FETCH_ENV_VALUES_SUCCESSFULLY, enums.HTTP_OK, envValues);
  } catch (error) {
    error.label = enums.FETCH_ENV_VALUES_CONTROLLER;
    logger.error(`fetching env values failed:::${enums.FETCH_ENV_VALUES_CONTROLLER}`, error.message);
    return next(error); 
  }
};


/**
 * updates admin env values settings
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const updateEnvValues = async(req, res, next) => {
  try {
    const { admin, body } = req;
    const existingEnvs = await processAnyData(settingsQueries.fetchEnvValues);
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const envToUpdate = [];
    for (const env of body) {
      const existingEnvValue = existingEnvs.find((existingEnv) => existingEnv.env_id === env.env_id);
      if (!existingEnvValue) {
        await adminActivityTracking(req.admin.admin_id, 31, 'fail', descriptions.updates_environment_failed(`${req.admin.first_name} ${req.admin.last_name}`));
        continue;
      }
      envToUpdate.push({
        env_id: env.env_id,
        value: env.value || existingEnvValue.value
      });
    }
    await Promise.all(
      envToUpdate.map(async(env) => {
        const envId = env.env_id;
        const value = env.value;
        return await processOneOrNoneData(settingsQueries.updateEnvValues, [ envId, value ]);
      })
    );
    logger.info(
      `${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated the env values settings in the DB updateEnvValues.admin.controllers.settings.js`
    );
    await adminActivityTracking(req.admin.admin_id, 31, 'success', descriptions.updates_environment(adminName));
    return ApiResponse.success(res, enums.UPDATED_ENV_VALUES_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_ENV_VALUES_CONTROLLER;
    logger.error(`updating env values failed:::${enums.UPDATE_ENV_VALUES_CONTROLLER}`, error.message);
    return next(error);
  }
};
  
/**
 * fetches loan score card breakdown
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const scoreCardBreakdown = async(req, res, next) => {
  try {
    const { admin } = req;
    const individualLoanScoreCardResult = await loanScoreCardBreakdown();
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched the individual loan scorecard weights
        from seedfi underwriting service scoreCardBreakdown.admin.controllers.settings.js`);
    const data = {
      individualLoanScoreCardResult: individualLoanScoreCardResult.data // same score card for both loan types for now
    };
    return ApiResponse.success(res, enums.SCORE_CARD_WEIGHTS_BREAKDOWN_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.SCORE_CARD_BREAKDOWN_CONTROLLER;
    logger.error(`fetching score card breakdown failed:::${enums.SCORE_CARD_BREAKDOWN_CONTROLLER}`, error.message);
    return next(error);  
  }
};

/**
 * creates system promos
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const createSystemPromo = async(req, res, next) => {
  const { body, document, admin } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const payload = settingsPayload.createPromo(body, document, admin);
    const promo =  await processOneOrNoneData(settingsQueries.createPromo, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully creates a promo createSystemPromo.admin.controllers.settings.js`);
    await adminActivityTracking(req.admin.admin_id, 43, 'success', descriptions.create_promo(adminName, body.name.trim()));
    return ApiResponse.success(res, enums.PROMO_CREATED_SUCCESSFULLY, enums.HTTP_CREATED, promo);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 43, 'fail', descriptions.create_promo_failed(adminName, body.name));
    error.label = enums.CREATE_PROMO_CONTROLLER;
    logger.error(`creating system promo failed:::${enums.CREATE_PROMO_CONTROLLER}`, error.message);
    return next(error);  
  }
};

/**
 * fetches all system promos
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const fetchAllSystemPromos = async(req, res, next) => {
  try {
    const { admin } = req;
    const promos = await processAnyData(settingsQueries.fetchAllPromos);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetches all system promos fetchAllSystemPromos.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.PROMOS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, promos);
  } catch (error) {
    error.label = enums.FETCH_PROMOS_CONTROLLER;
    logger.error(`fetching system promos failed:::${enums.FETCH_PROMOS_CONTROLLER}`, error.message);
    return next(error);  
  }
};

/**
 * fetches details of a particular promo
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const fetchSinglePromo = async(req, res, next) => {
  try {
    const { admin, promoDetails } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetches details of a particular promo 
    fetchSinglePromo.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.PROMO_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, promoDetails);   
  } catch (error) {
    error.label = enums.FETCH_PROMO_DETAILS_CONTROLLER;
    logger.error(`fetching a promo details failed:::${enums.FETCH_PROMO_DETAILS_CONTROLLER}`, error.message);
    return next(error);  
  }
};

/**
 * edits a particular promo
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const editPromoDetails = async(req, res, next) => {
  const { body, params: { promo_id }, document, admin, promoDetails  } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const payload = settingsPayload.editPromo(body, document, promoDetails, promo_id);
    const editedPromo = await processOneOrNoneData(settingsQueries.updatePromoDetails, payload);
    if (dayjs(body.start_date).isSame(dayjs(), 'day')) {
      await processOneOrNoneData(settingsQueries.updatePromoStatus, [ promo_id ]);
    }

    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully edits details of a promo  editPromoDetails.admin.controllers.settings.js`); 
    await adminActivityTracking(req.admin.admin_id, 44, 'success', descriptions.edit_promo(adminName, promoDetails.name.trim()));
    return ApiResponse.success(res, enums.PROMO_EDITED_SUCCESSFULLY, enums.HTTP_OK, editedPromo);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 44, 'fail', descriptions.edit_promo_failed(adminName, promoDetails.name));
    error.label = enums.EDIT_PROMO_DETAILS_CONTROLLER;
    logger.error(`editing a promo's details failed:::${enums.EDIT_PROMO_DETAILS_CONTROLLER}`, error.message);
    return next(error);  
  }
};

/**
 * cancels a particular promo
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const cancelPromo = async(req, res, next) => {
  const { body, admin } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const cancelledPromos = [];
    for (const id of body) {
      const actualEndDate = dayjs();
      const cancelledPromo = await processOneOrNoneData(settingsQueries.cancelPromo, [ id.promo_id, actualEndDate ]);
      await adminActivityTracking(req.admin.admin_id, 46, 'success', descriptions.cancel_promo(adminName, cancelledPromo.name.trim()));
      cancelledPromos.push(cancelledPromo);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully cancelled one or more promos on the system
    cancelPromo.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.PROMO_CANCELLED_SUCCESSFULLY, enums.HTTP_OK, cancelledPromos);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 46, 'fail', descriptions.cancel_promo_failed(adminName));
    error.label = enums.CANCEL_PROMO_CONTROLLER;
    logger.error(`cancelling promo failed:::${enums.CANCEL_PROMO_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * deletes a particular promo
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */

export const deletePromo = async(req, res, next) => {
  const { body, admin }  = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    for (const id of body) {
      const deletedPromos = await processOneOrNoneData(settingsQueries.deletePromo, id.promo_id);
      await adminActivityTracking(req.admin.admin_id, 45, 'success', descriptions.delete_promo(adminName, deletedPromos.name.trim()));
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully deletes one or more promos on the system
    deletePromo.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.PROMO_DELETED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 45, 'fail', descriptions.delete_promo_failed(adminName));
    error.label = enums.DELETE_PROMO_CONTROLLER;
    logger.error(`deleting promo failed:::${enums.DELETE_PROMO_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches admin reward points details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const fetchRewardPointDetails = async(req, res, next) => {
  try { 
    const { admin, query: { type } } = req;
    if (type === 'general') {
      const generalRewards =  await processAnyData(settingsQueries.fetchGeneralRewardPointDetails, []);
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched general reward point details from the DB 
      fetchRewardPointDetails.admin.settings.admin.js`);
      await Promise.all(
        generalRewards.map(async(reward) => {
          const range = await processAnyData(settingsQueries.fetchGeneralRewardRangePointDetails, [ reward.reward_id ]);
          reward.point_range = range;
          return reward;
        })
      );
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully set the point range for general rewards from the DB 
      fetchRewardPointDetails.admin.settings.admin.js`);
      return ApiResponse.success(res, enums.FETCH_REWARD_POINT_DETAILS_SUCCESSFULLY, enums.HTTP_OK, generalRewards);
    }
    const clusterRewards = await processAnyData(settingsQueries.fetchClusterRewardPointDetails, []);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched cluster related reward point details from the DB 
    fetchRewardPointDetails.admin.settings.admin.js`);
    return ApiResponse.success(res, enums.FETCH_REWARD_POINT_DETAILS_SUCCESSFULLY, enums.HTTP_OK, clusterRewards);
  } catch (error) {
    error.label = enums.FETCH_REWARD_POINT_DETAILS_CONTROLLER;
    logger.error(`fetching reward point details failed:::${enums.FETCH_REWARD_POINT_DETAILS_CONTROLLER}`, error.message);
    return next(error); 
  }
};

/**
 * update cluster related rewards
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const updateClusterRelatedRewards = async(req, res, next) => {
  try { 
    const { admin, body } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    await Promise.all(
      body.map(async(reward) => {
        await processOneOrNoneData(settingsQueries.updateClusterRelatedRewardPoints, [ reward.reward_id, parseFloat(reward.point) ]);
        return reward;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated cluster related reward point in the DB 
    updateClusterRelatedRewards.admin.settings.admin.js`);
    await adminActivityTracking(req.admin.admin_id, 52, 'success', descriptions.updates_reward_points(adminName, 'cluster related'));
    return ApiResponse.success(res, enums.UPDATED_CLUSTER_RELATED_REWARDS_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_CLUSTER_RELATED_REWARDS_CONTROLLER;
    logger.error(`updating cluster related reward points failed:::${enums.UPDATE_CLUSTER_RELATED_REWARDS_CONTROLLER}`, error.message);
    return next(error); 
  }
};

/**
 * update general rewards
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const updateGeneralRewards = async(req, res, next) => {
  try { 
    const { admin, body } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    await processOneOrNoneData(settingsQueries.updateGeneralRewardPoints, [ body.reward_id, parseFloat(body.point) ]); 
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated specified general reward point in the DB 
    updateGeneralRewards.admin.settings.admin.js`);
    await adminActivityTracking(req.admin.admin_id, 52, 'success', descriptions.updates_reward_points(adminName, 'general'));
    return ApiResponse.success(res, enums.UPDATED_GENERAL_REWARDS_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_GENERAL_REWARDS_CONTROLLER;
    logger.error(`updating general reward points failed:::${enums.UPDATE_GENERAL_REWARDS_CONTROLLER}`, error.message);
    return next(error); 
  }
};

/**
 * update general reward ranges and points
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminSettingsController
 */
export const updateGeneralRewardRanges = async(req, res, next) => {
  try { 
    const { admin, body } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    await Promise.all(
      body.map(async(range) => {
        await processOneOrNoneData(settingsQueries.updateGeneralRewardPointRanges, 
          [ range.range_id, parseFloat(range.lower_bound), parseFloat(range.upper_bound), parseFloat(range.point) ]);
        return range;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated general reward point ranges in the DB 
    updateGeneralRewardRanges.admin.settings.admin.js`);
    await adminActivityTracking(req.admin.admin_id, 52, 'success', descriptions.updates_reward_point_ranges(adminName, 'general'));
    return ApiResponse.success(res, enums.UPDATED_GENERAL_REWARD_RANGES_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_GENERAL_REWARD_RANGES_CONTROLLER;
    logger.error(`updating general reward ranges and points failed:::${enums.UPDATE_GENERAL_REWARD_RANGES_CONTROLLER}`, error.message);
    return next(error); 
  }
};

/**
 * resets user points to zero
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user kyc details.
 * @memberof AdminSettingsController
 */
export const resetUserRewardPoints = async(req, res, next) => {
  try {
    const {params: { user_id }, admin, userDetails } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`; 
    const userName = `${userDetails.first_name} ${userDetails.last_name}`;   
    await processNoneData(settingsQueries.resetUserRewardPoints, user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully resets user  points to zero resetUserRewardPoints.admin.controllers.settings.js`);
    await adminActivityTracking(req.admin.admin_id, 52, 'success', descriptions.reset_user_reward_points(adminName, userName)); 
    // to later change the activity tracking code when the migration is added
    return ApiResponse.success(res, enums.REWARD_POINTS_SET_TO_ZERO_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.ADMIN_SET_USER_REWARD_POINTS_TO_ZERO_CONTROLLER;
    logger.error(`resetting user reward points to zero failed:::${enums.ADMIN_SET_USER_REWARD_POINTS_TO_ZERO_CONTROLLER}`, error.message);
    return next(error);
  }
};
/**
 * resets all users points to zero
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user kyc details.
 * @memberof AdminSettingsController
 */
export const resetAllUsersRewardPoints = async(req, res, next) => {
  try {
    const { admin } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`; 
    await processNoneData(settingsQueries.resetAllUsersRewardPoints);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully resets users points to zero resetAllUsersRewardPoints.admin.controllers.settings.js`);
    await adminActivityTracking(req.admin.admin_id, 52, 'success', descriptions.reset_all_users_reward_points(adminName)); 
    // to later change the activity tracking code when the migration is added
    return ApiResponse.success(res, enums.REWARD_POINTS_SET_TO_ZERO_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.ADMIN_SET_USERS_REWARD_POINTS_TO_ZERO_CONTROLLER;
    logger.error(`setting userS points to zero failed:::${enums.ADMIN_SET_USERS_REWARD_POINTS_TO_ZERO_CONTROLLER}`, error.message);
    return next(error);
  }
};
