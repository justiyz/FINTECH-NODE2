/* eslint-disable */
import getTemplate from '.';

const heading = {
  forgotPassword: 'Password Reset Request',
  verifyEmail: 'Welcome to SeedFi 🎉',
  requestVerifyEmail: 'Verify your email',
  loanDisbursement: 'Loan Application Successful',
  loanClusterInvite: 'Loan cluster invite',
  failedCardDebit: 'Failed card debiting',
  successfulRepayment: 'Successful loan repayment',
  failedChargePayment: 'Failed Payment'
};

export const commonTemplate = (messageType, data) => {
  let headerText;
  switch (messageType) {
  case `${messageType}`:
    headerText = heading[messageType];
    break;
  default:
    headerText = '';
    break;
  }

  return `
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <title></title>
</head>
<body style=" background: #eeeeee;">
  <div style="font-family: Poppins; max-width: 600px; margin: 20px auto;  background: #FFFFFF;">
    <!--   HEADER   -->
    <table role="header" width="100%">
      <tr>
        <td style="padding: 40px 0px; width: 73%;">
          <img src="https://seedfi-upload.s3.eu-west-1.amazonaws.com/IMG_3580.PNG" 
          width="150px"
          alt="seedfi-icon">
        </td>
      </tr>
    </table>
    
    <!--   CONTENT   -->
    <table role="content" style="padding: 40px 50px; color: #363740; width: 100%;">
      <tr>
        <td style="font-weight: 900; font-size: 1.2rem; line-height: 48px; color: #84868c; padding-bottom: 23px">
          <span>${headerText}</span>
        </td>
      </tr>
      
      ${getTemplate(messageType, data)} 
    </table>
    <!--    FOOTER    -->
    <table role="footer" width="100%">
    <tr align="center">
      <td  style="padding: 20px 0;">
        
        <div style="color: #84868c; font-weight: 300; padding: 20px 0;  border-top: 2px solid #d9ecd4">
          <span>You are receiving this email because you have signed up on the SeedFi platform. <br />
          © ${new Date(new Date()).getFullYear()}, SeedFi . All rights reserved.
          </span>
        </div>
        
        <div style="color: #000; font-weight: 300;">
          <a href="#" style="text-decoration: none; color: #b5b5bd;">Terms & Conditions</a>
          <span style="padding: 0 16px;">|</span>
          <a href="#" style="text-decoration: none; color: #b5b5bd;">Privacy Policy</a>
          <span style="padding: 0 16px;">|</span>
          <a href="#" style="text-decoration: none; color: #b5b5bd;">Help Center</a>
        </div>
      </td>
    </tr>
  </table>
  </div>
</body>
</html>`;
};
