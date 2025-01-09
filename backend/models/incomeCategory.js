const mongoose = require('mongoose');

const incomeCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('IncomeCategory', incomeCategorySchema);