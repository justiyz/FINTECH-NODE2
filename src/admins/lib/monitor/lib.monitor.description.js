export const forgot_password  = () => 'admin initiate forgot password successfully';
export const forgot_password_failed  = () => 'admin initiating forgot password failed';
export const reset_password = () => 'admin resets password successfully';
export const create_role_permission = (name, roleName) => `${name}, successfully created role type ${roleName} with permissions`;
export const create_role_permission_failed = (name, roleName) => `${name}, failed to create role type ${roleName} with permissions`;
export const invite_admin = (name, newAdmin) => `Admin ${name}, successfully invites new admin ${newAdmin}`;
export const invite_admin_failed = (name, newAdmin) => `Admin ${name}, could not successfully invite new admin ${newAdmin}`;
export const completes_profile = () => 'admin completes profile process successful';
export const completes_profile_failed = () => 'admin completes profile process failed';
export const edit_permission = (name) => `${name}, edits admin permission`;
export const edit_permission_failed = (name) => `${name}, failed to edit admin permission`;
export const login_request = (name) => `${name}, initiates a request to login`;
export const login_request_failed = (name) => `${name}, failed to initiate a request to login`;
export const login_approved = (name) => `${name}, login request approved`;
export const login_approved_failed = (name) => `${name}, login request failed`;
export const new_password = () => 'admin sets new password';
export const new_password_failed = () => 'admin set new password failed';
export const activate_role = (name, type) => `${name}, activate admin role ${type}`;
export const deactivate_role = (name) => `${name}, deactivate admin role type`;
export const delete_role = (name) => `${name}, delete admin role type`;
export const delete_role_failed = (name) => `${name}, deleting admin role type failed`;
export const edit_role = (name) => `${name}, edits admin role type`;
export const edit_role_failed = (name) => `${name}, failed to edit admin role type`;
export const verify_reset_pass_otp = () => 'verify reset password otp';
export const verify_reset_pass_otp_failed = () => 'verify reset password otp';
export const manually_loan_approval = (name, type) => `${name}, approves ${type} loan application manually`;
export const manually_loan_approval_failed = (name, type) => `${name}, approving ${type} loan application manually failed`;
export const manually_loan_disapproval = (name, type) => `${name}, disapproves ${type} loan application manually`;
export const manually_loan_disapproval_failed = (name, type) => `${name}, disapproving ${type} loan application manually failed`;
export const uploads_document = (name, user_name) => `${name} uploads document for user ${user_name}`;
export const uploads_admin_document = (filename, admin) => `${filename} was uploaded by ${admin}`;
export const uploads_document_failed = (name, user_name) => `${name} uploading document for user ${user_name} failed`;
export const uploads_admin_image = (name, user_name) => `${name} uploading image for user ${user_name} failed`;
export const user_status = (name, action, user_name) => `${name} successfully ${action} a user ${user_name}`;
export const user_status_failed = (name, action, user_name) => `${name} failed to ${action} a user ${user_name}`;
export const approves_utility_bill = (name, user_name) => `${name} approves user ${user_name} uploaded utility bill`;
export const approves_utility_bill_failed = (name) => `${name} failed to approve user uploaded utility bill`;
export const decline_utility_bill = (name, user_name) => `${name} declines user ${user_name} uploaded utility bill`;
export const upload_blacklisted_bvns = (name, type) => `${name} uploads ${type} blacklisted bvns`;
export const upload_blacklisted_bvns_failed = (name, type) => `${name} uploading ${type} blacklisted bvns failed`;
export const updates_environment = (name) => `${name} updates environment variables values in settings`;
export const updates_environment_failed = (name) => `${name} updating environment variables values in settings failed`;
export const create_cluster = (name, cluster) => `${name} creates cluster ${cluster}`;
export const create_cluster_failed = (name) => `${name} failed to create cluster`;
export const activate_cluster = (name, cluster) => `${name} activates ${cluster} cluster`;
export const deactivate_cluster = (name, cluster) => `${name} deactivates cluster ${cluster}`;
export const cluster_member_invite  = (name) => `${name} invite a cluster member`;
export const cluster_member_invite_failed  = (name) => `${name} failed to invite a cluster member`;
export const delete_cluster_member = (name, clusterMemberName, clusterName) => `${name} deletes cluster member ${clusterMemberName} from cluster ${clusterName}`;
export const edit_cluster_interest_rate = (name, clusterName) => `${name} updated interest rate details for ${clusterName} cluster`;
export const edit_cluster_interest_rate_failed = (name, clusterName) => `${name} failed in updating interest rate details for ${clusterName} cluster`;
export const unblacklist_bvn = (name) => `${name} unblacklist user bvn`;
export const unblacklist_existing_user = (name) => `${name} unblacklist an existing user bvn`;
export const initiate_document_type_export = (name, type) => `${name} successfully initiates selected ${type} file export`;
export const loan_repayment = (name) => `${name} viewed loan repayment report and analytics`;
export const loan_failed_repayment = (name) => `${name} failed trying to viewed loan repayment report and analytics`;
export const loan_reports_and_analytics = (name) => `${name} successfully views loan management reports and analytics`;
export const loan_reports_and_analytics_failed = (name) => `${name} viewing loan management reports and analytics failed`;
export const cluster_reports_and_analytics = (name) => `${name} successfully views cluster management reports and analytics`;
export const cluster_reports_and_analytics_failed = (name) => `${name} viewing cluster management reports and analytics failed`;
export const marks_a_notification_read = () => 'admin reads a notification and thus is marked as read';
export const marks_a_notification_read_failed = () => 'admin could not read a notification and thus could not mark it as read';
export const marks_all_notifications_read = () => 'admin marked all unread notifications as read';
export const marks_all_notifications_read_failed = () => 'admin could not mark all unread notifications as read';
export const sends_alert_notification = (name) => `${name} sent alert notification type to users`;
export const sends_alert_notification_failed = (name) => `${name} failed in sending alert notification type to users`;
export const sends_system_notification = (name) => `${name} sent system notification type to users`;
export const sends_system_notification_failed = (name) => `${name} failed in sending system notification type to users`;
export const create_promo = (name, promoName) => `${name} created promo with name ${promoName} successfully`;
export const create_promo_failed = (name, promoName) => `${name} failed to create promo with name ${promoName}`;
export const edit_promo = (name, promoName) => `${name} edited promo with name ${promoName} successfully`;
export const edit_promo_failed = (name, promoName) => `${name} failed in editing promo with name ${promoName}`;
export const cancel_promo = (name, promoName) => `${name} cancelled promo with name ${promoName} successfully`;
export const cancel_promo_failed = (name) => `${name} failed in cancelling one or more promos`;
export const delete_promo = (name, promoName) => `${name} deleted promo with name ${promoName} successfully`;
export const delete_notification = (name, title) => `${name} deleted ${title} notification successfully`;
export const delete_promo_failed = (name) => `${name} failed in deleting one or more promos`;
export const delete_notification_failed = (name) => `${name} failed in deleting notifications`;
export const updates_reward_point_ranges = (name, type) => `${name} updates ${type} reward point ranges values in settings`;
export const updates_reward_points = (name, type) => `${name} updates ${type} reward point in settings`;
export const reset_user_reward_points = (name, userName) => `${name} resets reward point for ${userName}`;
export const reset_all_users_reward_points = (name) => `${name} resets all users reward points`;
export const fetch_shop_categories = (name) => `${name} attempt to fetch shop category`;
export const create_shop_categories = (name) => `${name} attempted to create shop category but failed`;
export const fetch_events_lists = (name) => `${name} successfully fetches list of events`;
export const fetch_single_event = (name) => 'event record fetched successfully';
export const create_event_record_failed = 'failed to create event record';
export const create_event_category_record_failed = 'failed to create event category record';
export const failed_to_fetch_ticket_categories = 'failed to fetch ticket categories';
export const create_merchant = (adminName, merchantName) => `Admin ${adminName}, successfully added a new merchant ${merchantName}`;
export const create_merchant_admin = (adminName, merchantName) => `Admin ${adminName}, successfully added a new merchant admin ${merchantName}`;
export const create_merchant_failed = (adminName, merchantName) => `Admin ${adminName}, failed to add a new merchant ${merchantName}`;
export const create_merchant_admin_failed = (adminName, merchantAdminName) => `Admin ${adminName}, failed to create a new merchant admin ${merchantAdminName}`;
export const merchant_admin_login_failed = (adminName, merchantAdminName) => `Admin ${adminName}, failed to login for merchant admin ${merchantAdminName}`;
