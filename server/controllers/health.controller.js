const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "RePlate API is running",
  });
};

module.exports = {
  getHealth,
};
