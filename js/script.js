let questions = [];
let wouldYouRatherQuestions = [];

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
const wyrBtn = document.getElementById("wyrBtn");
const moreGamesBtn = document.getElementById("moreGamesBtn");
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
    if (!response.ok) throw new Error("Could not load master question database");
    return response.json();
})
.then(masterData => {
    questions = Array.isArray(masterData) ? masterData : masterData.questions;
    wouldYouRatherQuestions = questions.filter(q => q.type === "would_you_rather");
    result.innerHTML = "Click a game mode to begin.";
})
.catch(error => {
    console.error(error);
    result.innerHTML = "Sorry, questions could not be loaded.";
});

function setModeButtonActive(button) {
    document.querySelectorAll(".mode-btn").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
}

function renderWouldYouRather(question) {
    result.innerHTML = `
        <div class="wyr-question">${question.question}</div>
        <div class="wyr-options">
            <button class="wyr-option" type="button">${question.optionA}</button>
            <span class="wyr-or">OR</span>
            <button class="wyr-option" type="button">${question.optionB}</button>
        </div>
    `;

    result.querySelectorAll(".wyr-option").forEach(button => {
        button.addEventListener("click", () => {
            result.querySelectorAll(".wyr-option").forEach(option => option.classList.remove("selected"));
            button.classList.add("selected");
        });
    });
}


/* =========================
   STEP 5 QUESTION ENGINE
========================= */

const DARENEST_GROUP_CATEGORY_MAP = {
    friends: [
        "friends", "best_friends", "friends_us", "friends_family"
    ],
    couples: [
        "couples", "romantic_couples", "couples_us"
    ],
    family: [
        "family", "kids_family", "siblings", "friends_family"
    ],
    office: [
        "office"
    ],
    party: [
        "party", "birthday", "holiday"
    ]
};

function getCategoryPool(group) {
    if (!group || group === "all") return null;
    return DARENEST_GROUP_CATEGORY_MAP[group] || [group];
}

function questionMatchesCategory(question, group) {
    const pool = getCategoryPool(group);
    if (!pool) return true;
    return pool.includes(question.category);
}

function questionMatchesAge(question) {
    return currentAgeGroup === "all" ||
        (Array.isArray(question.ageGroup) && question.ageGroup.includes(currentAgeGroup));
}

function getAvailableQuestionPool(type) {
    return questions.filter(question =>
        question.type === type &&
        questionMatchesCategory(question, currentCategory) &&
        questionMatchesAge(question) &&
        !usedQuestionIds.includes(question.id)
    );
}

function getFullQuestionPool(type) {
    return questions.filter(question =>
        question.type === type &&
        questionMatchesCategory(question, currentCategory) &&
        questionMatchesAge(question)
    );
}

function selectQuestion(type) {
    let pool = getAvailableQuestionPool(type);

    // Exhausted filtered pool: reset only the used-question list, then
    // rebuild the same filtered pool. This never mixes categories/ages.
    if (pool.length === 0) {
        usedQuestionIds = [];
        pool = getFullQuestionPool(type);
    }

    if (pool.length === 0) return null;

    const selected = pool[Math.floor(Math.random() * pool.length)];
    usedQuestionIds.push(selected.id);
    currentQuestion = selected;
    return selected;
}

