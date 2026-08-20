let questions = [];

let currentCategory = "friends";
let currentMode = "truth";
let currentAgeGroup = "all";

let usedQuestionIds = [];

let currentQuestion = null;

let favorites = JSON.parse(
    localStorage.getItem("darenestFavorites")
) || [];

const result = document.getElementById("result");
const challengeType = document.getElementById("challengeType");
const truthBtn = document.getElementById("truthBtn");
const dareBtn = document.getElementById("dareBtn");
const nextBtn = document.getElementById("nextBtn");
const shareBtn = document.getElementById("shareBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesList = document.getElementById("favoritesList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");
const ageOptions = document.querySelectorAll(".age-option");
const categories = document.querySelectorAll(".category");


/* =========================
   LOAD QUESTIONS
========================= */

fetch("data/questions_v2.json")
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
        (currentCategory === "all" ||
        question.category === currentCategory) &&
        question.type === type &&
        (currentAgeGroup === "all" ||
        question.ageGroup.includes(currentAgeGroup)) &&
        !usedQuestionIds.includes(question.id)
    );

    // If all questions have been used, start again
    if (filteredQuestions.length === 0) {

        usedQuestionIds = [];

        filteredQuestions = questions.filter(question =>
          (currentCategory === "all" ||
           question.category === currentCategory) &&
           question.type === type &&
           (currentAgeGroup === "all" ||
           question.ageGroup.includes(currentAgeGroup))
           );
    }

    if (filteredQuestions.length === 0) {

        result.innerHTML =
            "No questions available for this category and age group yet.";

        return;
    }

    const randomIndex =
        Math.floor(Math.random() * filteredQuestions.length);

    const selectedQuestion =
        filteredQuestions[randomIndex];

    usedQuestionIds.push(selectedQuestion.id);

    currentQuestion = selectedQuestion;

    result.innerHTML =
        selectedQuestion.question;

    updateFavoriteButton();

    document.getElementById("result").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
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
   share button
========================= */
shareBtn.onclick = function () {

    const question = result.innerText;

    if (!question || question === "Click Truth or Dare to begin your game.") {
        alert("Please choose a Truth or Dare question first.");
        return;
    }

    if (navigator.share) {

        navigator.share({
    title: "DareNest - Truth or Dare",
    text:
        "🎯 DareNest – Truth or Dare\n\n" +
        question +
        "\n\nPlay more: darenest.com"
        });

    } else {

        navigator.clipboard.writeText(question);

        alert("Question copied! You can now paste it anywhere.");

    }

}; 
/* existing function ends here */

function updateFavoriteButton() {

    if (!currentQuestion) {
        favoriteBtn.innerHTML = "❤️ Add to Favorites";
        return;
    }

    const isFavorite = favorites.some(
        question => question.id === currentQuestion.id
    );

    if (isFavorite) {
        favoriteBtn.innerHTML = "💔 Remove from Favorites";
    } else {
        favoriteBtn.innerHTML = "❤️ Add to Favorites";
    }
}
function displayFavorites() {

    if (favorites.length === 0) {

        favoritesList.innerHTML =
            "No favorite questions yet.";

        return;
    }

    favoritesList.innerHTML = "";

    favorites.forEach((question, index) => {

        const item = document.createElement("div");

        item.className = "favorite-item";

        item.innerHTML =
            "<strong>" +
            question.type.toUpperCase() +
            "</strong>: " +
            question.question +
            " <button onclick=\"removeFavorite(" +
            index +
            ")\">❌</button>";

        favoritesList.appendChild(item);

    });
}

function searchQuestions() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === "") {
        searchResults.innerHTML = "";
        return;
    }

    const matches = questions.filter(question =>
    question.question.toLowerCase().includes(searchTerm) &&
    question.category === currentCategory &&
    question.ageGroup.includes(currentAgeGroup)
    );

    if (matches.length === 0) {

        searchResults.innerHTML =
            "<p>No questions found.</p>";

        return;
    }

    searchResults.innerHTML =
        "<h3>🔎 Search Results (" +
        matches.length +
        ")</h3>";

    matches.forEach(question => {

        const item = document.createElement("button");

        item.className = "search-result";

        item.innerHTML =
            "<strong>" +
            question.type.toUpperCase() +
            "</strong>: " +
            question.question;

        item.onclick = function () {

    currentQuestion = question;
    currentMode = question.type;

    challengeType.innerHTML =
        question.type === "truth"
            ? "🎯 TRUTH"
            : "🔥 DARE";

    result.innerHTML = question.question;

    updateFavoriteButton();

    setTimeout(() => {
        result.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 200);

};

        searchResults.appendChild(item);

    });
}

searchBtn.onclick = searchQuestions;
searchInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        searchQuestions();
    }

});
function removeFavorite(index) {

    favorites.splice(index, 1);

    localStorage.setItem(
        "darenestFavorites",
        JSON.stringify(favorites)
    );

    displayFavorites();
    updateFavoriteButton();
}

favoriteBtn.onclick = function () {

    if (!currentQuestion) {
        alert("Please choose a Truth or Dare question first.");
        return;
    }

    const existingIndex = favorites.findIndex(
        question => question.id === currentQuestion.id
    );

    if (existingIndex === -1) {

        favorites.push(currentQuestion);

    } else {

        favorites.splice(existingIndex, 1);

    }

    localStorage.setItem(
        "darenestFavorites",
        JSON.stringify(favorites)
    );

    updateFavoriteButton();
    displayFavorites();
};
/* new function ends here */

/* =========================
   CATEGORIES
========================= */

categories.forEach(button => {

    button.onclick = function () {

        categories.forEach(category => {
            category.classList.remove("active");
        });

        this.classList.add("active");

        currentCategory = this.dataset.category;

        usedQuestionIds = [];
        currentQuestion = null;

        challengeType.innerHTML = "WELCOME";

        result.innerHTML =
            "Category changed to <b>" +
            currentCategory.charAt(0).toUpperCase() +
            currentCategory.slice(1) +
            "</b>. Click Truth or Dare.";

        updateFavoriteButton();
    };

});
ageOptions.forEach(button => {

    button.onclick = function () {

        ageOptions.forEach(option => {
            option.classList.remove("active");
        });

        this.classList.add("active");

        currentAgeGroup = this.dataset.age;

        usedQuestionIds = [];
        currentQuestion = null;

        challengeType.innerHTML = "WELCOME";

        result.innerHTML =
            "Age group changed to <b>" +
            this.innerText +
            "</b>. Click Truth or Dare.";

        updateFavoriteButton();
    };

});

displayFavorites();