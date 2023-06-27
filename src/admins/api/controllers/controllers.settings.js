import dayjs from 'dayjs';
import settingsQueries from '../queries/queries.settings';
import  settingsPayload from '../../lib/payloads/lib.payload.settings';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
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
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched env values from the DB fetchEnvValues.admin.controllers.admin.js`);
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
      `${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated the env values settings in the DB updateEnvValues.admin.controllers.admin.js`
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
        from seedfi underwriting service scoreCardBreakdown.admin.controllers.admin.js`);
    const clusterLoanScoreCardResult = { data: {} }; // to later implement for cluster loan scoreCard
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched the cluster loan scorecard weights
        from seedfi underwriting service scoreCardBreakdown.admin.controllers.admin.js`);
    const data = {
      individualLoanScoreCardResult: individualLoanScoreCardResult.data,
      clusterLoanScoreCardResult: clusterLoanScoreCardResult.data
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
  try {
    const { body, document, admin } = req;
    const payload = settingsPayload.createPromo(body, document, admin);
    const promo =  await processOneOrNoneData(settingsQueries.createPromo, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully creates a promo createSystemPromo.admin.controllers.settings.js`);
    return ApiResponse.success(res, enums.PROMO_CREATED_SUCCESSFULLY, enums.HTTP_CREATED, promo);
  } catch (error) {
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
    const { params: { promo_id }, admin } = req;
    const promoDetails = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, promo_id);
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
  try {
    const { body, params: { promo_id }, document, admin  } = req;
    const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, promo_id);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched details promo 
     editPromoDetails.admin.controllers.settings.js`);
    const payload = settingsPayload.editPromo(body, document, promo, promo_id);
    const editedPromo = await processOneOrNoneData(settingsQueries.updatePromoDetails, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully edits details of a promo 
     editPromoDetails.admin.controllers.settings.js`); 
    return ApiResponse.success(res, enums.PROMO_EDITED_SUCCESSFULLY, enums.HTTP_OK, editedPromo);
  } catch (error) {
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
  try {
    const { body, admin } = req;
    const cancelledPromos = [];

    for (const id of body) {
      const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, id.promo_id);
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully fetched promo details
      cancelPromo.admin.controllers.settings.js`);

      const actualEndDate = dayjs(promo.end_date).format('YYYY-MM-DD') > dayjs().format('YYYY-MM-DD')
        ? dayjs()
        : null;

      const cancelledPromo = await processOneOrNoneData(settingsQueries.cancelPromo, [ id.promo_id, actualEndDate ]);
      cancelledPromos.push(cancelledPromo);
    }

    return ApiResponse.success(res, enums.PROMO_CANCELLED_SUCCESSFULLY, enums.HTTP_OK, cancelledPromos);
  } catch (error) {
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
  try {
    const { body, admin }  = req;
    for (const id of body) {
      await processOneOrNoneData(settingsQueries.deletePromo, id.promo_id);
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully deletes a promo
     deletePromo.admin.controllers.settings.js`);
    }
    return ApiResponse.success(res, enums.PROMO_DELETED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.DELETE_PROMO_CONTROLLER;
    logger.error(`deleting promo failed:::${enums.DELETE_PROMO_CONTROLLER}`, error.message);
    return next(error);
  }
};