function renderChoiceQuestion(question, label) {
    result.innerHTML = `
        <div class="wyr-question">${question.question}</div>
        <div class="wyr-options" role="group" aria-label="${label}">
            <button class="wyr-option" type="button" data-choice="A">${question.optionA}</button>
            <span class="wyr-or" aria-hidden="true">OR</span>
            <button class="wyr-option" type="button" data-choice="B">${question.optionB}</button>
        </div>
        <div class="choice-selected-message" aria-live="polite"></div>
    `;

    const message = result.querySelector(".choice-selected-message");
    result.querySelectorAll(".wyr-option").forEach(button => {
        button.addEventListener("click", () => {
            result.querySelectorAll(".wyr-option").forEach(option => {
                option.classList.remove("selected");
                option.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");

            if (message) {
                message.textContent = `You chose: "${button.textContent.trim()}"`;
            }
        });
    });
}

function showSelectedQuestion(question) {
    if (!question) {
        result.innerHTML = "No questions available for this category and age group yet.";
        updateFavoriteButton();
        return;
    }

    if (question.type === "would_you_rather" || question.type === "this_or_that") {
        const label = question.type === "would_you_rather"
            ? "Would You Rather choices"
            : "This or That choices";
        renderChoiceQuestion(question, label);
    } else {
        result.innerHTML = question.question;
    }

    updateFavoriteButton();

    result.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function getRandomQuestion(type) {
    currentMode = type;

    if (type === "truth") {
        challengeType.innerHTML = "🎯 TRUTH";
        setModeButtonActive(truthBtn);
    } else if (type === "dare") {
        challengeType.innerHTML = "🔥 DARE";
        setModeButtonActive(dareBtn);
    } else if (type === "would_you_rather") {
        challengeType.innerHTML = "🤔 WOULD YOU RATHER";
        setModeButtonActive(wyrBtn);
    } else if (type === "this_or_that") {
        challengeType.innerHTML = "⚡ THIS OR THAT";
    } else if (type === "most_likely_to") {
        challengeType.innerHTML = "👀 MOST LIKELY TO";
    } else if (type === "never_have_i_ever") {
        challengeType.innerHTML = "🙈 NEVER HAVE I EVER";
    }

    const question = selectQuestion(type);
    showSelectedQuestion(question);
}

function randomTruth() {
    getRandomQuestion("truth");
}

function randomDare() {
    getRandomQuestion("dare");
}

function randomWouldYouRather() {
    getRandomQuestion("would_you_rather");
}

function randomThisOrThat() {
    getRandomQuestion("this_or_that");
}

function randomMostLikelyTo() {
    getRandomQuestion("most_likely_to");
}

function randomNeverHaveIEver() {
    getRandomQuestion("never_have_i_ever");
}


/* =========================
   BUTTONS
========================= */

truthBtn.onclick = function () {
    currentMode = "truth";
    setModeButtonActive(truthBtn);
    randomTruth();
};

dareBtn.onclick = function () {
    currentMode = "dare";
    setModeButtonActive(dareBtn);
    randomDare();
};

wyrBtn.onclick = randomWouldYouRather;
if (moreGamesBtn) {
    moreGamesBtn.onclick = function () {
        if (typeof pushScreen === "function") {
            pushScreen("games");
        } else {
            window.location.hash = "games";
        }
    };
}

nextBtn.onclick = function () {

    if (currentMode === "truth") {
        randomTruth();
    } else if (currentMode === "dare") {
        randomDare();
    } else if (currentMode === "would_you_rather") {
        randomWouldYouRather();
    } else if (currentMode === "this_or_that") {
        randomThisOrThat();
    } else if (currentMode === "most_likely_to") {
        randomMostLikelyTo();
    } else if (currentMode === "never_have_i_ever") {
        randomNeverHaveIEver();
    }

    updateGameStatus("New challenge");
};

/* =========================
   share button
========================= */
shareBtn.onclick = async function () {

    if (!currentQuestion) {
        alert("Please choose a question first.");
        return;
    }

    const text = (currentQuestion.type === "would_you_rather" || currentQuestion.type === "this_or_that")
        ? currentQuestion.question + "\n\n" + currentQuestion.optionA + "\nOR\n" + currentQuestion.optionB
        : currentQuestion.question;

    const shareText = "🎲 DareNest\n\n" + text + "\n\nPlay more: darenest.com";
    const shareUrl = window.location.href;

    // Prefer the device's native share sheet on supported phones/browsers.
    if (navigator.share) {
        try {
            await navigator.share({
                title: "DareNest",
                text: shareText,
                url: shareUrl
            });
            updateGameStatus("Shared");
            return;
        } catch (error) {
            // Closing/cancelling the native share sheet is not an error.
            if (error && error.name === "AbortError") return;
        }
    }

    // Fallback for browsers that do not support native sharing.
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(shareText + "\n\n" + shareUrl);
            updateGameStatus("✓ Copied to clipboard");
            return;
        } catch (error) {}
    }

    const area = document.createElement("textarea");
    area.value = shareText + "\n\n" + shareUrl;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
        document.execCommand("copy");
        updateGameStatus("✓ Copied to clipboard");
    } finally {
        area.remove();
    }
}; 
/* existing function ends here */

