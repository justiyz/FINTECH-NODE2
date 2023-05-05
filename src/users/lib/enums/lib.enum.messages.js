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
export const ACCOUNT_NOT_PREVIOUSLY_VERIFIED = 'User account has not been previously verified';
export const NO_TOKEN = 'Please provide a token';
export const INVALID_TOKEN = 'Invalid/Expired Token';
export const SESSION_EXPIRED = 'Session expired';
export const USER_ACCOUNT_STATUS = (status) => `User account is ${status}`;
export const KYC_PREVIOUSLY_COMPLETED = 'User KYC has been previously completed';
export const KYC_NOT_PREVIOUSLY_COMPLETED = 'User has not completed KYC';
export const SELFIE_IMAGE_PREVIOUSLY_UPLOADED = 'User selfie image has been previously uploaded';
export const SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED = 'User selfie image is yet to be uploaded, kindly do this first';
export const BVN_PREVIOUSLY_VERIFIED = 'User bvn has been previously verified';
export const BVN_NOT_PREVIOUSLY_VERIFIED = 'User is yet to verify bvn, kindly do this first';
export const BVN_USED_BY_ANOTHER_USER = 'This BVN has been used by another user';
export const USER_FIRST_NAME_NOT_MATCHING_BVN_NAME = 'User\'s first name does not match bvn first name';
export const USER_LAST_NAME_NOT_MATCHING_BVN_NAME = 'User\'s last name does not match bvn last name';
export const USER_MIDDLE_NAME_NOT_MATCHING_BVN_NAME = 'User\'s middle name does not match bvn middle name';
export const USER_GENDER_NOT_MATCHING_BVN_GENDER = 'User\'s gender does not match bvn gender';
export const USER_DOB_NOT_MATCHING_BVN_DOB = 'User\'s date of birth does not match bvn date of birth';
export const ALREADY_CREATED = (type) => `${type} already created`;
export const USER_CREDENTIALS = (type) => `User ${type} have not been created.`;
export const USER_ACCOUNT_VERIFIED = 'Account verified successfully';
export const USER_LOGIN_SUCCESSFULLY = 'User logged in successfully';
export const USER_PROFILE_COMPLETED = 'User profile completed successfully';
export const USER_EMAIL_EXIST = 'Account with this email address already exist';
export const USER_FCM_TOKEN_UPDATED = 'User fcm token updated';
export const USER_LOAN_STATUS_OVERDUE = 'Certain Users loan status updated to overdue';
export const DUE_FOR_PAYMENT_LOAN_REPAYMENT_INITIATED = 'Certain due for payments loan repayments initiated successfully';
export const CARD_PAYMENT_SUCCESS_STATUS_RECORDED = 'Card payment success status recorded successfully';
export const BANK_TRANSFER_SUCCESS_STATUS_RECORDED = 'Transfer payment recorded successfully';
export const BANK_TRANSFER_REVERSED_PAYMENT_RECORDED = 'Transfer reversed payment recorded successfully';
export const REFUND_STATUS_SAVED = (type) => `transaction refund ${type} saved to the DB`;
export const PAYSTACK_WEBHOOK_EVENT_TYPE_NOT_CATERED_FOR = 'Paystack webhook event type not catered for';
export const TRANSACTION_REFUND_INITIATED_FAILED = 'Transaction refund initiation failed';
export const INVALID_EMAIL_ADDRESS = 'Invalid email/password'; // mobile listens for this error message to perform an action be careful when changing
export const INVALID_PASSWORD = 'Invalid email or password';
export const INVALID_PIN = 'Invalid pin';
export const DEVICE_TOKEN_REQUIRED = 'device token is required in payload';
export const NEW_DEVICE_DETECTED = 'New device login, verify account with OTP sent to your registered phone number';
export const IS_VALID_CREDENTIALS = (type) => `New ${type} cannot be the same as old ${type}`;
export const PASSWORD_RESET = 'Password reset successful';
export const USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY = 'User selfie image updated successfully';
export const USER_BVN_VERIFIED_SUCCESSFULLY = 'User bvn verified successfully';
export const USER_REFRESH_TOKEN_UPDATED = 'User refresh token updated successfully';
export const INVALID_USER_REFRESH_TOKEN = 'Invalid refresh token';
export const ACCOUNT_DETAILS_PREVIOUSLY_SAVED = 'Account details previously saved by user';
export const BANK_ACCOUNTS_LIMITS_REACHED = 'User cannot save more than 3 bank accounts';
export const DEBIT_CARDS_LIMITS_REACHED = 'User cannot save more than 2 debit cards';
export const USER_IS_ON_AN_ACTIVE_LOAN = 'User is on an active loan, action cannot be performed';
export const USER_ADVANCED_KYC_NOT_COMPLETED = (type) => `kindly update your ${type} in profile to continue application`;
export const ACCOUNT_DETAILS_NOT_EXISTING = 'Account details does not exist';
export const ACCOUNT_ALREADY_DEFAULT_ACCOUNT = 'Account is already default account';
export const ACCOUNT_ALREADY_DISBURSEMENT_ACCOUNT = 'Account is already disbursement account';
export const ACCOUNT_DETAILS_NOT_USERS = 'Account details does not belong to user';
export const ACCOUNT_USER_NOT_OWNED_BY_USER = 'Account details does not belong to user';
export const BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY = (type) => `Account details ${type} status updated successfully`;
export const GENERATE_RESET_PASSWORD_TOKEN = (type) => `${type} token Successfully generated`;
export const PASSWORD_TOKEN = 'Password reset token sent';
export const BANK_ACCOUNT_SAVED_SUCCESSFULLY = 'Bank account added successfully';
export const BANK_ACCOUNTS_FETCHED_SUCCESSFULLY = 'Bank accounts fetched successfully';
export const DEBIT_CARDS_FETCHED_SUCCESSFULLY = 'Debit cards fetched successfully';
export const BANK_ACCOUNT_DELETED_SUCCESSFULLY = 'Bank account deleted successfully';
export const REQUEST_EMAIL_VERIFICATION = 'Email verification link sent Successfully to user email.';
export const VERIFY_EMAIL = 'Email verified successfully.';
export const EMAIL_ALREADY_VERIFIED = 'User email already verified.';
export const EMAIL_NOT_VERIFIED = 'User email not verified, kindly verify email to continue';
export const ID_UPLOAD_VERIFICATION = 'User id successfully verified';
export const CHECK_USER_ID_VERIFICATION = 'User Id already verified,  kindly contact support team if you want to update id.';
export const CHECK_USER_ADDRESS_VERIFICATION = 'User address already verified,  kindly contact support team if you want to update address info.';
export const CHECK_USER_UTILITY_BILL_VERIFICATION = 'User uploaded utility bill already verified,  kindly contact support team if you want to update utility bill details';
export const USER_UTILITY_BILL_VERIFICATION_PENDING = 'User uploaded utility bill is still being verified, kindly wait for the verification decision';
export const USER_ADDRESS_VERIFICATION_STILL_PENDING = 'User address verification is still pending, you will ne informed once it is verified';
export const USER_ADDRESS_CANNOT_BE_UPDATED = 'User address cannot be updated, kindly contact admin';
export const USER_VALID_ID_NOT_UPLOADED = 'User valid id not uploaded yet, kindly do this to continue.';
export const USER_ADDRESS_NOT_VERIFIED = 'User address not verified yet, kindly do this to continue.';
export const USER_UTILITY_BILL_NOT_VERIFIED = 'User uploaded utility bill not verified yet, kindly do this to continue.';
export const DETAILS_CAN_NOT_BE_UPDATED = 'Details can not be updated';
export const USER_ADDRESS_UPDATED_SUCCESSFULLY = 'Updated user address successfully, kindly await verification';
export const USER_UTILITY_BILL_UPDATED_SUCCESSFULLY = 'Updated user utility bill successfully, kindly await verification';
export const UPDATED_USER_PROFILE_SUCCESSFULLY = 'Updated user profile successfully';
export const FETCH_USER_PROFILE = 'User profile fetched successfully';
export const CARD_CAN_NOT_BE_SET_AS_DEFAULT = 'Card can not be set as default';
export const CARD_DOES_NOT_EXIST = 'Card does not exist';
export const CARD_ALREADY_SET_DEFAULT = 'Card is already default';
export const CARD_SET_AS_DEFAULT_SUCCESSFULLY = 'Successfully sets card as default';
export const CARD_CAN_NOT_BE_DELETED = 'Card can not be deleted';
export const CARD_DOES_NOT_BELONG_TO_USER = 'Card does not belong to user';
export const CARD_REMOVED_SUCCESSFULLY = 'Card removed successfully';
export const HOMEPAGE_FETCHED_SUCCESSFULLY = 'User homepage details fetched successfully';
export const DEBIT_CARD_REJECTED = 'Card has been rejected';
export const VALIDATE_PASSWORD_OR_PIN = (type) => `Invalid ${type}`;
export const CHANGE_PASSWORD = 'Password changed successful';
export const CREATE_PIN = 'Successfully create pin for user';
export const CHANGE_PIN = 'Pin changed successfully.';
export const CONFIRM_CREDENTIALS = (type) => `User ${type} confirmed successfully.`;
export const NO_DEFAULT_BANK_ACCOUNT = 'Kindly add a bank account as default to proceed';
export const USER_STATUS_INACTIVE_OR_BLACKLISTED = (type) => `User status is ${type} and so cannot apply for loan`;
export const NO_DEFAULT_DEBIT_CARD = 'Kindly add a debit card and set as default to proceed';
export const USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE = 'User cannot apply for a loan greater than maximum allowable amount';
export const USER_REQUESTS_FOR_LOAN_AMOUNT_LESSER_THAN_ALLOWABLE = 'User cannot apply for a loan lesser than minimum allowable amount';
export const USER_REQUESTS_FOR_LOAN_TENOR_GREATER_THAN_ALLOWABLE = 'User cannot apply for a loan for duration greater than maximum allowable tenor';
export const USER_REQUESTS_FOR_LOAN_TENOR_LESSER_THAN_ALLOWABLE = 'User cannot apply for a loan for duration lesser than minimum allowable tenor';
export const USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_EMPLOYMENT_LIMIT_ALLOWABLE = (percentage) => 
  `User cannot apply for a loan greater than ${percentage}% of maximum allowable amount`;
