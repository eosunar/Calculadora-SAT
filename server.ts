import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "CalculaSAT API is running" });
  });

  // Stripe Webhook (Placeholder)
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), (req, res) => {
    res.json({ received: true });
  });

  // Stripe Checkout Session (Placeholder)
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      // In a real app, you'd use the stripe SDK here
      // const session = await stripe.checkout.sessions.create({...})
      res.json({ url: "https://checkout.stripe.com/pay/mock_session" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
