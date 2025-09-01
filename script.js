// ===== Sixty & Out — v02 =====
const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec";

// Typing/intro controls
const TYPING_DELAY = 14;          // smaller = faster typing
const LONG_LINE_THRESHOLD = 360;  // very long lines render instantly
let SKIP_INTRO = false;

// ---------- Intro Lines (chunked) ----------
const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  `As many of you know, every year on Nov 11 we head out to a beach at Point Reyes, usually Drakes Beach.`,
  `There we dig a hole in the sand, build a huge fire, put volcanic rocks into the fire, and improvise a sweat lodge.`,
  `Then comes the binary dance from lodge to ocean (no, not naked — except that one year Max embraced his inner hippie and ran raw and wild into the surf).`,
  `It happens to be my birthday, but that’s just a convenient annual alarm clock telling us to go do this thing at the beach.`,
  `This year, however, we have a once-in-a-lifetime planetary alignment on Nov 11.`,
  `I’m turning 60 (!) and, on the same day, retiring from the job I’ve held for the past 22 years.`,
  `So I’m throwing a three-day retirement party — and *you are invited* to join as much as you like.`,
  `<a href='https://www.willow-camp.com/' target='_blank'>Willow Camp</a> at Stinson Beach is our HQ for out-of-towners (and locals if rooms open up).`,
  `It’s a bohemian compound that hosted Steinbeck and Oppenheimer back in the day; bungalows + an Airstream — sleeps up to 36.`,
  `We’ve rented the whole joint for the nights of the 10th and 11th, and the main house (holds 18) on the 12th.`,
  `Night of the 10th: catered sit-down dinner at Willow Camp by <a href='https://eatingwithlily.com/' target='_blank'>Lily Chait</a>.`,
  `Breakfasts and oysters on the beach on the 11th; co-host Pic Walker will provide an informal dinner that evening.`,
  `All food and accommodations are gratis.`,
  `RSVP below. Press Enter any time to skip the intro…`
];

// ---------- Questions (keys match Apps Script) ----------
const questions = [
  { key: 'name',        question: 'What is your full name?' },
  { key: 'email',       question: 'What is your email?' },
  { key: 'phone',       question: 'What is your phone number?' },
  { key: 'attending',   question: 'Will you be attending the party? (yes/no)' },
  { key: 'guests',      question: 'Bringing guests? If yes, how many?' },
  { key: 'nights',      question: 'Which nights are you staying at Willow Camp? (10, 11, 12)' },
  { key: 'dinner',      question: 'Will you join dinner on the 10th? (yes/no)' },
  { key: 'beachparty',  question: 'Will you join the beach party on the 11th? (yes/no)' },
  { key: 'allergies',   question: 'Any allergies or dietary restrictions?' },
  { key: 'special',     question: 'Any special needs or requests?' },
  { key: 'memory',      question: 'Upload a memory, photo, or poem (optional). Choose a file or press Enter to skip.' }
];

// ---------- State ----------
let currentLine = 0;
let currentQuestion = 0;
const answers = {};

// ---------- Typing helpers ----------
function typeLine(line, callback) {
  // Render HTML lines or very long lines instantly; respect skip flag
  if (SKIP_INTRO || line.includes('<a') || line.length > LONG_LINE_THRESHOLD) {
    terminal.innerHTML += line + '<br/>';
    if (callback) callback();
    return;
  }

  let i = 0;
  const tick = () => {
    if (SKIP_INTRO) {
      terminal.innerHTML += line.slice(i) + '<br/>';
      if (callback) callback();
      return;
    }
    terminal.innerHTML += line[i++];
    if (i < line.length) {
      setTimeout(tick, TYPING_DELAY);
    } else {
      terminal.innerHTML += '<br/>';
      if (callback) callback();
    }
  };
  tick();
}

function nextIntroLine() {
  if (currentLine < introLines.length) {
    typeLine(introLines[currentLine], nextIntroLine);
    currentLine++;
  } else {
    askQuestion();
  }
}

// Allow Enter to skip intro any time before questions
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && currentLine < introLines.length) {
    SKIP_INTRO = true;
  }
});

// ---------- Questions flow ----------
function askQuestion() {
  if (currentQuestion >= questions.length) {
    submitForm();
    return;
  }

  const q = questions[currentQuestion];
  typeLine(q.question, () => {
    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.setAttribute('data-key', q.key);

    if (q.key === 'memory') {
      input.type = 'file';
    } else {
      input.type = 'text';
    }

    // Handle text answers
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.type !== 'file') {
        answers[q.key] = input.value.trim();
        terminal.innerHTML += `<span class="answer">${input.value}</span><br/>`;
        input.remove();
        currentQuestion++;
        askQuestion();
      }
    });

    // Handle file answer
    if (input.type === 'file') {
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          answers[q.key] = input.files[0]; // real File -> goes as FormData
          terminal.innerHTML += `<span class="answer">[File selected: ${input.files[0].name}]</span><br/>`;
        } else {
          answers[q.key] = ''; // skipped
          terminal.innerHTML += `<span class="answer">[No file selected]</span><br/>`;
        }
        input.remove();
        currentQuestion++;
        askQuestion();
      });
      // Let users press Enter to skip file without choosing
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          answers[q.key] = '';
          terminal.innerHTML += `<span class="answer">[Skipped upload]</span><br/>`;
          input.remove();
          currentQuestion++;
          askQuestion();
        }
      });
    }

    terminal.appendChild(input);
    input.focus();
  });
}

// ---------- Submit with timeout + status ----------
function fetchWithTimeout(url, options, ms = 20000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { ...options, signal: ctl.signal })
    .finally(() => clearTimeout(t));
}

function submitForm() {
  const formData = new FormData();
  Object.keys(answers).forEach(key => {
    // Avoid undefined; FormData handles File vs string automatically
    formData.append(key, answers[key] ?? '');
  });

  typeLine('Submitting RSVP…', () => {});
  fetchWithTimeout(APPS_SCRIPT_URL, { method: 'POST', body: formData }, 20000)
    .then(r => r.json())
    .then(res => {
      if (res && res.ok) {
        typeLine('✓ RSVP submitted — thank you!', null);
      } else {
        typeLine('Error from server: ' + (res && res.error ? res.error : 'unknown'), null);
      }
    })
    .catch(err => {
      const msg = err.name === 'AbortError' ? 'request timed out' : err.message;
      typeLine('Network error: ' + msg, null);
    });
}

// ---------- Go ----------
nextIntroLine();
