const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

// We will first write the skeleton then we will create some blackbox that later we will fill it 

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;


  const res = await fetch('https://words.dev-apis.com/word-of-the-day?random=1')
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordPart = word.split('');
  setLoading(false)
  let done = false;
  isLoading = false;

  function addLetter (letter) {

    if (currentGuess.length < ANSWER_LENGTH) {
      // Add a letter to the end
      currentGuess += letter;
    } else {
      // Replace the end letter
      currentGuess = currentGuess.substring(0, currentGuess.length-1) + letter;
    }
    
    // Adding text to the boxes
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }
  
  async function commit() {
    
    if (currentGuess.length !== ANSWER_LENGTH){
      // Don't commit or Do nothing
      return;
    } 

    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess})
    })

    const resObj = await res.json();
    const validWord = resObj.validWord;
    // const { validWord } = resObj;

    isLoading = false;
    setLoading(isLoading);

    if (!validWord) {
      markInvalidWord();
      return;
    }
    


    const guessPart = currentGuess.split("");
    const map = makeMap(wordPart);
    for (let i = 0; i < ANSWER_LENGTH; i++) {

      // Mark as correct
      if (wordPart[i] === guessPart[i]) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("correct");
        map[guessPart[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {

      if (wordPart[i] === guessPart[i]) {
        // Do nothing 
      } else if (wordPart.includes(guessPart[i]) && map[guessPart[i]] > 0) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("close");
        map[guessPart[i]]--;
      } else {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
      }
    }
    
    // TODO did they win or lose?
    currentRow++;
    if (currentGuess === word) {
      document.querySelector('.brand').classList.add('winner')
      alert("You win!!");
      done = true;
      return;
    } else if (currentRow === ROUNDS) {
      alert(`You lose ! Correct word is ${word}`)
      done = true;
      return;
    }
    currentGuess = '';
    
  }
  
  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length-1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }
  
  function markInvalidWord () {
    // alert("Not a valid word");
    
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");
      setTimeout(function () {
        letters[ANSWER_LENGTH * currentRow + i].classList.add("invalid");

      }, 10)

    }
  }

  document.addEventListener('keydown', function handleKeyPress (event) {
    if (done || isLoading) {
      // Do nothing
      return;
    }
    const action = event.key;

    console.log(action)

    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    }
     else if(isLetter(action)) {
      addLetter(action.toUpperCase())
    } else {
      // DO nothing
    }
  })
}

function isLetter(letter) {
  return /^[a-zA-z]$/.test(letter)
}

function setLoading(isLoading) {
  console.log(isLoading);
  loadingDiv.classList.toggle('show', isLoading);
}

function makeMap (array) {

  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();