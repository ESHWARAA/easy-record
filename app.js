const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const dailySummariesRouter = require('./routes/dailySummaries');
const incomeCategoriesRouter = require('./routes/incomeCategories');
const expenseCategoriesRouter = require('./routes/expenseCategories');
const userRouter = require('./routes/user');
const app = express();


connectDB();
//tB9E0V36OvEhTogj

app.use(express.json());
app.use(cors());

app.use('/api/daily-summaries', dailySummariesRouter);
app.use('/api/income-categories', incomeCategoriesRouter);
app.use('/api/expense-categories', expenseCategoriesRouter);
app.use('/api/user', userRouter);

module.exports = app;