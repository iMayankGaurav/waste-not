const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  cost: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isConsumed: { type: Boolean, default: false },
  isWasted: { type: Boolean, default: false },
  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PantryItem', pantryItemSchema);
