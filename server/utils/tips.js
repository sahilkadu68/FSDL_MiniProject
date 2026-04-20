// Rule-based tips — no AI API calls needed
const TIPS = {
  transport: [
    "🚲 Switching from car to cycling for short trips (< 5 km) can reduce your transport emissions by up to 70%.",
    "🚆 Taking the train instead of driving saves about 80% in carbon emissions per km.",
    "🚗 Carpooling with just one other person cuts your per-trip emissions in half.",
    "🏃 Walking for trips under 2 km eliminates transport emissions entirely and improves health.",
    "🛵 Using an e-scooter or auto-rickshaw produces significantly less CO2 than a personal car.",
  ],
  food: [
    "🥦 Replacing just one beef meal per week with a vegetarian option saves over 145 kg CO2 per year.",
    "🌱 A plant-based diet produces 50-75% less greenhouse gas than a meat-heavy diet.",
    "🍗 Switching from beef to chicken reduces meal emissions by about 75%.",
    "🥗 Cooking at home with local produce has a lower carbon footprint than eating out.",
    "🐟 Fish meals produce about 83% less CO2 than beef — a great protein alternative.",
  ],
  energy: [
    "💡 Switching to LED bulbs can reduce lighting electricity usage by 80%.",
    "🌡️ Setting your AC just 1°C higher saves about 6% on cooling energy costs and emissions.",
    "⏰ Running heavy appliances (washing machine, dishwasher) during off-peak hours can be more efficient.",
    "☀️ Even a small rooftop solar panel can offset 20-30% of a household's electricity emissions.",
    "🔌 Unplugging devices when not in use eliminates phantom power draw — up to 10% of home energy use.",
  ],
  general: [
    "🌍 The average person produces about 4 kg of CO2 equivalent per day. Track daily to see where you stand!",
    "📊 Consistent tracking is the first step — people who monitor their footprint reduce it by 10-20% within months.",
    "♻️ Small daily changes add up: even a 10% reduction in your footprint saves over 140 kg CO2 per year.",
  ],
};

export const generateTip = (categoryTotals) => {
  // Find the highest emission category
  let highestCategory = 'general';
  let highestValue = 0;

  if (categoryTotals) {
    for (const [category, total] of Object.entries(categoryTotals)) {
      if (total > highestValue) {
        highestValue = total;
        highestCategory = category;
      }
    }
  }

  // If no activity yet, give a general tip
  if (highestValue === 0) {
    highestCategory = 'general';
  }

  const tips = TIPS[highestCategory] || TIPS.general;
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return {
    tip: randomTip,
    basedOn: highestCategory,
    message: highestValue > 0
      ? `Based on your activity, your highest emissions come from ${highestCategory}. Here's a tip:`
      : "Here's a tip to get you started on your green journey:",
  };
};

export default TIPS;
