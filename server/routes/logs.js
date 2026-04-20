import express from 'express';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';
import { calculateCO2e, getEmissionFactor, getSubcategoriesByCategory, getAllCategories } from '../utils/emissionFactors.js';
import { generateTip } from '../utils/tips.js';

const router = express.Router();

// GET /api/v1/logs/factors — return available categories and subcategories
router.get('/factors', (req, res) => {
  const categories = getAllCategories();
  const factors = {};
  categories.forEach(cat => {
    factors[cat] = getSubcategoriesByCategory(cat);
  });
  res.json({ categories, factors });
});

// GET /api/v1/logs/summary — aggregated data for dashboard (MUST be before /:id)
router.get('/summary', async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Total CO2e for today, week, month
    const [todayTotal, weekTotal, monthTotal] = await Promise.all([
      ActivityLog.aggregate([
        { $match: { userId, loggedAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$co2eKg' } } },
      ]),
      ActivityLog.aggregate([
        { $match: { userId, loggedAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$co2eKg' } } },
      ]),
      ActivityLog.aggregate([
        { $match: { userId, loggedAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$co2eKg' } } },
      ]),
    ]);

    // Breakdown by category (this month)
    const categoryBreakdown = await ActivityLog.aggregate([
      { $match: { userId, loggedAt: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$co2eKg' } } },
    ]);

    // Daily totals for last 7 days
    const dailyTotals = await ActivityLog.aggregate([
      { $match: { userId, loggedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$loggedAt' } },
          total: { $sum: '$co2eKg' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startOfToday);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyTotals.find(d => d._id === dateStr);
      dailyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: found ? parseFloat(found.total.toFixed(2)) : 0,
      });
    }

    // Build category totals for tip generation
    const catTotals = {};
    categoryBreakdown.forEach(c => { catTotals[c._id] = c.total; });
    const tip = generateTip(catTotals);

    res.json({
      today: todayTotal[0]?.total || 0,
      week: weekTotal[0]?.total || 0,
      month: monthTotal[0]?.total || 0,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c._id,
        total: parseFloat(c.total.toFixed(2)),
      })),
      dailyData,
      tip,
      globalAvgDaily: 4.0, // kg CO2e per day (reference)
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// POST /api/v1/logs — create a new activity log
router.post('/', async (req, res) => {
  try {
    const { category, subcategory, quantity, loggedAt } = req.body;

    if (!category || !subcategory || quantity === undefined) {
      return res.status(400).json({ error: 'Category, subcategory, and quantity are required.' });
    }

    const factor = getEmissionFactor(subcategory);
    if (!factor) {
      return res.status(400).json({ error: `Unknown subcategory: ${subcategory}` });
    }
    if (factor.category !== category) {
      return res.status(400).json({ error: `Subcategory ${subcategory} does not belong to ${category}.` });
    }

    const co2eKg = calculateCO2e(subcategory, quantity);

    const log = await ActivityLog.create({
      userId: req.userId,
      category,
      subcategory,
      quantity,
      co2eKg,
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log entry.' });
  }
});

// GET /api/v1/logs — get user's logs with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, from, to, limit = 100 } = req.query;
    const filter = { userId: req.userId };

    if (category) filter.category = category;
    if (from || to) {
      filter.loggedAt = {};
      if (from) filter.loggedAt.$gte = new Date(from);
      if (to) filter.loggedAt.$lte = new Date(to);
    }

    const logs = await ActivityLog.find(filter)
      .sort({ loggedAt: -1 })
      .limit(parseInt(limit));

    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

// PUT /api/v1/logs/:id — update a log entry
router.put('/:id', async (req, res) => {
  try {
    const { category, subcategory, quantity, loggedAt } = req.body;
    const log = await ActivityLog.findOne({ _id: req.params.id, userId: req.userId });

    if (!log) {
      return res.status(404).json({ error: 'Log not found.' });
    }

    if (subcategory && quantity !== undefined) {
      const factor = getEmissionFactor(subcategory);
      if (!factor) return res.status(400).json({ error: `Unknown subcategory: ${subcategory}` });
      log.subcategory = subcategory;
      log.quantity = quantity;
      log.co2eKg = calculateCO2e(subcategory, quantity);
      if (category) log.category = category;
    } else if (quantity !== undefined) {
      log.quantity = quantity;
      log.co2eKg = calculateCO2e(log.subcategory, quantity);
    }

    if (loggedAt) log.loggedAt = new Date(loggedAt);

    await log.save();
    res.json(log);
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ error: 'Failed to update log.' });
  }
});

// DELETE /api/v1/logs/:id — delete a log entry
router.delete('/:id', async (req, res) => {
  try {
    const log = await ActivityLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) {
      return res.status(404).json({ error: 'Log not found.' });
    }
    res.json({ message: 'Log deleted successfully.' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Failed to delete log.' });
  }
});

export default router;
