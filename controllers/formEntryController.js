const FormEntry = require('../models/formEntry');
const logger = require('../config/logger'); // Ensure you have a logger configured

exports.createFormEntry = async (req, res) => {
  try {
    const formEntry = new FormEntry(req.body);
    await formEntry.save();
    res.status(201).json(formEntry);
  } catch (err) {
    logger.error(`Error creating form entry: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchFormEntries = async (req, res) => {
    try {
      const { fromDate, toDate, category } = req.query;
      const from = new Date(fromDate);
      const to = toDate ? new Date(toDate) : new Date();
  
      if (isNaN(from.getTime()) || (toDate && isNaN(to.getTime()))) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
  
      const formEntries = await FormEntry.find({
        date: {
          $gte: from,
          $lte: to,
        },
        $or: [
          { 'income.category': category },
          { 'expenses.category': category },
        ],
      });
  
      const combinedResults = formEntries.map(entry => {
        let amount  = 0;
        // Check in income
        const incomeEntry = entry.income.find(i => i.category === category);
        if (incomeEntry) {
          amount = incomeEntry.amount;
        }
        else{
          // Check in expenses
          const expenseEntry = entry.expenses.find(e => e.category === category);
          if (expenseEntry) {
            amount = expenseEntry.amount;
          }
        }
        
        return {
          date: entry.date,
          amount,
        };
      });
  
      // Generate all dates in the range
      const dateRange = [];
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d));
      }
  
      // Merge the existing data with the full date range
      const response = dateRange.map((date) => {
        const existingEntry = combinedResults.find(
          (entry) =>
            entry.date.toISOString().split('T')[0] ===
            date.toISOString().split('T')[0]
        );
        return {
          date: date.toISOString().split('T')[0],
          amount: existingEntry ? existingEntry.amount : 0,
        };
      });
  
      res.json(response);
    } catch (err) {
      logger.error(`Error searching form entries: ${err.message}`);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

