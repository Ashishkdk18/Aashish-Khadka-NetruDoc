# 🏥 NetruDoc - Smart Healthcare Appointment and Consultation System

NetruDoc allows patients, doctors, and administrators to seamlessly manage healthcare appointments and teleconsultations with a high-performance, highly responsive user interface.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js (Vite) / TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Redux Toolkit 
*   **Real-Time Communication:** Socket.IO / WebRTC
*   **API Client:** Axios
*   **Backend Architecture:** Node.js / Express.js / MongoDB Atlas
*   **Security:** JSON Web Tokens (JWT) / bcrypt

---

## ✨ Features

### 📅 Smart Appointment Booking

Book, reschedule, or cancel appointments based on real-time availability in a responsive grid layout. 

*   **Dynamic Scheduling:** Doctors can open or block calendar slots dynamically.
*   **Conflict Prevention:** Real-time slot validation to entirely prevent double booking.
*   **Automated Alerts:** Instant email notifications powered by Nodemailer/Resend for confirmations.

### 📹 Telemedicine & Live Chat

*   **Video Consultation:** Join peer-to-peer WebRTC video calls directly from the browser, requiring no third-party plugins.
*   **Real-Time Chat:** Synchronous messaging via Socket.IO for patient-doctor communication prior to video calls.
*   **Prescription Generation:** Generate and download formatted PDF prescriptions instantly using the internal PDFKit engine.

### 💳 Secure Asset Management & Records

*   **Payment Gateway:** Secure online payment processing integrated directly with **Stripe** and **eSewa**.
*   **Digital Records:** Securely upload and manage image/PDF medical reports via Cloudinary integration.
*   **Role-Based Access:** Highly secure authentication guarding private routes between Patients, Doctors, and Administrators.

### 🎨 Clean UI/UX

*   **Responsive:** Optimized for everything from mobile devices to ultra-wide monitors.
*   **Accessible Design:** Clean, high-contrast aesthetic ensuring usability for all demographics.
*   **Interactive Dashboards:** Comprehensive analytics dashboards for admins to monitor system revenue, users, and appointment metrics via MongoDB aggregation.

---

## 🚀 Installation & Setup

**Step 1. Clone the Repository:**
```bash
git clone https://github.com/your-username/NetruDoc.git
cd NetruDoc
```

**Step 2. Backend Environment:**
Navigate to the `backend` directory, run `npm install`, and configure your `.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Step 3. Frontend Environment:**
Navigate to the `frontend` directory, run `npm install`, and configure your `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_SOCKET_URL=http://localhost:5000
```

**Step 4. Run Servers:**
Run `npm run dev` in both your frontend and backend terminals to start the application.

---

## 🎓 Academic Details
Developed by **Aashish Khadka** (London Met ID: 23049144) for the **CS6PO5NT- Project** Module. Note: This project was developed for academic evaluation purposes and is not intended to replace professional medical emergency systems.
