const Discord = require("discord.js");
const botconfig = require("./botconfig.json");
const bot = new Discord.Client();
const request = require("request");
const entities = require("entities");

bot.on("ready", () =>
{
    console.log(`Logged in as ${bot.user.tag}!`)
});

//Sætter variabler op som skal gemme data omkring et spørgsmål
let question = "";
let questions;
let correctAnswerArray = [];
let correctAnswerString = "";
let randomNumberQuestion;
let answered = false;
let hints = [];

bot.on("message", msg => {
    if(msg.channel.id !== botconfig.channel && msg.channel.id !== botconfig.testchannel) return;

    //returnere hvis det er botten der er forfatter på beskeden
    if(msg.author.bot) return;
    if(msg.content.toLowerCase() !== "question" && msg.content.toLocaleLowerCase() !== "new") return;

    new Promise((resolve, reject) => {
        request("https://opentdb.com/api.php?amount=1&difficulty=easy", (error, response, body) => 
        {
            questions = JSON.parse(response.body)
            if(!error && questions.response_code === 0) console.log("hej");
            resolve(questions);
        });
    }).then(resolvedData => {
        question = entities.decode(resolvedData.results[0].question);
        correctAnswerArray = questions.results[0].correct_answer.toLowerCase().split(" ");
        correctAnswerString = entities.decode(questions.results[0].correct_answer);
        hints = questions.results[0].incorrect_answers.slice();

        answered = false;
    
        //Giv mig det rigtige svar
        console.log(question + " " + correctAnswerString);
    
        //Vis spørgsmålet hvis det ikke er besvaret
        if(!answered) msg.reply("\n" + question);
    
        //Spørgsmålet er ikke nødvendigvis besvaret, men den sættes her som det for ikke at printe spørgsmålet igen ved //næste msg
        answered = true;
    });
});

//Takes care of the answers
bot.on("message", msg => {

    if(msg.channel.id !== botconfig.channel && msg.channel.id !== botconfig.testchannel) return;

    //returnere hvis det er botten der er forfatter på beskeden
    if(msg.author.bot) return;
    if(msg.content.toLowerCase() === "hint" || msg.content.toLowerCase() === "new" || msg.content.toLowerCase() === "question") return;

    let answerArray = [];
    let answeredCorrectly = false;

    answerArray = msg.content.toLowerCase().split(" ");

    answerArray.forEach(element => {
        correctAnswerArray.forEach(item => {
            if(element === item) answeredCorrectly = true;
        });
    });

    correctAnswerArray.forEach(element => {
        answerArray.forEach(item => {
            if(element === item) answeredCorrectly = true;
        });
    });

    if(answeredCorrectly)
    {
        msg.react("👍");
        msg.reply("\nWOW HOMIE DU SVAREDE RIGTIGT.\n" + correctAnswerString + " er rigtigt!\nSkriv \"new\" og få endnu et labert spørgsmål!");  
    } else 
    {
        msg.react("👎");
        msg.reply("\nForkert\nEr det alt for svært så prøv at skrive \"hint\" for lidt hjælp eller \"new\" for at få et nyt spørgsmål.");
    }
    console.log(correctAnswerString);
});

//Takes care of "hint" message
bot.on("message", msg => {

    if(msg.channel.id !== botconfig.channel && msg.channel.id !== botconfig.testchannel) return;

    //returnere hvis det er botten der er forfatter på beskeden
    if(msg.author.bot) return;
    if(msg.content.toLowerCase() !== "hint") return;

    //Reply med de forkerte svar som en del af et hint.
    let stringHints = "";
    for (let i = 0; i < hints.length; i++) {
        stringHints += hints[i] + ", "  
    }
    if(stringHints === "False, " || stringHints === "True, ")
    {
        msg.reply("\nIngen hints til det her spørgsmål!");
    } else{
        msg.reply("\nHer er nogle forkerte svar: " + stringHints);
    }
});
bot.login(botconfig.token);
