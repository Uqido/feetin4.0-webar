const question = document.getElementById("question")
const answer1 = document.getElementById("answer-1")
const answer2 = document.getElementById("answer-2")
const answer3 = document.getElementById("answer-3")
const answer4 = document.getElementById("answer-4")
const quizElement = document.getElementById("quiz")
const recapElement = document.getElementById("recap")
const recapMessage = document.getElementById("recap-message")

let quiz

let questionIndex = 0
let correctAnswers = 0
let isAnswerGiven = false

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onAnswerClick(index) {

    if (isAnswerGiven)
        return

    isAnswerGiven = true
    //check answer, color card
    const correctIndex = quiz[questionIndex].correctIndex

    const isCorrect = index === correctIndex
    correctAnswers += isCorrect ? 1 : 0
    const newColor = isCorrect ? "green" : "red"

    switch (index) {
        case 0:
            answer1.style.backgroundColor = newColor
            break
        case 1:
            answer2.style.backgroundColor = newColor
            break
        case 2:
            answer3.style.backgroundColor = newColor
            break
        case 3:
            answer4.style.backgroundColor = newColor
            break

    }

    setTimeout(() => {
        //go to next question
        const nextQuestionIndex = questionIndex + 1

        if (nextQuestionIndex >= quiz.length)
            toggleRecap(true)
        else
            initWithIndex(nextQuestionIndex)
        isAnswerGiven = false
    }, 3000)

    //await sleep(5000)


}


function toggleRecap(showRecap) {
    if (showRecap) {
        recapMessage.innerText = `Correct Answers: ${correctAnswers}/${quiz.length}`

        quizElement.style.display = "none"
        recapElement.style.display = "block"
    } else {
        quizElement.style.display = "block"
        recapElement.style.display = "none"
    }
}

function restartQuiz() {
    correctAnswers = 0
    initWithIndex(0)
    toggleRecap(false)
}

function initWithIndex(index) {
    questionIndex = index
    const current = quiz[index]
    question.innerText = current.question
    answer1.innerText = current.answers[0]
    answer2.innerText = current.answers[1]
    answer3.innerText = current.answers[2]
    answer4.innerText = current.answers[3]

    answer1.style.backgroundColor = "#dfdfdf"
    answer2.style.backgroundColor = "#dfdfdf"
    answer3.style.backgroundColor = "#dfdfdf"
    answer4.style.backgroundColor = "#dfdfdf"
}

(async () => {

    const pageName = url.toString().split("/").pop().replace(".html", "")

    const jsonPath = "config/" + pageName + "-quiz.json";
    quiz = await (await fetch(jsonPath)).json()

    initWithIndex(questionIndex)
})()