export const UNDERWRITING_SERVICE_NOT_AVAILABLE = 'Loan application not available at the moment kindly try again later';
export const SYSTEM_MAXIMUM_ALLOWABLE_AMOUNT_HAS_NULL_VALUE = 'Action not permitted on this loan application as there is no system maximum allowable amount';
export const LOAN_APPLICATION_DECLINED_DECISION = 'User loan application decline due to ineligibility, kindly try again some other time';
export const LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT = (status) => `Loan has a status of ${status}, thus repayment cannot be processed`;
export const LOAN_APPLICATION_MANUAL_DECISION = 'User loan application is subject to manual decision by admin, kindly be patient for a decision to be made';
export const LOAN_APPLICATION_APPROVED_DECISION = 'User loan application is automatically approved kindly proceed to checkout';
export const LOAN_APPLICATION_NOT_EXISTING = 'loan application does not exist for user';
export const LOAN_PAYMENT_NOT_EXISTING = 'loan payment does not exist for user';
export const LOAN_AMOUNT_NOT_EQUAL_TO_SYSTEM_MAXIMUM_AMOUNT = 'System maximum loan amount needs to be accepted to process loan disbursement';
export const LOAN_APPLICATION_STILL_AWAITS_APPROVAL = 'loan application still awaits approval, disbursement cannot be made';
export const LOAN_APPLICATION_DECLINED = 'loan application declined, disbursement cannot be made';
export const LOAN_APPLICATION_PREVIOUSLY_DISBURSED = (type) => `Loan application status is ${type}, disbursement cannot be made again`;
export const LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN = (type) => `User currently have ${type}, thus cannot apply for another`;
export const LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS = (type) => `Loan application is already ${type}, thus action cannot be performed`;
export const USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES = 'Loan disbursement not available at the moment, kindly try again later or contact support';
export const USER_YOU_VERIFY_ADDRESS_VERIFICATION_ISSUES = 'Address verification not available at the moment, kindly try again later';
export const LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_LOAN_REASON = 
'User has an existing approved loan, kindly cancel or proceed to disbursement for the approved existing loan application';
export const LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL = 'User loan application disbursement initiated successful';
export const SYSTEM_ALLOWABLE_LOAN_AMOUNT_UPDATED__SUCCESSFULLY = 'System maximum allowable loan amount updated successfully';
export const LOAN_APPLICATION_CANCELLING_SUCCESSFUL = 'User loan application cancelled successful';
export const USER_LOAN_DETAILS_FETCHED_SUCCESSFUL = (type) => `User ${type} loan details fetched successful`;
export const USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL = (type) => `User ${type} loan payment details fetched successful`;
export const USER_CURRENT_LOANS_FETCHED_SUCCESSFUL = 'User current loans fetched successful';
export const CLUSTER_NOT_EXISTING = 'Cluster does not exist';
export const CLUSTER_NO_LONGER_EXISTING = 'Cluster no longer exist';
export const CLUSTER_DECISION_TICKET_NOT_EXISTING = 'Cluster decision ticket does not exist';
export const USER_NOT_CLUSTER_MEMBER = 'User does not belong to this cluster';
export const USER_ALREADY_CLUSTER_MEMBER = 'User already belongs to this cluster';
export const USER_HAS_PREVIOUSLY_RAISED_REQUEST_CLUSTER_TICKET = (type) => `User still has an open request to ${type} this cluster, kindly wait till a conclusion is reached`;
export const USER_PREVIOUSLY_DECIDED = 'User has previously taken a decision on this ticket';
export const VOTING_DECISION_ALREADY_CONCLUDED = 'Voting decision for this ticket has been concluded, therefore action cannot be performed anymore';
export const CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE = (type) => `Action cannot be performed on a ${type} cluster`;
export const USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL = (type) => `User ${type} loan payments fetched successful`;
export const FORGOT_PIN_TOKEN = 'Pin reset token sent';
export const PAYMENT_OTP_ACCEPTED = 'payment OTP is valid and transaction is successful';
export const PAYMENT_OTP_REJECTED = 'payment OTP is invalid please check and input valid one';
export const PIN_RESET = 'Pin reset successful';
export const CLUSTER_NAME_ALREADY_EXISTING = (name) => `A cluster with this name "${name}" already exists`;
export const UPDATE_INCOME_FOR_ACTION_PERFORMANCE = 'kindly update income in employment details to perform action';
export const NOT_CATERED_FOR_DECISION_TYPE = 'Decision ticket belongs to a type not catered for yet';
export const CLUSTER_CLOSED_FOR_MEMBERSHIP = 'No member can join this cluster again';
export const USER_NO_CLUSTER_INVITATION = (name) => `User has no active invitation from ${name} cluster`;
export const REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY = 'request to join cluster sent successfully, kindly wait for acceptance';
export const JOIN_CLUSTER_DECISION_CHOICE = (decision) => `User ${decision} request to join cluster successfully`;
export const REQUEST_TO_JOIN_CLUSTER_DECISION = (name) => `User ${name} request to join cluster recorded`;
export const CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING = 'Cluster minimum income is greater than user monthly income';
export const CLUSTER_CREATED_SUCCESSFULLY = 'Cluster created successfully';
export const CLUSTER_FETCHED_SUCCESSFULLY = 'Clusters fetched successfully';
export const CLUSTER_DETAILS_FETCHED_SUCCESSFULLY = 'Cluster details fetched successfully';
export const INVITE_CLUSTER_MEMBER = 'Cluster member invited successfully';
export const CLUSTER_MEMBER_INVITATION = (type) => `Successfully invite cluster member through ${type}`;
export const CLUSTER_MEMBER_NOT_ADMIN = 'Cluster member is not an admin and can not perform this action';
export const CLUSTER_IS_ON_ACTIVE_LOAN = 'Cluster is on an active loan, hence you can not edit this field';
export const USER_CANNOT_TAKE_DECISION_ON_THIS_TICKET = 'User cannot take a decisions on this delete cluster ticket being the author';
export const USER_CAN_NOT_EDIT = (type) => `you can not edit ${type}`;
export const CLUSTER_MEMBERS_FETCHED_SUCCESSFULLY = 'Cluster members fetched successfully';
export const USER_ON_ACTIVE_LOAN = 'You still have active loan on this cluster, kindly pay all for you to leave';
export const USER_IS_AN_ADMIN = 'You are currently the admin, you cannot leave the cluster, kindly assign someone as admin before leaving';
export const USER_IS_NOT_AN_ADMIN = 'You can not perform this action because you are not an admin';
export const USER_LEFT_CLUSTER_SUCCESSFULLY = 'User left cluster successfully';
export const REQUEST_TO_DELETE_CLUSTER = (decision) => `User ${decision} request to delete cluster successfully`;
export const SELECT_NEW_ADMIN = 'Successfully send request to select new admin';
export const CLUSTER_ADMIN_ACCEPTANCE = (decision) => `User successfully ${decision} to become new cluster admin.`;
export const INITIATE_DELETE_CLUSTER = 'Successfully initiate a delete cluster';
export const CLUSTER_DELETED_SUCCESSFULLY = 'Cluster deleted successfully';
export const CLUSTER_EDITED_SUCCESSFULLY = 'Cluster edited successfully';
export const USER_CANNOT_PERFORM_ACTION = 'User cant accept admin invite';
export const NOTIFICATION_UPDATED_SUCCESSFULLY = 'Notification updated successfully';
export const NEXT_OF_KIN_CREATED_SUCCESSFULLY = 'Next of kin created successfully';
export const CANNOT_CHANGE_NEXT_OF_KIN = 'Kindly contact support to change next of kin details';
export const USER_PROFILE_NEXT_UPDATE = (type) => `User can only update ${type} details after 3 months`;
export const EMPLOYMENT_DETAILS = 'User employment details successfully created';
export const EMPLOYMENT_TYPE_ALREADY_EXIST = 'User already created employment type';
export const UPDATE_EMPLOYMENT_DETAILS = 'User employment detail has been updated successfully';


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
export const USER_DETAILS_FETCHED_SUCCESSFULLY = 'User details fetched successfully';
export const USER_ACCOUNT_INFORMATION_FETCHED_SUCCESSFULLY = 'User account information fetched successfully';
export const EDIT_ROLE_DETAILS_SUCCESSFUL = 'Role details edited successfully';
export const EDIT_ADMIN_PERMISSIONS_SUCCESSFUL = 'Admin permissions edited successfully';
export const ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN = 'action cannot be performed on super admin';
export const ACTION_NOT_ALLOWED_FOR_SELF_ADMIN = 'action cannot be performed on self';
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
export const ADMIN_PHONE_NUMBER_EXIST = 'Account with this phone number already exist';
export const IS_ROLE_ACTIVE = (role) => `Role code ${role} is deactivated`;
export const SEARCH_FILTER_ADMINS = 'Searched/filtered admins successfully';
export const CHECK_IF_ROLE_IS_SUPER_ADMIN = 'Kindly confirm that rule is not super admin role';
export const EDIT_ADMIN_STATUS = 'Admin status successfully updated.';
export const USER_PROFILE_PREVIOUSLY_COMPLETED = 'User profile already completed';
export const USER_HAS_NOT_UPLOADED_UTILITY_BILL = 'User has not uploaded any utility bill';
export const USER_UTILITY_BILL_PREVIOUSLY_APPROVED = 'User utility bill has been previously approved';
export const NOTIFICATION_SENT_TO_USER_SUCCESSFULLY = 'Notification sent to user successfully';
export const ADMIN_CURRENT_STATUS = (status) => `Admin status is already ${status} in the DB.`;
export const USER_CURRENT_STATUS = (status) => `User status is already ${status} in the DB.`;
export const FETCH_ADMIN_PROFILE = 'Admin profile fetched successfully';
export const PLATFORM_OVERVIEW_PAGE_FETCHED = 'Platform overview details fetched successfully';
export const ROLES_FETCHED_SUCCESSFULLY = 'Roles fetched successfully';
export const ADMINS_PER_ROLES_FETCHED_SUCCESSFULLY = 'Admins per role fetched successfully';
export const EDIT_USER_STATUS = 'User status successfully updated.';
export const USERS_FETCHED_SUCCESSFULLY = 'Users fetched successfully';
export const FETCH_USER_ORR_BREAKDOWN = 'User ORR breakdown fetched successfully';
export const DOCUMENT_UPLOADED_AND_SAVED_SUCCESSFULLY_FOR_USER = 'Document uploaded and saved successfully for user';
export const ADMIN_USER_UPLOADED_DOCUMENTS_FETCHED = 'Admin uploaded user documents fetched successfully';
export const FETCH_USER_KYC_DETAILS = 'User kyc details fetched successfully';
export const USER_UTILITY_BILL_DECIDED_SUCCESSFULLY = (decision) => `User uploaded utility bill ${decision} successfully`;
export const UPLOAD_DOCUMENT_VALIDATION = 'Please upload document';
export const FILE_SIZE_TOO_BIG = 'Please upload a file less than 3MB';
export const UPLOAD_PDF_DOCUMENT_VALIDATION = 'Please upload a .pdf extension document file';
export const UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION = 'Please upload a .jpeg or .jpg or .png extension image file';
export const GENERATE_ADMIN_RESET_PASSWORD_TOKEN =  'Password token Successfully generated';
export const LOAN_APPLICATION_NOT_EXISTING_IN_DB = 'loan application does not exist';
export const LOAN_APPLICATION_STATUS = (status) => `loan application has status ${status}, thus action cannot be performed`;
export const LOAN_APPLICATION_DECISION = (decision) => `Loan application ${decision} successfully`;
export const LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY = 'loan application details fetched successfully';
export const ADMIN_FETCH_CLUSTER_DETAILS = 'Admin fetched user clusters successfully';
export const ADMIN_FETCH_MEMBER_CLUSTER_DETAILS = 'Admin fetched cluster member details successfully';
export const ADMIN_CHECK_IF_CLUSTER_EXIST = 'Cluster does not exist';
export const LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY = 'loan applications fetched successfully';
export const REPAID_LOANS_FETCHED_SUCCESSFULLY = 'Repaid loans fetched successfully';
export const FETCH_ENV_VALUES_SUCCESSFULLY = 'Fetched env values successfully';
export const UPDATED_ENV_VALUES_SUCCESSFULLY = 'Updated env values successfully';
