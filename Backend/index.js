// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8800;

// Middleware
app.use(cors());
app.use(express.json()); // za POST request body

// GET request: /api/weather?city=London
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  console.log("City received:", city); // <== test

  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    console.log("Using API Key:", apiKey); // <== test

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    const data = {
      city: response.data.name,
      temp: response.data.main.temp,
      condition: response.data.weather[0].main,
    };

    res.json(data);
  } catch (err) {
    console.error("Error fetching weather:", err.response?.data || err.message);
    res.status(500).json({ error: "There is no city named: ", city });
  }
});

// POST request: /api/weather  { "city": "London" }
app.post("/api/weather", async (req, res) => {
  const city = req.body.city; // JSON body
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );

    const data = {
      city: response.data.name,
      temp: response.data.main.temp,
      condition: response.data.weather[0].main,
    };

    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "There is no city named: ", city });
  }
});

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("API Key:", process.env.WEATHER_API_KEY);
