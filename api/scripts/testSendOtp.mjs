import dotenv from 'dotenv';
dotenv.config();

import sendOtp from '../utils/sendOtp.js';

const email = process.argv[2] || 'testuser@igdtuw.ac.in';
const otp = process.argv[3] || Math.floor(100000 + Math.random() * 900000).toString();

(async () => {
  console.log('Sending OTP', otp, 'to', email);
  const res = await sendOtp(email, otp);
  console.log('sendOtp returned:', res);
  process.exit(res && res.success ? 0 : 1);
})();
