import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getData, saveData } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'spendwise_super_secret_jwt_key_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, currency = 'INR' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const data = getData();
    if (!data.users) data.users = [];

    const existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      currency,
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    saveData(data);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, currency: newUser.currency }
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const data = getData();

    // Support demo login
    if (email === 'demo@spendwise.io' || email === 'alex@spendwise.io') {
      const demoToken = jwt.sign(
        { id: 'usr-demo-1', name: 'Alex Mercer', email: 'alex@spendwise.io' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        message: 'Demo Login Successful',
        token: demoToken,
        user: { id: 'usr-demo-1', name: 'Alex Mercer', email: 'alex@spendwise.io', currency: 'INR' }
      });
    }

    if (!data.users) data.users = [];
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        currency: 'INR'
      }
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token', details: err.message });
  }
});

export default router;
