module.exports = async (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Vercel serverless is up',
    timestamp: new Date().toISOString()
  });
};


