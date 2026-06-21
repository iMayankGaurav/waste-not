require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const cron = require('node-cron');
const PantryItem = require('./models/PantryItem');
const nodemailer = require('nodemailer');
const User = require('./models/User.js');
const protect = require('./middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ShoppingItem = require('./models/ShoppingItem');

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

// Add a new grocery item
app.post('/api/items', protect, async (req, res) => {
  try {
    const newItem = await PantryItem.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(newItem); // Send the saved item back to React
  } catch (error) {
    console.error('Database Save Error:', error);
    res.status(500).json({ error: 'Failed to save item to database.' });
  }
});

// Get all grocery items
app.get('/api/items', protect, async (req, res) => {
  try {
    const items = await PantryItem.find({
      userId: req.user.id, // STRICTLY look at the logged-in user
      isConsumed: false,
      isWasted: false,
    }).sort({ expiryDate: 1 });
    res.json(items);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch items.' });
  }
});

// Update an item's status (Ate it or Wasted it)
app.put('/api/items/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { isConsumed, isWasted } = req.body;

    const updatedItem = await PantryItem.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isConsumed, isWasted },
      { new: true }
    );

    if (isConsumed && updatedItem) {
      await ShoppingItem.create({
        name: updatedItem.name,
        userId: req.user.id,
      });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update item.' });
  }
});

// Get Financial Statistics for the logged-in user (PROTECTED)
app.get('/api/finances', protect, async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.user.id });

    let totalEaten = 0;
    let totalWasted = 0;
    const categorySpend = {};

    items.forEach((item) => {
      if (item.isConsumed) totalEaten += item.cost;
      if (item.isWasted) totalWasted += item.cost;
      if (!categorySpend[item.category]) categorySpend[item.category] = 0;
      categorySpend[item.category] += item.cost;
    });

    res.json({
      pieData: [
        { name: 'Money Eaten', value: totalEaten },
        { name: 'Money Wasted', value: totalWasted },
      ],
      barData: Object.keys(categorySpend).map((key) => ({
        name: key,
        total: categorySpend[key],
      })),
    });
  } catch (error) {
    console.error('Finance Error:', error);
    res.status(500).json({ error: 'Failed to calculate finances.' });
  }
});

// --- AUTHENTICATION ROUTES ---

// 1. Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Hash the password (scramble it 10 times for security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user with the scrambled password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create the JWT (The VIP wristband)
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 2. Login an existing user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare the typed password with the scrambled one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Create the JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// --- SHOPPING LIST ROUTES ---

// 1. Get user's active shopping list items
app.get('/api/shopping', protect, async (req, res) => {
  try {
    const list = await ShoppingItem.find({
      userId: req.user.id,
      isBought: false,
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shopping list.' });
  }
});

// 2. Add an item to the shopping list
app.post('/api/shopping', protect, async (req, res) => {
  try {
    const { name } = req.body;
    const newItem = await ShoppingItem.create({
      name,
      userId: req.user.id,
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to shopping list.' });
  }
});

// 3. Delete/Remove an item from the shopping list (When crossed off)
app.delete('/api/shopping/:id', protect, async (req, res) => {
  try {
    await ShoppingItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    res.json({ message: 'Item removed from shopping list.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item.' });
  }
});

// --- HEALTH CHECK ---
// Uptime Robot will ping this to keep the server awake!
app.get('/api/ping', (req, res) => {
  res.status(200).json({ message: "Server is awake!" });
});

// The "Inspire Me" Route
app.post('/api/inspire', async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: 'Please provide some ingredients.' });
    }

    const prompt = `I have the following ingredients: ${ingredients.join(', ')}. 
    Give me a recipe to use them up. You must return ONLY a valid JSON object with the following keys: 
    'title' (string), 'prepTime' (string), 'ingredientsNeeded' (array of strings), and 'instructions' (array of strings). 
    Do not use markdown formatting like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const rawText = response.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const recipeJSON = JSON.parse(rawText);

    res.json(recipeJSON);
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate recipe.' });
  }
});

// 1. Configure the Email Sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. The Cron Job
cron.schedule('0 8 * * *', async () => {
  console.log('Checking for expiring groceries...');

  try {
    // Calculate tomorrow's exact date window
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    // Get all registered users
    const users = await User.find();

    for (const user of users) {
      // Find food strictly for this user that expires tomorrow and hasn't been eaten
      const expiringItems = await PantryItem.find({
        userId: user._id,
        isConsumed: false,
        isWasted: false,
        expiryDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
      });

      // If they have food expiring, send the warning!
      if (expiringItems.length > 0) {
        const itemList = expiringItems.map((item) => item.name).join(', ');

        await transporter.sendMail({
          from: `"Waste-Not AI" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: '⚠️ Waste-Not Alert: Groceries Expiring Tomorrow!',
          text: `Hi ${user.name},\n\nFriendly reminder that the following items are expiring tomorrow:\n\n👉 ${itemList}\n\nTime to ask the Zero-Waste Chef for a recipe!\n\n- The Waste-Not Team`,
        });

        console.log(`Alert sent successfully to ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Cron Job Error:', error);
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
