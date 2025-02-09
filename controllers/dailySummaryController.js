const DailySummary = require('../models/dailySummary');
const logger = require('../config/logger');
const mongoose = require('mongoose');

exports.getAllDailySummaries = async (req, res) => {
  try {
    const dailySummaries = await DailySummary.find().populate('incomeEntries.category expenseEntries.category');
    res.json(dailySummaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//900,100,1000.

exports.getDailySummaryByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    const dailySummary = await DailySummary.findOne({ date }).populate('incomeEntries.category expenseEntries.category');
    if (!dailySummary) {
      return res.status(404).json({ message: 'Daily summary not found' });
    }
    res.json(dailySummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createDailySummary = async (req, res) => {
  const { date, incomeEntries, expenseEntries, notes, day, totalIncome, totalExpenses } = req.body;

  try {
    const existingSummary = await DailySummary.findOneAndUpdate(
      { date: new Date(date) },
      {
        $set: {
          incomeEntries,
          expenseEntries,
          notes,
          day,
          totalIncome,
          totalExpenses
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(existingSummary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getDailySummariesByPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const total = await DailySummary.countDocuments();
    const summaries = await DailySummary.find()
      .sort({ date: -1 }) // Sort by date in descending order
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summaries,
    });
  } catch (error) {
    console.error('Error fetching daily summaries:', error);
    res.status(500).json({ error: 'Error fetching daily summaries' });
  }
};

exports.getDailySummariesByDateRange = async (req, res) => {
  logger.info(`Fetching daily summaries by date range.`);
  try {
    const { fromDate, toDate } = req.query;
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date();

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: 'Invalid date range provided.' });
    }

    // Income Aggregation Query
    const incomeSummaries = await DailySummary.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lt: to,
          },
        },
      },
      { $unwind: '$incomeEntries' },
      {
        $group: {
          _id: '$incomeEntries.category',
          totalIncome: { $sum: '$incomeEntries.amount' },
        },
      },
      {
        $lookup: {
          from: 'incomecategories', // Match this to your actual collection name
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: {
          path: '$categoryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          category: '$categoryDetails.name', // Map the name field from IncomeCategory
          totalIncome: { $round: ['$totalIncome', 2] },
          _id: 0,
        },
      },
    ]);

    // Expense Aggregation Query
    const expenseSummaries = await DailySummary.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lt: to,
          },
        },
      },
      { $unwind: '$expenseEntries' },
      {
        $group: {
          _id: '$expenseEntries.category',
          totalExpense: { $sum: '$expenseEntries.amount' },
        },
      },
      {
        $lookup: {
          from: 'expensecategories', // Match this to your actual collection name
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: {
          path: '$categoryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          category: '$categoryDetails.name', // Map the name field from ExpenseCategory
          totalExpense: { $round: ['$totalExpense', 2] },
          _id: 0,
        },
      },
    ]);

    // Combine Results
    res.json({
      incomeSummaries,
      expenseSummaries,
    });
  } catch (err) {
    logger.error(`Error fetching daily summaries: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryDataByRange = async (req, res) => {
  console.log('Fetching category data by range.');
  try {
    const { fromDate, toDate, category } = req.query;
    const from = new Date(fromDate);
    const to = toDate ? new Date(toDate) : new Date();

    // Validate date inputs
    if (isNaN(from.getTime()) || (toDate && isNaN(to.getTime()))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const specifiedCategoryId = new mongoose.Types.ObjectId(category);

    // Fetch total income for the specified category
    const incomeData = await DailySummary.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lte: to,
          },
        },
      },
      { $unwind: '$incomeEntries' },
      {
        $match: {
          'incomeEntries.category': specifiedCategoryId,
        },
      },
      {
        $group: {
          _id: '$date',
          totalAmount: { $sum: '$incomeEntries.amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Fetch total expenses for the specified category
    const expenseData = await DailySummary.aggregate([
      {
        $match: {
          date: {
            $gte: from,
            $lte: to,
          },
        },
      },
      { $unwind: '$expenseEntries' },
      {
        $match: {
          'expenseEntries.category': specifiedCategoryId,
        },
      },
      {
        $group: {
          _id: '$date',
          totalAmount: { $sum: '$expenseEntries.amount' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalAmount: { $round: ['$totalAmount', 2] },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Merge results and return
    const results = {};

    incomeData.forEach((entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      results[dateKey] = {
        date: entry.date,
        amount: entry.totalAmount || 0
      };
    });

    expenseData.forEach((entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (results[dateKey]) {
        results[dateKey].totalExpenses = entry.totalAmount || 0;
      } else {
        results[dateKey] = {
          date: entry.date,
          amount: entry.totalAmount || 0,
        };
      }
    });

    // const response = Object.values(results).sort(
    //   (a, b) => new Date(a.date) - new Date(b.date)
    // );

   // Convert combinedResults to an array
   const combinedResults = Object.values(results);

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
    console.error(`Error fetching category data: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};
