const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  cost: { type: Number, required: true },
  isConsumed: { type: Boolean, default: false },
  isWasted: { type: Boolean, default: false },
});

module.exports = mongoose.model('PantryItem', pantryItemSchema);
