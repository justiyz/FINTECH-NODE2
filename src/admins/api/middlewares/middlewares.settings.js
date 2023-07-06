import path from 'path';
import enums from '../../../users/lib/enums';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as S3 from '../../api/services/services.s3';
import {  processOneOrNoneData } from '../services/services.db';
import settingsQueries from '../queries/queries.settings';
import dayjs from 'dayjs';
import config from '../../../users/config';

/**
 * uploading promo banner
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */

export const uploadPromoBanner =  async(req, res, next) => {
  try {
    const { files, admin } = req;
    if (files || (files && files.document)) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: to be uploaded file is existing uploadPromoBanner.middlewares.settings.js`);
      const fileExt = path.extname(files.document.name);
      if (files.document.size > 3197152) { // 3 MB
        logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.user_id}:::Info: file size is greater than 3MB uploadPromoBanner.middlewares.user.js`);
        return ApiResponse.error(res, enums.FILE_SIZE_TOO_BIG, enums.HTTP_BAD_REQUEST, enums.UPLOAD_PROMO_BANNER_MIDDLEWARE);
      }
      const acceptedImageFileTypes = [ '.png', '.jpg', '.jpeg' ];
      if (!acceptedImageFileTypes.includes(fileExt)) {
        logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: document type is not a jpeg, jpg or png file uploadPromoBanner.middlewares.settings.js`);
        return ApiResponse.error(res, enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_PROMO_BANNER_MIDDLEWARE);
      }
      const url = `files/promo-banners/${admin.admin_id}/promo-banner/${files.document.name}`;
      if (config.SEEDFI_NODE_ENV === 'test') {
        req.document = {
          document_url: 'https://photow-profile-images.s3.us-west-2.amazonaws.com/files/promo-banners/admin-28e51a1e9b1111ed931eff591a8539da/promo-banner/1%20%2827%29.jpg',
          document_extension: fileExt 
        };
        return next();
      }
      const payload = Buffer.from(files.document.data, 'binary');
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: upload payload and url set uploadPromoBanner.middlewares.settings.js`);
      const contentType = 'image/png';
      const data  = await S3.uploadFile(url, payload, contentType);
      const s3Data = {
        document_url: data.Location,
        document_extension: fileExt
      };
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info:file uploaded to amazon s3 bucket uploadPromoBanner.middlewares.settings.js`);
      req.document = s3Data;
      return next();
    }
    return next();
    
  } catch (error) {
    error.label = enums.UPLOAD_PROMO_BANNER_MIDDLEWARE;
    logger.error(`uploading promo banner to amazon s3 failed::${enums.UPLOAD_PROMO_BANNER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if promo is unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */
export const checkIfPromoAlreadyExists = async(req, res, next) => {
  try {
    const { admin, body } = req;
    const existingPromo = await processOneOrNoneData(settingsQueries.fetchPromoByName, [ body.name.toLowerCase() ]);
    if (existingPromo) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms promo already exist in the db
         checkIfPromoAlreadyExists.middlewares.settings.js`);
      return ApiResponse.error(res, enums.PROMO_ALREADY_EXIST, enums.HTTP_CONFLICT, enums.CHECK_IF_PROMO_ALREADY_EXIST_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_PROMO_ALREADY_EXIST_MIDDLEWARE;
    logger.error(`checking if promo already exist failed::${enums.CHECK_IF_PROMO_ALREADY_EXIST_MIDDLEWARE}`, error.message);
    return next(error);  
  }
};

/**
 * checks if start or end date has not passed
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */
export const checkIfStartOrEndDateHasPassed = async(req, res, next) => {
  try {
    const { admin, body } = req;
    if (body.start_date < dayjs().format('YYYY-MM-DD') || body.end_date < dayjs().format('YYYY-MM-DD')) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms start or end date has passed
      checkIfStartOrEndDateHasPassed.middlewares.settings.js`); 
      return ApiResponse.error(res, enums.PAST_END_OR_START_DATE, enums.HTTP_BAD_REQUEST);
    }
    if (body.start_date > body.end_date) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms start date is greater than end date
      checkIfStartOrEndDateHasPassed.middlewares.settings.js`); 
      return ApiResponse.error(res, enums.START_DATE_CAN_NOT_BE_AHEAD_OF_HEAD_DATE, enums.HTTP_BAD_REQUEST);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_START_OR_END_DATE_HAS_PASSED_MIDDLEWARE;
    logger.error(`checking if start or end date has passed failed::${enums.CHECK_IF_START_OR_END_DATE_HAS_PASSED_MIDDLEWARE}`, error.message);
    return next(error);   
  }
};

/**
 * checks if promo exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */
export const checkIfPromoExists = async(req, res, next) => {
  try {
    const { admin, params: { promo_id }, body } = req;
    if (promo_id) {
      const promoDetails = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, promo_id);
      if (!promoDetails) {
        logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms promo does not exist in the DB
         checkIfPromoExists.middlewares.settings.js`); 
        return ApiResponse.error(res, enums.PROMO_DOES_NOT_EXIST, enums.HTTP_BAD_REQUEST); 
      }
      req.promoDetails = promoDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: about to check if promos exists in the DB
     checkIfPromoExists.middlewares.settings.js`); 
    for (const id of body) {
      const promoDetails = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, id.promo_id);
      if (!promoDetails) {
        return ApiResponse.error(res, enums.PROMO_DOES_NOT_EXIST, enums.HTTP_BAD_REQUEST); 
      }
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_PROMO_EXISTS_MIDDLEWARE;
    logger.error(`checking if promo exists failed::${enums.CHECK_IF_PROMO_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);    
  }
};

