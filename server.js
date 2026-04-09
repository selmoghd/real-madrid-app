// ===============================
// IMPORTS
// ===============================
const express = require("express"); // Web framework for Node.js
const cors = require("cors"); // Enables cross-origin requests
const axios = require("axios"); // HTTP client for external API calls

// ===============================
// APP SETUP
// ===============================
const app = express();

// Enable CORS for frontend-backend communication
app.use(cors());

// ===============================
// ENVIRONMENT VARIABLES
// ===============================
// API key stored securely in environment variables
const API_KEY = process.env.API_KEY;

// ===============================
// HEALTH CHECK ROUTE
// ===============================
// Confirms that the server is running
app.get("/", (req, res) => {
  res.send("Server is alive");
});

// ===============================
// MATCHES ROUTE
// ===============================
// Fetches Real Madrid match data from football-data.org
app.get("/matches", async (req, res) => {
  console.log("MATCHES ROUTE HIT"); // Debug log

  try {
    // Request match data from external API
    const response = await axios.get(
      "https://api.football-data.org/v4/teams/86/matches",
      {
        headers: {
          "X-Auth-Token": API_KEY, // Authentication header
        },
      }
    );

    // Return data to client
    res.json(response.data);

  } catch (error) {
    // Log detailed error for debugging
    console.error("ERROR:", error.response?.data || error.message);

    // Send generic error response
    res.status(500).send("Error fetching matches");
  }
});

// ===============================
// SERVER START
// ===============================
// Uses platform-provided port or defaults to 5000 locally
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===============================
// KEEP PROCESS ALIVE (DEV ONLY)
// ===============================
// Remove before deployment
//process.stdin.resume();