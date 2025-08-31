const terminal = document.getElementById('terminal');
const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRWYuvLxAjbqhihk72MXaoUITNNts9bx9QkKvgn-WEonMTLcPY4tysbM0pGw3kAlfT/exec"; // replace with deployed Apps Script URL


// Typing effect settings
const TYPING_DELAY = 35; // smaller = faster typing
const LINE_DELAY = 500;  // delay between lines

const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  "Every year on Nov 11 we head to Point Reyes, usually Drakes Beach. We dig holes, build a huge fire, improvise a sweat lodge, then do the binary dance (not naked — except one wild year).",
  "This year is special: Nov 11 I'm turning 60 (!) and retiring after 22 years. I'm throwing a three-day retirement party — you are invited!",
  'Willow Camp (<a href="https://www.willow-camp.com/" target="_blank" style="color:#00FF00; text-decoration:none;">link</a>) at Stinson Beach is booked for out-of-town guests. Nights of 10th-12th. Full catered dinners and breakfasts included. All gratis.',
  "RSVP below. Press Enter to begin..."
];

const questions = [
  { key: 'Name', question: 'What is your name?' },
  { key: 'Email', question: 'What is your email?' },
  { key: 'Phone', question: 'What is your phone number?' },
  { key: 'Attending Party', question: 'Will you attend the party? (yes/no)' },
  { key: 'Bringing Guests', question: 'Are you bringing guests? If so, how many?' },
  { key: 'Nights at Willow Camp', question: 'Which nights will you stay at Willow Camp? (10th/11th/12th)' },
  { key: 'Dinner on 10th', question: 'Will you join dinner on the 10th? (yes/no)' },
  { key: 'Beach Party 11th', question: 'Will you join the beach party on the 11th? (yes/no)' },
  { key: 'Memory/Photo/Poem', question: 'Share a memory, photo link, or poem:' },
  { key: 'Allergies or Dietary Restrictions', question: 'Any allergies or dietary restrictions?' },
  { key: 'Special Needs/Requests', question: 'Any special needs or requests?' }
];

let currentLine = 0;
let currentChar = 0;
let userResponses = {};
let currentQuestion = 0;
let isAsking = false;

function typeLine(line, callback) {
  if (currentChar < line.length) {
    terminal.innerHTML += line.charAt(currentChar);
    currentChar++;
    setTimeout(() => typeLine(line, callback), TYPING_DELAY);
  } else {
    terminal.innerHTML += '<br/>';
    currentChar = 0;
    setTimeout(callback, LINE_DELAY);
  }
}

function showIntro() {
  if (currentLine < introLines.length) {
    typeLine(introLines[currentLine], showIntro);
    currentLine++;
  } else {
    document.addEventListener('keydown', startQuestions, { once: true });
  }
}

function startQuestions(e) {
  if (e.key === 'Enter') {
    askQuestion();
  }
}

function askQuestion() {
  isAsking = true;
  terminal.innerHTML += `<span class="question">${questions[currentQuestion].question}</span><br/>`;
}

document.addEventListener('keydown', function (e) {
  if (!isAsking) return;

  const inputField = document.getElementById('input-line');
  if (!inputField) {
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.id = 'input-line';
    newInput.className = 'input-line';
    terminal.appendChild(newInput);
    newInput.focus();
  } else {
    if (e.key === 'Enter') {
      const value = inputField.value;
      userResponses[questions[currentQuestion].key] = value;
      terminal.removeChild(inputField);
      terminal.innerHTML += `<span class="answer">${value}</span><br/>`;
      currentQuestion++;

      if (currentQuestion < questions.length) {
        askQuestion();
      } else {
        isAsking = false;
        submitResponses();
      }
    }
  }
});

function submitResponses() {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(userResponses),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(() => {
      terminal.innerHTML += '<br/><span class="success">RSVP submitted successfully. Thank you!</span>';
    })
    .catch(() => {
      terminal.innerHTML += '<br/><span class="error">Error submitting RSVP. Please try again later.</span>';
    });
}

// Start intro on load
showIntro();
