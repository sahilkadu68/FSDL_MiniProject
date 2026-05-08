/**
 * Advanced Analytics & Scoring Engine
 * Generates insights, suggestions, and carbon score
 */

// Calculate Carbon Score (0-100)
export const calculateCarbonScore = (dailyAverage, weeklyTotal) => {
  /**
   * Scoring Logic:
   * < 5 kg/day    → 90-100 (Excellent)
   * 5-10 kg/day   → 70-89  (Good)
   * 10-15 kg/day  → 50-69  (Average)
   * 15-20 kg/day  → 30-49  (High)
   * > 20 kg/day   → 0-29   (Very High)
   */

  if (dailyAverage < 5) {
    return {
      score: Math.min(100, 90 + (5 - dailyAverage) * 2),
      label: 'Excellent',
      description: 'Your carbon footprint is exceptionally low!',
      color: '#10b981', // Green
    };
  } else if (dailyAverage < 10) {
    return {
      score: Math.min(89, 70 + (10 - dailyAverage) * 3.8),
      label: 'Good',
      description: 'You\'re doing better than average!',
      color: '#6366f1', // Indigo
    };
  } else if (dailyAverage < 15) {
    return {
      score: Math.min(69, 50 + (15 - dailyAverage) * 3.8),
      label: 'Average',
      description: 'There\'s room for improvement here.',
      color: '#f59e0b', // Amber
    };
  } else if (dailyAverage < 20) {
    return {
      score: Math.min(49, 30 + (20 - dailyAverage) * 3.8),
      label: 'High',
      description: 'Consider making lifestyle changes.',
      color: '#ef5350', // Red
    };
  } else {
    return {
      score: Math.max(0, 29 - (dailyAverage - 20) * 2),
      label: 'Very High',
      description: 'Urgent action needed to reduce emissions.',
      color: '#d32f2f', // Dark Red
    };
  }
};

