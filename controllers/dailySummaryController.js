const DailySummary = require('../models/dailySummary');
const logger = require('../config/logger');

exports.getAllDailySummaries = async (req, res) => {
  try {
    const dailySummaries = await DailySummary.find().populate('incomeEntries.category expenseEntries.category');
    res.json(dailySummaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDailySummaryByDate = async (req, res) => {
    try {
        const date = new Date(req.params.date);
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
  const dailySummary = new DailySummary(req.body);
  try {
    const newDailySummary = await dailySummary.save();
    res.status(201).json(newDailySummary);
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