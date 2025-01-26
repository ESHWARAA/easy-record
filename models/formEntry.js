const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formEntrySchema = new Schema({
  date: { type: Date, required: true },
  day: { type: String, required: true },
  income: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  expenses: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      type : { type: String, required: true },
    },
  ],
  notes: [
    {
      content: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('FormEntry', formEntrySchema);