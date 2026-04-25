🚧 Labor Connect

*Bridging the Gap Between Skilled Laborers and Employers*

---

📌 Overview

**Labor Connect** is a full-stack web platform designed to connect **skilled laborers (mason, construction workers, etc.)** with **employers seeking on-demand workforce**.

It solves the real-world problem of:

* Unorganized labor hiring
* Lack of trust & verification
* No centralized job marketplace for daily wage workers

🎯 Target Users

* Contractors / Employers
* Skilled & Unskilled Laborers

---
🚀 Features

👷 Laborer Side

* Profile creation with skills & experience
* Browse and apply for jobs
* Ratings & reviews system
* Real-time chat with employers

🏢 Employer Side

* Post jobs with requirements
* Manage job applications
* Hire & review laborers
* Track job status

💬 Real-Time Communication

* Socket-based chat system
* Persistent messaging
* Chat cleanup jobs

🔐 Admin Panel

* Admin authentication & role-based access
* Manage users, jobs, reports
* Monitor logs & system activity

⚙️ System Features

* OTP-based authentication
* Rate limiting & security middleware
* CORS handling & debugging tools
* Error boundary & logging system

---

🛠️ Tech Stack

Frontend

* React (Vite)
* Context API (Auth Management)
* Axios (API handling)
* CSS (Custom + Modular)

Backend

* Node.js
* Express.js
* REST API architecture

Database

* MongoDB (Mongoose Models)

Real-Time

* Socket.IO

Testing & Tools

* Jest (Backend Testing)
* Excel-based Test Cases
* Postman (API Testing)
* Vercel (Deployment config)

---
📸 Screenshots / Demo
<video controls src="Manpower Connect.mp4" title="Readme Video"></video>

🔗 *Live Demo:* `https://labor-connect.vercel.app/  

---

▶️ Usage

1. Register as **Laborer or Employer**
2. Login using OTP/Auth system
3. Post or apply for jobs
4. Use chat system for communication
5. Admin can monitor via dashboard
---

🧪 Testing Section

#✅ Types of Testing Performed

* ✔ Functional Testing
* ✔ UI Testing
* ✔ Negative Testing
* ✔ Edge Case Testing

---

🐞 Known Issues (From Testing)

* ❗ CORS preflight failures in some environments
* ❗ Login failures under certain API timeout scenarios
* ❗ Chat delay under heavy load

---
🧠 Challenges & Learnings

🔴 Challenges

* Handling **CORS errors across environments**
* Implementing **secure admin authentication**
* Managing **real-time chat scalability**
* Handling async errors across frontend & backend

🟢 Solutions

* Built custom `corsMiddleware`
* Used centralized error handling utilities
* Implemented request queue & logging system
* Used socket optimization techniques

---

🔮 Future Improvements

* 🚀 AI-based labor recommendations
* 📱 Mobile app (React Native)
* 📊 Analytics dashboard for employers
* 🔐 OAuth / Social login
* ⚡ Performance optimization for chat system
* 🌍 Multi-language support

---

🤝 Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a Pull Request

---

👨‍💻 Author

**GitHub:** https://github.com/Mantechie?tab=repositories    
**LinkedIn:** https://www.linkedin.com/in/manan-sharma-24ab20229/  

---

⭐ Final Note

This project demonstrates:

* Full-stack development (React + Node + MongoDB)
* Real-world problem solving
* Strong QA & testing practices
* Production-level architecture

---

