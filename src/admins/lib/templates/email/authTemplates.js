import config from '../../../../users/config/index';

export const login = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hi Admin,
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Kindly complete your login process by using the otp below</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>OTP expires by ${data.expireTime} if not used</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <h1>${data.token}</h1>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
          If you didn't request a login, you can ignore this email.
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;

export const forgotPassword = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hi Admin,
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>Kindly reset your password using the otp below</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <p>OTP expires by ${data.expireTime} if not used</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <h1>${data.token}</h1>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
          If you didn't request a reset password, you can ignore this email.
        </td>
    </tr>
    <tr>
        <td>
          <span style="line-height: 40px">Thanks</span> <br />
          <span style="line-height: 40px">Yours Credibly</span> <br />
          <span style="font-weight: 600; display: block;">SeedFi</span>
          <span style="display: block;">Email: ask@seedfi.com</span>
          <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;
    
export const  adminInviteMail = (data) => `<tr>
    <td style="padding: 10px 0;">
      <p style="font-weight: 500; font-size: 14px; line-height: 160%; color: #4F4F4F;">
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
    </td>`;

export const  insufficientBalance = (data) => `<tr>
    <tr>
        <td style="padding-bottom: 30px;">
            Hi SeedFi Admin,
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
            <p>Kindly fund your paystack wallet balance for loan disbursement</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
            <p>current balance: ${data.currentBalance}</p>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
          Kindly login to your paystack dashboard to fund balance
        </td>
    </tr>
    <tr>
        <td>
            <span style="line-height: 40px">Thanks</span> <br />
            <span style="line-height: 40px">Yours Credibly</span> <br />
            <span style="font-weight: 600; display: block;">SeedFi</span>
            <span style="display: block;">Email: ask@seedfi.com</span>
            <span style="display: block;">Call: +234 814 650 7035</span>
        </td>
    </tr>`;
