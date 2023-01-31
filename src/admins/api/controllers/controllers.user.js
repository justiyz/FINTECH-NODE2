import * as UserService from '../services/services.user';
import UserPayload from '../../../admins/lib/payloads/lib.payload.user';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import { adminActivityTracking } from '../../lib/monitor';


/**
 * should activate and deactivate user status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */
export const editUserStatus = async(req, res, next) => {
  const { body: { status } } = req;
  const activityType = status === 'active' ? 19 : 20;
  try {
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    decoded that admin is about to user status. activateAndDeactivateUser.admin.controllers.user.js`);
    await UserService.editUserStatus([ req.params.user_id, req.body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    confirm that user status has been edited and updated in the DB. activateAndDeactivateUser.admin.controllers.user.js`);
    adminActivityTracking(req.admin.admin_id, activityType, 'success');
    return  ApiResponse.success(res, enums.EDIT_USER_STATUS, enums.HTTP_OK);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, activityType, 'fail');
    error.label = enums.EDIT_USER_STATUS_CONTROLLER;
    logger.error(`activate and deactivate user failed:::${enums.EDIT_USER_STATUS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return user profile details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminUserController
 */
export const userProfileDetails = async(req, res, next) => {
  try {
    const { admin, userDetails, params: { user_id } } = req;
    const userReferrals = await UserService.fetchUserReferrals([ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user referrals details fetched from the DB userProfileDetails.admin.controllers.user.js`);
    userDetails.bvn = await UserHash.decrypt(decodeURIComponent(userDetails.bvn));
    const data = {
      personalInformation: userDetails,
      referralCount: userReferrals.length,
      referrals: userReferrals
    };
    return ApiResponse.success(res, enums.USER_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.USER_PROFILE_DETAILS_CONTROLLER;
    logger.error(`fetching user details and referral details from the DB failed:::${enums.USER_PROFILE_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return user account information(debit cards and bank account) details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminUserController
 */
export const userAccountInformation = async(req, res, next) => {
  try {
    const { admin, params: { user_id } } = req;
    const [ userDebitCards, userBankAccount ] = await UserService.fetchUserAccountDetails([ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user debit cards and bank accounts fetched from the DB userAccountInformation.admin.controllers.user.js`);
    await Promise.all(
      userDebitCards.map(async(card) => {
        const decryptedFirst6Digits = await UserHash.decrypt(decodeURIComponent(card.first_6_digits));
        card.first_6_digits = decryptedFirst6Digits;
        const decryptedLast4Digits = await UserHash.decrypt(decodeURIComponent(card.last_4_digits));
        card.last_4_digits = decryptedLast4Digits;
        card.card_expiry = `${card.expiry_month}/${card.expiry_year.slice(-2)}`;
        delete card.expiry_month;
        delete card.expiry_year;
        return card;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user debit cards formatted successfully fetchUserDebitCards.controller.user.js`);
    const data = {
      userDebitCards,
      userBankAccount
    };
    return ApiResponse.success(res, enums.USER_ACCOUNT_INFORMATION_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.USER_ACCOUNT_INFORMATION_CONTROLLER;
    logger.error(`fetching user account information from the DB failed:::${enums.USER_ACCOUNT_INFORMATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return all the users based on specific searches
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminRoleController
 */
export const fetchUsers = async (req, res, next) => {
  try {
    const { query, admin } = req;
    const  payload  = UserPayload.fetchUsers(query);
    const [ users, [ usersCount ] ] = await UserService.fetchUsers(payload);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(usersCount.total_count),
      total_pages: Helpers.calculatePages(Number(usersCount.total_count), Number(req.query.per_page) || 10),
      users
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched users from the DB fetchUsers.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.USERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_USERS_CONTROLLER;
    logger.error(`fetching users in the DB failed:::${enums.FETCH_USERS_CONTROLLER}`, error.message);
    return next(error);
  }
};
