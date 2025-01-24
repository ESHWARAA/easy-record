const express = require('express');
const router = express.Router();
const dailySummaryController = require('../controllers/dailySummaryController');

router.get('/', dailySummaryController.getAllDailySummaries);
router.get('/date/:date', dailySummaryController.getDailySummaryByDate);
router.get('/pagination', dailySummaryController.getDailySummariesByPagination);
router.get('/range', dailySummaryController.getDailySummariesByDateRange);
router.post('/', dailySummaryController.createDailySummary);


module.exports = router;