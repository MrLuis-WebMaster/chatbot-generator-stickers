const axios = require('axios');
require('dotenv').config()

const getStickersbyServiceGif = async (q) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://tenor.googleapis.com/v2/search',
            params: {
              key: process.env.GIF_SERVICE_API_KEY,
              q,
              limit:4
            },
          };
        const response = await axios.request(options);
        return response
    } catch (error) {
        console.error(error);
    }
    
} 

module.exports = getStickersbyServiceGif