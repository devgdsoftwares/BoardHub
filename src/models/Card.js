const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
  position: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Card || mongoose.model('Card', CardSchema); 