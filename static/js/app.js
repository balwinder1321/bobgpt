const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const themeToggle = document.getElementById('themeToggle');
const voiceBtn = document.getElementById('voiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const saveBtn = document.getElementById('saveBtn');

let sessions = [];
let activeSessionId = null;
let recognition = null;
let isListening = false;

function createId() {
  return `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function init() {
  loadTheme();
  loadSessions();
  attachEvents();
  if (!activeSessionId) {
    startNewSession();
  }
}

function attachEvents() {
  sendBtn.addEventListener('click', () => handleSend());
  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  });
  newChatBtn.addEventListener('click', startNewSession);
  themeToggle.addEventListener('change', toggleTheme);
  voiceBtn.addEventListener('click', toggleVoiceRecognition);
  copyBtn.addEventListener('click', copyCurrentSession);
  downloadBtn.addEventListener('click', downloadCurrentSession);
  saveBtn.addEventListener('click', saveCurrentSession);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('bobgpt-theme') || 'dark';
  setTheme(savedTheme);
  themeToggle.checked = savedTheme === 'light';
}

function setTheme(theme) {
  document.documentElement.classList.toggle('light-mode', theme === 'light');
  localStorage.setItem('bobgpt-theme', theme);
}

function toggleTheme() {
  const theme = themeToggle.checked ? 'light' : 'dark';
  setTheme(theme);
}

function loadSessions() {
  const stored = localStorage.getItem('bobgpt-sessions');
  sessions = stored ? JSON.parse(stored) : [];
  activeSessionId = localStorage.getItem('bobgpt-active-session');
  if (!sessions.length) {
    sessions = [];
    activeSessionId = null;
  }
  renderSidebar();
  restoreActiveSession();
}

function restoreActiveSession() {
  if (!activeSessionId && sessions.length) {
    activeSessionId = sessions[0].id;
  }
  if (activeSessionId) {
    const session = sessions.find((session) => session.id === activeSessionId);
    if (session) {
      renderSession(session);
      return;
    }
  }
  startNewSession();
}

function saveSessions() {
  localStorage.setItem('bobgpt-sessions', JSON.stringify(sessions));
  localStorage.setItem('bobgpt-active-session', activeSessionId);
  renderSidebar();
}

function startNewSession() {
  const newSession = {
    id: createId(),
    title: `New Conversation ${sessions.length + 1}`,
    messages: [],
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(newSession);
  activeSessionId = newSession.id;
  saveSessions();
  renderSession(newSession);
}

function renderSidebar() {
  chatHistory.innerHTML = '';
  sessions.forEach((session) => {
    const item = document.createElement('div');
    item.className = `chat-item ${session.id === activeSessionId ? 'active' : ''}`;
    item.innerHTML = `
      <h3>${session.title}</h3>
      <p>${session.messages.length ? session.messages[session.messages.length - 1].content.slice(0, 48) : 'Start the vibe...'}</p>
    `;
    item.addEventListener('click', () => openSession(session.id));
    chatHistory.appendChild(item);
  });
}

function openSession(sessionId) {
  activeSessionId = sessionId;
  localStorage.setItem('bobgpt-active-session', activeSessionId);
  const session = sessions.find((item) => item.id === sessionId);
  if (session) {
    renderSession(session);
  }
}

function renderSession(session) {
  chatWindow.innerHTML = '';
  session.messages.forEach((message, index) => {
    appendMessage(message.role, message.content, false, index);
  });
  messageInput.value = '';
  saveSessions();
}

function appendMessage(role, content, shouldScroll = true, index = null) {
  const messageBlock = document.createElement('div');
  messageBlock.className = `message-block ${role === 'user' ? 'user' : 'assistant'}`;

  const meta = document.createElement('div');
  meta.className = 'message-meta';
  meta.innerHTML = `<span>${role === 'user' ? 'You' : 'BobGPT'}</span><span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = marked.parse(content || '');

  messageBlock.appendChild(meta);
  messageBlock.appendChild(bubble);
  chatWindow.appendChild(messageBlock);
  if (shouldScroll) {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function updateSessionHistory(role, content) {
  const session = sessions.find((item) => item.id === activeSessionId);
  if (!session) return;
  session.messages.push({ role, content, timestamp: new Date().toISOString() });
  saveSessions();
}

function getSessionHistory() {
  const session = sessions.find((item) => item.id === activeSessionId);
  return session ? session.messages : [];
}

function handleSend() {
  const content = messageInput.value.trim();
  if (!content) return;
  appendMessage('user', content);
  updateSessionHistory('user', content);
  messageInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending...';
  showTypingBubble();

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: content, history: getSessionHistory() }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Server error');
      }
      return response.json();
    })
    .then((data) => {
      removeTypingBubble();
      if (data.answer) {
        appendMessage('assistant', data.answer);
        updateSessionHistory('assistant', data.answer);
      } else {
        appendMessage('assistant', 'BobGPT could not generate an answer. Please try again.');
        updateSessionHistory('assistant', 'BobGPT could not generate an answer. Please try again.');
      }
    })
    .catch((error) => {
      removeTypingBubble();
      appendMessage('assistant', `Error: ${error.message}`);
      updateSessionHistory('assistant', `Error: ${error.message}`);
    })
    .finally(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send';
    });
}

function showTypingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'message-block assistant typing';
  bubble.innerHTML = `
    <div class="message-meta"><span>BobGPT</span><span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div class="message-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>
  `;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingBubble() {
  const bubble = document.querySelector('.message-block.typing');
  if (bubble) bubble.remove();
}

function toggleVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = 'Voice input unavailable in this browser.';
    return;
  }

  if (isListening) {
    stopVoiceRecognition();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('active');
    voiceStatus.textContent = 'Listening... speak now.';
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    voiceStatus.textContent = 'Captured voice. Tap send.';
  };

  recognition.onerror = () => {
    voiceStatus.textContent = 'Voice recognition stopped. Try again.';
    stopVoiceRecognition();
  };

  recognition.onend = () => {
    stopVoiceRecognition();
  };

  recognition.start();
}

function stopVoiceRecognition() {
  if (recognition) {
    recognition.stop();
  }
  isListening = false;
  voiceBtn.classList.remove('active');
  voiceStatus.textContent = 'Say "Hello Bob"';
}

function copyCurrentSession() {
  const session = sessions.find((item) => item.id === activeSessionId);
  if (!session) return;
  const text = session.messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
  navigator.clipboard.writeText(text)
    .then(() => {
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = 'Copy All'; }, 1400);
    })
    .catch(() => {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => { copyBtn.textContent = 'Copy All'; }, 1400);
    });
}

function downloadCurrentSession() {
  const session = sessions.find((item) => item.id === activeSessionId);
  if (!session) return;
  const fileContent = session.messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n');
  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${session.title.replace(/\W+/g, '_').toLowerCase()}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function saveCurrentSession() {
  const session = sessions.find((item) => item.id === activeSessionId);
  if (!session) return;
  session.title = prompt('Give this chat a title', session.title) || session.title;
  saveSessions();
}

init();
