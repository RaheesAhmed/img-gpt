import puppeteer from "puppeteer";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI(apiKey);

async function generateImages(prompt) {
  try {
    const response = await openai.images.generate({
      model: "gpt-4-vision-preview",
      prompt: prompt,
    });

    if (response && response.data && response.data.images) {
      return response.data.images;
    } else {
      throw new Error("Invalid response from DALL-E API");
    }
  } catch (error) {
    console.error("Error generating images:", error);
    throw error;
  }
}

const extractPageContent = async (page) => {
  try {
    return await page.evaluate(() => document.body.innerText);
  } catch (error) {
    console.error("Error extracting page content:", error);
    throw error;
  }
};

const createPrompt = (content) => {
  try {
    const analyticsContent = fs.readFileSync("IMGPT analytics.txt", "utf-8");
    const promptContent = fs.readFileSync("IMGPT.txt", "utf-8");

    let prompt = `${content}\n${analyticsContent}\n${promptContent}`;
    if (content.includes("important keyword")) {
      prompt += "\nAdditional prompt for important keyword";
    } else {
      prompt += "\nDefault prompt";
    }

    console.log("Generated Prompt:", prompt); // Logging the generated prompt
    return prompt;
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw error;
  }
};

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto("https://teletimesinternational.com/", {
      waitUntil: "networkidle2",
    });

    const content = await extractPageContent(page);
    const prompt = createPrompt(content);
    const images = await generateImages(prompt);

    console.log("Generated Images:", images);
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  }
})();
