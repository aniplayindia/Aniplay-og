const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   🌐 BACKEND API (DATA SOURCE)
========================= */
const API_URL = "https://aniplay-backend.onrender.com/api/data";

/* =========================
   🧠 CACHE SYSTEM
========================= */
let cachedData = [];
let lastFetch = null;

async function fetchData() {
  try {
    console.log("📡 Fetching data...");

    const res = await axios.get(API_URL);
    cachedData = res.data.data || [];

    lastFetch = new Date();

    console.log("✅ Data loaded:", cachedData.length);

  } catch (err) {
    console.error("❌ Fetch error:", err.message);
  }
}

/* =========================
   🔄 AUTO REFRESH
========================= */
setInterval(fetchData, 5 * 60 * 1000);
fetchData();

/* =========================
   🌍 CORS
========================= */
app.use(cors());

/* =========================
   🔥 COMBINED OG ROUTE
========================= */
app.get("*", (req, res) => {
  const id = req.query.id;

  // 🏠 HOMEPAGE OG
  if (!id) {
    const frontendURL = "https://aniplay.42web.io/";

    return res.send(`
<!DOCTYPE html>
<html>
<head>
<title>AniPlay - Watch Anime Free</title>

<link rel="canonical" href="${frontendURL}" />

<meta property="og:title" content="AniPlay - Watch Anime Free in HD">
<meta property="og:description" content="Stream latest anime, movies & shows in HD for free.">
<meta property="og:image" content="https://aniplay.42web.io/assets/logo.png">
<meta property="og:url" content="${frontendURL}">
<meta property="og:type" content="website">

<meta name="twitter:card" content="summary_large_image">

<meta http-equiv="refresh" content="0; url=${frontendURL}">
</head>
<body></body>
</html>
    `);
  }

  // 🎬 ANIME OG AUTO GENERATION
  const item = cachedData.find(x => String(x.id) === String(id));

  if (!item) {
    return res.status(404).send("Anime not found");
  }

  const title = item.title || "AniPlay";
  const description =
    item.description ||
    item.fullDescription ||
    "Watch this anime on AniPlay";

  const image =
    item.thumbnail ||
    item.poster ||
    "https://aniplay.42web.io/assets/logo.png";

  const frontendURL = `https://aniplay.42web.io/?id=${id}`;

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>${title}</title>

<link rel="canonical" href="${frontendURL}" />

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${frontendURL}">
<meta property="og:type" content="video.other">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<meta http-equiv="refresh" content="0; url=${frontendURL}">
</head>
<body></body>
</html>
  `);
});

/* =========================
   ❤️ HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    lastFetch,
    items: cachedData.length
  });
});

/* =========================
   🚀 START SERVER
========================= */
app.listen(PORT, () => {
  console.log("✅ OG Server running on port", PORT);
});
