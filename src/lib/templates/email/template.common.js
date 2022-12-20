/* eslint-disable max-len */
import getTemplate from '.';

const heading = {
  forgotPassword: 'Password Reset Request'
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
<body>
  <div style="font-family: Poppins">
    <!--   HEADER   -->
    <table role="header" width="100%">
      <tr>
        <td bgcolor="#003BB3" style="padding: 40px 64px; font-size: 14px; width: 73%;">
        <span>just dummy email template</span>
        </td>
      </tr>
    </table>
    
    <!--   CONTENT   -->
    <table role="content" style="padding: 80px 64px; color: #363740;">
      <tr>
        <td style="font-weight: 600; font-size: 32px; line-height: 48px; color: #003BB3; padding-bottom: 23px">
          <span>${headerText}</span>
        </td>
      </tr>
      
      ${getTemplate(messageType, data)}
      
    </table>
    
    <!--    FOOTER    -->
    <table role="footer" width="100%">
      <tr align="center">
        <td  style="background: #003BB3; padding: 40px 0;">
          <div style="padding-bottom: 34px">
            <a href="#">
                <img style="padding-right: 40px" src="https://res.cloudinary.com/dtsjiqrgd/image/upload/v1636711876/facebook_yl5wto.png" alt="facebook-icon">
              </a>
            <a href="#">
            <img style="padding-right: 40px" src="https://res.cloudinary.com/dtsjiqrgd/image/upload/v1636711926/instagram_vfnpyx.png" alt="instagram-icon">
            </a>
            <a href="#">
              <img style="padding-right: 40px" src="https://res.cloudinary.com/dtsjiqrgd/image/upload/v1636712047/twitter_kfu6bd.png" alt="twitter-icon">
            </a>
            <a href="#">
            <img src="https://res.cloudinary.com/dtsjiqrgd/image/upload/v1636712011/linked-in_gkbnuo.png" alt="linked-in-icon">
            </a>
          </div>
          
          <div style="color: #fff; font-weight: 300; padding-bottom: 34px">
            <span>You are receiving this email because you have signed up on the Seedfi platform. <br />
            © ${new Date(new Date()).getFullYear()}, SEEDFI . All rights reserved.
            </span>
          </div>
          
          <div style="color: #fff; font-weight: 300;">
            <a href="#" style="text-decoration: none; color: #fff;">Terms & Conditions</a>
            <span style="padding: 0 16px;">|</span>
            <a href="#" style="text-decoration: none; color: #fff;">Privacy Policy</a>
            <span style="padding: 0 16px;">|</span>
            <a href="#" style="text-decoration: none; color: #fff;">Help Center</a>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};
