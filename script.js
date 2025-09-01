const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec"; 
// replace with your deployed Google Apps Script URL

// ------------------ Intro Lines ------------------ //
const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  `Every year on Nov 11 we head to Point Reyes, usually Drakes Beach.
We dig a hole in the sand, build a huge fire, improvise a sweat lodge,
then do the binary dance (not naked — except one wild year).`,
  `This year is special: Nov 11 I'm turning 60 (!) and retiring after 22 years.
I'm throwing a three-day retirement party — you are invited!`,
  `<a href='https://www.willow-camp.com/' target='_blank'>Willow Camp</a> at Stinson Beach is booked for out-of-town guests.
Nights of 10th–12th. Full catered dinners and breakfasts included. All gratis.`,
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

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      typeLine('RSVP submitted successfully! Thank you 🎉', null);
    })
    .catch(() => {
      typeLine('Error submitting RSVP. Please try again.', null);
    });
}

// ------------------ Start ------------------ //
nextIntroLine();
