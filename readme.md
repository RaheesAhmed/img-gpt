# Image Generation with OpenAI and Puppeteer

This project uses OpenAI's GPT-4 Vision API and Puppeteer to generate images based on the content of a webpage.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js installed on your machine to run this project. You can download it from [here](https://nodejs.org).

### Installing

1. Clone the repository:

   ```
   git clone https://github.com/RaheesAhmed/img-gpt.git
   ```

2. Install the dependencies:

   ```
   cd image-generation
   npm install
   ```

3. Create a `.env` file in the root directory of the project and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Run the script:
   ```
   node index.js
   ```

## How it works

The script does the following:

1. Launches a new Puppeteer browser.
2. Opens a new page and navigates to "https://teletimesinternational.com/".
3. Extracts the content of the page.
4. Reads the content of two files: "IMGPT analytics.txt" and "IMGPT.txt", and combines them with the extracted content to create a prompt.
5. If the content includes the phrase "important keyword", an additional prompt is added.
6. Sends the prompt to the OpenAI API to generate images.
7. Logs the generated images.
8. Closes the browser.

## Built With

- [Puppeteer](https://pptr.dev/) - Headless browser used for web scraping
- [OpenAI](https://openai.com/) - AI model used for image generation
- [dotenv](https://www.npmjs.com/package/dotenv) - Used to load environment variables
- [fs](https://nodejs.org/api/fs.html) - Node.js file system module for reading files

## Authors

- Rahees Ahmed

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OpenAI for their amazing GPT-4 Vision API
- Puppeteer for their powerful headless browser
