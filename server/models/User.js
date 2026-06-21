const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // <-- WE ADDED THIS
  categories: { 
    type: [String], 
    default: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Spices'] 
  }
});

module.exports = mongoose.model('User', userSchema);