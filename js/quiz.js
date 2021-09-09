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
    const newClass = isCorrect ? "right-answer" : "wrong-answer"

    switch (index) {
        case 0:
            answer1.classList.add(newClass)
            break
        case 1:
            answer2.classList.add(newClass)
            break
        case 2:
            answer3.classList.add(newClass)
            break
        case 3:
            answer4.classList.add(newClass)
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
    }, 2000)

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

function initRightAnswer(text) {
    return `<div>${text}</div>
            <div class="icon"><i class="fas fa-check fa-2x"></i></div>`
}

function initWrongAnswer(text) {
    return `<div>${text}</div>
            <div class="icon"><i class="fas fa-times fa-2x"></i></div>`
}

function initWithIndex(index) {
    questionIndex = index
    const current = quiz[index]
    const correctIndex = quiz[index].correctIndex
    question.innerText = current.question
    answer1.innerHTML = correctIndex == 0 ? initRightAnswer(current.answers[0]) : initWrongAnswer(current.answers[0])
    answer2.innerHTML = correctIndex == 1 ? initRightAnswer(current.answers[1]) : initWrongAnswer(current.answers[1])
    answer3.innerHTML = correctIndex == 2 ? initRightAnswer(current.answers[2]) : initWrongAnswer(current.answers[2])
    answer4.innerHTML = correctIndex == 3 ? initRightAnswer(current.answers[3]) : initWrongAnswer(current.answers[3])

    answer1.classList.remove("right-answer", "wrong-answer")
    answer2.classList.remove("right-answer", "wrong-answer")
    answer3.classList.remove("right-answer", "wrong-answer")
    answer4.classList.remove("right-answer", "wrong-answer")
}

(async() => {

    const pageName = url.toString().split("/").pop().replace(".html", "")

    const jsonPath = "config/" + pageName + "-quiz.json";
    quiz = await (await fetch(jsonPath)).json()

    initWithIndex(questionIndex)
})()