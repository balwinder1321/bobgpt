# BobGPT

BobGPT is a premium AI chatbot web app built with Flask, modern glassmorphism UI, animated gradients, dark/light mode, voice input, local chat storage, and OpenAI API integration.

## Features

- Futuristic AI chatbot layout with glass-style UI and motion effects
- Dark/light theme with responsive mobile-friendly design
- Sidebar chat history and session management
- Markdown support for bot responses
- Voice input using browser speech recognition
- Local chat save, copy, and download options
- Secure OpenAI API request handling via Flask backend and `.env`
- Deployment-ready for Render and Replit

## Getting Started

### Prerequisites

- Python 3.10+
- OpenAI API key

### Install

1. Clone or initialize the project folder.
2. Create a virtual environment and activate it:

```bash
python -m venv venv
venv\Scripts\Activate.ps1  # PowerShell
# or
venv\Scripts\activate.bat  # cmd
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and add your OpenAI key:

```bash
copy .env.example .env
```

5. Run locally:

```bash
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## Deployment

### Render

1. Push the repository to GitHub.
2. Create a new Web Service on Render.
3. Use `python app.py` or `gunicorn app:app` as the start command.
4. Add `OPENAI_API_KEY` as an environment variable.

### Replit

1. Upload the project to Replit.
2. Add `OPENAI_API_KEY` in Secrets.
3. Use the `.replit` config to run the Flask app.

## Project Structure

- `app.py` – Flask backend and OpenAI route
- `templates/index.html` – frontend UI markup
- `static/css/style.css` – polished glassmorphism styling
- `static/js/app.js` – chat logic, storage, voice, and API calls
- `.env.example` – environment variable example
- `requirements.txt` – Python dependencies

## Notes

- Local chat history is stored in `localStorage` in the browser.
- Voice input works on supported Chrome-based browsers using SpeechRecognition.

Enjoy building and customizing BobGPT! 🚀
