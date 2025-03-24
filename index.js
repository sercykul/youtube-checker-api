const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/check-video", async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: "videoId missing" });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  let result = {
    videoId,
    type: "Normal Video",
    finalUrl: `https://www.youtube.com/watch?v=${videoId}`
  };

  try {
    const shortsUrl = `https://www.youtube.com/shorts/${videoId}`;
    await page.goto(shortsUrl, { waitUntil: "networkidle2", timeout: 15000 });

    const redirectedUrl = page.url();
    const isStillShorts = redirectedUrl.includes("/shorts/");

    if (isStillShorts) {
      result.type = "Shorts";
      result.finalUrl = shortsUrl;
    }

    const title = await page.title();
    result.title = title;
  } catch (error) {
    result.error = "Error checking video";
  } finally {
    await browser.close();
    return res.json(result);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
