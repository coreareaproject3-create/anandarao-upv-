import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OTP Storage: email -> { otp: string, expiry: number }
const otpStorage = new Map<string, { otp: string; expiry: number }>();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const getTransporter = () => {
    const email = process.env.EMAIL || process.env.GMAIL_USER || process.env.SPRING_MAIL_USERNAME || process.env.MAIL_USERNAME;
    const password = process.env.PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.SPRING_MAIL_PASSWORD || process.env.MAIL_PASSWORD;
    const host = process.env.SMTP_SERVER || process.env.SPRING_MAIL_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || process.env.SPRING_MAIL_PORT || process.env.MAIL_PORT || '587');

    if (!email || !password) return null;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: email,
        pass: password,
      },
    });
  };

  // API Routes
  app.post("/api/request-otp", async (req, res) => {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStorage.set(email, { otp, expiry });

    const transporter = getTransporter();
    if (!transporter) {
      console.warn("[SERVER] Mail credentials not configured. OTP (debug only):", otp);
      return res.json({ 
        success: true, 
        message: "OTP generated (Server simulation mode)", 
        debug: process.env.NODE_ENV !== 'production' ? otp : null 
      });
    }

    try {
      await transporter.sendMail({
        from: '"WAVE SHIELD Security" <no-reply@waveshield.com>',
        to: email,
        subject: "WAVE SHIELD - OTP Verification",
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; border: 4px solid #0f172a; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; color: #ffffff;">
              <!-- Embedded UI Logo -->
              <div style="margin-bottom: 20px;">
                <svg width="120" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                  <path d="M200 50 L350 120 V300 C350 400 200 450 200 450 C200 450 50 400 50 300 V120 L200 50Z" stroke="#3b82f6" stroke-width="12" stroke-linejoin="round" />
                  <rect x="115" y="140" width="20" height="240" rx="4" fill="#94a3b8" />
                  <rect x="190" y="100" width="20" height="320" rx="4" fill="#cbd5e1" />
                  <rect x="265" y="140" width="20" height="240" rx="4" fill="#94a3b8" />
                  <rect x="75" y="215" width="250" height="20" rx="2" fill="#f8fafc" fill-opacity="0.9" />
                  <rect x="75" y="255" width="250" height="20" rx="2" fill="#f8fafc" fill-opacity="0.9" />
                  <path d="M75 235 Q105 210 135 235 T195 235 T255 235 T315 235" stroke="#3b82f6" stroke-width="8" fill="none" stroke-linecap="round" />
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic;">WAVE <span style="color: #3b82f6;">SHIELD</span></h1>
              <p style="margin: 10px 0 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 4px; color: #3b82f6;">True Velocity . True Strength</p>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 16px; color: #1e293b; margin-bottom: 25px;">Hello <strong>${name || 'Tester'}</strong>,</p>
              <p style="font-size: 15px; color: #475569; line-height: 1.6;">Welcome to the next generation of Concrete Analysis. Use the Verification Code below to access the WaveShield Command Center.</p>
              
              <div style="margin: 35px 0; background-color: #f1f5f9; border: 2px dashed #3b82f6; padding: 30px;">
                <span style="display: block; font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Verification Identity Token</span>
                <div style="font-size: 48px; font-weight: 900; letter-spacing: 8px; color: #0f172a; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </div>
              </div>

              <p style="font-size: 12px; color: #94a3b8; font-weight: 500;">Valid for 5 minutes. Login now to unlock professional laboratory reporting features.</p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Thiagarajar College of Engineering // Dept. of Civil Engineering</p>
            </div>
          </div>
        `
      });
      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("[SERVER] OTP Send Error:", error);
      res.status(500).json({ error: "Failed to send OTP email" });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStorage.get(email);

    if (!record) return res.status(400).json({ error: "No OTP request found for this email" });
    if (Date.now() > record.expiry) {
      otpStorage.delete(email);
      return res.status(400).json({ error: "OTP has expired" });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Success
    otpStorage.delete(email);
    res.json({ success: true });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[UPV LAB SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer();
