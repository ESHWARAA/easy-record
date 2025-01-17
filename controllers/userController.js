const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger'); // Import the logger

exports.signUpUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      logger.info(`User created successfully: ${username}`);
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      logger.error(`Error creating user: ${err.message}`);
      res.status(500).json({ error: 'Error creating user' });
    }
  };

  exports.logInUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`User not found: ${email}`);
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn(`Invalid credentials for user: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
      logger.info(`User logged in successfully: ${email}`);
      res.json({ message: 'Login successful', token });
    } catch (err) {
      logger.error(`Error logging in: ${err.message}`);
      res.status(500).json({ error: 'Error logging in' });
    }
  };