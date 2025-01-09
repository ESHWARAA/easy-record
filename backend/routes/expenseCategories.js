const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategoryController');

router.get('/', expenseCategoryController.getAllExpenseCategories);
router.post('/', expenseCategoryController.createExpenseCategory);
router.get('/:id', expenseCategoryController.getExpenseCategoryById);
router.put('/:id', expenseCategoryController.updateExpenseCategory);
router.delete('/:id', expenseCategoryController.deleteExpenseCategory);

module.exports = router;