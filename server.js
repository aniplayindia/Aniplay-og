const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// 👉 अपना API डालो यहाँ
const API_URL = "https://your-api-url.com/api/data";

// cache
let cachedData = [];

// load data
async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    cachedData = data;
    console.log("Data loaded");
  } catch (err) {
    console.log("Error loading API");
  }
}

// हर 5 मिनट refresh
loadData();
setInterval(loadData, 5 * 60 * 1000);

// 🔥 AUTO OG ROUTE
app.get("/share/:id", (req, res) => {
  const id = req.params.id;

  const item = cachedData.find(x => x.id == id);

  if (!item) return res.send("Content not found");

  const title = item.title;
  const desc = item.description || "Watch on AniPlay";
  const image = item.thumbnail;

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">
<meta property="og:type" content="video.other">
<meta property="og:url" content="https://${req.headers.host}/share/${id}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${image}">
</head>

<body>
<script>
window.location.href = "https://aniplay.42web.io/?view=player&id=${id}";
</script>
</body>
</html>
`);
});

// root
app.get("/", (req, res) => {
  res.send("AniPlay OG Server Running");
});

app.listen(PORT, () => console.log("Server started"));
