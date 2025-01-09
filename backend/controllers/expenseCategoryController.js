const ExpenseCategory = require('../models/ExpenseCategory');

// Get all expense categories
exports.getAllExpenseCategories = async (req, res) => {
    try {
        const categories = await ExpenseCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new expense category
exports.createExpenseCategory = async (req, res) => {
    const category = new ExpenseCategory({
        name: req.body.name
    });

    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single expense category by ID
exports.getExpenseCategoryById = async (req, res) => {
    try {
        const category = await ExpenseCategory.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an expense category
exports.updateExpenseCategory = async (req, res) => {
    try {
        const category = await ExpenseCategory.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (req.body.name != null) {
            category.name = req.body.name;
        }

        const updatedCategory = await category.save();
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an expense category
exports.deleteExpenseCategory = async (req, res) => {
    try {
        const category = await ExpenseCategory.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.remove();
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};