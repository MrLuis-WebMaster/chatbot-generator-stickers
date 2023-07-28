const axios = require('axios');
require('dotenv').config()

async function generateImageFromPrompt(prompt) {
  const apiKey = process.env.IMG_AI_SERVICE_API_KEY;
  const apiUrl = 'https://api.openai.com/v1/images/generations';
  try {
    const response = await axios.post(
      apiUrl,
      {
        prompt: prompt,
        n: 1,
        size: '256x256'
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].url;
    } else {
      throw new Error('error')
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

module.exports = generateImageFromPrompt;
