const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  categories: {
    type: [String],
    default: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Spices'],
  },
});

module.exports = mongoose.model('User', userSchema);
