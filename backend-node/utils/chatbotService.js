const { GoogleGenerativeAI } = require('@google/generative-ai');

const getChatbotResponse = async (message, user) => {
  const role = user ? user.role : 'guest';
  const name = user ? user.username : 'there';
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "⚠️ Setup Required: I am currently undergoing AI core upgrades. Please add your GEMINI_API_KEY to the .env file and restart the server to activate my advanced AI brain!";
  }
  
  const systemPrompt = `
    You are the 'OrganMatch Smart Assistant', an advanced, helpful, and professional AI Medical Assistant for the OrganMatch platform.
    You are currently talking to a user named '${name}' whose role is '${role}'.
    
    OrganMatch is a platform that uses a 5-pillar AI Scoring Algorithm for organ transplants:
    1. Blood Compatibility (30%)
    2. Medical Urgency (30%)
    3. Organ Quality (20%)
    4. Regional Proximity (10%)
    5. Waiting Time (10%)
    
    Guidelines:
    - Keep your answers concise, empathetic, and highly informative.
    - If the user asks for medical advice or reports an emergency, clearly state you are an AI and they should contact a real doctor or emergency services immediately.
    - Use simple, easy-to-read formatting.
    - Speak politely and professionally.
    - Tailor your advice to the user's role (${role}).
  `;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fullMessage = `${systemPrompt}\n\nUser Message: ${message}`;
    const result = await model.generateContent(fullMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Gemini API Error: ${error.message}`);
    return "I'm currently experiencing very high traffic on my AI servers. Please try asking again in a few seconds!";
  }
};

module.exports = { getChatbotResponse };
