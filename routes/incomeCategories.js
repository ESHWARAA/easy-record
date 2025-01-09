const express = require('express');
const router = express.Router();
const incomeCategoryController = require('../controllers/incomeCategoryController');

router.get('/', incomeCategoryController.getAllIncomeCategories);
router.post('/', incomeCategoryController.createIncomeCategory);
router.get('/:id', incomeCategoryController.getIncomeCategoryById);
router.put('/:id', incomeCategoryController.updateIncomeCategory);
router.delete('/:id', incomeCategoryController.deleteIncomeCategory);

module.exports = router;