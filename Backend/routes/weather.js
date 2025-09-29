import express from "express";
import axios from "axios";
import db from "../db.js";

const router = express.Router();
const API_KEY = "646dc99e7cd6b800d5d16d174ea270ed";

router.get("/", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  // Provjeri bazu
  db.query(
    "SELECT * FROM weather_history WHERE city = ? ORDER BY created_at DESC LIMIT 1",
    [city],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length > 0) {
        const diff = (new Date() - new Date(results[0].created_at)) / 1000 / 60;
        if (diff < 10) return res.json(results[0]);
      }

      // Ako nema ili je staro, pozovi OpenWeather API
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const weather = {
          city: response.data.name,
          temperature: response.data.main.temp,
          description: response.data.weather[0].description,
        };

        db.query(
          "INSERT INTO weather_history (city, temperature, description) VALUES (?, ?, ?)",
          [weather.city, weather.temperature, weather.description]
        );

        res.json(weather);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
      }
    }
  );
});

export default router;
