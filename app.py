import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from openai import OpenAI

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing in environment. Copy .env.example to .env and add your key.")

client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.get_json(force=True)
    user_message = data.get("message", "").strip()
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Message is required."}), 400

    system_prompt = (
        "You are BobGPT, a premium AI assistant with a futuristic personality. "
        "Provide concise, polished answers, keep a modern startup tone, and avoid repetition."
    )

    messages = [{"role": "system", "content": system_prompt}]
    for item in history:
        if item.get("role") and item.get("content"):
            messages.append({"role": item["role"], "content": item["content"]})
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=messages,
            temperature=0.8,
            max_output_tokens=900,
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

    ai_text = getattr(response, "output_text", None)
    if not ai_text:
        ai_text = ""
        output = getattr(response, "output", [])
        if output:
            first_output = output[0]
            content = getattr(first_output, "content", None)
            if isinstance(content, list):
                pieces = []
                for item in content:
                    if isinstance(item, dict):
                        pieces.append(item.get("text", ""))
                    elif hasattr(item, "text"):
                        pieces.append(getattr(item, "text", ""))
                ai_text = "\n".join(filter(None, pieces))
            elif isinstance(content, str):
                ai_text = content
            elif hasattr(first_output, "text"):
                ai_text = getattr(first_output, "text", "")
        ai_text = ai_text.strip()

    if not ai_text:
        return jsonify({"error": "OpenAI response contained no text."}), 500

    return jsonify({"answer": ai_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
