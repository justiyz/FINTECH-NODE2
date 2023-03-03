export const operations = {
  1: 'SNUP', // signup
  2: 'VRYPN', // verify signup phone number
  3: 'INVRYEML', // initiate verify email
  4: 'VRYEML', // verify email
  5: 'VRYBVN', // verify BVN
  6: 'RSPNVRYOTP', // resend phone number verification OTP
  7: 'CMPKYCPWD', // complete KYC and create password
  8: 'FGPWD', // forgot password
  9: 'RSPWD', // reset password
  10: 'CHPWD', // change password
  11: 'CRPIN', // create pin
  12: 'FGPIN', // forgot pin
  13: 'RSPIN', // reset pin
  14: 'CHPIN', // change pin
  15: 'LGIN', // login
  16: 'CFMTRPN', // confirm transaction pin
  17: 'UPSIMG', // upload selfie image
  18: 'UPNID', // upload valid national id
  19: 'UPPRFL', // update user profile
  20: 'VRYRPDOP', // verify reset password otp
  21: 'CRTARLE', // create admin role type
  22: 'EDTARLE', // edit admin role type
  23: 'IVTADM', // invite other admin types
  24: 'ADMCPPR', // admin completes profile
  25: 'EDONPRF', // user edits own profile
  26: 'SVDCDTS', // save debit card details
  27: 'SVDBADTS', // save bank account details
  28: 'RMSVDDC', // remove saved debit card
  29: 'RMSVDBA', // remove saved bank account
  30: 'CFMPWD', // confirm user password
  31: 'CFMPIN', // confirm user pin
  32: 'INTCDPYT', // initialize card payment
  33: 'PYTRFDD', // payment refunded
  34: 'STDBTCDDF', // set debit card as default
  35: 'STACTNMDF', // set account number as default
  36: 'STACTNMDS', // set account number as disbursement account
  37: 'APLYLOAN', // apply for personal loan
  38: 'PLONMNAPP', // personal loan subjected to manual approval
  39: 'PLONAPAUT', // personal loan approved automatically
  40: 'PLONDCLND', // personal loan declined
  41: 'RNGPSLOAN', // renegotiate personal loan
  42: 'PSLOANDBSD', // personal loan disbursed to user successfully
  43: 'CNCPLNAP', // user cancels loan application process
  44: 'INPSLNDSBT', // user initiates loan disbursement by authorizing loan with pin
  45: 'PSLNDBSFLD', // loan disbursement payment to user failed
  46: 'PSLNDBSRVD', // loan disbursement payment to user failed and amount reversed back to seedfi account
  47: 'CRTPBCLST', // user creates a public cluster
  48: 'CRTPVCLST', // user creates a private cluster
  49: 'RQTJNCLST', // user requests to join cluster
  50: 'APRQJNCLST', // existing cluster user accepts request to join cluster
  51: 'DCRQJNCLST', // existing cluster user declines request to join cluster
  52: 'JNCLST', // join cluster', 'user joins cluster
  53: 'RJTJNCLST', // user rejected from joining cluster
  54: 'IVCLMBYEM', // cluster admin invites cluster member by email
  55: 'IVCLMBYPN', // cluster admin invite cluster member by phone number
  56: 'INCLSTLNAP', // cluster admin initiates cluster loan application
  57: 'APCLTLNAPT', // cluster member accepts cluster loan application terms
  58: 'DCCLTLNAPT', // cluster member declines cluster loan application terms
  59: 'INDELCLTRQ', // cluster admin initiate delete cluster
  60: 'APDELCLTRQ', // cluster member accepts delete cluster request
  61: 'DCDELCLTRQ', // cluster member declines delete cluster request
  62: 'CLSTDELTD', // cluster deleted upon agreement by cluster members
  63: 'LVCLST', // cluster member leaves cluster
  64: 'SGNCLTADM', // cluster admin suggests new cluster admin
  65: 'ACNCLTADM', // suggested admin cluster member accepts new cluster admin role
  66: 'DCNCLTADM', // suggested admin cluster member declines new cluster admin role
  67: 'BNWCLTADM', // cluster member becomes new cluster admin
  68: 'EDTCLST', // cluster admin edits cluster
  69: 'APLNAPOFLT', // user accepts loan application offer letter
  70: 'AUTPLONRP', // users partial loan obligation is repaid automatically
  71: 'MANPLONRP', // users partial loan obligation is repaid manually by user
  72: 'AUTFLONRP', // users full loan obligation is repaid automatically
  73: 'MANFLONRP', // users full loan obligation is repaid manually by user
  74: 'RNGLONTRM', // user renegotiates loan terms during application
  75: 'RSHDLONTN', // user reschedules loan tenor
  76: 'RSHDLONRA' // user reschedules loan repayment amount
};
  
