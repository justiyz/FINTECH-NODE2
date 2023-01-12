import dayjs from 'dayjs';

export const CURRENT_TIME_STAMP = `${dayjs().format('DD-MMM-YYYY, HH:mm:ss')}`;
export const VALIDATE_DATA_MIDDLEWARE = 'ModelMiddleware::validateData';
export const VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE = 'UserMiddleware::validateUnAuthenticatedUser';
export const SIGNUP_CONTROLLER = 'AuthController::signup';
export const RESEND_SIGNUP_OTP_CONTROLLER = 'AuthController::resendSignupOtp';
export const VERIFY_ACCOUNT_CONTROLLER = 'AuthController::verifyAccount';
export const LOGIN_CONTROLLER = 'AuthController::login';
export const COMPLETE_PROFILE_CONTROLLER = 'AuthController::completeProfile';
export const PROCESS_REFERRAL_CONTROLLER = 'AuthController::processReferral';
export const GENERATE_VERIFICATION_TOKEN_MIDDLEWARE = 'AuthMiddleware::generateVerificationToken';
export const GENERATE_REFERRAL_CODE_MIDDLEWARE = 'AuthMiddleware::generateReferralCode';
export const CHECK_IF_REFERRAL_CODE_EXISTS_MIDDLEWARE = 'AuthMiddleware::checkIfReferralCodeExists';
export const VERIFY_VERIFICATION_TOKEN_MIDDLEWARE = 'AuthMiddleware::verifyVerificationToken';
export const VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE = 'UserMiddleware::verifyEmailVerificationToken';
export const GENERATE_TOKENS_MIDDLEWARE = 'AuthMiddleware::generateTokens';
export const GET_AUTH_TOKEN_MIDDLEWARE = 'AuthMiddleware::getAuthToken';
export const VALIDATE_AUTH_TOKEN_MIDDLEWARE = 'AuthMiddleware::validateAuthToken';
export const IS_COMPLETED_KYC_MIDDLEWARE = 'AuthMiddleware::isCompletedKyc';
export const IS_PASSWORD_CREATED_MIDDLEWARE = 'AuthMiddleware::isPasswordCreated';
export const CHECK_IF_EMAIL_ALREADY_EXIST_MIDDLEWARE = 'AuthMiddleware::checkIfEmailAlreadyExist';
export const COMPARE_PASSWORD_MIDDLEWARE = 'AuthMiddleware::comparePassword';
export const STERLING_BVN_VERIFICATION_SERVICE = 'DojahService::dojahValidateBvn';
export const IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE = 'UserMiddleware::isUploadedImageSelfie';
export const IS_VERIFIED_BVN_MIDDLEWARE = 'UserMiddleware::isVerifiedBvn';
export const VERIFY_BVN_MIDDLEWARE = 'UserMiddleware::verifyBvn';
export const UPDATE_BVN_CONTROLLER = 'UserController::updateBvn';
export const UPDATE_USER_FCM_TOKEN_CONTROLLER = 'UserController::updateUserFcmToken';
export const FORGOT_PASSWORD_CONTROLLER = 'AuthMiddleware::forgotPassword';
export const RESET_PASSWORD_CONTROLLER = 'AuthMiddleware::resetPassword';
export const UPDATE_USER_REFRESH_TOKEN_CONTROLLER = 'UserController::updateUserRefreshToken';
export const VALIDATE_USER_REFRESH_TOKEN_MIDDLEWARE = 'UserMiddleware::validateRefreshToken';
export const UPDATE_SELFIE_IMAGE_CONTROLLER = 'UserMiddleware::updateSelfieImage';
export const GENERATE_RESET_PASSWORD_TOKEN_MIDDLEWARE = 'AuthMiddleware::generateResetPasswordToken';
export const RESET_PASSWORD_TOKEN_CONTROLLER = 'AuthMiddleware::resetPasswordToken';
export const REQUEST_EMAIL_VERIFICATION_CONTROLLER = 'UserController::requestEmailVerification';
export const VERIFY_EMAIL_CONTROLLER = 'UserController::verifyEmail';
export const IS_EMAIL_VERIFIED_MIDDLEWARE = 'UserMiddleware::isEmailVerified';
export const IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE = 'UserMiddleware::isBvnPreviouslyExisting';


// Admin related labels
export const VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::validateUnAuthenticatedAdmin';
export const COMPARE_ADMIN_PASSWORD_MIDDLEWARE = 'AdminAuthMiddleware::compareAdminPassword';
export const VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::validateAdminResetPasswordToken';
export const GENERATE_ADMIN_VERIFICATION_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::generateAdminVerificationToken';
export const CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE = 'AdminAuthMiddleware::checkIfChangedDefaultPassword';
export const GENERATE_ADMIN_RESET_PASSWORD_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::generateAdminResetPasswordToken';
export const COMPLETE_ADMIN_LOGIN_REQUEST_CONTROLLER = 'AdminAuthController::completeAdminLoginRequest';
export const VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::verifyLoginVerificationToken';
export const ADMIN_LOGIN_CONTROLLER = 'AdminAuthController::login';
export const ADMIN_FORGOT_PASSWORD_CONTROLLER = 'AdminAuthController::forgotPassword';
export const SET_PASSWORD_CONTROLLER = 'AdminAuthController::setPassword';
export const SEND_ADMIN_PASSWORD_TOKEN_CONTROLLER = 'AdminAuthController::sendAdminPasswordToken';
export const GET_ADMIN_AUTH_TOKEN_MIDDLEWARE = 'AuthMiddleware::getAdminAuthToken';
export const VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::validateAdminAuthToken';
export const ADMIN_ACCESS_MIDDLEWARE = 'AdminRoleMiddleware::adminAccess';
export const CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE = 'AdminRoleMiddleware::checkRoleNameIsUnique';
export const CHECK_ADMIN_RESOURCES_MIDDLEWARE = 'AdminRoleMiddleware::checkAdminResources';
export const CREATE_ROLE_CONTROLLER = 'AdminRoleController::createRole';
export const ADMIN_PERMISSION_RESOURCES_CONTROLLER = 'AdminRoleController::adminPermissionResources';
export const NON_SUPER_ADMIN_CONTROLLER = 'AdminRoleController::nonSuperAdminRoles';
export const CHECK_IF_ROLE_HAS_BEEN_ASSIGNED = 'AdminRoleMiddleware::checkIfRoleHasBeenAssigned';
export const DELETE_ROLE_CONTROLLER = 'AdminRoleController::deleteRole';
export const CHECK_IF_ROLE_EXIST_MIDDLEWARE = 'AdminRoleMiddleware::checkIfRoleExists';
export const INVITE_ADMIN_CONTROLLER = 'AdminController::inviteAdmin';
export const VALIDATE_ROLE_CODE_MIDDLEWARE = 'AdminRoleMiddleware::validateRoleCode';
