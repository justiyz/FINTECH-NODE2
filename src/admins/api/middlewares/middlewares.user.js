import path from 'path';
import userQueries from '../queries/queries.user';
import UserQueries from '../../../users/api/queries/queries.user';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';
import * as S3 from '../../api/services/services.s3';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import config from '../../../users/config';
import { processAnyData } from '../services/services.db';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import { uploads_admin_document } from "../../lib/monitor/lib.monitor.description";

/**
 * check if user is on active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const userLoanStatus = async(req, res, next) => {
  try {
    if ((req.userDetails.loan_status !== 'inactive') && ((req.body.status === 'deactivated') || (req.body.status === 'suspended'))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user is currently on an active loan userLoanStatus.admin.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_IS_ON_AN_ACTIVE_LOAN, enums.HTTP_FORBIDDEN, enums.USER_LOAN_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user is not on an active loan userLoanStatus.admin.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.USER_LOAN_STATUS_MIDDLEWARE;
    logger.error(`checking if user is on an active loan failed::${enums.USER_LOAN_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check user current status in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const checkUserCurrentStatus = async(req, res, next) => {
  const { body: { status }, userDetails } = req;
  let activityType;
  let descriptionType;
  const userName = `${userDetails.first_name} ${userDetails.last_name}`;
  const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
  switch (status) {
  case 'deactivated':
    activityType = 20;
    descriptionType = descriptions.user_status_failed(adminName, status, userName);
    break;
  case 'suspended':
    activityType = 24;
    descriptionType = descriptions.user_status_failed(adminName, status, userName);
    break;
  case 'watchlisted':
    activityType = 26;
    descriptionType = descriptions.user_status_failed(adminName, status, userName);
    break;
  case 'blacklisted':
    activityType = 25;
    descriptionType = descriptions.user_status_failed(adminName, status, userName);
    break;
  default:
    activityType = 19;
    descriptionType = descriptions.user_status_failed(adminName, status, userName);
    break;
  }

  try {
    if (req.userDetails.status === req.body.status) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:
      decoded that the user is already ${req.body.status} in the DB. checkUserCurrentStatus.admin.middlewares.admin.js`);
      await adminActivityTracking(req.admin.admin_id, activityType, 'fail', descriptionType);
      return ApiResponse.error(res, enums.USER_CURRENT_STATUS(req.body.status), enums.HTTP_BAD_REQUEST, enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE;
    logger.error(`checking user status current status failed::${enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const uploadAdminImage = async(req, res, next) => {
  try {
    const { files, body } = req;
    const file_name = req.files.image.md5;
    if (!files || (files && !files.image)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: No file is being selected for upload uploadImage.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 63, 'fail', descriptions.uploads_admin_image(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.UPLOAD_IMAGE_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_IMAGE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: To be uploaded image file exists uploadImage.admin.middlewares.user.js`);
    const fileExt = path.extname(files.image.name);
    if (files.image.size > 3197152) { // 3 MB
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: File size is greater than 3MB uploadImage.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 63, 'fail', descriptions.uploads_admin_image(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.FILE_SIZE_TOO_BIG, enums.HTTP_BAD_REQUEST, enums.UPLOAD_IMAGE_MIDDLEWARE);
    }

    const acceptedImageFileTypes = [ '.png', '.jpg', '.jpeg' ]; // Additional image formats
    if (body.type === 'image' && !acceptedImageFileTypes.includes(fileExt)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: Image type is not a jpeg, jpg, or png file uploadImage.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_admin_image(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.UPLOAD_AN_IMAGE_IMAGE_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_IMAGE_MIDDLEWARE);
    }

    const url = `files/event-images/${files.image.name}`; // Adjust the S3 bucket path as needed
    if (config.SEEDFI_NODE_ENV === 'test') {
      req.image = encodeURIComponent(
        await UserHash.encrypt({
          image_url: 'https://p-i.s3.us-west-2.amazonaws.com/files/user-images/user-af4922be60fd1b85068ed/land%20ownership%20proof.jpg',
          image_extension: fileExt
        })
      );
      return next();
    }

    const payload = Buffer.from(files.image.data, 'binary');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: Upload payload and URL set uploadImage.admin.middlewares.user.js`);
    const contentType = 'image/' + (fileExt === '.jpg' ? 'jpeg' : 'png'); // Set content type for image files

    const data = await S3.uploadFile(url, payload, contentType);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: Image uploaded to Amazon S3 bucket uploadImage.admin.middlewares.user.js`);

    req.image = encodeURIComponent(
      await UserHash.encrypt({ image_url: data.Location, image_extension: fileExt })
    );

    return next();
  } catch (error) {
    error.label = enums.UPLOAD_IMAGE_MIDDLEWARE;
    logger.error(`Uploading image to Amazon S3 failed::${enums.UPLOAD_IMAGE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * uploading document to s3 for user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const uploadDocument = async(req, res, next) => {
  try {
    const { files, userDetails, body } = req;
    const userName = `${userDetails.first_name} ${userDetails.last_name}`;
    if (!files || (files && !files.document)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: no file is being selected for upload uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23,  'fail', descriptions.uploads_document_failed(`${req.admin.first_name} ${req.admin.last_name}`, userName));
      return ApiResponse.error(res, enums.UPLOAD_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: to be uploaded file is existing uploadDocument.admin.middlewares.user.js`);
    const fileExt = path.extname(files.document.name);
    if (files.document.size > 3197152) { // 3 MB
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: file size is greater than 3MB uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_document_failed(`${req.admin.first_name} ${req.admin.last_name}`, userName));
      return ApiResponse.error(res, enums.FILE_SIZE_TOO_BIG, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    if (body.type === 'file' && fileExt !== '.pdf') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: document type is not a pdf file uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_document_failed(`${req.admin.first_name} ${req.admin.last_name}`, userName));
      return ApiResponse.error(res, enums.UPLOAD_PDF_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    const acceptedImageFileTypes = [ '.png', '.jpg', '.jpeg' ];
    if (body.type === 'image' && !acceptedImageFileTypes.includes(fileExt)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: document type is not a jpeg, jpg or png file uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_document_failed(`${req.admin.first_name} ${req.admin.last_name}`, userName));
      return ApiResponse.error(res, enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    const url = `files/user-documents/${userDetails.user_id}/${body.title.trim()}/${files.document.name}`;
    if (config.SEEDFI_NODE_ENV === 'test') {
      req.document = encodeURIComponent(
        await UserHash.encrypt({
          document_url: 'https://p-i.s3.us-west-2.amazonaws.com/files/user-documents/user-af4922be60fd1b85068ed/land%20ownership%20proof.doc',
          document_extension: fileExt
        })
      );
      return next();
    }
    const payload = Buffer.from(files.document.data, 'binary');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: upload payload and url set uploadDocument.admin.middlewares.user.js`);
    const contentType = body.type === 'file' ? 'application/pdf' : 'image/png';
    const data  = await S3.uploadFile(url, payload, contentType);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:file uploaded to amazon s3 bucket uploadDocument.admin.middlewares.user.js`);
    req.document = encodeURIComponent(
      await UserHash.encrypt({ document_url: data.Location, document_extension: fileExt })
    );
    return next();
  } catch (error) {
    error.label = enums.UPLOAD_DOCUMENT_MIDDLEWARE;
    logger.error(`uploading document to amazon s3 failed::${enums.UPLOAD_DOCUMENT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * uploading document to s3 for user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const uploadAdminDocument = async(req, res, next) => {
  try {
    const { files, body } = req;
    const file_name = req.files.document.md5;
    if (!files || (files && !files.document)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: no file is being selected for upload uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23,  'fail', descriptions.uploads_admin_document(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.UPLOAD_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: to be uploaded file is existing uploadDocument.admin.middlewares.user.js`);
    const fileExt = path.extname(files.document.name);
    if (files.document.size > 3197152) { // 3 MB
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: file size is greater than 3MB uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_admin_document(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.FILE_SIZE_TOO_BIG, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    const acceptedImageFileTypes = [ '.png', '.jpg', '.jpeg' ];
    if (body.type === 'image' && !acceptedImageFileTypes.includes(fileExt)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: document type is not a jpeg, jpg or png file uploadDocument.admin.middlewares.user.js`);
      await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_admin_document(`${req.admin.first_name} ${req.admin.last_name}`, file_name));
      return ApiResponse.error(res, enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_DOCUMENT_MIDDLEWARE);
    }
    const url = `files/event-documents/${files.document.name}`;
    if (config.SEEDFI_NODE_ENV === 'testz') {
      req.document = encodeURIComponent(
        await UserHash.encrypt({
          document_url: 'https://p-i.s3.us-west-2.amazonaws.com/files/user-documents/user-af4922be60fd1b85068ed/land%20ownership%20proof.doc',
          document_extension: fileExt
        })
      );
      return next();
    }
    const payload = Buffer.from(files.document.data, 'binary');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: upload payload and url set uploadDocument.admin.middlewares.user.js`);
    const contentType = body.type === 'file' ? 'application/pdf' : 'image/png';
    const data  = await S3.uploadFile(url, payload, contentType);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:file uploaded to amazon s3 bucket uploadDocument.admin.middlewares.user.js`);
    req.document = encodeURIComponent(
      await UserHash.encrypt({ document_url: data.Location, document_extension: fileExt })
    );
    return next();
  } catch (error) {
    error.label = enums.UPLOAD_DOCUMENT_MIDDLEWARE;
    logger.error(`uploading document to amazon s3 failed::${enums.UPLOAD_DOCUMENT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user exists in the DB based on user_id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const checkIfUserExists = async(req, res, next) => {
  try {
    // const { params: { user_id } } = req;
    const user_id = req.params.user_id || req.body.user_id;
    const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ user_id ]);
    if (userDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:
        successfully confirms that user being queried exists in the DB checkIfUserExists.admin.middlewares.user.js`);
      const [ userEmploymentDetails ] = await processAnyData(userQueries.getUserEmploymentDetails, [ user_id ]);
      const [ userAddressDetails ] = await processAnyData(userQueries.getUserAddressDetails, [ user_id ]);
      const [ userNextOfKinDetails ] = await processAnyData(UserQueries.getUserNextOfKin, [ user_id ]);
      req.userDetails = userDetails;
      req.userEmploymentDetails = userEmploymentDetails;
      req.userAddressDetails = userAddressDetails;
      req.userNextOfKinDetails = userNextOfKinDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:
      successfully confirms that user being queried does not exists in the DB checkIfUserExists.admin.middlewares.user.js`);
    return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('user'), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_USER_EXISTS_MIDDLEWARE;
    logger.error(`checking if queried user id exists in the DB failed::${enums.CHECK_IF_USER_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * admin check cluster exists in the DB based on cluster and user_id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const adminCheckIfClusterExists = async(req, res, next) => {
  try {
    const { params: { cluster_id } } = req;
    const [ existingCluster ] = await processAnyData(userQueries.checkIfClusterExists, [ cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: checked if cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
    if (!existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: cluster does not exist in the DB checkIfClusterExists.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.ADMIN_CHECK_IF_CLUSTER_EXIST, enums.HTTP_BAD_REQUEST, enums.ADMIN_CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
    req.cluster = existingCluster;
    return next();
  } catch (error) {
    error.label = enums.ADMIN_CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE_MIDDLEWARE;
    logger.error(`checking if cluster exists failed::${enums.ADMIN_CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * admin check cluster member exists in the DB based on cluster and user_id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const checkIfUserBelongsToCluster = async(req, res, next) => {
  try {
    const { params, cluster } = req;
    const [ clusterMember ] = await processAnyData(userQueries.fetchClusterMemberDetails, [ params.user_id, cluster.cluster_id ]);
    if (!clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user does not belong to this cluster adminCheckIfClusterMemberExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_NOT_CLUSTER_MEMBER, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_BELONGS_TO_CLUSTER_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user belongs to this cluster and can proceed
    adminCheckIfClusterMemberExist.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_BELONGS_TO_CLUSTER_MIDDLEWARE;
    logger.error(`checking if user belongs to cluster failed::${enums.CHECK_IF_USER_BELONGS_TO_CLUSTER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
