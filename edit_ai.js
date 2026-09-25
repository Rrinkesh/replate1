const fs = require('fs');

let file = fs.readFileSync('server/controllers/aiController.js', 'utf8');

const newLogic = `const { GoogleGenAI } = require("@google/genai");
const Food = require("../models/Food");
const User = require("../models/User");

const predictSurplus = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: "Gemini API key is not configured on the server."
      });
    }

    const { dayOfWeek, isHoliday, weather, mealsPrepared, mealsSold } = req.body;
    
    // 1. Fetch user to get businessId
    const firebaseUid = req.user?.firebaseUid || req.user?.uid;
    const user = await User.findOne({ firebaseUid });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    // 2. Fetch last 7 days of food surplus data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentFoods = await Food.find({
      businessId: user._id,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });

    // 3. Aggregate surplus by date
    const surplusByDate = {};
    recentFoods.forEach(food => {
      const dateKey = food.createdAt.toISOString().split('T')[0];
      if (!surplusByDate[dateKey]) {
        surplusByDate[dateKey] = 0;
      }
      surplusByDate[dateKey] += food.quantity;
    });

    const historicalDataStr = Object.keys(surplusByDate).length > 0 
      ? Object.entries(surplusByDate).map(([date, qty]) => \`- \${date}: \${qty} meals surplus\`).join('\\n')
      : "No surplus recorded in the last 7 days.";

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = \`You are an expert Restaurant Inventory Forecaster AI.
I am providing you with today's data for a restaurant, along with their actual surplus history from the last 7 days.
    
Current Factors:
- Target Day of Week: \${dayOfWeek}
- Is it a Holiday/Event?: \${isHoliday}
- Weather: \${weather}
- Meals Prepared (Current Baseline): \${mealsPrepared || "Unknown"}
- Meals Sold (Current Baseline): \${mealsSold || "Unknown"}

Past 7 Days Surplus History:
\${historicalDataStr}

Your task is to predict the expected surplus for tomorrow based on this 7-day historical trend and the current factors. Provide a short, actionable recommendation to reduce overproduction.
You MUST return the response strictly as a JSON object with the following schema, and absolutely no other text or markdown formatting:
{
  "predictedSurplusMin": Number,
  "predictedSurplusMax": Number,
  "aiRecommendation": "String (2 sentences max)"
}\`;

    let response;
    const fallbackModels = ["gemini-3.6-flash", "gemini-3.6-pro", "gemini-1.5-flash"];
    let currentModelIndex = 0;
    let retries = 3;

    while (retries > 0) {
      try {
        const activeModel = fallbackModels[currentModelIndex];
        console.log(\`Attempting AI prediction with model: \${activeModel}...\`);
        
        response = await ai.models.generateContent({
          model: activeModel,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        break;
      } catch (err) {
        if ((err.status === 503 || err.status === 429) && retries > 1) {
          console.warn(\`Gemini API Busy/Rate Limited. Switching models and retrying...\`);
          currentModelIndex = (currentModelIndex + 1) % fallbackModels.length;
          await new Promise(res => setTimeout(res, 3000));
          retries--;
        } else {
          throw err;
        }
      }
    }

    const resultText = response.text;
    const resultJson = JSON.parse(resultText);

    res.status(200).json({
      success: true,
      prediction: resultJson
    });

  } catch (error) {
    console.error("AI Prediction Error:", error);
    
    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message: "The AI servers are currently experiencing very high demand. Please wait a few moments and try again."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate AI prediction."
    });
  }
};

module.exports = {
  predictSurplus
};
`;

fs.writeFileSync('server/controllers/aiController.js', newLogic);
