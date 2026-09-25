import React, { useState } from "react";
import { Sparkles, TrendingDown, Info, Loader2 } from "lucide-react";
import api from "../../services/api";

const AIForecasterCard = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  const [formData, setFormData] = useState({
    dayOfWeek: new Date().toLocaleDateString("en-US", { weekday: "long" }),
    isHoliday: "No",
    weather: "Clear",
    mealsPrepared: "",
    mealsSold: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    try {
      const response = await api.post("/ai/predict", formData);
      if (response.data && response.data.prediction) {
        setPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error("AI Prediction Error:", error);
      alert(error.response?.data?.message || "Failed to fetch prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft-md border border-brand-100 overflow-hidden mt-8 group hover:shadow-soft-lg transition-all duration-300">
      <div className="bg-gradient-to-r from-brand-600 to-emerald-600 p-5 flex items-center justify-between text-white">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            AI Waste Preventer
          </h2>
          <p className="text-sm font-semibold text-brand-50 opacity-90 mt-1">
            Predict tomorrow's surplus and reduce overproduction.
          </p>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Day of Week</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Holiday / Event</label>
            <input type="text" name="isHoliday" value={formData.isHoliday} onChange={handleChange} placeholder="e.g. None, Diwali, Local Fair" className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Weather Forecast</label>
            <select name="weather" value={formData.weather} onChange={handleChange} className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500">
              <option value="Clear">Clear</option>
              <option value="Rain">Rain</option>
              <option value="Heatwave">Heatwave</option>
              <option value="Cold">Cold / Snow</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Meals Prepared Today</label>
            <input type="number" name="mealsPrepared" value={formData.mealsPrepared} onChange={handleChange} className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal-500 mb-1">Meals Sold Today</label>
            <input type="number" name="mealsSold" value={formData.mealsSold} onChange={handleChange} className="w-full text-sm border-charcoal-200 rounded-lg focus:ring-brand-500" required />
          </div>
          

          <div className="md:col-span-3 mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-charcoal-900 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Generate Tomorrow's Forecast
            </button>
          </div>
        </form>

        {prediction && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mt-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 border border-brand-100 shadow-soft-sm">
                <TrendingDown className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-charcoal-900 mb-1">AI Prediction Result</h3>
                <p className="text-2xl font-black text-brand-700 mb-2">
                  {prediction.predictedSurplusMin} - {prediction.predictedSurplusMax} meals
                </p>
                <div className="flex items-start gap-2 text-sm text-charcoal-700 bg-white p-3 rounded-lg border border-brand-100 shadow-soft-sm">
                  <Info className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="font-medium leading-relaxed">{prediction.aiRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIForecasterCard;

