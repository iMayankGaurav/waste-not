require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const cron = require('node-cron');
const PantryItem = require('./models/PantryItem');

const app = express();
app.use(cors());
app.use(express.json()); 

// Initialize the Gemini Client using the loaded environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((error) => console.error('MongoDB connection error:', error));

//ROUTES

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'The backend is alive and talking!' });
});

// The "Inspire Me" Route
app.post('/api/inspire', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Please provide some ingredients." });
    }

    const prompt = `I have the following ingredients: ${ingredients.join(', ')}. 
    Give me a recipe to use them up. You must return ONLY a valid JSON object with the following keys: 
    'title' (string), 'prepTime' (string), 'ingredientsNeeded' (array of strings), and 'instructions' (array of strings). 
    Do not use markdown formatting like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash',
      contents: prompt,
    });

    const rawText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const recipeJSON = JSON.parse(rawText);

    res.json(recipeJSON);

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Failed to generate recipe." });
  }
});

//BACKGROUND TASKS (Cron Jobs)
cron.schedule('0 8 * * *', async () => {
  console.log("Running daily expiry check...");

  try {
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);

    const expiringItems = await PantryItem.find({
      expiryDate: { $lte: twoDaysFromNow },
      isConsumed: false,
      isWasted: false
    }).populate('userId'); 

    if (expiringItems.length > 0) {
      console.log(`Found ${expiringItems.length} items about to expire!`);
      // Next step: Nodemailer logic will go here
    } else {
      console.log("No items expiring soon. Pantry is looking good!");
    }

  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

//START THE SERVER (Always at the bottom)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});