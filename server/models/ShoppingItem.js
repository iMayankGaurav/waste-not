const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  isBought: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ShoppingItem', shoppingItemSchema);
