class QuizEngine {
    constructor(containerId, questions) {
        this.container = document.getElementById(containerId);
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.score = 0;

        if (!this.container) {
            console.error(`Quiz container with ID '${containerId}' not found.`);
            return;
        }

        this.renderStart();
    }

    renderStart() {
        this.container.innerHTML = `
            <div class="quiz-start">
                <h3>Проверьте себя</h3>
                <p>Готовы пройти тест? ${this.questions.length} вопросов.</p>
                <button class="btn" id="start-quiz-btn">Начать тест</button>
            </div>
        `;
        this.container.querySelector('#start-quiz-btn').addEventListener('click', () => {
            this.renderQuestion();
        });
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];

        let optionsHtml = '';
        question.options.forEach((opt, index) => {
            optionsHtml += `
                <div class="quiz-option" data-index="${index}">
                    ${opt.text}
                </div>
            `;
        });

        this.container.innerHTML = `
            <div class="quiz-question-card">
                <div class="quiz-progress">Вопрос ${this.currentQuestionIndex + 1} из ${this.questions.length}</div>
                <h4 class="quiz-question-text">${question.text}</h4>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
                <div class="quiz-feedback" style="display: none;"></div>
                <button class="btn quiz-next-btn" style="display: none;">Далее</button>
            </div>
        `;

        const options = this.container.querySelectorAll('.quiz-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => this.handleAnswer(e, question));
        });

        this.container.querySelector('.quiz-next-btn').addEventListener('click', () => {
            this.currentQuestionIndex++;
            if (this.currentQuestionIndex < this.questions.length) {
                this.renderQuestion();
            } else {
                this.renderResult();
            }
        });
    }

    handleAnswer(e, question) {
        if (this.container.querySelector('.quiz-option.selected')) return; // Prevent multiple clicks

        const selectedOption = e.currentTarget;
        const selectedIndex = parseInt(selectedOption.dataset.index);
        const isCorrect = selectedIndex === question.correctIndex;

        selectedOption.classList.add('selected');
        if (isCorrect) {
            selectedOption.classList.add('correct');
            this.score++;
        } else {
            selectedOption.classList.add('wrong');
            // Highlight correct answer
            this.container.querySelector(`.quiz-option[data-index="${question.correctIndex}"]`).classList.add('correct');
        }

        const feedbackEl = this.container.querySelector('.quiz-feedback');
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = isCorrect
            ? `<strong>Верно!</strong> ${question.explanation}`
            : `<strong>Ошибка.</strong> ${question.explanation}`;
        feedbackEl.className = `quiz-feedback ${isCorrect ? 'success' : 'error'}`;

        this.container.querySelector('.quiz-next-btn').style.display = 'inline-block';
    }

    renderResult() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        let message = '';
        if (percentage === 100) message = 'Великолепно! Вы мастер.';
        else if (percentage >= 70) message = 'Хороший результат!';
        else message = 'Стоит повторить материал.';

        this.container.innerHTML = `
            <div class="quiz-result">
                <h3>Тест завершен</h3>
                <div class="quiz-score">${this.score} из ${this.questions.length}</div>
                <p>${message}</p>
                <button class="btn" id="restart-quiz-btn">Пройти заново</button>
                <a href="../articles/index.html" class="btn btn-outline" style="margin-left: 10px;">К статьям</a>
            </div>
        `;

        this.container.querySelector('#restart-quiz-btn').addEventListener('click', () => {
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.renderStart();
        });
    }
}
