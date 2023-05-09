import dayjs from 'dayjs';

export const CURRENT_TIME_STAMP = `${dayjs().format('DD-MMM-YYYY, HH:mm:ss')}`;
export const VALIDATE_DATA_MIDDLEWARE = 'ModelMiddleware::validateData';
export const VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE = 'UserMiddleware::validateUnAuthenticatedUser';
export const SIGNUP_CONTROLLER = 'AuthController::signup';
export const RESEND_SIGNUP_OTP_CONTROLLER = 'AuthController::resendSignupOtp';
export const VERIFY_ACCOUNT_CONTROLLER = 'AuthController::verifyAccount';
export const LOGIN_CONTROLLER = 'AuthController::login';
export const COMPLETE_PROFILE_CONTROLLER = 'AuthController::completeProfile';
export const GENERATE_REFERRAL_CODE_MIDDLEWARE = 'AuthMiddleware::generateReferralCode';
export const CHECK_IF_USER_ACCOUNT_NOT_VERIFIED_MIDDLEWARE = 'AuthMiddleware::checkIfUserAccountNotVerified';
export const CHECK_IF_REFERRAL_CODE_EXISTS_MIDDLEWARE = 'AuthMiddleware::checkIfReferralCodeExists';
export const VERIFY_VERIFICATION_TOKEN_MIDDLEWARE = 'AuthMiddleware::verifyVerificationToken';
export const VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE = 'UserMiddleware::verifyEmailVerificationToken';
export const VALIDATE_AUTH_TOKEN_MIDDLEWARE = 'AuthMiddleware::validateAuthToken';
export const IS_COMPLETED_KYC_MIDDLEWARE = 'AuthMiddleware::isCompletedKyc';
export const IS_PASSWORD_CREATED_MIDDLEWARE = 'AuthMiddleware::isPasswordCreated';
export const CHECK_IF_EMAIL_ALREADY_EXIST_MIDDLEWARE = 'AuthMiddleware::checkIfEmailAlreadyExist';
export const COMPARE_PASSWORD_MIDDLEWARE = 'AuthMiddleware::comparePassword';
export const COMPARE_DEVICE_TOKEN_MIDDLEWARE = 'AuthMiddleware::compareDeviceToken';
export const PERSONAL_LOAN_APPLICATION_ELIGIBILITY_CHECK_SERVICE = 'SeedfiUnderwritingService::personalLoanApplicationEligibilityCheck';
export const CREATE_USER_YOU_VERIFY_CANDIDATE_SERVICE = 'YouVerifyService::createUserYouVerifyCandidate';
export const INITIATE_YOU_VERIFY_ADDRESS_VERIFICATION_SERVICE = 'YouVerifyService::initiateUserYouVerifyAddressVerification';
export const DOJAH_BVN_VERIFICATION_SERVICE = 'DojahService::dojahBvnVerificationCheck';
export const PAYSTACK_FETCH_BANKS_SERVICE = 'PaystackService::fetchBanks';
export const PAYSTACK_RESOLVE_BANK_ACCOUNT_NAME_SERVICE = 'PaystackService::resolveAccount';
export const COMPARE_PIN_MIDDLEWARE = 'AuthMiddleware::comparePin';
export const CHECK_IF__NEW_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE = 'AuthMiddleware::checkIfNewCredentialsSameAsOld';
export const PAYSTACK_INITIATE_CARD_PAYMENT_SERVICE = 'PaystackService::initializeCardPayment';
export const SUBMIT_PAYMENT_OTP_WITH_REFERENCE_SERVICE = 'PaystackService::submitPaymentOtpWithReference';
export const PAYSTACK_INITIATE_BANK_ACCOUNT_CHARGE_FOR_LOAN_REPAYMENT_SERVICE = 'PaystackService::initializeBankAccountChargeForLoanRepayment';
export const CONFIRM_PAYSTACK_PAYMENT_STATUS_BY_REFERENCE_SERVICE = 'PaystackService::confirmPaystackPaymentStatusByReference';
export const FETCH_SEEDFI_PAYSTACK_BALANCE_SERVICE = 'PaystackService::fetchSeedfiPaystackBalance';
export const RAISE_A_REFUND_TICKED_FOR_CARD_TOKENIZATION_TRANSACTION_SERVICE = 'PaystackService::raiseARefundTickedForCardTokenizationTransaction';
export const CREATE_TRANSFER_RECEIPT_SERVICE = 'PaystackService::createTransferRecipient';
export const INITIATE_TRANSFER_SERVICE = 'PaystackService::initiateTransfer';
export const IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE = 'UserMiddleware::isUploadedImageSelfie';
export const IS_VERIFIED_BVN_MIDDLEWARE = 'UserMiddleware::isVerifiedBvn';
export const VERIFY_BVN_MIDDLEWARE = 'UserMiddleware::verifyBvn';
export const UPDATE_BVN_CONTROLLER = 'UserController::updateBvn';
export const UPDATE_USER_FCM_TOKEN_CONTROLLER = 'UserController::updateUserFcmToken';
export const UPDATE_LOAN_STATUS_TO_OVERDUE_CONTROLLER = 'CronController::updateLoanStatusToOverdue';
export const INITIATE_LOAN_REPAYMENT_CONTROLLER = 'CronController::initiateLoanRepayment';
export const PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE = 'PaymentMiddleware::paystackWebhookVerification';
export const VERIFY_PAYSTACK_PAYMENT_STATUS_MIDDLEWARE = 'PaymentMiddleware::verifyPaystackPaymentStatus';
export const RAISE_REFUND_FOR_CARD_TOKENIZATION_MIDDLEWARE = 'PaymentMiddleware::raiseRefundForCardTokenization';
export const PROCESS_PERSONAL_LOAN_REPAYMENTS_MIDDLEWARE = 'PaymentMiddleware::processPersonalLoanRepayments';
export const PROCESS_PERSONAL_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE = 'PaymentMiddleware::processPersonalLoanTransferPayments';
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
export const FETCH_BANKS_CONTROLLER = 'UserController::fetchBanks';
export const CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE = 'UserMiddleware::checkAccountPreviouslySaved';
export const CHECK_IF_MAXIMUM_BANK_ACCOUNTS_SAVED_MIDDLEWARE = 'UserMiddleware::checkIfMaximumBankAccountsSaved';
export const CHECK_IF_MAXIMUM_DEBIT_CARDS_SAVED_MIDDLEWARE = 'UserMiddleware::checkIfMaximumDebitCardsSaved';
export const CHECK_USER_LOAN_STATUS_MIDDLEWARE = 'UserMiddleware::checkUserLoanStatus';
export const CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE = 'UserMiddleware::checkUserAdvancedKycUpdate';
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
export const GENERATE_RESET_TOKEN_CONTROLLER = 'AuthController::generateResetToken';
export const REQUEST_EMAIL_VERIFICATION_CONTROLLER = 'UserController::requestEmailVerification';
export const VERIFY_EMAIL_CONTROLLER = 'UserController::verifyEmail';
export const IS_EMAIL_VERIFIED_MIDDLEWARE = 'UserMiddleware::isEmailVerified';
export const IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE = 'UserMiddleware::isBvnPreviouslyExisting';
export const CHECK_IF_BVN_FLAGGED_BLACKLISTED_MIDDLEWARE = 'UserMiddleware::checkIfBvnFlaggedBlacklisted';
export const ID_UPLOAD_VERIFICATION_CONTROLLER = 'AuthController::idUploadVerification';
export const IS_UPDATED_VERIFICATION_ID_MIDDLEWARE = 'UserMiddleware::checkUserIdVerification';
export const IS_VERIFIED_ADDRESS_DETAILS_MIDDLEWARE = 'UserMiddleware::isVerifiedAddressDetails';
export const IS_VERIFIED_UTILITY_BILL_MIDDLEWARE = 'UserMiddleware::isVerifiedUtilityBill';
export const CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE = 'UserMiddleware::checkIfBvnIsVerified';
export const CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE = 'UserMiddleware::createUserAddressYouVerifyCandidate';
export const UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE = 'UserMiddleware::uploadUtilityBillDocument';
export const INITIATE_ADDRESS_VERIFICATION_CONTROLLER = 'UserController::initiateAddressVerification';
export const UPDATE_UPLOADED_UTILITY_BILL_CONTROLLER = 'UserController::updateUploadedUtilityBill';
export const FETCH_USER_ADDRESS_DETAILS_CONTROLLER = 'UserController::fetchUserAddressDetails';
export const UPDATE_USER_PROFILE_CONTROLLER = 'UserController::updateUserProfile';
export const IS_PIN_CREATED_MIDDLEWARE = 'AuthMiddleware::isPinCreated';
export const GET_USER_PROFILE_CONTROLLER = 'UserController::getProfile';
export const VALIDATE_PASSWORD_OR_PIN_MIDDLEWARE = 'AuthMiddleware::validatePasswordOrPin';
export const CHECK_IF_CARD_EXISTS_MIDDLEWARE = 'UserMiddleware::checkIfCardExist';
export const CHECK_IF_CARD_ALREADY_DEFAULT_CARD_MIDDLEWARE = 'UserMiddleware::checkIfCardAlreadyDefaultCard';
export const SET_DEFAULT_CARD_CONTROLLER = 'UserController::setDefaultCard';
export const REMOVE_SAVED_CARD_CONTROLLER = 'UserController::removeCard';
export const HOMEPAGE_DETAILS_CONTROLLER = 'UserController::homepageDetails';
export const CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE = 'LoanMiddleware::checkUserLoanApplicationExists';
export const CHECK_USER_LOAN_PAYMENT_EXISTS_MIDDLEWARE = 'LoanMiddleware::checkUserLoanPaymentExists';
export const CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE = 'LoanMiddleware::checkIfUserHasActivePersonalLoan';
export const CHECK_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE = 'LoanMiddleware::checkIfLoanApplicationStatusIsStillPending';
export const CHECK_IF_EMPLOYMENT_TYPE_LIMIT_APPLIES_MIDDLEWARE = 'LoanMiddleware::checkIfEmploymentTypeLimitApplies';
export const CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE = 'LoanMiddleware::checkSeedfiPaystackBalance';
export const GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE = 'LoanMiddleware::generateLoanDisbursementRecipient';
export const VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE = 'LoanMiddleware::validateLoanAmountAndTenor';
export const CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE = 'LoanMiddleware::checkIfLoanApplicationStatusIsCurrentlyApproved';
export const CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER = 'LoanController::checkUserLoanEligibility';
export const ACCEPT_SYSTEM_MAXIMUM_ALLOWABLE_LOAN_AMOUNT_CONTROLLER = 'LoanController::acceptSystemMaximumAllowableLoanAmount';
export const CANCEL_LOAN_APPLICATION_CONTROLLER = 'LoanController::cancelLoanApplication';
export const FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER = 'LoanController::fetchPersonalLoanDetails';
export const FETCH_PERSONAL_LOAN_PAYMENT_DETAILS_CONTROLLER = 'LoanController::fetchPersonalLoanPaymentDetails';
export const INITIATE_MANUAL_LOAN_REPAYMENT_CONTROLLER = 'LoanController::fetchPersonalLoanPaymentDetails';
export const INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER = 'LoanController::initiateManualCardOrBankLoanRepayment';
export const FETCH_USER_CURRENT_LOANS_CONTROLLER = 'LoanController::fetchUserCurrentLoans';
export const FETCH_USER_LOAN_PAYMENT_TRANSACTIONS_CONTROLLER = 'LoanController::fetchUserLoanPaymentTransactions';
export const SUBMIT_PAYMENT_OTP_CONTROLLER = 'LoanController::submitPaymentOtp';
export const INITIATE_LOAN_DISBURSEMENT_CONTROLLER = 'LoanController::initiateLoanDisbursement';
export const CHECK_IF_ALREADY_CLUSTER_MEMBER_MIDDLEWARE = 'ClusterMiddleware::checkIfAlreadyClusterMember';
export const CHECK_IF_INVITEE_ALREADY_EXIST_MIDDLEWARE = 'ClusterMiddleware::checkIfInviteeAlreadyClusterMember';
export const CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE = 'ClusterMiddleware::checkIfClusterExists';
export const CHECK_IF_CLUSTER_DECISION_TICKET_EXISTS_MIDDLEWARE = 'ClusterMiddleware::checkIfClusterDecisionTicketExists';
export const CHECK_IF_USER_HAS_PREVIOUSLY_DECIDED_MIDDLEWARE = 'ClusterMiddleware::checkIfUserHasPreviouslyDecided';
export const CHECK_IF_CLUSTER_DECISION_HAS_BEEN_CONCLUDED_MIDDLEWARE = 'ClusterMiddleware::checkIClusterDecisionHasBeenConcluded';
export const CHECK_IF_CARD_BELONGS_TO_A_USER_MIDDLEWARE = 'UserMiddleware::checkIfCardBelongsToTheUser';
export const FORGOT_PIN_CONTROLLER = 'AuthMiddleware::forgotPin';
export const RESET_PIN_CONTROLLER = 'AuthMiddleware::resetPin';
export const CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE = 'ClusterMiddleware::checkIfClusterNameUnique';
export const USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE = 'ClusterMiddleware::userTakesRequestToJoinClusterDecision';
export const COMPARE_USER_MONTHLY_INCOME_MIDDLEWARE = 'ClusterMiddleware::compareUserMonthlyIncome';
export const GENERATE_CLUSTER_UNIQUE_CODE_MIDDLEWARE = 'ClusterMiddleware::generateClusterUniqueCode';
export const CONFIRM_CLUSTER_IS_STILL_OPEN_FOR_JOINING_MIDDLEWARE = 'ClusterMiddleware::confirmClusterIsStillOpenForJoining';
export const CONFIRM_USER_CLUSTER_INVITATION_MIDDLEWARE = 'ClusterMiddleware::confirmUserClusterInvitation';
export const REQUEST_TO_JOIN_CLUSTER_CONTROLLER = 'ClusterController::requestToJoinCluster';
export const JOIN_CLUSTER_ON_INVITATION_CONTROLLER = 'ClusterController::joinClusterOnInvitation';
export const FINAL_CLUSTER_DECISION_CONTROLLER = 'ClusterController::finalClusterDecision';
export const CREATE_CLUSTER_CONTROLLER = 'ClusterController::createCluster';
export const INVITE_CLUSTER_CONTROLLER = 'ClusterController::inviteClusterMember';
export const FETCH_CLUSTERS_CONTROLLER = 'ClusterController::fetchClusters';
export const FETCH_CLUSTER_DETAILS_CONTROLLER = 'ClusterController::fetchClusterDetails';
export const CHECK_IF_CLUSTER_MEMBER_IS_ADMIN_MIDDLEWARE = 'ClusterMiddleware::CHECK_IF_CLUSTER_MEMBER_IS_ADMIN_MIDDLEWARE';
export const CHECK_IF_CLUSTER_IS_ON_ACTIVE_LOAN_MIDDLEWARE = 'ClusterMiddleware::checkIfClusterIsOnActiveLoan';
export const CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE = 'ClusterMiddleware::checkIfThereIsMoreThanOnePersonInTheCluster';
export const FETCH_CLUSTER_MEMBERS_CONTROLLER = 'ClusterController::fetchClusterMembers';
export const CHECK_IF_USER_IS_ON_ACTIVE_LOAN_MIDDLEWARE = 'ClusterMiddleware::checkIfUserIsOnActiveLoan';
export const CHECK_IF_USER_CAN_LEAVE_A_CLUSTER_MIDDLEWARE = 'ClusterMiddleware::checkIfUserIsOnActiveLoan';
export const LEAVE_CLUSTER_CONTROLLER = 'ClusterController::leaveCluster';
export const EDIT_CLUSTER_CONTROLLER = 'ClusterController::editCluster';
export const REQUEST_TO_DELETE_CLUSTER_MIDDLEWARE = 'ClusterMiddleware::requestToDeleteCluster';
export const NEW_ADMIN_CLUSTER_ACCEPTANCE_MIDDLEWARE = 'ClusterMiddleware::newAdminClusterAcceptance';
export const INITIATE_DELETE_CLUSTER_CONTROLLER = 'ClusterController::initiateDeleteCluster';
export const SUGGEST_NEW_CLUSTER_ADMIN_CONTROLLER = 'ClusterController::suggestNewClusterAdmin';
export const UPDATE_NOTIFICATION_IS_READ_CONTROLLER = 'UserController::updateNotificationIsRead';
export const CREATE_NEXT_OF_KIN_CONTROLLER = 'UserController::createNextOfKin';
export const FETCH_NEXT_OF_KIN_CONTROLLER = 'UserController::fetchNextOfKin';
export const CHECK_IF_USER_HAS_FILLED_NEXT_OF_KIN_MIDDLEWARE = 'UserMiddleware::checkIfUserHasPreviouslyCreatedNextOfKin';
export const CHECK_IF_USER_BVN_NOT_BLACKLISTED_MIDDLEWARE = 'LoanMiddleware::checkIfUserBvnNotBlacklisted';
export const USER_PROFILE_NEXT_UPDATE_MIDDLEWARE = 'UserMiddleware::userProfileNextUpdate';
export const EMPLOYMENT_DETAILS_CONTROLLER = 'UserMiddleware::createUserEmploymentDetails';
export const UPDATE_EMPLOYMENT_DETAILS_CONTROLLER = 'UserMiddleware::updateEmploymentDetails';
export const UPDATE_MONO_ACCOUNT_ID_CONTROLLER = 'UserMiddleware::updateMonoAccountId';


