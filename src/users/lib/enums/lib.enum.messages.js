export const ERROR_STATUS = 'Error';
export const SUCCESS_STATUS = 'Success';
export const SERVER_ERROR = 'Server Error';
export const WELCOME = 'Welcome to Seedfi';
export const DEAD_END_MESSAGE = 'Resource Not Found';
export const SOMETHING_BROKE_MESSAGE = 'Oooops! Something broke, kindly try later';
export const ACCOUNT_EXIST = 'Account already exist';
export const ACCOUNT_ALREADY_VERIFIED = 'Account already verified';
export const ACCOUNT_NOT_EXIST = (type) => `${type} account does not exist`;
export const INVALID = (text) => `Invalid ${text}`;
export const EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN = 'Email has been verified OR verification token is invalid';
export const ACCOUNT_CREATED = 'Account created successfully';
export const VERIFICATION_OTP_RESENT = 'OTP code sent';
export const NO_AUTHORIZATION = 'Authorization Token Is Required';
export const INVALID_AUTHORIZATION = 'Invalid Authorization Token';
export const NOT_SUCCESSFUL_TRANSACTION = 'Payment was not successful';
export const PAYMENT_RECORD_NOT_FOUND = 'Payment transaction record not found';
export const REFUND_NOT_INITIATED_FOR_PAYMENT_TRANSACTION = 'Refund not initiated for payment transaction';
export const PAYMENT_EARLIER_RECORDED = 'Payment transaction status has been previously recorded';
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
export const CARD_PAYMENT_SUCCESS_STATUS_RECORDED = 'Card payment success status recorded successfully';
export const REFUND_STATUS_SAVED = (type) => `transaction refund ${type} saved to the DB`;
export const PAYSTACK_WEBHOOK_EVENT_TYPE_NOT_CATERED_FOR = 'Paystack webhook event type not catered for';
export const TRANSACTION_REFUND_INITIATED_FAILED = 'Transaction refund initiation failed';
export const INVALID_EMAIL_ADDRESS = 'Invalid email/password'; // mobile listens for this error message to perform an action be careful when changing
export const INVALID_PASSWORD = 'Invalid email or password';
export const PASSWORD_RESET = 'Password reset successful';
export const USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY = 'User selfie image updated successfully';
export const USER_BVN_VERIFIED_SUCCESSFULLY = 'User bvn verified successfully';
export const USER_REFRESH_TOKEN_UPDATED = 'User refresh token updated successfully';
export const INVALID_USER_REFRESH_TOKEN = 'Invalid refresh token';
export const ACCOUNT_DETAILS_PREVIOUSLY_SAVED = 'Account details previously saved by user';
export const USER_IS_ON_AN_ACTIVE_LOAN = 'User is on an active loan, action cannot be performed';
export const ACCOUNT_DETAILS_NOT_EXISTING = 'Account details does not exist';
export const ACCOUNT_ALREADY_DEFAULT_ACCOUNT = 'Account is already default account';
export const ACCOUNT_ALREADY_DISBURSEMENT_ACCOUNT = 'Account is already disbursement account';
export const ACCOUNT_DETAILS_NOT_USERS = 'Account details does not belong to user';
export const ACCOUNT_USER_NOT_OWNED_BY_USER = 'Account details does not belong to user';
export const BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY = (type) => `Account details ${type} status updated successfully`;
export const GENERATE_RESET_PASSWORD_TOKEN = 'Password token Successfully generate';
export const PASSWORD_TOKEN = 'Password reset token sent';
export const BANK_ACCOUNT_SAVED_SUCCESSFULLY = 'Bank account added successfully';
export const BANK_ACCOUNTS_FETCHED_SUCCESSFULLY = 'Bank accounts fetched successfully';
export const DEBIT_CARDS_FETCHED_SUCCESSFULLY = 'Debit cards fetched successfully';
export const BANK_ACCOUNT_DELETED_SUCCESSFULLY = 'Bank account deleted successfully';
export const REQUEST_EMAIL_VERIFICATION = 'Email verification link sent Successfully to user email.';
export const VERIFY_EMAIL = 'Email verified successfully.';
export const EMAIL_ALREADY_VERIFIED = 'User email already verified.';
export const EMAIL_NOT_VERIFIED = 'User email not verified';
export const  ID_UPLOAD_VERIFICATION = 'User id successfully verified';
export const CHECK_USER_ID_VERIFICATION = 'User Id already verified,  kindly contact support team if you want to update id.';
export const DETAILS_CAN_NOT_BE_UPDATED = 'Details can not be updated';
export const UPDATED_USER_PROFILE_SUCCESSFULLY = 'Updated user profile successfully';
export const FETCH_USER_PROFILE = 'User profile fetched successfully';
export const CARD_CAN_NOT_BE_SET_AS_DEFAULT = 'Card can not be set as default';
export const CARD_DOES_NOT_EXIST = 'Card does not exist';
export const CARD_SET_AS_DEFAULT_SUCCESSFULLY = 'Successfully sets card as default';
export const CARD_CAN_NOT_BE_DELETED = 'Card can not be deleted';
export const CARD_DOES_NOT_BELONG_TO_USER = 'Card does not belong to user';
export const CARD_REMOVED_SUCCESSFULLY = 'Card removed successfully';


