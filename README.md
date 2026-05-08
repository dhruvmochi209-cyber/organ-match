# OrganMatch - Medical Organ Transplant Matching System

OrganMatch is a secure, intelligent, and scalable MERN stack web application designed to connect organ donors with recipients. It integrates advanced AI capabilities to validate medical reports and ensures fair match prioritization.

## 🚀 Key Features
- **OTP-Based Secure Authentication:** Secure user registration and password recovery using OTPs sent via Gmail SMTP.
- **AI Medical Report Validation:** Integration with Google Gemini AI to analyze and extract relevant clinical details from uploaded donor/recipient medical reports (PDF format).
- **Match Priority System:** Intelligent matching algorithm based on HLA typing, blood group compatibility, and medical urgency.
- **Secure Payments:** Integrated Razorpay payment gateway to process and confirm transactions securely.
- **Real-Time Dashboards:** Dedicated interactive portals for Donors, Recipients, and Hospital Admins.
- **AI Medical Chatbot:** A Gemini-powered smart assistant to resolve user queries instantly.

## 🛠 Tech Stack
- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI Integration:** Google Gemini Pro API
- **Payment Gateway:** Razorpay
- **Other Technologies:** Socket.io, JSON Web Tokens (JWT), Nodemailer

## 📦 Project Structure
- `/frontend`: React + Vite client-side application.
- `/backend-node`: Node.js/Express server handling APIs, AI processing, and Database connectivity.
- `/dummy_reports_for_demo`: Sample medical PDFs for testing and presentation purposes.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB installed and running locally (or MongoDB Atlas URI)
- Google Gemini API Key
- Razorpay API Credentials
- Gmail App Password for sending emails

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/OrganMatch.git
cd OrganMatch
```

### 2. Environment Variables Configuration
Create a `.env` file in the **root** folder of the project with the following keys:
```env
# Node Backend Env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/organmatch
JWT_SECRET=your_jwt_secret_key

# External APIs
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Common Email Env (for SMTP)
SENDER_EMAIL=your_email@gmail.com
SENDER_PASSWORD=your_app_password
```

### 3. Backend Setup
```bash
cd backend-node
npm install
npm start
```
The backend server will run on `http://localhost:8000`.

### 4. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be available at `http://localhost:5173`.

---
*Developed as part of a final-year engineering project.*
