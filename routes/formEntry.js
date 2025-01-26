const express = require('express');
const router = express.Router();
const formEntryController = require('../controllers/formEntryController');


router.get('/search', formEntryController.searchFormEntries);
router.post('/', formEntryController.createFormEntry);

module.exports = router;