export const forgot_password  = () => 'admin initiate forgot password successfully';
export const forgot_password_failed  = () => 'admin initiating forgot password failed';
export const reset_password = () => 'admin resets password successfully';
export const create_role_permission = (name, roleName) => `${name}, successfully created role type ${roleName} with permissions`;
export const create_role_permission_failed = (name, roleName) => `${name}, failed to create role type ${roleName} with permissions`;
export const invite_admin = (name, newAdmin) => `Admin ${name}, successfully invites new admin ${newAdmin}`;
export const invite_admin_failed = (name, newAdmin) => `Admin ${name}, could not successfully invite new admin ${newAdmin}`;
export const completes_profile = () => 'admin completes profile process successful';
export const completes_profile_failed = () => 'admin completes profile process failed';
export const edit_permission = (name) => `${name}, edit admin permission`;
export const edit_permission_failed = (name) => `${name}, editing admin permission failed`;
export const login_request = (name) => `${name}, initiate a request to login`;
export const login_request_failed = (name) => `${name}, initiating a request to login failed`;
export const login_approved = (name) => `${name}, login request approved`;
export const login_approved_failed = (name) => `${name}, login request failed`;
export const new_password = (name) => `${name}, sets new password`;
export const new_password_failed = (name) => `${name}, failed to set new password`;
export const activate_role = (name, type) => `${name}, activate admin role ${type}`;
export const deactivate_role = (name) => `${name}, deactivate admin role type`;
export const delete_role = (name) => `${name}, delete admin role type`;
export const delete_role_failed = (name) => `${name}, deleting admin role type failed`;
export const edit_role = (name) => `${name}, edit admin role type`;
export const edit_role_failed = (name) => `${name}, failed to edit admin role type`;
export const verify_reset_pass_otp = () => 'verify reset password otp';
export const verify_reset_pass_otp_failed = () => 'verify reset password otp';
export const manually_loan_approval = (name) => `${name}, approves loan application manually`;
export const manually_loan_approval_failed = (name) => `${name}, failed to approve loan application manually`;
export const manually_loan_approval_or_decline_failed = (name) => `${name}, failed to approve or decline loan application manually`;
export const uploads_document = (name) => `${name} uploads document for user`;
export const uploads_document_failed = (name) => `${name} uploading document for user failed`;
export const user_status = (name, action) => `${name} successfully ${action} a user`;
export const user_status_failed = (name, action) => `${name} failed to ${action} a user`;
export const approves_utility_bill = (name) => `${name} approves user uploaded utility bill`;
export const approves_utility_bill_failed = (name) => `${name} failed to approve user uploaded utility bill`;
export const decline_utility_bill = (name) => `${name} declines user uploaded utility bill`;
export const upload_blacklisted_bvns = (name, type) => `${name} uploads ${type} blacklisted bvns`;
export const upload_blacklisted_bvns_failed = (name, type) => `${name} uploading ${type} blacklisted bvns failed`;
export const updates_environment = (name) => `${name} updates environment variables values in settings`;
export const updates_environment_failed = (name) => `${name} updating environment variables values in settings failed`;
export const create_cluster = (name, cluster) => `${name} create cluster ${cluster}`;
export const create_cluster_failed = (name, cluster) => `${name} failed to create cluster ${cluster}`;
export const activate_cluster = (name, cluster) => `${name} activate ${cluster} cluster`;
export const deactivate_cluster = (name, cluster) => `${name} deactivate ${cluster} cluster`;
export const cluster_member_invite  = (name) => `${name} invite a cluster member`;
export const cluster_member_invite_failed  = (name) => `${name} inviting a cluster member failed`;
export const activate_cluster_member = (name) => `${name} admin activate cluster member`;
export const deactivate_cluster_member = (name) => `${name} admin deactivated cluster member`;
