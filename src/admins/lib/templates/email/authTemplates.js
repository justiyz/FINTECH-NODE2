import config from '../../../../users/config/index';

export const login = (data) => `
<h2 style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 28px;line-height: 36px;color: #84868c;">
    Hi ${data.first_name},
</h2>

    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
        <td style="padding-bottom: 40px">
        <span>Kindly complete your login process by using the otp below</span>
        </td>
    </tr>

    <tr style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
        <td style="padding-bottom: 40px">
        <span>OTP expires by ${data.expireTime} if not used</span>
        </td>
    </tr>

    <tr border="0" cellspacing="0" cellpadding="0" width="100%">
  <td style=" background-color:#f2faf1;padding: 12px 35px;width: 100%;height: 35px;border-radius: 8px;" align="center">
    <span style=" text-decoration: none; display: inline-block;font-family: 'Figtree';font-style: normal;font-weight: 700;
    font-size: 25px;line-height: 24px;text-align: center;color: #1a201d;letter-spacing: 3px;">
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
  </tr> `;

export const forgotPassword = (data) => `
<h2 style=" font-family: 'Figtree'; font-style: normal; font-weight: 400; font-size: 28px; line-height: 36px; color: #84868c;">
Hi ${data.first_name},
</h2> 

<tr>
<td>
<p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
Kindly reset your password using the otp below,
OTP expires by ${data.expirationTime} if not used. <br><br>
Please do not share this code with anyone.
</p>
</td>
</tr><br>

<tr border="0" cellspacing="0" cellpadding="0" width="100%">
<td style=" background-color:#f2faf1;padding: 12px 35px;width: 100%;height: 35px;border-radius: 8px;"
align="center">
<span style=" text-decoration: none; display: inline-block;font-family: 'Figtree';font-style: normal;font-weight: 700;
font-size: 25px;line-height: 24px;text-align: center;color: #1a201d;letter-spacing: 3px;">
${data.token}
</span>
</td>
</tr> <br>

<tr>
<td style="padding-bottom: 40px">
<p style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 18px;line-height: 24px;color: #84868c;margin-bottom: 30px;">
If you didn't request a reset password, you can ignore this email.
</p>
</td>
</tr>`;
    
export const  adminInviteMail = (data) => `
 <tr>
    <td style="padding: 10px 0;">
      <p style="font-weight: 400; font-size: 16px; line-height: 150%; color: #84868c">
      <br>
      <br>
      You have been invited by SeedFi as an admin.
      <br>
      <br>
      All you need to do is log in via the link and the credentials provided below.
      <br>
      <br>
      Email Address - ${data.email}  <br>
      <br> Default Password - ${data.password}
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
<h2 style="font-family: 'Figtree';font-style: normal;font-weight: 400;font-size: 28px;line-height: 36px;color: #84868c;">
Hi ${data.first_name},
</h2>
    <tr style="font-weight: 500; font-size: 14px; line-height: 160%; color: #84868c">
        <td style="padding-bottom: 40px">
            <p>Kindly fund your paystack wallet balance for loan disbursement</p>
        </td>
    </tr>
    <tr style="font-weight: 500; font-size: 14px; line-height: 160%; color: #84868c">
        <td style="padding-bottom: 40px">
            <p>current balance: ${data.currentBalance}</p>
        </td>
    </tr>
    <tr style="font-weight: 500; font-size: 14px; line-height: 160%; color: #84868c">
        <td style="padding-bottom: 40px">
          Kindly login to your paystack dashboard to fund balance
        </td>
    </tr>
`;
