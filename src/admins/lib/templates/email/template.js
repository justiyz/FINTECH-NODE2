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
