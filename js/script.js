let questions = [];

let currentCategory = "friends";
let currentMode = "truth";

let usedQuestionIds = [];

const result = document.getElementById("result");
const challengeType = document.getElementById("challengeType");
const truthBtn = document.getElementById("truthBtn");
const dareBtn = document.getElementById("dareBtn");
const nextBtn = document.getElementById("nextBtn");
const categories = document.querySelectorAll(".category");


/* =========================
   LOAD QUESTIONS
========================= */

fetch("data/questions.json")
    .then(response => {

        if (!response.ok) {
            throw new Error("Could not load questions.json");
        }

        return response.json();

    })
    .then(data => {

    questions = data;

    result.innerHTML = "Click Truth or Dare to begin your game.";

})
    .catch(error => {

    console.error(error);

    result.innerHTML = "Sorry, questions could not be loaded.";

});


/* =========================
   GET RANDOM QUESTION
========================= */

function getRandomQuestion(type) {

    let filteredQuestions = questions.filter(question =>
        question.category === currentCategory &&
        question.type === type &&
        !usedQuestionIds.includes(question.id)
    );

    // If all questions have been used, start again
    if (filteredQuestions.length === 0) {

        usedQuestionIds = [];

        filteredQuestions = questions.filter(question =>
            question.category === currentCategory &&
            question.type === type
        );
    }

    if (filteredQuestions.length === 0) {

        result.innerHTML =
            "No questions available for this category yet.";

        return;
    }

    const randomIndex =
        Math.floor(Math.random() * filteredQuestions.length);

    const selectedQuestion =
        filteredQuestions[randomIndex];

    usedQuestionIds.push(selectedQuestion.id);

    result.innerHTML =
        selectedQuestion.question;
}


/* =========================
   TRUTH
========================= */

function randomTruth() {

    currentMode = "truth";

    challengeType.innerHTML = "🎯 TRUTH";

    getRandomQuestion("truth");

}


/* =========================
   DARE
========================= */

function randomDare() {

    currentMode = "dare";

    challengeType.innerHTML = "🔥 DARE";

    getRandomQuestion("dare");

}


/* =========================
   BUTTONS
========================= */

truthBtn.onclick = randomTruth;

dareBtn.onclick = randomDare;

nextBtn.onclick = function () {

    if (currentMode === "truth") {

        randomTruth();

    } else {

        randomDare();

    }

};


/* =========================
   CATEGORIES
========================= */

categories.forEach(button => {

    button.onclick = function () {

        categories.forEach(category => {

            category.classList.remove("active");

        });

        this.classList.add("active");

        currentCategory =
            this.dataset.category;

        challengeType.innerHTML =
            "WELCOME";

        result.innerHTML =
            "Category changed to <b>" +
            currentCategory.charAt(0).toUpperCase() +
            currentCategory.slice(1) +
            "</b>. Click Truth or Dare.";

    };

});