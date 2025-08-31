const terminal = document.getElementById('terminal');
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL'; // replace with deployed 
Apps Script URL

const introLines = [
  'BOOTING: sixty_and_out.exe',
  'LOADING: memories.sys  ▓▓▓▓▓▓▓▓▓▓  OK',
  'Hi Friends,',
  "Every year on Nov 11 we head to Point Reyes, usually Drakes Beach. We 
dig holes, build a huge fire, improvise a sweat lodge, then do the binary 
dance (not naked — except one wild year).",
  "This year is special: Nov 11 I'm turning 60 (!) and retiring after 22 
years. I'm throwing a three-day retirement party — you are invited!",
  "Willow Camp at Stinson Beach is booked for out-of-town guests. Nights 
of 10th-12th. Full catered dinners and breakfasts included. All gratis.",
  "RSVP below. Press Enter to begin..."
];

const questions = [
  {key:'name', q:'Your full name?'},
  {key:'email', q:'Your email?'},
  {key:'attending', q:'Will you attend? (yes/no)'},
  {key:'plusOne', q:'Bringing any guests? (number)'},
  {key:'kids', q:'Bringing kids? (number)'},
  {key:'stayWillow', q:'Would you like to stay at Willow Camp? (yes/no)'},
  {key:'nights', q:'How many nights at Willow?'},
  {key:'dinner10', q:'Join dinner on 10th? (yes/no)'},
  {key:'party11', q:'Join beach party on 11th? (yes/no)'},
  {key:'dinner11', q:'Join casual dinner & music on 11th? (yes/no)'},
  {key:'memory', q:'Share a memory, photo link, poem, or video?'},
  {key:'specialRequests', q:'Any special requests or needs?'}
];

let answers = {};
let qIndex = 0;

function typeWriter(lines, i=0) {
  if (i < lines.length) {
    let line = lines[i];
    let j=0;
    const interval = setInterval(() => {
      if (j<line.length) { terminal.innerHTML += line[j]; j++; } 
      else { clearInterval(interval); terminal.innerHTML += '<br>'; 
typeWriter(lines, i+1); }
    }, 25);
  } else {
    askNextQuestion();
  }
}

function askNextQuestion() {
  if (qIndex >= questions.length) {
    submitAnswers();
    return;
  }
  const q = questions[qIndex];
  const input = document.createElement('input');
  input.id = q.key;
  input.autofocus = true;
  terminal.appendChild(document.createElement('br'));
  terminal.innerHTML += q.q + '<br>';
  terminal.appendChild(input);
  input.addEventListener('keypress', function(e){
    if (e.key==='Enter'){
      answers[q.key] = input.value.trim();
      terminal.innerHTML += input.value + '<br>';
      input.remove();
      qIndex++;
      askNextQuestion();
    }
  });
}

async function submitAnswers() {
  terminal.innerHTML += 'Submitting RSVP...<br>';
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method:'POST',
      body: JSON.stringify(answers),
      headers:{'Content-Type':'application/json'}
    });
    const data = await res.json();
    if(data.result==='success') terminal.innerHTML += 'RSVP received! 
Thank you.<br>';
    showKanban();
  } catch(e) { terminal.innerHTML += 'Error submitting RSVP.<br>'; }
}

function showKanban() {
  terminal.innerHTML += '<br><h3>Memory Wall</h3>';
  const columns = ['Photos','Stories','Poems','Misc'];
  const board = document.createElement('div');
  board.className='kanban';
  columns.forEach(col=>{
    const colDiv = document.createElement('div');
    colDiv.className='column';
    colDiv.id='col-'+col;
    colDiv.innerHTML='<strong>'+col+'</strong>';
    board.appendChild(colDiv);
  });
  terminal.appendChild(board);
}
typeWriter(introLines);

