import nodemailer from "nodemailer";

let transporter;
let usingTestAccount = false;

async function initTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL, EMAIL_PASS, NODE_ENV } = process.env;

  // Preferred: explicit SMTP settings
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
  }

  // Backwards-compatible: EMAIL / EMAIL_PASS (e.g. Gmail app password)
  if (EMAIL && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL, pass: EMAIL_PASS },
    });
    return transporter;
  }

  // In production we want explicit SMTP credentials — fail fast
  if (NODE_ENV === "production") {
    console.error("Email credentials are not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in environment.");
    return null;
  }

  // Development fallback: use Ethereal test account so emails can be previewed
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    usingTestAccount = true;
    console.info("Using Ethereal test account for email in development. Previews will be printed after sending.");
    return transporter;
  } catch (err) {
    console.error("Failed to create test email account:", err && err.message ? err.message : err);
    return null;
  }
}

const sendOtp = async (email, otp) => {
  const tr = await initTransporter();

  const mailOptions = {
    from: `"IGDTUW Lost & Found" <${process.env.SMTP_FROM || process.env.EMAIL || "no-reply@example.com"}>`,
    to: email,
    subject: "Your OTP for verification",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };

  if (!tr) {
    const msg = "Email transporter not configured — skipping sending OTP.";
    console.warn(msg, "OTP:", otp);
    return { success: false, error: msg };
  }

  try {
    const info = await tr.sendMail(mailOptions);
    let preview;
    if (usingTestAccount) {
      preview = nodemailer.getTestMessageUrl(info);
      console.info("OTP sent (Ethereal). Preview URL:", preview || "(no preview available)");
    }
    return { success: true, previewUrl: preview };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    console.error("Failed to send OTP email:", message);
    return { success: false, error: message };
  }
};

export default sendOtp;
