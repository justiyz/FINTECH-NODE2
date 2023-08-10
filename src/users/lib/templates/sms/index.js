export const signupSms = (data) => `Hello, thank you for signing up with Seedfi.,
Your confirmation code is ${data.otp}. This code is active for ${data.otpDuration}.
Best, SeedFi team
`;

export const verifyAccountOTPSms = (data) => `Hello, kindly use this code, ${data.otp} to verify your account.
This code is active for ${data.otpDuration}.
Best, SeedFi team
`;

export const resetPinOTPSms = (data) => `Hello, kindly use this code, ${data.otp} to reset your pin.
This code is active for ${data.otpDuration}.
Best, SeedFi team
`;
