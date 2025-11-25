import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const OtpSchema = new mongoose.Schema({ email: String, otp: String }, { timestamps: true });
const Otp = mongoose.model('Otp', OtpSchema);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const email = process.argv[2] || 'testuser@igdtuw.ac.in';
    const record = await Otp.findOne({ email }).sort({ createdAt: -1 }).lean();
    console.log(record);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
