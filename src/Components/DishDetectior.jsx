import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Map class number to dish names
const classNames = [
  "Biryani","Cake","Chicken Bun","Chicken Fry","Chips","Cookies","Custard",
  "Dry Pepper Chicken","Fish Kabab","French Fry","Fried rice with Chilli Chicken",
  "Kabab","Kacchi","Khichuri","Momo","Nawabi Shemai","Nuggets","Pasta",
  "Payesh","Pizza","Roshlmalai","Sauce","Shahi Tukra","Spring Rolls","Tiramisu","noodles"
];

// Vibrant gradient colors for each dish
const classColors = [
  "from-red-400 to-red-600","from-pink-300 to-pink-500","from-yellow-400 to-yellow-600",
  "from-orange-400 to-orange-600","from-indigo-400 to-indigo-600","from-purple-300 to-purple-500",
  "from-green-300 to-green-500","from-teal-400 to-teal-600","from-blue-400 to-blue-600",
  "from-pink-400 to-pink-600","from-purple-400 to-purple-600","from-red-300 to-red-500",
  "from-yellow-300 to-yellow-500","from-green-400 to-green-600","from-blue-300 to-blue-500",
  "from-pink-200 to-pink-400","from-teal-300 to-teal-500","from-orange-300 to-orange-500",
  "from-indigo-300 to-indigo-500","from-purple-200 to-purple-400","from-red-200 to-red-400",
  "from-yellow-200 to-yellow-400","from-green-200 to-green-400","from-blue-200 to-blue-400",
  "from-pink-100 to-pink-300","from-purple-100 to-purple-300"
];

const DishDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select an image first.");

    const formData = new FormData();
    formData.append("image", selectedFile);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/upload/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPrediction(response.data);
    } catch (error) {
      console.error(error);
      alert("Failed to get prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 flex flex-col items-center p-6">
      <motion.h1
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-extrabold mb-10 text-gray-800 text-center"
      >
        🍽 AI Dish Detector
      </motion.h1>

     <div className="grid grid-cols-2 gap-10">
         {/* Image Upload + Preview Card */}
      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className="w-full max-w-lg flex flex-col items-center gap-4"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 text-gray-600 w-full text-center"
        />

        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-3xl shadow-2xl overflow-hidden border border-gray-200 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          </motion.div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold shadow-xl hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all"
          disabled={loading}
        >
          {loading ? "Detecting..." : "Detect Dish"}
        </motion.button>
      </motion.form>

      {/* Predictions */}
      <AnimatePresence>
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className="mt-10 w-full max-w-lg flex flex-col gap-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 flex flex-col gap-4"
            >
              <h2 className="text-2xl font-bold text-gray-800 text-center">
                Predicted Dish:{" "}
                <span className="text-purple-500">
                  {classNames[parseInt(prediction.predicted_class.replace("class_", ""), 10)]}
                </span>
              </h2>

              <h3 className="text-xl font-semibold text-gray-700 text-center mb-2">
                Top Predictions
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {prediction.top_4_predictions.map((item, index) => {
                  const classIndex = parseInt(item.class.replace("class_", ""), 10);
                  const colorClass = classColors[classIndex] || "from-gray-400 to-gray-600";
                  return (
                    <motion.div
                      key={index}
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-r ${colorClass} rounded-xl p-4 shadow-lg hover:shadow-2xl transition-shadow`}
                    >
                      <div className="flex justify-between font-semibold text-white mb-2">
                        <span>{classNames[classIndex]}</span>
                        <span>{(item.confidence * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.confidence * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-4 bg-white rounded-full"
                        ></motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
     </div>
    </div>
  );
};

export default DishDetector;