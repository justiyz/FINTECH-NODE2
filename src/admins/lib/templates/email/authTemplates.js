import config from '../../../../users/config/index';

export const login = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi ${data.first_name},
    </h2>
  </td>
</tr>

<tr>
    <td style=" font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      <p>Kindly complete your login process by using the OTP below</p>
    </td>
</tr>

<tr>
  <td style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    <p>OTP expires by ${data.expireTime} if not used</p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">
  <td style=" background-color:#f2faf1;padding: 12px 35px;width: 100%;height: 35px;border-radius: 8px;" align="center">
    <span style=" text-decoration: none; display: inline-block;font-family: 'Figtree';font-style: normal;font-weight: 700;
      font-size: 20px;line-height: 24px;text-align: center;color: #1a201d;letter-spacing: 3px;">
      ${data.token}
    </span>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    If you didn't initiate this login, you can ignore this email.
    </p>
  </td>
</tr>`;

export const forgotPassword = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi ${data.first_name},
    </h2>
  </td>
</tr>

<tr>
  <td>
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
      Kindly reset your password using the OTP below,
      OTP expires by ${data.expireTime} if not used. <br><br>
      Please do not share this code with anyone.
    </p>
  </td>
</tr>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">
  <td style=" background-color:#f2faf1;padding: 12px 35px;width: 100%;height: 35px;border-radius: 8px;"
  align="center">
    <span style=" text-decoration: none; display: inline-block;font-family: 'Figtree';font-style: normal;font-weight: 700;
      font-size: 20px;line-height: 24px;text-align: center;color: #1a201d;letter-spacing: 3px;">
      ${data.token}
    </span>
  </td>
</tr>

<tr>
  <td style="padding-bottom: 40px">
    <p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
    If you didn't request a reset password, you can ignore this email.
    </p>
  </td>
</tr>`;
    
export const  adminInviteMail = (data) => `
<tr>
  <td>
    <p style="font-weight: 400; font-size: 18px; line-height: 150%; color: #84868c">
    <br>
    <br>
    You have been invited by SeedFi as an admin.
    <br>
    <br>
    All you need to do is log in via the link and the credentials provided below.
    <br>
    <br>
    <b>Email Address</b> - ${data.email}<br><br>
    <b>Default Password</b> - ${data.password}
    <br>
    <br>
    Kindly change your password and update your profile on your first log in.
    <br>
    <br>
    Login <a style="color: #1ECAAB" href='${config.SEEDFI_ADMIN_WEB_BASE_URL}/auth/login'>here</a>.
    </p>
  </td>
</tr>`;

export const  insufficientBalance = (data) => `
<tr>
  <td>
    <h2 style="font-family: 'Figtree';font-style: normal;font-weight: 500;font-size: 20px;line-height: 36px;color: #84868c;">
    Hi ${data.first_name},
    </h2>
  </td>
</tr>

<tr style="font-weight: 500; font-size: 18px; line-height: 160%; color: #84868c">
  <td>
    <span>Kindly fund your paystack wallet balance for loan disbursement</span>
  </td>
</tr>
  
<tr style="font-weight: 500; font-size: 16px; line-height: 160%; color: #84868c">
  <td>
    <span>current balance: <b>${data.currentBalance}</b></span>
  </td>
</tr>
  
<tr style="font-weight: 500; font-size: 16px; line-height: 160%; color: #84868c">
  <td>
    Kindly login to your paystack dashboard to fund balance
  </td>
</tr>`;

export const  manualLoanApproval = (data) => `
<tr>
  <td style="padding-bottom: 30px;">
    Hello ${data.first_name},
  </td>
</tr>

<tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 16px;line-height: 24px;">
  <td style="padding-bottom: 20px">
    <p>
    There is ${data.type} loan application from ${data.loanUser} that requires manual approval<br/>
    Kindly click <a href="${config.SEEDFI_ADMIN_WEB_BASE_URL}/dashboard/loan-applications/management">here</a> to take decision on the loan application
    </p>  
  </td>
</tr>`;
