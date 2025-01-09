const IncomeCategory = require('../models/IncomeCategory');

// Get all income categories
exports.getAllIncomeCategories = async (req, res) => {
    try {
        const categories = await IncomeCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new income category
exports.createIncomeCategory = async (req, res) => {
    const category = new IncomeCategory({
        name: req.body.name
    });

    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single income category by ID
exports.getIncomeCategoryById = async (req, res) => {
    try {
        const category = await IncomeCategory.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an income category
exports.updateIncomeCategory = async (req, res) => {
    try {
        const category = await IncomeCategory.findById(req.params.id);
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

// Delete an income category
exports.deleteIncomeCategory = async (req, res) => {
    try {
        const category = await IncomeCategory.findById(req.params.id);
        if (category == null) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.remove();
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};