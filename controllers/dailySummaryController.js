const DailySummary = require('../models/dailySummary');

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