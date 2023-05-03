import settingsQueries from '../queries/queries.settings';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { processAnyData, processOneOrNoneData } from '../services/services.db';


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


export const updateEnvValues = async(req, res, next) => {
  try {
    const { admin, body } = req;
    const existingEnvs= await processAnyData(settingsQueries.fetchEnvValues);
    const envToUpdate = body.map((env) => {
      const existingEnvValue = existingEnvs.find((existingEnv) => existingEnv.env_id === env.env_id);
      if (!existingEnvValue) {
        return null;
      }
      return {
        env_id: env.env_id,
        value: env.value || existingEnvValue.value
      };
    }).filter((env) => env !== null);
    console.log(envToUpdate);
    await Promise.all(
      envToUpdate.map(async(env) => {
        const envId = env.env_id;
        const value = env.value;
        await processOneOrNoneData(settingsQueries.updateEnvValues, [ envId, value ]);
        return;
      })
    );
  
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin successfully updated the env values settings 
      in the DB updateEnvValues.admin.controllers.admin.js`);
    return ApiResponse.success(res, enums.UPDATED_ENV_VALUES_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_ENV_VALUES_CONTROLLER;
    logger.error(`updating env values failed:::${enums.UPDATE_ENV_VALUES_CONTROLLER}`, error.message);
    return next(error); 
  }
};
  

