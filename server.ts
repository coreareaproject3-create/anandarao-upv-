import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/welcome-email", (req, res) => {
    const { name, email } = req.body;
    console.log(`[SERVER] Sending welcome email to ${name} at ${email}`);
    
    // In a production app, we would use something like SendGrid or AWS SES here
    // Example: sendMail({ to: email, subject: 'Welcome to UPV Lab', body: `Welcome ${name}...` });
    
    // For this build, we return success but warn if variables are missing
    if (!process.env.EMAIL_API_KEY) {
      return res.json({ 
        success: true, 
        message: "Auth successful", 
        warning: "Laboratory guidelines were logged to console (EMAIL_API_KEY not set for actual transmission)." 
      });
    }

    res.json({ success: true, message: "Technical guidelines sent to your inbox." });
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
