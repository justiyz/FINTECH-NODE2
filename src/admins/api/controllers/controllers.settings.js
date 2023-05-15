import settingsQueries from '../queries/queries.settings';
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
    const existingEnvs= await processAnyData(settingsQueries.fetchEnvValues);
    const envToUpdate = body.map((env) => {
      const existingEnvValue = existingEnvs.find((existingEnv) => existingEnv.env_id === env.env_id);
      if (!existingEnvValue) {
        adminActivityTracking(req.admin.admin_id, 31, 'fail', descriptions.updates_environment_failed(admin.first_name));
        return null;
      }
      return {
        env_id: env.env_id,
        value: env.value || existingEnvValue.value
      };
    }).filter((env) => env !== null);
    await Promise.all(
      envToUpdate.map(async(env) => {
        const envId = env.env_id;
        const value = env.value;
        return await processOneOrNoneData(settingsQueries.updateEnvValues, [ envId, value ]);
      })
    );
  
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated the env values settings 
      in the DB updateEnvValues.admin.controllers.admin.js`);
    adminActivityTracking(req.admin.admin_id, 31, 'success', descriptions.updates_environment(admin.first_name));
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

