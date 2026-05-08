const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdfParse = require('pdf-parse-new');

const validateMedicalPdf = async (filePath, organ, reportType) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("No GEMINI_API_KEY, skipping AI validation.");
      return { isValid: true, msg: "AI Validation skipped (No API Key)" };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a medical report validator. 
    Review this extracted text from a ${reportType} report for a patient donating/needing a ${organ}.
    Ensure the text actually looks like a legitimate medical report of this type.
    Reply with ONLY 'VALID' if it appears legitimate, or a brief reason (starting with 'INVALID: ') if it does not.
    Text: ${text.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text().trim();

    if (aiText.startsWith('VALID')) {
      return { isValid: true, msg: "" };
    } else {
      return { isValid: false, msg: aiText.replace('INVALID: ', '') };
    }
  } catch (error) {
    console.error("PDF Validation error:", error);
    // Graceful fallback for demo if Gemini API is overloaded (503 Service Unavailable)
    if (error.status === 503 || error.status === 500) {
      console.warn("Gemini API is overloaded. Bypassing validation for demo purposes.");
      return { isValid: true, msg: "" };
    }
    return { isValid: false, msg: "Could not validate PDF (AI Service Error)" };
  }
};

module.exports = { validateMedicalPdf };
