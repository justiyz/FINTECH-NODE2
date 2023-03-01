export const signupSms = (data) => `Hi, thanks for signing up on Seedfi\n,
please use this OTP ${data.otp} to verify your phone number.\n
This OTP expires in 10 minutes time.
`;

export const resendSignupOTPSms = (data) => `Hello, Please use the following OTP\n,
${data.otp} to verify your phone number.\n
This OTP expires in 10 minutes time.
`;

export const resetPinOTPSms = (data) => `Kindly use the following OTP\n,
${data.otp} to reset your pin.\n
This OTP expires in 3 minutes time.
`;