// admin module related messages
export const LOGIN_REQUEST_SUCCESSFUL = 'Login request successful, kindly check your mail';
export const ADMIN_HAS_NO_PERMISSIONS = 'Admin has no active permissions';
export const ADMIN_LOGIN_SUCCESSFULLY = 'Admin logged in successfully';
export const PASSWORD_SET_SUCCESSFULLY = 'Password set successfully';
export const ADMIN_PERMISSIONS_FETCHED_SUCCESSFULLY = 'Admin permissions fetched successfully';
export const ADMIN_COMPLETE_PROFILE_SUCCESSFUL = 'Admin complete profile successful';
export const ADMIN_NOT_SET_NEW_PASSWORD = 'Kindly set your new password first';
export const ADMIN_ALREADY_SET_NEW_PASSWORD = 'admin has previously set new password, kindly do change password';
export const ADMIN_ALREADY_COMPLETED_PROFILE = 'admin has previously completed profile, kindly do edit profile';
export const ADMIN_ROLE_NAME_EXISTS = (name) => `A role withe the name "${name}" already exists in the DB`;
export const ADMIN_CANNOT_PERFORM_ACTION = (action, resource) => `Admin cannot perform "${action}" action on ${resource} module`;
export const ADMIN_RESOURCE_ACTION = (resource) => `Admin dose not have resource action ${resource}.`;
export const RESOURCE_ID_SENT_NOT_EXISTS = (resource_id) => `resource with resource id ${resource_id} does not exist`;
export const RESOURCE_REPEATING_IN_PAYLOAD = (resource_name) => `resource "${resource_name}" is repeating more than once`;
export const CANNOT_PERFORM_ACTION_BASED_ON_CURRENT_STATUS = (action, status) => `cannot ${action} a role with ${status} status`;
export const ACTIVATE_DEACTIVATE_ROLE_SUCCESSFULLY = (status) => `Role status set to ${status} successfully`;
export const ROLE_CREATION_SUCCESSFUL = 'Role with permissions created successfully';
export const EDIT_ROLE_DETAILS_SUCCESSFUL = 'Role details edited successfully';
export const EDIT_ADMIN_PERMISSIONS_SUCCESSFUL = 'Admin permissions edited successfully';
export const ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN = 'action cannot be performed on super admin';
export const ADMIN_RESOURCES_FETCHED_SUCCESSFULLY = 'Admin resources fetched successfully';
export const ROLE_PERMISSIONS_FETCHED_SUCCESSFULLY = 'Role details with permissions fetched successfully';
export const NON_SUPER_ADMINS_FETCHED_SUCCESSFULLY = 'Non-super admin roles fetched successfully';
export const ROLE_HAS_BEEN_ASSIGNED_TO_AN_ADMIN = 'Role has already been assigned to an admin';
export const ROLE_DELETED_SUCCESSFULLY = 'Role deleted successfully';
export const ROLE_DOES_NOT_EXIST = 'The role you are trying to delete does not exist in the DB';
export const SUPER_ADMIN_ROLE_NONASSIGNABLE = 'Super admin role cannot be assigned to an admin';
export const VALIDATE_ROLE_CODE_NOT_EXIST = 'Role does not exist';
export const ADMIN_SUCCESSFULLY_INVITED = 'Admin invited successfully.';
export const ADMIN_EMAIL_EXIST = 'Account with this email address already exist';
export const IS_ROLE_ACTIVE = (role) => `Role code ${role} is deactivated`;
export const SEARCH_FILTER_ADMINS = 'Searched/filtered admins successfully';
export const CHECK_IF_ROLE_IS_SUPER_ADMIN = 'Kindly confirm that rule is not super admin role';
export const EDIT_ADMIN_STATUS = 'Admin status successfully updated.';
export const ADMIN_CURRENT_STATUS = (status) => `Admin status is already ${status} in the DB.`;
export const FETCH_ADMIN_PROFILE = 'Admin profile fetched successfully';
export const ROLES_FETCHED_SUCCESSFULLY = 'Roles fetched successfully';
