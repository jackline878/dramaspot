const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8080;

// Function to fetch data from DramaSpots
const fetchFromDramaspots = async () => {
  try {
    const res = await axios.get('https://dramaspots.com');
    console.log(`[${new Date().toLocaleTimeString()}] Fetched ${res.data.length} articles`);
    // You can process or store data here as needed
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error fetching data:`, err.message);
  }
};

// Start the fetch loop every 13 minutes
setInterval(fetchFromDramaspots, 13 * 60 * 1000); // 13 minutes in ms

// Optional: Call once immediately on start
fetchFromDramaspots();

// Basic route
app.get('/', (req, res) => {
  res.send('DramaSpots fetcher is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
