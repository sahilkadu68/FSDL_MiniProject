import express from 'express';
import mongoose from 'mongoose';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Rule-based fallback calculation
function calculateFallback(sliders, currentAvg) {
  let multiplier = 1.0;

  // Diet impact: meat(0) → mixed(1) → vegetarian(2) → vegan(3)
  const dietReduction = [0, -0.10, -0.25, -0.35];
  multiplier += dietReduction[sliders.diet] || 0;

  // Transport impact: car(0) → mixed(1) → public(2) → bike/walk(3)
  const transportReduction = [0, -0.12, -0.25, -0.40];
  multiplier += transportReduction[sliders.transport] || 0;

  // Energy impact: high(0) → medium(1) → low(2) → minimal(3)
  const energyReduction = [0, -0.10, -0.20, -0.30];
  multiplier += energyReduction[sliders.energy] || 0;

  multiplier = Math.max(0.1, multiplier);
  const projected = currentAvg * multiplier;
  const percentChange = ((projected - currentAvg) / currentAvg * 100).toFixed(1);

  return {
    currentMonthly: parseFloat(currentAvg.toFixed(2)),
    projectedMonthly: parseFloat(projected.toFixed(2)),
    percentChange: parseFloat(percentChange),
    explanation: generateFallbackExplanation(sliders, percentChange),
  };
}

function generateFallbackExplanation(sliders, percentChange) {
  const changes = [];
  if (sliders.diet >= 2) changes.push('plant-based diet');
  if (sliders.transport >= 2) changes.push('public transport or cycling');
  if (sliders.energy >= 2) changes.push('energy-efficient habits');

  if (changes.length === 0) {
    return `Your current lifestyle choices are typical. With minor adjustments, you could see a ${Math.abs(percentChange)}% change in your carbon footprint.`;
  }

  return `By switching to ${changes.join(', ')}, you could reduce your monthly carbon footprint by approximately ${Math.abs(percentChange)}%. Small consistent changes create big impact over time!`;
}

// POST /api/v1/ai/simulate
router.post('/simulate', async (req, res) => {
  try {
    const { diet, transport, energy } = req.body;

    if (diet === undefined || transport === undefined || energy === undefined) {
      return res.status(400).json({ error: 'Diet, transport, and energy slider values are required (0-3).' });
    }

    // Get user's last 30 days average
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userId = new mongoose.Types.ObjectId(req.userId);
    const result = await ActivityLog.aggregate([
      { $match: { userId, loggedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$co2eKg' } } },
    ]);

    const monthlyTotal = result[0]?.total || 120; // Default ~120 kg/month if no data
    const sliders = { diet, transport, energy };

    // Try Gemini API first, fall back to rule-based
    let response;
    try {
      response = await callGemini(sliders, monthlyTotal);
    } catch (aiError) {
      console.log('Gemini API failed, using fallback:', aiError.message);
      response = calculateFallback(sliders, monthlyTotal);
    }

    res.json(response);
  } catch (error) {
    console.error('Simulate error:', error);
    res.status(500).json({ error: 'Simulation failed. Please try again.' });
  }
});

async function callGemini(sliders, currentMonthly) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key configured');

  const dietLabels = ['Heavy meat', 'Mixed/moderate', 'Vegetarian', 'Vegan'];
  const transportLabels = ['Mostly car', 'Mix of car & public', 'Mostly public transport', 'Cycling/walking'];
  const energyLabels = ['High usage', 'Medium usage', 'Low/efficient', 'Minimal/solar'];

  const prompt = `You are a carbon footprint calculator. A user currently produces ${currentMonthly.toFixed(1)} kg CO2e per month. They want to simulate changing their lifestyle to:
- Diet: ${dietLabels[sliders.diet]}
- Transport: ${transportLabels[sliders.transport]}  
- Energy: ${energyLabels[sliders.energy]}

Respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text):
{"projectedMonthly": <number>, "percentChange": <number negative means reduction>, "explanation": "<2 sentences max>"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty response from Gemini');

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  return {
    currentMonthly: parseFloat(currentMonthly.toFixed(2)),
    projectedMonthly: parseFloat(parsed.projectedMonthly.toFixed(2)),
    percentChange: parseFloat(parsed.percentChange.toFixed(1)),
    explanation: parsed.explanation,
  };
}

export default router;