function updateGameStatus(message) {
    const status = document.getElementById("dnGameStatus");
    if (!status) return;
    status.textContent = message;
    clearTimeout(window.dnStatusTimer);
    window.dnStatusTimer = setTimeout(() => {
        status.textContent = currentQuestion ? "Ready for the next challenge" : "Ready to play";
    }, 1800);
}

function updateFavoriteButton() {

    if (!currentQuestion) {
        favoriteBtn.innerHTML = "💾 Save Question";
        return;
    }

    const isFavorite = favorites.some(
        question => question.id === currentQuestion.id
    );

    if (isFavorite) {
        favoriteBtn.innerHTML = "💔 Remove Saved Question";
    } else {
        favoriteBtn.innerHTML = "💾 Save Question";
    }
}
function displayFavorites() {
    if (!favorites.length) {
        favoritesList.innerHTML = "No favorite questions yet.";
        return;
    }

    favoritesList.innerHTML = "";

    const labels = {
        truth: "🎯 TRUTH",
        dare: "🔥 DARE",
        would_you_rather: "🤔 WOULD YOU RATHER",
        this_or_that: "⚡ THIS OR THAT",
        most_likely_to: "👀 MOST LIKELY TO",
        never_have_i_ever: "🙈 NEVER HAVE I EVER"
    };

    favorites.forEach((question, index) => {
        const item = document.createElement("article");
        item.className = "favorite-item";

        const type = document.createElement("div");
        type.className = "favorite-type";
        type.textContent = labels[question.type] || String(question.type || "").toUpperCase();

        const text = document.createElement("div");
        text.className = "favorite-question";
        text.textContent = question.question || "";

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "favorite-remove";
        remove.textContent = "✕";
        remove.setAttribute("aria-label", "Remove favorite");
        remove.addEventListener("click", () => removeFavorite(index));

        item.appendChild(type);
        item.appendChild(text);
        item.appendChild(remove);
        favoritesList.appendChild(item);
    });
}

function searchQuestions() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    if (searchTerm === "") {
        searchResults.innerHTML = "";
        return;
    }

    if (currentMode === "would_you_rather") {
        const matches = wouldYouRatherQuestions.filter(question =>
            question.question.toLowerCase().includes(searchTerm) &&
            (currentAgeGroup === "all" || question.age_group === "all_ages" || question.age_group === currentAgeGroup)
        );

        if (matches.length === 0) {
            searchResults.innerHTML = "<p>No questions found.</p>";
            return;
        }

        searchResults.innerHTML = "<h3>🔎 Would You Rather Results (" + matches.length + ")</h3>";
        matches.forEach(question => {
            const item = document.createElement("button");
            item.className = "search-result";
            item.innerHTML = "<strong>WOULD YOU RATHER</strong>: " + question.question;
            item.onclick = function () {
                currentQuestion = {
                    id: `wyr-${question.id}`, type: "would_you_rather", category: "would_you_rather",
                    ageGroup: [question.age_group], question: question.question,
                    option_a: question.option_a, option_b: question.option_b
                };
                challengeType.innerHTML = "🤔 WOULD YOU RATHER";
                renderWouldYouRather(question);
                updateFavoriteButton();
            };
            searchResults.appendChild(item);
        });
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
            : question.type === "dare"
                ? "🔥 DARE"
                : "🤔 WOULD YOU RATHER";

    if (question.type === "would_you_rather") {
        renderWouldYouRather(question);
    } else {
        result.innerHTML = question.question;
    }

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
        alert("Please choose a question first.");
        return;
    }

    const existingIndex = favorites.findIndex(
        question => question.id === currentQuestion.id
    );

    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        updateGameStatus("Removed from Favorites");
    } else {
        favorites.push(currentQuestion);
        updateGameStatus("❤️ Added to Favorites");
    }

    localStorage.setItem("darenestFavorites", JSON.stringify(favorites));
    updateFavoriteButton();
    displayFavorites();
    if (window.darenestRenderFavorites) window.darenestRenderFavorites();

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
            "</b>. Choose a game mode.";

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
            "</b>. Choose a game mode.";

        updateFavoriteButton();
    };

});

