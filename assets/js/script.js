// Question object array, with question, options, and answer. 
const questions = [{
   question: 'The concept of gravity was discovered by which famous physicist?',
   options: ['Sir Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nicolaus Copernicus'],
   answer: 'Sir Isaac Newton',
},
{
   question: 'Which is the most abundant element in the universe?',
   options: ['Iron', 'Carbon', 'Hydrogen', 'Oxygen'],
   answer: 'Hydrogen',
},
{
   question: 'What is the SI unit for energy?',
   options: ['Calorie', 'Kilowatt', 'Horsepower', 'Joule'],
   answer: 'Joule',
},
{
   question: 'At what temperature are Celsius and Fahrenheit equal?',
   options: ['-100', '-40', '0', '32'],
   answer: '-40',
},
{
   question: `In Einstein\’s formula E=mc^2, what is the name of the constant represented by c?`,
   options: ['Planck\'s Constant', 'Speed of Light', 'Speed of Sound', 'Avogadro\'s Constant'],
   answer: 'Speed of Light',
}];

// **GLOBAL VARIABLES**
// maybe put timeleft into startquiz function?
var timeLeft = 90;
var score = 0;
var currentQuestion = 0;
var shuffledQuestions = [];
var highScores = [];
var names = (JSON.parse(localStorage.getItem("names")) === null) ? [] : JSON.parse(localStorage.getItem("names"));

//  **DOM ELEMENTS**
// Start button
var startButton = document.querySelector("#instructions button");

// Questions view
var questionNumber = document.querySelector("#questions h2 span");
var questionText = document.querySelector("#questions .questiontext");
var answerButtons = document.querySelectorAll("#questions button");
var timeEl = document.querySelector("#timer");
var scoreEl = document.querySelector("#scoreboard");

// Score input view
var scoreInput = document.querySelector("#scoreinput p");
var nameInput = document.querySelector("#scoreinput input");
var enterScoreButton = document.querySelector("#scoreinput button");

// High scores view
var viewHighScoresButton = document.querySelector("#viewhighscores");
var highScoreList = document.querySelector("#highscores ol");
var resetQuizButton = document.querySelector("#resetquiz");
var resetHighScoresButton = document.querySelector("#highscores button");


// collecting all the views into an array.  Is this worth it?  Or just add manually?
var viewIDs = [];
var views = (document.querySelectorAll("main section")).forEach(element => { viewIDs.push(element.id) });

//  **EVENT LISTENERS**
startButton.addEventListener("click", startQuiz);
answerButtons.forEach(element => { element.addEventListener("click", checkAnswer) });
enterScoreButton.addEventListener("click", enterScore);
viewHighScoresButton.addEventListener("click", viewHighScores);
resetQuizButton.addEventListener("click", resetQuiz);
resetHighScoresButton.addEventListener("click", resetHighScores);

//  **FUNCTIONS**
// Start the quiz.
function startQuiz() {
   // Shuffle the questions array and display the first question.
   shuffledQuestions = shuffle(questions);
   displayQuestion();
   changeView("questions");

   // Start the timer.
   let timerInterval = setInterval(function () {
      timeLeft -= 0.1;
      timeEl.textContent = timeLeft.toPrecision(3);

      // Stop the timer if it reaches 0 or the quiz is over (i.e. view changes).
      if (timeLeft === 0 || document.getElementById("questions").style.display == "none") {
         clearInterval(timerInterval);
      }
   }, 100);
}

// Display the current question and answer options.
function displayQuestion() {
   // Shuffle the answer options
   let shuffledArray = shuffle(shuffledQuestions[currentQuestion].options)

   // Write the current question number, question text, and answer options to the page.
   questionNumber.textContent = currentQuestion + 1;
   questionText.textContent = shuffledQuestions[currentQuestion].question;
   answerButtons.forEach((element, index) => { element.textContent = shuffledArray[index] });
}

// Check if the answer is correct, and add to the score if it is.
function checkAnswer() {
   if (shuffledQuestions[currentQuestion].answer == this.innerHTML) {
      score++;
      scoreEl.textContent = score;
   } else {
      timeLeft -= 15;
   }

   // TODO add a way to visually show if the answer was correct or not.

   // Go to the next question or end.
   currentQuestion++;
   if (currentQuestion < shuffledQuestions.length) {
      displayQuestion()
   } else {
      console.log("Quiz over");
      scoreInput.textContent = "Your score is " + score + "."
      // add in the enter score screen
      changeView("scoreinput");
   }
}

// Enter the score into the high score list.
function enterScore() {
   // make sure the name is valid; if not, return.

   let input = nameInput.value.trim();
   console.log(parseFloat(input))
   try {
      if (input != "" && input != null && isNaN(parseFloat(input))) {
            nameInput.value = input; 
      } else {
         throw "error";
      }
  
   } catch (error) {
      window.alert("Please enter a valid name.");
      return;
   }




   // Add the score to the high score list.
   if (names.length == 0) {
      names.push([nameInput.value, score]);
   }
   else {
      names.every((element) => {
         if (element[1] >= score && names.indexOf(element) == names.length - 1) {
            names.push([nameInput.value, score]);
         } else if (element[1] >= score) {
            return true;
         } else {
            names.splice(names.indexOf(element), 0, [nameInput.value, score]);
            return false;
         }
      })
   }

   // Keep the high score list to 10 items.
   if (names.length > 10) {names=names.slice(0,10)}

   // Save the high score list to local storage.
   localStorage.setItem("names", JSON.stringify(names));

   // Display the high score list.
   displayHighScores();

   // Go to the high score list view.
   changeView("highscores");
}

function displayHighScores() {
   var highScoreListChild = document.querySelectorAll("#highscores ol li");
   highScoreListChild.forEach(element => { element.remove() });

   names.forEach((item) => {
      let li = document.createElement("li");
      li.innerText = item;
      highScoreList.appendChild(li);
   })


}
// View the high scores.
function viewHighScores() {
   changeView("highscores");
}

// Reset the quiz.
function resetQuiz() {
   score = 0;
   currentQuestion = 0;
   timeLeft = 90;
   nameInput.value = "";
   changeView("instructions");
}

function resetHighScores() {
   // TODO add in the ability to clear the high scores.
   localStorage.removeItem("names");
   localStorage.clear();
   names = [];
   displayHighScores();
}

// Show the provided view and hides all the others.
function changeView(viewToShow) {
   viewIDs.forEach(element => {
      if (viewToShow == element) {
         document.getElementById(element).style.display = "block";
      } else {
         document.getElementById(element).style.display = "none";
      }
   });
}

// Fisher-Yates Shuffle via https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
   let currentIndex = array.length, randomIndex;

   // While there remain elements to shuffle.
   while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
         array[randomIndex], array[currentIndex]];
   }

   return array;
}