/**
 * checks promo status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */

export const checkPromoStatus = async(req, res, next) => {
  try {
    const { params: { promo_id }, admin } = req;
    const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, promo_id);
    if (promo.status !== 'inactive') {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully checks promo status
      checkPromoStatus .middlewares.settings.js`); 
      return ApiResponse.error(res, enums.PROMO_CAN_NOT_BE_EDITED, enums.HTTP_BAD_REQUEST);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_PROMO_STATUS_MIDDLEWARE;
    logger.error(`checking promo status failed::${enums.CHECK_PROMO_STATUS_MIDDLEWARE}`, error.message);
    return next(error);    
  }
};

/**
 * checks if promo is Active
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */

export const checkIfPromoIsActive = async(req, res, next) => {
  try {
    const {   admin, body } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: about to check through each promos if still of active status
    checkIfPromoIsActive.middlewares.settings.js`); 
    for (const id of body) {
      const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, id.promo_id);
      if (promo.status === 'active') {
        return ApiResponse.error(res, enums.PROMO_CAN_NOT_BE_DELETED, enums.HTTP_BAD_REQUEST);
      }   
    }
    return next(); 
  } catch (error) {
    error.label = enums.CHECK_IF_PROMO_IS_ACTIVE_MIDDLEWARE;
    logger.error(`checking if promo is active failed::${enums.CHECK_IF_PROMO_IS_ACTIVE_MIDDLEWARE}`, error.message);
    return next(error);       
  }
};

/**
 * checks if Admin created promo
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminSettingsMiddleware
 */

export const checkIfAdminCreatedPromo = async(req, res, next) => {
  try {
    const { admin, body, params: { promo_id } } = req;
    if (promo_id) {
      const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, promo_id);
      if (admin.role_type === 'SADM' || admin.admin_id === promo.created_by) {
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: confirms that admin is not the creator of the promo and not the super admin
      checkIfAdminCreatedPromo.middlewares.settings.js`); 
      return ApiResponse.error(res, enums.ADMIN_DID_NOT_CREATE_PROMO(promo.name), enums.HTTP_BAD_REQUEST);
    }
    for (const id of body) {
      const promo = await processOneOrNoneData(settingsQueries.fetchSinglePromoDetails, id.promo_id);
      if (admin.role_type === 'SADM' || admin.admin_id === promo.created_by) {
        return next();
      }
      return ApiResponse.error(res, enums.ADMIN_DID_NOT_CREATE_PROMO(promo.name), enums.HTTP_BAD_REQUEST);
    }
  } catch (error) {
    error.label = enums.CHECK_IF_ADMIN_CREATED_PROMO_MIDDLEWARE;
    logger.error(`checking if admin created promo failed::${enums.CHECK_IF_ADMIN_CREATED_PROMO_MIDDLEWARE}`, error.message);
    return next(error);       
  }
};