displayFavorites();
/* ===== DareNest Step 2 corrected flow ===== */
function randomThisOrThat(){
    currentMode = "this_or_that";
    const filtered = questions.filter(q =>
        q.type === "this_or_that" &&
        (currentCategory === "all" || q.category === currentCategory || q.category === "this_or_that") &&
        (currentAgeGroup === "all" || q.ageGroup.includes(currentAgeGroup)) &&
        !usedQuestionIds.includes(q.id)
    );
    let pool = filtered;
    if(pool.length===0){
        usedQuestionIds=[];
        pool=questions.filter(q =>
            q.type === "this_or_that" &&
            (currentAgeGroup === "all" || q.ageGroup.includes(currentAgeGroup))
        );
    }
    if(pool.length===0){
        challengeType.innerHTML="⚡ THIS OR THAT";
        result.innerHTML="No This or That questions available for this age group yet.";
        return;
    }
    const q=pool[Math.floor(Math.random()*pool.length)];
    usedQuestionIds.push(q.id);
    currentQuestion=q;
    challengeType.innerHTML="⚡ THIS OR THAT";
    if(q.optionA && q.optionB){
        result.innerHTML = `
          <div class="wyr-question">${q.question}</div>
          <div class="wyr-options">
            <button class="wyr-option" type="button">${q.optionA}</button>
            <span class="wyr-or">OR</span>
            <button class="wyr-option" type="button">${q.optionB}</button>
          </div>
          <div class="choice-selected-message" aria-live="polite"></div>`;
        result.querySelectorAll(".wyr-option").forEach(button=>{
            button.addEventListener("click",()=>{
                result.querySelectorAll(".wyr-option").forEach(o=>o.classList.remove("selected"));
                button.classList.add("selected");
                const choiceMessage = result.querySelector(".choice-selected-message");
                if (choiceMessage) choiceMessage.textContent = `You chose: "${button.textContent.trim()}"`;
            });
        });
    } else {
        result.innerHTML=q.question;
    }
    updateFavoriteButton();
    result.scrollIntoView({behavior:"smooth",block:"center"});
}

(function(){
  const flow=document.getElementById("dnFlow");
  if(!flow)return;
  const screens={
    welcome:document.getElementById("dnWelcome"),
    category:document.getElementById("dnCategory"),
    age:document.getElementById("dnAge"),
    games:document.getElementById("dnGames")
  };
  let selectedCategory=currentCategory;
  let selectedAge=currentAgeGroup;

  function show(name){
    Object.entries(screens).forEach(([key,el])=>{el.hidden=key!==name;});
    window.scrollTo({top:0,behavior:"smooth"});
  }

  document.getElementById("dnStart")?.addEventListener("click",()=>show("category"));

  flow.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedCategory=btn.dataset.category;
    currentCategory=selectedCategory;
    usedQuestionIds=[];
    currentQuestion=null;
    show("age");
  }));

  flow.querySelectorAll("[data-age]").forEach(btn=>btn.addEventListener("click",()=>{
    selectedAge=btn.dataset.age;
    currentAgeGroup=selectedAge;
    usedQuestionIds=[];
    currentQuestion=null;
    show("games");
  }));

  flow.querySelectorAll("[data-game]").forEach(btn=>btn.addEventListener("click",()=>{
    const game=btn.dataset.game;
    currentCategory=selectedCategory;
    currentAgeGroup=selectedAge;
    usedQuestionIds=[];
    currentQuestion=null;
    document.body.classList.add("dn-playing");
    if(game==="truth") randomTruth();
    else if(game==="dare") randomDare();
    else if(game==="would_you_rather") randomWouldYouRather();
    else if(game==="this_or_that") randomThisOrThat();
  }));

  flow.querySelectorAll("[data-back]").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.back)));
})();


