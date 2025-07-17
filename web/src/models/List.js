const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
  position: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.List || mongoose.model('List', ListSchema); 