// Generate Smart Insights Panel
export const generateSmartInsights = (categoryTotals) => {
  const totalEmissions = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  if (totalEmissions === 0) {
    return {
      insights: [],
      highestCategory: null,
      message: 'Start logging activities to see your insights!',
    };
  }

  const insights = Object.entries(categoryTotals).map(([category, total]) => {
    const percentage = totalEmissions > 0 ? (total / totalEmissions) * 100 : 0;
    let impact = 'Low';
    if (percentage > 60) impact = 'High';
    else if (percentage > 30) impact = 'Medium';

    return {
      category,
      total: parseFloat(total.toFixed(2)),
      percentage: parseFloat(percentage.toFixed(1)),
      impact,
      icon: getCategoryIcon(category),
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const highestCategory = insights[0];
  const message = `${highestCategory.category.charAt(0).toUpperCase()}${highestCategory.category.slice(1)} contributes ${highestCategory.percentage.toFixed(0)}% of your emissions`;

  return {
    insights,
    highestCategory: highestCategory.category,
    message,
    totalEmissions: parseFloat(totalEmissions.toFixed(2)),
  };
};

// Generate Dynamic Smart Suggestions (beyond tips)
export const generateDynamicSuggestions = (insights) => {
  const suggestions = [];

  if (!insights.insights || insights.insights.length === 0) {
    return [];
  }

  const categoryTotals = {};
  insights.insights.forEach(i => {
    categoryTotals[i.category] = i.total;
  });

  // Transport Suggestions
  if (categoryTotals.transport > 0) {
    const transportPct = (categoryTotals.transport / insights.totalEmissions) * 100;
    if (transportPct > 40) {
      suggestions.push({
        id: 'transport-public',
        category: 'transport',
        title: '🚆 Switch to Public Transport',
        description: 'Public transport emits 80-90% less CO2 than cars',
        impact: 'High',
        priority: 1,
      });
      suggestions.push({
        id: 'transport-carpool',
        category: 'transport',
        title: '🚗 Try Carpooling',
        description: 'Share rides to split emissions with others',
        impact: 'Medium',
        priority: 2,
      });
    } else if (transportPct > 15) {
      suggestions.push({
        id: 'transport-short-trips',
        category: 'transport',
        title: '🚴 Bike for Short Trips',
        description: 'Cycling for trips under 5 km eliminates transport emissions',
        impact: 'Medium',
        priority: 1,
      });
    }
  }

  // Food Suggestions
  if (categoryTotals.food > 0) {
    const foodPct = (categoryTotals.food / insights.totalEmissions) * 100;
    if (foodPct > 40) {
      suggestions.push({
        id: 'food-vegetarian',
        category: 'food',
        title: '🥦 Go Vegetarian (1x per week)',
        description: 'One vegetarian meal per week saves 145 kg CO2 annually',
        impact: 'High',
        priority: 1,
      });
      suggestions.push({
        id: 'food-reduce-beef',
        category: 'food',
        title: '🍗 Switch Beef to Chicken',
        description: 'Chicken has 75% lower emissions than beef',
        impact: 'High',
        priority: 2,
      });
    } else if (foodPct > 15) {
      suggestions.push({
        id: 'food-local',
        category: 'food',
        title: '🌾 Buy Local & Seasonal',
        description: 'Local produce has lower transportation emissions',
        impact: 'Medium',
        priority: 1,
      });
    }
  }

  // Energy Suggestions
  if (categoryTotals.energy > 0) {
    const energyPct = (categoryTotals.energy / insights.totalEmissions) * 100;
    if (energyPct > 35) {
      suggestions.push({
        id: 'energy-led',
        category: 'energy',
        title: '💡 Switch to LED Bulbs',
        description: 'LEDs use 80% less energy than incandescent bulbs',
        impact: 'High',
        priority: 1,
      });
      suggestions.push({
        id: 'energy-solar',
        category: 'energy',
        title: '☀️ Install Solar Panels',
        description: 'A small solar setup can offset 20-30% of home electricity',
        impact: 'Very High',
        priority: 2,
      });
    } else if (energyPct > 10) {
      suggestions.push({
        id: 'energy-unplug',
        category: 'energy',
        title: '🔌 Reduce Phantom Power',
        description: 'Unplug devices to eliminate 5-10% of energy waste',
        impact: 'Medium',
        priority: 1,
      });
    }
  }

  // Add general suggestion
  suggestions.push({
    id: 'general-track',
    category: 'general',
    title: '📊 Keep Tracking',
    description: 'Consistent tracking leads to 10-20% voluntary reduction in emissions',
    impact: 'Medium',
    priority: 3,
  });

  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 5); // Top 5 suggestions
};

// Progress Tracking: Last 7 days vs Previous 7 days
export const calculateProgressTracking = (lastWeekTotal, previousWeekTotal) => {
  const lastWeekAvg = lastWeekTotal / 7;
  const previousWeekAvg = previousWeekTotal / 7;
  
  let change = 0;
  let trend = '→'; // neutral
  let status = 'stable';

  if (previousWeekAvg > 0) {
    change = ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100;
    if (change > 5) {
      trend = '↑';
      status = 'increasing';
    } else if (change < -5) {
      trend = '↓';
      status = 'decreasing';
    }
  }

  return {
    lastWeekTotal: parseFloat(lastWeekTotal.toFixed(2)),
    lastWeekAvg: parseFloat(lastWeekAvg.toFixed(2)),
    previousWeekTotal: parseFloat(previousWeekTotal.toFixed(2)),
    previousWeekAvg: parseFloat(previousWeekAvg.toFixed(2)),
    changePercent: parseFloat(change.toFixed(1)),
    trend,
    status,
    message: change > 0 
      ? `Your emissions increased by ${Math.abs(change).toFixed(0)}% compared to last week`
      : change < 0 
      ? `Great! Your emissions decreased by ${Math.abs(change).toFixed(0)}% compared to last week`
      : 'Your emissions remained stable compared to last week',
  };
};

// Helper function
function getCategoryIcon(category) {
  const icons = {
    transport: '🚗',
    food: '🍽️',
    energy: '⚡',
  };
  return icons[category] || '📊';
}

export default {
  calculateCarbonScore,
  generateSmartInsights,
  generateDynamicSuggestions,
  calculateProgressTracking,
};
