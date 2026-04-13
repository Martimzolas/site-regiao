const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.XWEATHER_CLIENT_ID || "";
const CLIENT_SECRET = process.env.XWEATHER_CLIENT_SECRET || "";

app.use(express.static(path.join(__dirname)));

app.get("/api/weather", async (req, res) => {
  const place = (req.query.place || "Porto,PT").toString();

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({
      error: "Credenciais em falta no .env (XWEATHER_CLIENT_ID / XWEATHER_CLIENT_SECRET)."
    });
  }

  try {
    const endpoint = `https://data.api.xweather.com/conditions/${encodeURIComponent(place)}?client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      const details = await response.text();
      return res.status(response.status).json({
        error: "Erro da Xweather.",
        details
      });
    }

    const payload = await response.json();
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      error: "Falha ao comunicar com a Xweather.",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ativo em http://localhost:${PORT}`);
});
