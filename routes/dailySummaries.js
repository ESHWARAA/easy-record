const express = require('express');
const router = express.Router();
const dailySummaryController = require('../controllers/dailySummaryController');

router.get('/', dailySummaryController.getAllDailySummaries);
router.get('/:date', dailySummaryController.getDailySummaryByDate);
router.post('/', dailySummaryController.createDailySummary);
// ... other routes (update, delete)

module.exports = router;