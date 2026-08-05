const truths=[
"What's your biggest fear?",
"Who was your first crush?",
"What's your most embarrassing moment?"
];

const dares=[
"Sing your favorite song.",
"Do 20 jumping jacks.",
"Speak in an accent for one minute."
];

let currentMode="truth";

const result=document.getElementById("result");
const challengeType=document.getElementById("challengeType");

function randomTruth(){

currentMode="truth";

challengeType.innerHTML="🎯 TRUTH";

result.innerHTML=truths[Math.floor(Math.random()*truths.length)];

}

function randomDare(){

currentMode="dare";

challengeType.innerHTML="🔥 DARE";

result.innerHTML=dares[Math.floor(Math.random()*dares.length)];

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

const categories=document.querySelectorAll(".category");

categories.forEach(btn=>{

btn.onclick=function(){

categories.forEach(c=>c.classList.remove("active"));

this.classList.add("active");

}

});