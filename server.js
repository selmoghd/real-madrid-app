const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const API_KEY = "5b19ecb3c0a94b5cab8cae67772cf94e";

// test route
app.get("/", (req, res) => {
  res.send("Server is alive");
});

// real matches route
app.get("/matches", async (req, res) => {
  console.log("MATCHES ROUTE HIT");

  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/teams/86/matches",
      {
        headers: {
          "X-Auth-Token": API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).send("Error fetching matches");
  }
});

// IMPORTANT FIX
const server = app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

// keep process alive
process.stdin.resume();