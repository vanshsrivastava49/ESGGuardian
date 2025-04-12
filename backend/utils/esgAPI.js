const axios = require("axios");

exports.fetchESGStandards = async () => {
  const response = await axios.get("https://esgapi.rapidapi.com/latest", {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "your-host",
    },
  });
  return response.data;
};
