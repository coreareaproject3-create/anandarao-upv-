import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // AI Analysis Route
  app.post("/api/ai-analyze", async (req, res) => {
    try {
      const { data } = req.body;
      
      const prompt = `
        You are a Senior Civil Engineer specializing in Non-Destructive Testing (NDT) of concrete structures.
        Analyze the following Ultrasonic Pulse Velocity (UPV) laboratory test data:
        
        Method: ${data.method}
        Path Length: ${data.parameters.pathLength} mm
        Pulse Time: ${data.parameters.pulseTime} us
        Measured Velocity: ${data.results.measuredVelocity} km/s
        Corrected Velocity: ${data.results.correctedVelocity} km/s
        Quality Identification: ${data.results.quality}
        
        Provide a concise, professional engineering insight covering:
        1. Structural Interpretation: What does this velocity mean for this specific concrete member?
        2. Integrity Level: Assessment of voids, cracks, or honeycombing.
        3. Recommendation: Immediate field action or further testing (e.g., Core Test, Rebound Hammer).
        
        Keep the tone technical, objective, and authoritative. Return the response in professional markdown format.
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error) {
      console.error("[GEMINI ERROR]", error);
      res.status(500).json({ error: "AI Insight Engine offline. Please verify API configuration." });
    }
  });

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

  app.post("/api/send-report", async (req, res) => {
    const { name, email, results, method, parameters, isBatch } = req.body;
    
    const transporter = getTransporter();
    if (!transporter) return res.status(500).json({ error: "Email service not configured on server" });

    try {
      let resultsHtml = '';
      if (!isBatch) {
        resultsHtml = `
          <div style="background-color: #f8fafc; padding: 25px; border: 1px solid #e2e8f0; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Single Point Analysis</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #475569;">
              <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Path Length (L):</td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${parameters.pathLength} mm</td></tr>
              <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Pulse Time (T):</td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${parameters.pulseTime} µs</td></tr>
              <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9;">Measured Velocity (Vm):</td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700;">${results.measuredVelocity.toFixed(3)} km/s</td></tr>
              <tr style="color: #3b82f6; font-size: 18px;"><td style="padding: 12px 0; font-weight: 900;">Corrected Velocity (Vc):</td><td style="padding: 12px 0; text-align: right; font-weight: 900;">${results.correctedVelocity.toFixed(3)} km/s</td></tr>
              <tr><td style="padding: 6px 0;">Quality Grade:</td><td style="padding: 6px 0; text-align: right; font-weight: 900; color: #0284c7;">${results.quality}</td></tr>
            </table>
          </div>
        `;
      } else {
        resultsHtml = `
          <h3 style="margin: 25px 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase;">Batch Analysis Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr style="background-color: #0f172a; color: #ffffff;">
              <th style="padding: 8px; text-align: left; border: 1px solid #334155;">Location</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Vm (km/s)</th>
              <th style="padding: 8px; text-align: center; border: 1px solid #334155;">Vc (km/s)</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #334155;">Grade</th>
            </tr>
            ${results.map((r: any) => `
              <tr style="background-color: #ffffff;">
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${r.location}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">${r.results.measuredVelocity.toFixed(3)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 700;">${r.results.correctedVelocity.toFixed(3)}</td>
                <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: 700;">${r.results.quality}</td>
              </tr>
            `).join('')}
          </table>
        `;
      }

      await transporter.sendMail({
        from: '"WAVE SHIELD Laboratory" <reports@waveshield.com>',
        to: email,
        subject: `[REPORT] Lab Analysis: ${method.toUpperCase()} - ${new Date().toLocaleDateString()}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 4px solid #0f172a; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 40px 20px; text-align: center; color: #ffffff;">
              <div style="margin-bottom: 15px;">
                <svg width="100" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                  <path d="M200 50 L350 120 V300 C350 400 200 450 200 450 C200 450 50 400 50 300 V120 L200 50Z" stroke="#3b82f6" stroke-width="12" stroke-linejoin="round" />
                  <rect x="115" y="140" width="20" height="240" rx="4" fill="#94a3b8" />
                  <rect x="190" y="100" width="20" height="320" rx="4" fill="#cbd5e1" />
                  <rect x="265" y="140" width="20" height="240" rx="4" fill="#94a3b8" />
                  <rect x="75" y="215" width="250" height="20" rx="2" fill="#f8fafc" fill-opacity="0.9" />
                  <rect x="75" y="255" width="250" height="20" rx="2" fill="#f8fafc" fill-opacity="0.9" />
                  <path d="M75 235 Q105 210 135 235 T195 235 T255 235 T315 235" stroke="#3b82f6" stroke-width="8" fill="none" stroke-linecap="round" />
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">WAVE <span style="color: #3b82f6;">SHIELD</span></h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: #3b82f6;">True Velocity . True Strength</p>
            </div>

            <div style="padding: 35px 25px;">
              <h2 style="font-size: 16px; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 20px;">Laboratory Analysis Report</h2>
              
              <table style="width: 100%; font-size: 13px; color: #64748b; margin-bottom: 30px;">
                <tr><td><strong>Analyst:</strong> ${name}</td><td style="text-align: right;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</td></tr>
                <tr><td><strong>Email:</strong> ${email}</td><td style="text-align: right;"><strong>Method:</strong> ${method}</td></tr>
              </table>

              ${resultsHtml}

              <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                <p style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
                  This report is electronically generated for professional validation of concrete structural integrity.<br/>
                  <strong>Thiagarajar College of Engineering // Department of Civil Engineering</strong>
                </p>
              </div>
            </div>
          </div>
        `
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[SERVER] Report dispatch error:", error);
      res.status(500).json({ error: "Failed to dispatch analysis report" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
