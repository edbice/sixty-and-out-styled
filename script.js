const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec"; 
// replace with your deployed Google Apps Script URL

// ------------------ Intro Lines ------------------ //
const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  `As many of you know, every year on Nov 11 we head out to a beach at point reyes, usually Drakes Beach. There we dig a hole in the sand, build a huge fire, put volcanic rocks into the fire, improvise a sweat lodge and then start the binary dance from lodge to ocean (no, not naked, except that one year Max embraced his inner hippie and went ran raw and wild into the surf). It happens to be my birthday, but that is just a convenient annual alarm clock telling us to go do this thing at the beach.`,
  `This year, however, we have a once in a lifetime planetary alignment happening on Nov 11. I am turning 60 (!) and, on the same day, I am retiring from the job I've held for the past 22 years. So, I am throwing a three day long retirement party and *you are invited* to join as much of this as you would like. For out of town guests (and perhaps too some local friends if my late invitation and historically subpar friendship maintenance/communications lead to some open rooms at the inn) we have booked the <a href='https://www.willow-camp.com/' target='_blank'>Willow Camp</a> at Stinson Beach. It is a bohemian compound that has hosted Steinbeck and Oppenheimer in the day. At full capacity - which includes Balinese bungalows and an AirStream trailer - it can hold 36. We have the full joint rented for the nights of the 10th and 11th and have the main house (holds 18) on the 12th. The night of the 10th we will gather everyone - local and out of town guests - for a catered sit down dinner at Willow Camp catered by <a href='https://eatingwithlily.com/' target='_blank'>Lily Chait</a>. We will cater breakfasts and oysters on the beach on the 11th. My event co-host Pic Walker will be providing an informal catered dinner on the evening of the 11th.`,
  `Full catered dinners and breakfasts included. All gratis.`,
  "RSVP below. Press Enter to begin..."
];

// ------------------ Questions ------------------ //
const questions = [
  { key: 'name', question: 'What is your full name?' },
  { key: 'email', question: 'What is your email?' },
  { key: 'phone', question: 'What is your phone number?' },
  { key: 'attending', question: 'Will you be attending the party? (yes/no)' },
  { key: 'guests', question: 'Bringing guests? If yes, how many?' },
  { key: 'nights', question: 'Which nights are you staying at Willow Camp? (10, 11, 12)' },
  { key: 'dinner', question: 'Will you join dinner on the 10th? (yes/no)' },
  { key: 'beachparty', question: 'Will you join the beach party on the 11th? (yes/no)' },
  { key: 'allergies', question: 'Do you have any allergies or dietary restrictions?' },
  { key: 'special', question: 'Any special needs or requests?' },
  { key: 'memory', question: 'Upload a memory, photo, or poem (optional). Please drop a file or paste a link.' }
];

// ------------------ State ------------------ //
let currentLine = 0;
let currentQuestion = 0;
let answers = {};

// ------------------ Helpers ------------------ //
function typeLine(line, callback) {
  if (line.includes('<a')) {
    terminal.innerHTML += line + '<br/>';
    if (callback) callback();
    return;
  }

  let i = 0;
  const interval = setInterval(() => {
    terminal.innerHTML += line[i];
    i++;
    if (i === line.length) {
      clearInterval(interval);
      terminal.innerHTML += '<br/>';
      if (callback) callback();
    }
  }, 40);
}

function nextIntroLine() {
  if (currentLine < introLines.length) {
    typeLine(introLines[currentLine], nextIntroLine);
    currentLine++;
  } else {
    askQuestion();
  }
}

function askQuestion() {
  if (currentQuestion < questions.length) {
    typeLine(questions[currentQuestion].question, () => {
      const input = document.createElement('input');
      input.className = 'terminal-input';
      input.setAttribute('data-key', questions[currentQuestion].key);

      if (questions[currentQuestion].key === 'memory') {
        input.type = 'file';
      }

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && input.type !== 'file') {
          answers[input.dataset.key] = input.value;
          terminal.innerHTML += `<span class="answer">${input.value}</span><br/>`;
          input.remove();
          currentQuestion++;
          askQuestion();
        }
      });

      if (input.type === 'file') {
        input.addEventListener('change', function () {
          answers[input.dataset.key] = input.files[0];
          terminal.innerHTML += `<span class="answer">[File Selected: ${input.files[0].name}]</span><br/>`;
          input.remove();
          currentQuestion++;
          askQuestion();
        });
      }

      terminal.appendChild(input);
      input.focus();
    });
  } else {
    submitForm();
  }
}

// ------------------ Submit to Google Sheets ------------------ //
function submitForm() {
  const formData = new FormData();
  Object.keys(answers).forEach(key => {
    formData.append(key, answers[key]);
  });

 fetch(APPS_SCRIPT_URL, { method: 'POST', body: formData })
  .then(r => r.json())
  .then(res => {
    if (res.ok) {
      typeLine('✓ RSVP submitted — thank you!', null);
    } else {
      typeLine('Error from server: ' + (res.error || 'unknown'), null);
    }
  })
  .catch(err => {
    typeLine('Network error: ' + err.message, null);
  });


// ------------------ Start ------------------ //
nextIntroLine();
