let questions = [];

fetch("questions.json")
.then(response => response.json())
.then(data => {
    questions = data;
});

let currentCategory="friends";
let currentMode="truth";

const result=document.getElementById("result");
const challengeType=document.getElementById("challengeType");

function randomTruth(){

    currentMode = "truth";

    challengeType.innerHTML = "🎯 TRUTH";

    const filtered = questions.filter(q =>
        q.category === currentCategory &&
        q.type === "truth"
    );

    const random = filtered[Math.floor(Math.random() * filtered.length)];

    result.innerHTML = random.question;

}

function randomDare(){

    currentMode = "dare";

    challengeType.innerHTML = "🔥 DARE";

    const filtered = questions.filter(q =>
        q.category === currentCategory &&
        q.type === "dare"
    );

    const random = filtered[Math.floor(Math.random() * filtered.length)];

    result.innerHTML = random.question;

}

document.getElementById("truthBtn").onclick=randomTruth;

document.getElementById("dareBtn").onclick=randomDare;

document.getElementById("nextBtn").onclick=function(){

if(currentMode==="truth"){

randomTruth();

}
else{

randomDare();

}

}

const categories = document.querySelectorAll(".category");

categories.forEach(btn => {

    btn.onclick = function () {

        categories.forEach(c => c.classList.remove("active"));

        this.classList.add("active");

        currentCategory = this.dataset.category;

        challengeType.innerHTML = "WELCOME";

        result.innerHTML = "Category changed to <b>" +
                           currentCategory.charAt(0).toUpperCase() +
                           currentCategory.slice(1) +
                           ". Click Truth or Dare.";

    };

});