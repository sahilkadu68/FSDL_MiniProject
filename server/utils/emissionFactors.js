// Hardcoded emission factors (kg CO2e per unit)
const EMISSION_FACTORS = {
  // Transport (per km)
  car_petrol: { factor: 0.21, unit: 'km', label: 'Car (Petrol)', category: 'transport' },
  car_diesel: { factor: 0.27, unit: 'km', label: 'Car (Diesel)', category: 'transport' },
  bus: { factor: 0.089, unit: 'km', label: 'Bus', category: 'transport' },
  train: { factor: 0.041, unit: 'km', label: 'Train', category: 'transport' },
  bike: { factor: 0.0, unit: 'km', label: 'Bicycle', category: 'transport' },
  flight_domestic: { factor: 0.255, unit: 'km', label: 'Flight (Domestic)', category: 'transport' },
  auto_rickshaw: { factor: 0.15, unit: 'km', label: 'Auto Rickshaw', category: 'transport' },

  // Food (per meal/serving)
  beef_meal: { factor: 3.0, unit: 'meal', label: 'Beef Meal', category: 'food' },
  chicken_meal: { factor: 0.7, unit: 'meal', label: 'Chicken Meal', category: 'food' },
  fish_meal: { factor: 0.5, unit: 'meal', label: 'Fish Meal', category: 'food' },
  vegetarian_meal: { factor: 0.2, unit: 'meal', label: 'Vegetarian Meal', category: 'food' },
  vegan_meal: { factor: 0.1, unit: 'meal', label: 'Vegan Meal', category: 'food' },
  dairy_glass: { factor: 0.4, unit: 'serving', label: 'Dairy (1 glass)', category: 'food' },

  // Energy (per kWh or cubic metre)
  electricity: { factor: 0.82, unit: 'kWh', label: 'Electricity', category: 'energy' },
  natural_gas: { factor: 2.0, unit: 'm³', label: 'Natural Gas', category: 'energy' },
  lpg_cylinder: { factor: 42.5, unit: 'cylinder', label: 'LPG Cylinder', category: 'energy' },
};

export const getEmissionFactor = (subcategory) => {
  return EMISSION_FACTORS[subcategory] || null;
};

export const calculateCO2e = (subcategory, quantity) => {
  const factor = EMISSION_FACTORS[subcategory];
  if (!factor) return 0;
  return parseFloat((quantity * factor.factor).toFixed(3));
};

export const getSubcategoriesByCategory = (category) => {
  return Object.entries(EMISSION_FACTORS)
    .filter(([_, v]) => v.category === category)
    .map(([key, v]) => ({ key, ...v }));
};

export const getAllCategories = () => ['transport', 'food', 'energy'];

export default EMISSION_FACTORS;
