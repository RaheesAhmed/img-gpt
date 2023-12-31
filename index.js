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

const generateMultipleImages = async (prompt) => {
  let images = [];
  for (let i = 0; i < 5; i++) {
    try {
      let response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        quality: "standard",
        size: "1024x1024",
        response_format: "url",
      });

      if (response && response.data && Array.isArray(response.data)) {
        images.push(response.data.map((image) => image.url)[0]); // Push the first (and only) image URL
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }
  return images;
};

const extractColorsAndBrandAttributes = (htmlContent) => {
  const $ = cheerio.load(htmlContent);
  let colors = [];
  let brandAttributes = "";

  // Example: Extracting primary colors from CSS (you can enhance this)
  $("style").each((_, element) => {
    let styleContent = $(element).html();
    let colorMatch = styleContent.match(/#[0-9a-fA-F]{6}/g); // Regex for hex colors
    if (colorMatch) {
      colors.push(...colorMatch);
    }
  });

  // Example: Extracting brand attributes (you can add more sophisticated analysis)
  $("meta[name='description']").each((_, element) => {
    brandAttributes += $(element).attr("content") + " ";
  });

  console.log("Extracted Colors:", colors);
  console.log("Extracted Brand Attributes:", brandAttributes);

  return { colors, brandAttributes };
};

app.post("/generate-images", async (req, res) => {
  const { url } = req.body;

  try {
    const htmlContent = await scrapeWebsite(url);
    const { colors, brandAttributes } =
      extractColorsAndBrandAttributes(htmlContent);
    const summarizedContent = extractKeyContent(htmlContent);
    const prompt = createPrompt(summarizedContent, colors);
    const images = await generateMultipleImages(prompt);
    res.json({ images, brandAttributes }); // Sending brand attributes for reference
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

  let prompt = `IMGPT2 is refined to produce exactly five distinct DALLE images from a single input consisting of a website URL and three hex color codes. It will focus solely on generating these images, adhering to the guidelines in IMGPT.txt and using the specified colors, without providing any written analysis. Each image will be unique, reflecting different aspects of the website's content and essence. The output from IMGPT2 will be these five images, each serving as a separate visual representation of the website, together forming a comprehensive visual set.Dont include any text. Create an advertisement image based on the following content: ${truncatedContent}`;
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
