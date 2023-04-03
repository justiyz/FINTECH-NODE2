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

  return `<!DOCTYPE html>
  <html 
  lang="en" xmlns="http://www.w3.org/1999/xhtml" 
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="x-apple-disable-message-reformatting" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;1,500;1,800&display=swap"
          rel="stylesheet" />
      <title>Seedfi</title>
  </head>
      <body style="margin: 0; padding: 0; background: #eeeeee;">
          <center>
          <div style="
          width: 100%; margin-top: 20px!important;max-width: 600px;background: #ffffff;padding: 30px 30px;text-align: left;font-family: 'Figtree', sans-serif;  ">
                  <div>
                      <img src="https://seedfi-upload.s3.eu-west-1.amazonaws.com/IMG_3580.PNG" 
                      width="150" height="50"
                     style="display: block; margin-bottom: 10px" />
                  </div> <br><br>
  
                  <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"bgcolor="#ffffff">
                      <tr>
                          <td>
                              <span style="font-family: 'Figtree'; font-style: normal; font-weight: 600; font-size: 32px;
                                  line-height: 44px; color: #1a201d; margin-bottom: 50px;"
                                  >${headerText}</span>
                          </td>
                      </tr>
  
                      ${getTemplate(messageType, data)}     
                  </table>
  
                  <footer style="text-align: center;">
                      <!--   Border Line   -->
                  <hr style=" border: none;height: 1px;color: #d9ecd4;background: #d9ecd4;width: 100%;margin-bottom: 20px;margin-top: 20px;" />
                      <span style=" align-items: center; font-family: 'Figtree'; font-style: normal;font-weight: 400;font-size: 14px;line-height: 20px;color: #b5b5bd;margin-bottom: 30px;">
                      You are receiving this email because you have signed up on the Seedfi platform. <br />
                      © ${new Date(new Date()).getFullYear()}, SEEDFI . All rights reserved.
                      </span>
                  </footer>
              </div>
          </center>
      </body>
  </html>
  `;
};
