const { getChatbotResponse } = require('../utils/chatbotService');

const queryChatbot = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const user = req.user || null;

  try {
    const response = await getChatbotResponse(message, user);
    res.status(200).json({
      response: response,
      sender: 'bot',
      timestamp: null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { queryChatbot };
