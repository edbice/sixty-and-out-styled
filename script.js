// ===== Sixty & Out — v02 (simplified, no file uploads) =====
const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = "/api/submit";

// Typing/intro controls
const TYPING_DELAY = 14;          
const LONG_LINE_THRESHOLD = 360;  
let SKIP_INTRO = false;

// ---------- Intro Lines ----------
const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  `As many of you know, every year on Nov 11 we head out to a beach at Point Reyes, usually Drakes Beach.`,
  `There we dig a hole in the sand, build a huge fire, put volcanic rocks into the fire, and improvise a sweat lodge.`,
  `Then comes the binary dance from lodge to ocean, fire to water, old to new.`,
  `It happens to be my birthday, but that's just a convenient annual alarm clock telling us to go do this thing at the beach.`,
  `This year, however, we have a once-in-a-lifetime planetary alignment.`,
  `I'm turning 60 (!) and, on the same day, retiring from the job I've held for the past 22 years.`,
  `So I'm throwing a three-day retirement party — and *you are invited* to join for as much of the fun as you like.`,
  `<a href='https://www.willow-camp.com/' target='_blank'>Willow Camp</a> at Stinson Beach is our HQ for out-of-towners (and locals if rooms open up).`,
  `It's a bohemian compound with a main house, a set of Balinese bungalows + an Airstream and sleeps up to 36.`,
  `We've rented the whole joint for the nights of the 10th and 11th, and the main house (holds 18) on the 12th.`,
  `Night of the 10th: catered sit-down dinner at Willow Camp by <a href='https://eatingwithlily.com/' target='_blank'>Lily Chait</a>.`,
  `Breakfasts every morning and grilled oysters on the beach on the 11th; co-host Pic Walker will provide an informal dinner that evening.`,
  `All food and accommodations are gratis.`,
  `RSVP below. Press Enter any time to skip the intro… (All fields are optional!)`
];

// ---------- Questions ----------
const questions = [
  { key: 'name',        question: 'What is your full name? (or how you\'d like to be addressed)' },
  { key: 'email',       question: 'Your email? (optional - for updates only)' },
  { key: 'phone',       question: 'Phone number? (optional - any format is fine)' },
  { key: 'attending',   question: 'Planning to attend? (yes/no/maybe)' },
  { key: 'guests',      question: 'Bringing guests? (number or names - whatever works)' },
  { key: 'nights',      question: 'Which nights at Willow Camp? (10th, 11th, 12th - any combo or free text)' },
  { key: 'dinner',      question: 'Join dinner on the 10th? (yes/no/maybe)' },
  { key: 'beachparty',  question: 'Join beach party on the 11th? (yes/no/maybe)' },
  { key: 'allergies',   question: 'Any allergies or dietary needs? (optional)' },
  { key: 'special',     question: 'Any special requests or accessibility needs? (optional)' },
  { key: 'memory',      question: 'Share a memory, poem, complaint, observation, idea, etc :) (optional)' }
];

// ---------- State ----------
let currentLine = 0;
let currentQuestion = 0;
const answers = {};

// ---------- Typing helpers ----------
function typeLine(line, callback) {
  if (SKIP_INTRO || line.includes('<a') || line.length > LONG_LINE_THRESHOLD) {
    terminal.innerHTML += line + '<br/>';
    if (callback) setTimeout(callback, 0);
    return;
  }

  let i = 0;
  const tick = () => {
    if (SKIP_INTRO) {
      terminal.innerHTML += line.slice(i) + '<br/>';
      if (callback) setTimeout(callback, 0);
      return;
    }
    terminal.innerHTML += line[i++];
    if (i < line.length) {
      setTimeout(tick, TYPING_DELAY);
    } else {
      terminal.innerHTML += '<br/>';
      if (callback) setTimeout(callback, 0);
    }
  };
  tick();
}

function nextIntroLine() {
  if (currentLine < introLines.length) {
    const line = introLines[currentLine++];
    typeLine(line, nextIntroLine);
  } else {
    askQuestion();
  }
}

// Allow Enter to skip intro
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
    input.type = 'text';
    input.placeholder = 'Press Enter to skip...';

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        answers[q.key] = input.value.trim();
        const displayValue = input.value.trim() || '[skipped]';
        terminal.innerHTML += `<span class="answer">${displayValue}</span><br/>`;
        input.remove();
        currentQuestion++;
        askQuestion();
      }
    });

    terminal.appendChild(input);
    input.focus();
  });
}

// ---------- Submit ----------
function fetchWithTimeout(url, options, ms = 20000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  return fetch(url, { ...options, signal: ctl.signal }).finally(() => clearTimeout(t));
}

function submitForm() {
  const formData = new FormData();
  
  Object.keys(answers).forEach(key => {
    const value = answers[key] || '';
    formData.append(key, value);
  });

  typeLine('Submitting RSVP…', () => {});
  
  fetchWithTimeout(APPS_SCRIPT_URL, { method: 'POST', body: formData }, 20000)
    .then(r => r.json())
    .then(res => {
      if (res && (res.ok || res.result === 'success')) {
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