/* ===== DareNest unified setup + navigation controller ===== */
(function(){
  const flow=document.getElementById("dnFlow");
  const change=document.getElementById("dnChangeGame");
  if(!flow)return;

  const screens={
    welcome:document.getElementById("dnWelcome"),
    category:document.getElementById("dnCategory"),
    age:document.getElementById("dnAge"),
    games:document.getElementById("dnGames")
  };

  const order=["welcome","category","age","games"];
  let category=(typeof currentCategory==="string" ? currentCategory : "all");
  let age=(typeof currentAgeGroup==="string" ? currentAgeGroup : "all");
  let screen="welcome";
  let playing=false;
  let internalNavigation=false;

  flow.querySelectorAll("button").forEach(b=>b.type="button");

  

function render(name){
    if(!screens[name]) name="welcome";
    screen=name;
    Object.entries(screens).forEach(([key,el])=>{ if(el) el.hidden=(key!==name); });

    const target = screens[name];
    if (target) {
      target.scrollIntoView({behavior:"smooth", block:"start"});
    } else {
      window.scrollTo({top:0,behavior:"smooth"});
    }
  }

  function pushScreen(name){
    history.pushState({darenest:true,screen:name},"","#"+name);
    render(name);

  }

  function replaceInitial(){
    // Add a same-document Welcome history entry without changing the visible URL.
    // This keeps the first browser Back action inside DareNest instead of jumping
    // to the page that was visited before index.html.
    history.pushState({darenest:true,screen:"welcome",darenestRoot:true},"",location.pathname + location.search);
    render("welcome");
  }

  function enterGameplay(){
    playing=true;
    document.body.classList.add("dn-playing");
    if(change) change.hidden=false;
    // Gameplay is a history state, so browser Back has a real state to return to.
    history.pushState({darenest:true,screen:"gameplay"},"","#gameplay");
  }

  function leaveGameplayToGames(){
    playing=false;
    document.body.classList.remove("dn-playing");
    if(change) change.hidden=true;
    pushScreen("games");
  }

  document.getElementById("dnStart")?.addEventListener("click",()=>{
    pushScreen("category");
  });

  flow.querySelectorAll("[data-category]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      category=btn.dataset.category;
      currentCategory=category;
      usedQuestionIds=[];
      currentQuestion=null;
      pushScreen("age");
    });
  });

  flow.querySelectorAll("[data-age]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      age=btn.dataset.age;
      currentAgeGroup=age;
      usedQuestionIds=[];
      currentQuestion=null;
      pushScreen("games");
    });
  });

  flow.querySelectorAll("[data-game]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const game=btn.dataset.game;
      currentCategory=category;
      currentAgeGroup=age;
      usedQuestionIds=[];
      currentQuestion=null;

      enterGameplay();

      if(game==="truth" && typeof randomTruth==="function") randomTruth();
      else if(game==="dare" && typeof randomDare==="function") randomDare();
      else if(game==="would_you_rather" && typeof randomWouldYouRather==="function") randomWouldYouRather();
      else if(game==="this_or_that" && typeof randomThisOrThat==="function") randomThisOrThat();
      else if(game==="most_likely_to" && typeof randomMostLikelyTo==="function") randomMostLikelyTo();
      else if(game==="never_have_i_ever" && typeof randomNeverHaveIEver==="function") randomNeverHaveIEver();
    });
  });

  // Back buttons inside setup: go to the immediate previous step.
  flow.querySelectorAll("[data-back]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const target=btn.dataset.back;
      pushScreen(target);
    });
  });

  if(change){
    change.type="button";
    change.addEventListener("click",e=>{
      e.preventDefault();
      leaveGameplayToGames();
    });
  }

  window.addEventListener("popstate",event=>{
    const state=event.state;
    const target=state && state.darenest ? state.screen : location.hash.replace("#","");

    if(playing || target==="gameplay"){
      playing=false;
      document.body.classList.remove("dn-playing");
      if(change) change.hidden=true;
      render("games");
      return;
    }

    if(screens[target]){
      render(target);

      return;
    }

    // If the browser reaches before our app's first state, keep the visitor
    // inside the app rather than unexpectedly leaving the setup flow.
    replaceInitial();
  });

  // Start at a real history state. This is what makes the browser Back button
  // work reliably on localhost and on mobile browsers.
  const initial=location.hash.replace("#","");
  if(screens[initial]) {
    history.replaceState({darenest:true,screen:initial},"",location.pathname + location.search + "#" + initial);
    render(initial);
  } else {
    replaceInitial();
  }
})();

