# Pahlavan Plan - AI Workout Planner

<p align="center">
  <img src="https://github.com/YaserZarifi/PahlawanPlan/blob/master/frontend/src/assets/logo.png" alt="Pahlavan Plan Logo" width="200"/>
</p>

<h3 align="center">Forge Your Strength, Build Your Legacy.</h3>

<p align="center">
  <strong><a href="https://pahlawan-ai.netlify.app/">View Live Demo</a></strong>
</p>

---

## 📋 Overview

**Pahlavan Plan** is a sophisticated, AI-powered web application designed to generate highly personalized 4-week workout plans. Leveraging the power of Large Language Models via the Groq API, it crafts detailed fitness routines based on user-specific goals, fitness levels, available equipment, and biometric data. The app provides an engaging, animated user interface complete with video tutorials for each exercise, fetched dynamically from the YouTube API.

This project showcases a full-stack architecture, with a **React** frontend and a **Django REST Framework** backend, deployed on modern, free-tier cloud infrastructure.

## ✨ Key Features

* **AI-Powered Plan Generation:** Utilizes the Groq API to create unique and detailed 4-week workout programs.
* **Advanced Personalization:** Users can input basic goals or use the "Advanced Options" to provide their weight, height, age, and gender for a more tailored plan.
* **Dynamic Video Tutorials:** The app fetches and embeds YouTube video tutorials for each exercise, providing clear visual guidance on proper form.
* **AI Reasoning Animation:** To enhance the user experience, the AI's "thinking process" is displayed via a typing animation before the final plan is revealed.
* **Dual Theming:** A beautiful and seamless light/dark mode toggle with smoothly animated background transitions.
* **SMOOTH UI/UX:** The entire interface is built with modern animations, including a "pop-in" modal for exercise details, on-scroll fade-in for workout cards, and smooth transitions for weekly pagination.
* **Modern Deployment:** The frontend is deployed on **Netlify** and the backend on **Render**, demonstrating a professional CI/CD workflow.

## 🛠️ Tech Stack

This project is a full-stack application built with a modern technology stack.

**Frontend:**
* **Framework:** React (with Vite)
* **Styling:** Tailwind CSS
* **Animations:** CSS Transitions & Keyframes, Web Workers for background tasks.

**Backend:**
* **Framework:** Django & Django REST Framework
* **Server:** Gunicorn (for production)
* **Database:** SQLite (default for development)

**APIs & Services:**
* **AI:** Groq API (for workout generation)
* **Video:** YouTube Data API v3 (for exercise tutorials)
* **Hosting:**
    * **Frontend:** Netlify
    * **Backend:** Render

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Python (3.9 or newer)
* Node.js and npm
* Git

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/YaserZarifi/PahlawanPlan.git
    cd PahlawanPlan
    ```

2.  **Setup the Backend (in a new terminal):**
    ```sh
    # Navigate to the backend directory
    cd backend

    # Create and activate a virtual environment
    python -m venv venv
    .\venv\Scripts\activate  # On Windows
    # source venv/bin/activate  # On macOS/Linux

    # Install Python dependencies
    pip install -r requirements.txt

    # Create a .env file for your secret keys
    # Open the .env file and add your keys
    ```
    Your `backend/.env` file should look like this:
    ```
    GROQ_API_KEY=your_groq_api_key_here
    YOUTUBE_API_KEY=your_youtube_api_key_here
    ```

3.  **Setup the Frontend (in a second terminal):**
    ```sh
    # Navigate to the frontend directory
    cd frontend

    # Install JavaScript dependencies
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    * In your backend terminal (with the venv activated), run:
        ```sh
        python manage.py runserver
        ```
    * The backend will be running at `http://127.0.0.1:8000`

2.  **Start the Frontend Server:**
    * In your frontend terminal, run:
        ```sh
        npm run dev
        ```
    * Your browser should automatically open to `http://localhost:5173`.

## 🚢 Deployment

This application is deployed using a separate frontend/backend architecture.

* **Frontend (Netlify):** The React application is built into a static `dist` folder (`npm run build`) and deployed on Netlify.
    * **Base directory:** `frontend`
    * **Build command:** `npm run build`
    * **Publish directory:** `frontend/dist`

* **Backend (Render):** The Django application is deployed as a Web Service on Render.
    * **Root Directory:** `backend`
    * **Build Command:** `pip install -r requirements.txt`
    * **Start Command:** `gunicorn backend.wsgi`
    * **Environment Variables** must be set on the Render dashboard for `GROQ_API_KEY`, `YOUTUBE_API_KEY`, `DJANGO_ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/YaserZarifi/PahlawanPlan/issues).

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## ✍️ Author

* **Yaser Zarifi** - *Initial work & Development* - [LinkedIn](https://www.linkedin.com/in/mohammad-yaser-zarifi/)
