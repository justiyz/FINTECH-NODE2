export const ERROR_STATUS = 'Error';
export const SUCCESS_STATUS = 'Success';
export const SERVER_ERROR = 'Server Error';
export const WELCOME = 'Welcome to Seedfi';
export const DEAD_END_MESSAGE = 'Resource Not Found';
export const SOMETHING_BROKE_MESSAGE = 'Oooops! Something broke, kindly try later';
export const ACCOUNT_EXIST = 'Account already exist';
export const ACCOUNT_ALREADY_VERIFIED = 'Account already verified';
export const ACCOUNT_NOT_EXIST = 'Account does not exist';
export const INVALID = (text) => `Invalid ${text}`;
export const EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN = 'Email has been verified OR verification token is invalid';
export const ACCOUNT_CREATED = 'Account created successfully';
export const VERIFICATION_OTP_RESENT = 'OTP code sent';
export const EXPIRED_VERIFICATION_TOKEN = 'Verification OTP is expired';
export const NO_TOKEN = 'Please provide a token';
export const INVALID_TOKEN = 'Invalid/Expired Token';
export const SESSION_EXPIRED = 'Session expired';
export const USER_ACCOUNT_STATUS = (status) => `User account is ${status}`;
export const KYC_PREVIOUSLY_COMPLETED = 'Users KYC has been previously completed';
export const KYC_NOT_PREVIOUSLY_COMPLETED = 'Users has not completed KYC';
export const SELFIE_IMAGE_PREVIOUSLY_UPLOADED = 'Users selfie image has been previously uploaded';
export const SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED = 'Users selfie image is yet to be uploaded, kindly do this first';
export const BVN_PREVIOUSLY_VERIFIED = 'Users bvn has been previously verified';
export const BVN_NOT_PREVIOUSLY_VERIFIED = 'Users is yet to verify bvn, kindly do this first';
export const BVN_USED_BY_ANOTHER_USER= 'This BVN has been used by another user';
export const USER_FIRST_NAME_NOT_MATCHING_BVN_NAME = 'User\'s first name does not match bvn first name';
export const USER_LAST_NAME_NOT_MATCHING_BVN_NAME = 'User\'s last name does not match bvn last name';
export const USER_MIDDLE_NAME_NOT_MATCHING_BVN_NAME = 'User\'s middle name does not match bvn middle name';
export const USER_GENDER_NOT_MATCHING_BVN_GENDER = 'User\'s gender does not match bvn gender';
export const ALREADY_CREATED = (type) => `${type} already created`;
export const USER_ACCOUNT_VERIFIED = 'Account verified successfully';
export const USER_LOGIN_SUCCESSFULLY = 'User logged in successfully';
export const USER_PROFILE_COMPLETED = 'User profile completed successfully';
export const USER_EMAIL_EXIST = 'Account with this email address already exist';
export const USER_FCM_TOKEN_UPDATED = 'User fcm token updated';
export const INVALID_EMAIL_ADDRESS = 'Invalid email/password'; // mobile listens for this error message to perform an action be careful when changing
export const INVALID_PASSWORD = 'Invalid email or password';
export const PASSWORD_RESET = 'Password reset successful';
export const USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY = 'User selfie image updated successfully';
export const USER_BVN_VERIFIED_SUCCESSFULLY = 'User bvn verified successfully';
export const USER_REFRESH_TOKEN_UPDATED = 'User refresh token updated successfully';
export const INVALID_USER_REFRESH_TOKEN = 'Invalid refresh token';
export const GENERATE_RESET_PASSWORD_TOKEN = 'Password token Successfully generate';
export const PASSWORD_TOKEN = 'Password reset token sent';
export const REQUEST_EMAIL_VERIFICATION = 'Email verification otp sent Successfully.';
export const VERIFY_EMAIL = 'Email verified successfully.';
export const EMAIL_ALREADY_VERIFIED = 'User email already verified.';
export const EMAIL_NOT_VERIFIED = 'User email not verified';

// admin module related messages
export const LOGIN_REQUEST_SUCCESSFUL = 'Login request successful, kindly check your mail';
export const ADMIN_HAS_NO_PERMISSIONS = 'Admin has no active permissions';
export const ADMIN_LOGIN_SUCCESSFULLY = 'Admin logged in successfully';
export const ADMIN_ROLE_NAME_EXISTS = (name) => `A role withe the name "${name}" already exists in the DB`;
export const ADMIN_CANNOT_PERFORM_ACTION = (action, resource) => `Admin cannot perform "${action}" action on ${resource} module`;
export const RESOURCE_ID_SENT_NOT_EXISTS = (resource_id) => `resource with resource id ${resource_id} does not exist`;
export const RESOURCE_REPEATING_IN_PAYLOAD = (resource_name) => `resource "${resource_name}" is repeating more than once`;
export const ROLE_CREATION_SUCCESSFUL = 'Role with permissions created successfully';
export const ADMIN_RESOURCES_FETCHED_SUCCESSFULLY = 'Admin resources fetched successfully';