/* =========================
   STEP 7 FAVORITES CONTROLLER
========================= */
(function(){
    const openBtn = document.getElementById("dnFavoritesOpen");
    const panel = document.getElementById("dnFavoritesPanel");
    const closeBtn = document.getElementById("dnFavoritesClose");
    const clearBtn = document.getElementById("dnFavoritesClear");
    const items = document.getElementById("dnFavoritesItems");
    const count = document.getElementById("dnFavoritesCount");

    if (!openBtn || !panel || !closeBtn || !clearBtn || !items || !count) return;

    function typeLabel(type){
        return ({
            truth:"🎯 TRUTH",
            dare:"🔥 DARE",
            would_you_rather:"🤔 WOULD YOU RATHER",
            this_or_that:"⚡ THIS OR THAT",
            most_likely_to:"👀 MOST LIKELY TO",
            never_have_i_ever:"🙈 NEVER HAVE I EVER"
        })[type] || String(type || "").toUpperCase();
    }

    function renderSavedQuestions(){
        const list = Array.isArray(favorites) ? favorites : [];
        count.textContent = list.length === 1
            ? "1 saved question"
            : `${list.length} saved questions`;

        items.innerHTML = "";

        if (!list.length){
            const empty=document.createElement("div");
            empty.className="dn-favorites-empty";
            empty.textContent="No saved questions yet. Tap ❤️ Add to Favorites while playing.";
            items.appendChild(empty);
            return;
        }

        list.forEach((question,index)=>{
            const entry=document.createElement("article");
            entry.className="dn-favorite-entry";

            const type=document.createElement("div");
            type.className="dn-favorite-type";
            type.textContent=typeLabel(question.type);

            const q=document.createElement("div");
            q.className="dn-favorite-question";
            q.textContent=question.question || "";

            entry.appendChild(type);
            entry.appendChild(q);

            if ((question.type==="would_you_rather" || question.type==="this_or_that") &&
                question.optionA !== undefined && question.optionB !== undefined){
                const opts=document.createElement("div");
                opts.className="dn-favorite-options";
                opts.textContent=`A: ${question.optionA}  •  B: ${question.optionB}`;
                entry.appendChild(opts);
            }

            const actions=document.createElement("div");
            actions.className="dn-favorite-actions";

            const load=document.createElement("button");
            load.type="button";
            load.className="dn-favorite-load";
            load.textContent="▶ Play This";
            load.addEventListener("click",()=>{
                currentQuestion=question;
                currentMode=question.type;
                challengeType.textContent=typeLabel(question.type);
                if (question.type==="would_you_rather" || question.type==="this_or_that"){
                    renderChoiceQuestion(question, typeLabel(question.type)+" choices");
                } else {
                    result.textContent=question.question || "";
                }
                updateFavoriteButton();
                updateGameStatus("Loaded from Favorites");
                panel.hidden=true;
                document.body.classList.add("dn-playing");
                if (typeof change !== "undefined" && change) change.hidden=false;
                result.scrollIntoView({behavior:"smooth",block:"center"});
            });

            const remove=document.createElement("button");
            remove.type="button";
            remove.className="dn-favorite-remove";
            remove.textContent="✕ Remove";
            remove.addEventListener("click",()=>{
                favorites.splice(index,1);
                localStorage.setItem("darenestFavorites",JSON.stringify(favorites));
                renderSavedQuestions();
                updateFavoriteButton();
                updateGameStatus("Removed from Favorites");
            });

            actions.appendChild(load);
            actions.appendChild(remove);
            entry.appendChild(actions);
            items.appendChild(entry);
        });
    }

    function openFavorites(){
        renderSavedQuestions();
        panel.hidden=false;
        document.body.classList.add("dn-favorites-open");
        closeBtn.focus();
    }

    function closeFavorites(){
        panel.hidden=true;
        document.body.classList.remove("dn-favorites-open");
        openBtn.focus();
    }

    openBtn.addEventListener("click",openFavorites);
    closeBtn.addEventListener("click",closeFavorites);

    panel.addEventListener("click",e=>{
        if(e.target===panel) closeFavorites();
    });

    clearBtn.addEventListener("click",()=>{
        if(!favorites.length) return;
        if(!confirm("Remove all saved questions?")) return;
        favorites=[];
        localStorage.setItem("darenestFavorites","[]");
        renderSavedQuestions();
        updateFavoriteButton();
        updateGameStatus("Favorites cleared");
    });

    document.addEventListener("keydown",e=>{
        if(e.key==="Escape" && !panel.hidden) closeFavorites();
    });

    window.darenestRenderFavorites=renderSavedQuestions;
})();