// Admin related labels
export const VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::validateUnAuthenticatedAdmin';
export const COMPARE_ADMIN_PASSWORD_MIDDLEWARE = 'AdminAuthMiddleware::compareAdminPassword';
export const VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::validateAdminResetPasswordToken';
export const CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE = 'AdminAuthMiddleware::checkIfChangedDefaultPassword';
export const COMPLETE_ADMIN_LOGIN_REQUEST_CONTROLLER = 'AdminAuthController::completeAdminLoginRequest';
export const VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE = 'AdminAuthMiddleware::verifyLoginVerificationToken';
export const ADMIN_LOGIN_CONTROLLER = 'AdminAuthController::login';
export const ADMIN_FORGOT_PASSWORD_CONTROLLER = 'AdminAuthController::forgotPassword';
export const SET_PASSWORD_CONTROLLER = 'AdminAuthController::setPassword';
export const ADMIN_PERMISSIONS_CONTROLLER = 'AdminAuthController::adminPermissions';
export const COMPLETE_ADMIN_PROFILE_CONTROLLER = 'AdminAuthController::completeAdminProfile';
export const SEND_ADMIN_PASSWORD_TOKEN_CONTROLLER = 'AdminAuthController::sendAdminPasswordToken';
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
export const CHECK_IF_ADMIN_PHONE_NUMBER_ALREADY_EXIST_MIDDLEWARE = 'AdminAminMiddleware::checkIfAdminPhoneNumberAlreadyExist';
export const CHECK_IF_SUPER_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::checkIfSuperAdmin';
export const CHECK_IF_AUTHENTICATED_ADMIN_MIDDLEWARE = 'AdminAdminMiddleware::checkIfAuthenticatedAdmin';
export const CHECK_IF_ADMIN_EXISTS_MIDDLEWARE = 'AdminAdminMiddleware::checkIfAdminExists';
export const CHECK_IF_USER_EXISTS_MIDDLEWARE = 'AdminAdminMiddleware::checkIfUserExists';
export const IS_ROLE_ACTIVE_MIDDLEWARE = 'AdminRoleMiddleware::isRoleActive';
export const FETCH_ALL_ADMINS_CONTROLLER = 'AdminAdminController::fetchAllAdmins';
export const EDIT_ADMIN_STATUS_CONTROLLER = 'AdminAdminController::editAdminStatus';
export const CHECK_ADMIN_CURRENT_STATUS_MIDDLEWARE = 'AdminAdminMiddleware::checkAdminCurrentStatus';
export const CHECK_USER_CURRENT_STATUS_MIDDLEWARE = 'AdminUserMiddleware::checkUserCurrentStatus';
export const UPLOAD_DOCUMENT_MIDDLEWARE = 'AdminUserMiddleware::uploadDocument';
export const FETCH_ROLES = 'AdminRoleController::fetchRoles';
export const FETCH_ADMINS_PER_ROLE_CONTROLLER = 'AdminRoleController::fetchAdminsPerRole';
export const GET_PROFILE_CONTROLLER = 'AdminAdminController::getProfile';
export const FETCH_PLATFORM_OVERVIEW_CONTROLLER = 'AdminAdminController::fetchPlatformOverview';
export const SEND_NOTIFICATIONS_CONTROLLER = 'AdminUserController::sendNotifications';
export const USER_LOAN_STATUS_MIDDLEWARE = 'AdminUserMiddleware::userLoanStatus';
export const EDIT_USER_STATUS_CONTROLLER = 'AdminUserController::editUserStatus';
export const FETCH_USERS_CONTROLLER = 'AdminUserController::fetchUsers';
export const SAVE_USER_UPLOADED_DOCUMENT_CONTROLLER = 'AdminUserController::saveUserUploadedDocument';
export const FETCH_ADMIN_UPLOADED_USER_DOCUMENTS_CONTROLLER = 'AdminUserController::fetchAdminUploadedUserDocuments';
export const USER_ORR_BREAKDOWN_CONTROLLER = 'AdminUserController::fetchUserOrrBreakdown';
export const USER_KYC_DETAILS_CONTROLLER = 'AdminUserController::fetchUserKycDetails';
export const VERIFY_USER_UTILITY_BILL_CONTROLLER = 'AdminUserController::verifyUserUtilityBill';
export const CHECK_LOAN_EXISTS_MIDDLEWARE = 'AdminLoanMiddleware::checkIfLoanExists';
export const USER_ORR_SCORE_BREAKDOWN_SERVICE = 'SeedfiUnderwritingService::userOrrScoreBreakdown';
export const LOAN_SCORE_CARD_BREAKDOWN_WEIGHT_SERVICE = 'SeedfiUnderwritingService::loanScoreCardBreakdown';
export const LOAN_ORR_SCORE_BREAKDOWN_SERVICE = 'SeedfiUnderwritingService::loanOrrScoreBreakdown';
export const APPROVE_LOAN_APPLICATION_CONTROLLER = 'AdminLoanController::approveLoanApplication';
export const DECLINE_LOAN_APPLICATION_CONTROLLER = 'AdminLoanController::declineLoanApplication';
export const LOAN_APPLICATION_DETAILS_CONTROLLER = 'AdminLoanController::loanApplicationDetails';
export const FETCH_ADMIN_CLUSTER_DETAILS_CONTROLLER = 'AdminUserController::fetchClusterDetails';
export const FETCH_ADMIN_CLUSTER_MEMBER_DETAILS_CONTROLLER = 'AdminUserController::fetchClusterMemberDetails';
export const ADMIN_CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE_MIDDLEWARE = 'ClusterMiddleware::checkIfClusterExists';
export const CHECK_IF_USER_BELONGS_TO_CLUSTER_MIDDLEWARE = 'ClusterMiddleware::checkIfUserBelongsToCluster';
export const FETCH_LOAN_APPLICATIONS_CONTROLLER = 'AdminLoanController::fetchLoans';
export const REPAID_LOANS_CONTROLLER = 'AdminLoanController::fetchRepaidLoans';
export const FETCH_ENV_VALUES_CONTROLLER = 'AdminLoanController::fetchEnvValues';
export const UPDATE_ENV_VALUES_CONTROLLER = 'AdminLoanController::updateEnvValues';
export const BLACKLIST_BVN_CONTROLLER = 'AdminLoanController::blacklistBvn';
export const IS_BVN_ALREADY_BLACKLISTED_MIDDLEWARE = 'AdminAdminMiddleware::isBvnAlreadyBlacklisted';
export const SCORE_CARD_BREAKDOWN_CONTROLLER = 'AdminLoanController::scoreCardBreakdown';

