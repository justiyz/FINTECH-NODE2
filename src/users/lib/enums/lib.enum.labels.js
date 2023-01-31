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
export const STERLING_BVN_VERIFICATION_SERVICE = 'SterlingService::sterlingBvnVerificationCheck';
export const DOJAH_BVN_VERIFICATION_SERVICE = 'DojahService::dojahBvnVerificationCheck';
export const PAYSTACK_FETCH_BANKS_SERVICE = 'PaystackService::fetchBanks';
export const PAYSTACK_RESOLVE_BANK_ACCOUNT_NAME_SERVICE = 'PaystackService::resolveAccount';
export const COMPARE_PIN_MIDDLEWARE = 'AuthMiddleware::comparePin';
export const CHECK_IF__NEW_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE = 'AuthMiddleware::checkIfNewCredentialsSameAsOld';
export const PAYSTACK_INITIATE_CARD_PAYMENT_SERVICE = 'PaystackService::initializeCardPayment';
export const CONFIRM_PAYSTACK_PAYMENT_STATUS_BY_REFERENCE_SERVICE = 'PaystackService::confirmPaystackPaymentStatusByReference';
export const IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE = 'UserMiddleware::isUploadedImageSelfie';
export const IS_VERIFIED_BVN_MIDDLEWARE = 'UserMiddleware::isVerifiedBvn';
export const VERIFY_BVN_MIDDLEWARE = 'UserMiddleware::verifyBvn';
export const UPDATE_BVN_CONTROLLER = 'UserController::updateBvn';
export const UPDATE_USER_FCM_TOKEN_CONTROLLER = 'UserController::updateUserFcmToken';
export const PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE = 'PaymentMiddleware::paystackWebhookVerification';
export const VERIFY_PAYSTACK_PAYMENT_STATUS_MIDDLEWARE = 'PaymentMiddleware::verifyPaystackPaymentStatus';
export const RAISE_REFUND_FOR_CARD_TOKENIZATION_MIDDLEWARE = 'PaymentMiddleware::raiseRefundForCardTokenization';
export const VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE = 'PaymentMiddleware::verifyTransactionPaymentRecord';
export const SAVE_CARD_AUTH_MIDDLEWARE = 'PaymentMiddleware::saveCardAuth';
export const UPDATE_PAYMENT_STATUS_HISTORY_MIDDLEWARE = 'PaymentMiddleware::updatePaymentHistoryStatus';
export const INITIALIZE_CARD_TOKENIZATION_PAYMENT_CONTROLLER = 'PaymentController::initializeCardTokenizationPayment';
export const FINAL_WEBHOOK_RESPONSE_CONTROLLER = 'PaymentController::finalWebhookResponse';
export const FORGOT_PASSWORD_CONTROLLER = 'AuthMiddleware::forgotPassword';
export const RESET_PASSWORD_CONTROLLER = 'AuthMiddleware::resetPassword';
export const CHANGE_PASSWORD_CONTROLLER = 'AuthController::changePassword';
export const CREATE_PIN_CONTROLLER = 'AuthController::createPin';
export const CHANGE_PIN_CONTROLLER = 'AuthController::changePin';
export const CONFIRM_PASSWORD_CONTROLLER = 'AuthController::confirmPassword';
export const CONFIRM_PIN_CONTROLLER = 'AuthController::confirmPin';
export const UPDATE_USER_REFRESH_TOKEN_CONTROLLER = 'UserController::updateUserRefreshToken';
export const VALIDATE_USER_REFRESH_TOKEN_MIDDLEWARE = 'UserMiddleware::validateRefreshToken';
export const UPDATE_SELFIE_IMAGE_CONTROLLER = 'UserMiddleware::updateSelfieImage';
export const GENERATE_RESET_PASSWORD_TOKEN_MIDDLEWARE = 'AuthMiddleware::generateResetPasswordToken';
export const FETCH_BANKS_CONTROLLER = 'UserController::fetchBanks';
export const CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE = 'UserMiddleware::checkAccountPreviouslySaved';
export const CHECK_IF_MAXIMUM_BANK_ACCOUNTS_SAVED_MIDDLEWARE = 'UserMiddleware::checkIfMaximumBankAccountsSaved';
export const CHECK_IF_MAXIMUM_DEBIT_CARDS_SAVED_MIDDLEWARE = 'UserMiddleware::checkIfMaximumDebitCardsSaved';
export const CHECK_USER_LOAN_STATUS_MIDDLEWARE = 'UserMiddleware::checkUserLoanStatus';
export const CHECK_IF_ACCOUNT_DETAILS_EXISTS_MIDDLEWARE = 'UserMiddleware::checkIfAccountDetailsExists';
export const CHECK_ACCOUNT_CURRENT_CHOICE_AND_TYPE_SENT_MIDDLEWARE = 'UserMiddleware::checkAccountCurrentChoicesAndTypeSent';
export const CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE = 'UserMiddleware::checkAccountOwnership';
export const RESOLVE_BANK_ACCOUNT_NUMBER_NAME_MIDDLEWARE = 'UserMiddleware::resolveBankAccountNumberName';
export const SAVE_ACCOUNT_DETAILS_CONTROLLER = 'UserController::saveAccountDetails';
export const FETCH_USERS_ACCOUNT_DETAILS_CONTROLLER = 'UserController::fetchUserAccountDetails';
export const FETCH_USER_DEBIT_CARDS_CONTROLLER = 'UserController::fetchUserDebitCards';
export const DELETE_USER_ACCOUNT_DETAILS_CONTROLLER = 'UserController::deleteUserAccountDetails';
export const UPDATE_USER_ACCOUNT_DETAILS_CHOICE_CONTROLLER = 'UserController::updateAccountDetailsChoice';
export const RETURN_ACCOUNT_DETAILS_CONTROLLER = 'UserController::returnAccountDetails';
export const RESET_PASSWORD_TOKEN_CONTROLLER = 'AuthController::resetPasswordToken';
export const REQUEST_EMAIL_VERIFICATION_CONTROLLER = 'UserController::requestEmailVerification';
export const VERIFY_EMAIL_CONTROLLER = 'UserController::verifyEmail';
export const IS_EMAIL_VERIFIED_MIDDLEWARE = 'UserMiddleware::isEmailVerified';
export const IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE = 'UserMiddleware::isBvnPreviouslyExisting';
export const ID_UPLOAD_VERIFICATION_CONTROLLER = 'AuthController::idUploadVerification';
export const IS_UPDATED_VERIFICATION_ID_MIDDLEWARE = 'UserMiddleware::checkUserIdVerification';
export const CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE = 'UserMiddleware::checkIfBvnIsVerified';
export const UPDATE_USER_PROFILE_CONTROLLER = 'UserController::updateUserProfile';
export const IS_PIN_CREATED_MIDDLEWARE = 'AuthMiddleware::isPinCreated';
export const GET_USER_PROFILE_CONTROLLER = 'UserController::getProfile';
export const VALIDATE_PASSWORD_OR_PIN_MIDDLEWARE = 'AuthMiddleware::validatePasswordOrPin';
export const CHECK_IF_CARD_EXISTS_MIDDLEWARE = 'UserMiddleware::checkIfCardExist';
export const SET_DEFAULT_CARD_CONTROLLER = 'UserController::setDefaultCard';
export const REMOVE_SAVED_CARD_CONTROLLER = 'UserController::removeCard';
export const CHECK_IF_CARD_BELONGS_TO_A_USER_MIDDLEWARE = 'UserMiddleware::checkIfCardBelongsToTheUser';

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
export const ADMIN_PERMISSIONS_CONTROLLER = 'AdminAuthController::adminPermissions';
export const COMPLETE_ADMIN_PROFILE_CONTROLLER = 'AdminAuthController::completeAdminProfile';
export const SEND_ADMIN_PASSWORD_TOKEN_CONTROLLER = 'AdminAuthController::sendAdminPasswordToken';
export const GET_ADMIN_AUTH_TOKEN_MIDDLEWARE = 'AuthMiddleware::getAdminAuthToken';
export const VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::validateAdminAuthToken';
export const ADMIN_ACCESS_MIDDLEWARE = 'AdminRoleMiddleware::adminAccess';
export const CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE = 'AdminRoleMiddleware::checkRoleNameIsUnique';
export const CHECK_IF_SUPER_ADMIN_ROLE_MIDDLEWARE = 'AdminRoleMiddleware::checkIfSuperAdminRole';
export const CHECK_ROLE_CURRENT_STATUS_MIDDLEWARE = 'AdminRoleMiddleware::checkRoleCurrentStatus';
export const CHECK_ADMIN_RESOURCES_MIDDLEWARE = 'AdminRoleMiddleware::checkAdminResources';
export const CREATE_ROLE_CONTROLLER = 'AdminRoleController::createRole';
export const USER_PROFILE_DETAILS_CONTROLLER = 'AdminRoleController::userProfileDetails';
export const USER_ACCOUNT_INFORMATION_CONTROLLER = 'AdminRoleController::userAccountInformation';
export const ADMIN_PERMISSION_RESOURCES_CONTROLLER = 'AdminRoleController::adminPermissionResources';
export const ROLE_PERMISSIONS_CONTROLLER = 'AdminRoleController::rolePermissions';
export const ACTIVATE_DEACTIVATE_ROLE_CONTROLLER = 'AdminRoleController::activateDeactivateRole';
export const EDIT_ADMIN_PERMISSIONS_CONTROLLER = 'AdminAdminController::editAdminPermissions';
export const NON_SUPER_ADMIN_CONTROLLER = 'AdminRoleController::nonSuperAdminRoles';
export const CHECK_IF_ROLE_HAS_BEEN_ASSIGNED = 'AdminRoleMiddleware::checkIfRoleHasBeenAssigned';
export const DELETE_ROLE_CONTROLLER = 'AdminRoleController::deleteRole';
export const CHECK_IF_ROLE_EXIST_MIDDLEWARE = 'AdminRoleMiddleware::checkIfRoleExists';
export const INVITE_ADMIN_CONTROLLER = 'AdminAdminController::inviteAdmin';
export const VALIDATE_ROLE_CODE_MIDDLEWARE = 'AdminRoleMiddleware::validateRoleCode';
export const CHECK_IF_ADMIN_EMAIL_ALREADY_EXIST_MIDDLEWARE = 'AdminAminMiddleware::checkIfAminEmailAlreadyExist';
export const CHECK_IF_SUPER_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::checkIfSuperAdmin';
export const CHECK_IF_AUTHENTICATED_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::checkIfAuthenticatedAdmin';
export const CHECK_IF_ADMIN_EXISTS_MIDDLEWARE = 'AdminAdminMiddleware::checkIfAdminExists';
export const CHECK_IF_USER_EXISTS_MIDDLEWARE = 'AdminAdminMiddleware::checkIfUserExists';
export const IS_ROLE_ACTIVE_MIDDLEWARE = 'AdminRoleMiddleware::isRoleActive';
export const FETCH_ALL_ADMINS_CONTROLLER = 'AdminAdminController::fetchAllAdmins';
export const EDIT_ADMIN_STATUS_CONTROLLER = 'AdminAdminController::editAdminStatus';
export const CHECK_ADMIN_CURRENT_STATUS_MIDDLEWARE = 'AdminAdminMiddleware::checkAdminCurrentStatus';
export const CHECK_USER_CURRENT_STATUS_MIDDLEWARE = 'AdminUserMiddleware::checkUserCurrentStatus';
export const FETCH_ROLES = 'AdminRoleController::fetchRoles';
export const GET_PROFILE_CONTROLLER = 'AdminAdminController::getProfile';
export const USER_LOAN_STATUS_MIDDLEWARE = 'AdminUserMiddleware::userLoanStatus';
export const EDIT_USER_STATUS_CONTROLLER = 'AdminUserController::editUserStatus';
export const FETCH_USERS_CONTROLLER = 'AdminUserController::fetchUsers';
