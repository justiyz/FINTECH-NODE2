import config from '../../../config/index';

export const forgotPassword = (data) => `
    <tr>
        <td style="padding-bottom: 30px;">
        Hi ${data.first_name},
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
        <h1>${data.otp}</h1>
        </td>
    </tr>
    <tr>
        <td style="padding-bottom: 40px">
          If you didn't request a password reset, you can ignore this email. Your password will not be changed.
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

export const verifyEmail = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.first_name},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>
              Thanks for signing up on SeedFi.<br />
              we welcome you to this great lending platform. 
              click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
            </span>
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

export const requestVerifyEmail = (data) => `
    <tr>
        <td style="padding-bottom: 20px">
          <span>
            <span>Hi ${data.first_name},</span> <br />
          </span>
        </td>
    </tr>

    <tr>
        <td style="padding-bottom: 20px">
           <span>
              Thanks for signing up on SeedFi.<br />
              to verify your email, kindly click <a href="${config.SEEDFI_BACKEND_BASE_URL}/api/v1/user/verify-email?verifyValue=${data.otp}">here</a> to verify your email.
            </span>
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

