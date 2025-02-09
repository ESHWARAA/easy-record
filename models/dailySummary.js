const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const dailySummarySchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  day: { type: String, required: true },
  totalIncome: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  incomeEntries: [
    {
      category: { type: ObjectId, ref: 'IncomeCategory' },
      amount: { type: Number, required: true }
    }
  ],
  expenseEntries: [
    {
      category: { type: ObjectId, ref: 'ExpenseCategory' },
      amount: { type: Number, required: true },
      type: { type: String, required: true }
    }
  ],
  notes: { type: [String], default: [] }
});

module.exports = mongoose.model('DailySummary', dailySummarySchema);
