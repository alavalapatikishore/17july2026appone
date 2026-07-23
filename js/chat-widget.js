/* =========================================================
   PATIENT REGISTRATION CHAT WIDGET
   Bottom-right floating chat box.
   Guides the user through patient details step by step,
   then shows a "Patient Registration Details" summary card.
   ========================================================= */

(function () {

  // Fields collected, in order. type: 'text' or 'choice'
  const FIELDS = [
    { key: 'fullName',    label: 'Full Name',      type: 'text',
      prompt: "Hi 👋 I'm the Patient Registration Assistant. Let's add a new patient.\n\nWhat is the patient's full name?" },
    { key: 'dob',         label: 'Date of Birth',  type: 'text',
      prompt: "Got it. What is the patient's date of birth? (e.g. 12-04-1990)" },
    { key: 'gender',      label: 'Gender',         type: 'choice', options: ['Male', 'Female', 'Other'],
      prompt: "Please select the patient's gender:" },
    { key: 'phone',       label: 'Phone Number',   type: 'text',
      prompt: "What is the patient's phone number?" },
    { key: 'email',       label: 'Email',          type: 'text',
      prompt: "What is the patient's email address? (type \"skip\" if none)" },
    { key: 'bloodGroup',  label: 'Blood Group',    type: 'choice',
      options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      prompt: "Select the patient's blood group:" },
    { key: 'address',     label: 'Address',        type: 'text',
      prompt: "Finally, what is the patient's address? (Street, City, State, PIN)" }
  ];

  let step = -1;
  let patientData = {};

  let panel, launcher, messagesEl, quickRepliesEl, inputEl, sendBtn, closeBtn;

  function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addMessage(text, sender) {
    const msg = el('div', 'chat-msg ' + sender, escapeHtml(text));
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function showTyping(callback, delay) {
    const typing = el('div', 'chat-typing', '<span></span><span></span><span></span>');
    messagesEl.appendChild(typing);
    scrollToBottom();
    setTimeout(() => {
      typing.remove();
      callback();
    }, delay || 500);
  }

  function clearQuickReplies() {
    quickRepliesEl.innerHTML = '';
  }

  function showQuickReplies(options) {
    clearQuickReplies();
    options.forEach(opt => {
      const chip = el('button', 'chat-chip', escapeHtml(opt));
      chip.type = 'button';
      chip.addEventListener('click', () => handleAnswer(opt));
      quickRepliesEl.appendChild(chip);
    });
  }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  function askCurrentField() {
    const field = FIELDS[step];
    showTyping(() => {
      addMessage(field.prompt, 'bot');
      if (field.type === 'choice') {
        showQuickReplies(field.options);
        setInputEnabled(true);
      } else {
        clearQuickReplies();
        setInputEnabled(true);
      }
    });
  }

  function generatePatientId() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return 'PT-2026-' + rand;
  }

  function showSummary() {
    clearQuickReplies();
    setInputEnabled(false);
    showTyping(() => {
      addMessage("All set! Here are the Patient Registration details:", 'bot');

      const card = el('div', 'chat-msg summary');
      const heading = el('h4', null,
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 8h4M19 6v4"/></svg> Patient Registration Details');
      card.appendChild(heading);

      FIELDS.forEach(f => {
        const row = el('div', 'summary-row');
        const value = patientData[f.key] && patientData[f.key].trim() !== '' ? patientData[f.key] : '—';
        row.innerHTML = '<span class="k">' + escapeHtml(f.label) + '</span><span class="v">' + escapeHtml(value) + '</span>';
        card.appendChild(row);
      });

      const pid = el('div', 'summary-pid', 'Patient ID: ' + generatePatientId());
      card.appendChild(pid);

      messagesEl.appendChild(card);
      scrollToBottom();

      showTyping(() => {
        addMessage("Would you like to register another patient?", 'bot');
        showQuickReplies(['Register another patient', 'Done']);
      }, 400);

      if (typeof showToast === 'function') {
        showToast('Patient registered successfully');
      }
    }, 600);
  }

  function handleAnswer(value) {
    value = (value || '').trim();
    if (value === '') return;

    // Post-summary quick replies
    if (value === 'Register another patient') {
      addMessage(value, 'user');
      clearQuickReplies();
      startConversation(true);
      return;
    }
    if (value === 'Done') {
      addMessage(value, 'user');
      clearQuickReplies();
      showTyping(() => {
        addMessage("Great! You can reopen this chat anytime to register another patient. \ud83d\ude0a", 'bot');
        setInputEnabled(false);
      }, 400);
      return;
    }

    if (step < 0 || step >= FIELDS.length) return;

    const field = FIELDS[step];
    addMessage(value, 'user');
    patientData[field.key] = (field.key === 'email' && value.toLowerCase() === 'skip') ? '' : value;

    clearQuickReplies();
    setInputEnabled(false);
    inputEl.value = '';

    step++;
    if (step < FIELDS.length) {
      askCurrentField();
    } else {
      showSummary();
    }
  }

  function startConversation(isRestart) {
    step = 0;
    patientData = {};
    if (isRestart) {
      showTyping(() => {
        addMessage("Sure! Let's register another patient.", 'bot');
        setTimeout(() => askCurrentField(), 350);
      }, 400);
    } else {
      askCurrentField();
    }
  }

  function openPanel() {
    panel.classList.add('open');
    launcher.classList.add('hide');
    if (step === -1) {
      startConversation(false);
    } else {
      inputEl.focus();
    }
  }

  function closePanel() {
    panel.classList.remove('open');
    launcher.classList.remove('hide');
  }

  function buildWidget() {
    // Launcher button
    launcher = el('button', 'chat-launcher', '');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Open Patient Registration chat');
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';

    // Panel
    panel = el('div', 'chat-panel');
    panel.innerHTML = `
      <div class="chat-panel-header">
        <div class="chat-header-title">
          <div class="chat-bot-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 8h4M19 6v4"/></svg>
          </div>
          <div>
            <b>Patient Registration</b>
            <span>Assistant is online</span>
          </div>
        </div>
        <button type="button" class="chat-close-btn" aria-label="Close chat">&times;</button>
      </div>
      <div class="chat-panel-body" id="chatMessages"></div>
      <div class="chat-panel-quickreplies" id="chatQuickReplies"></div>
      <div class="chat-panel-footer">
        <input type="text" id="chatInput" placeholder="Type your answer..." autocomplete="off">
        <button type="button" class="chat-send-btn" id="chatSendBtn" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
    `;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    messagesEl = panel.querySelector('#chatMessages');
    quickRepliesEl = panel.querySelector('#chatQuickReplies');
    inputEl = panel.querySelector('#chatInput');
    sendBtn = panel.querySelector('#chatSendBtn');
    closeBtn = panel.querySelector('.chat-close-btn');

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);

    sendBtn.addEventListener('click', () => handleAnswer(inputEl.value));
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAnswer(inputEl.value);
      }
    });

    setInputEnabled(false);
  }

  document.addEventListener('DOMContentLoaded', buildWidget);
})();
