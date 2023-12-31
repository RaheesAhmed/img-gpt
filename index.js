import express from "express";
import puppeteer from "puppeteer";
import OpenAI from "openai";
import dotenv from "dotenv";
import cheerio from "cheerio";

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

app.use("/", express.static("public"));

app.post("/generate-images", async (req, res) => {
  const { url, colorCodes } = req.body;

  const data = req.body;
  console.log(data);

  try {
    const htmlContent = await scrapeWebsite(url);
    const summarizedContent = extractKeyContent(htmlContent);
    const prompt = createPrompt(summarizedContent, colorCodes);
    const images = await generateImages(prompt);
    res.json({ images });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).send("Error generating images");
  }
});

const scrapeWebsite = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  const content = await page.content();
  await browser.close();
  return content;
};

const extractKeyContent = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  let summarizedContent = "";

  // Extract text from key elements like headings and paragraphs
  $("h1, h2, h3, p").each((_, element) => {
    summarizedContent += $(element).text() + " ";
  });

  return summarizedContent;
};

const createPrompt = (content, colorCodes) => {
  const MAX_LENGTH = 400; // Adjust as needed
  let truncatedContent =
    content.length > MAX_LENGTH
      ? content.substring(0, MAX_LENGTH) + "..."
      : content;

  let prompt = `Create an advertisement image based on the following content: ${truncatedContent}`;
  if (colorCodes && colorCodes.length) {
    prompt += `. Use the following colors: ${colorCodes.join(", ")}`;
  }
  return prompt;
};

const generateImages = async (prompt) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1, // As per the documentation, DALL-E 3 currently supports generating only one image per request
      quality: "standard", // Optional: Adjust as needed
      size: "1024x1024", // Optional: Adjust as needed
      response_format: "url", // Specify the format of the response
    });

    // Check if the response has the expected structure
    if (response && response.data && Array.isArray(response.data)) {
      return response.data.map((image) => image.url);
    } else {
      console.error("Unexpected response structure:", response);
      return []; // Return an empty array or handle as needed
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
};

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
