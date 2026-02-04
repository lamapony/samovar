/**
 * Samovar Game Engine
 * A reusable library for interactive language learning games.
 */

const GameEngine = {
    /**
     * Initialize a game in a specific container
     * @param {HTMLElement|string} container - The DOM element or ID to render the game in
     * @param {string} gameType - The type of game ('alias', 'multiple-choice', 'fill-blanks', 'drag-drop', 'matching', 'find-error', 'sentence-builder')
     * @param {Object|Array} data - The data for the game
     */
    init: function(container, gameType, data) {
        const target = typeof container === 'string' ? document.getElementById(container) : container;
        if (!target) {
            console.error('GameEngine: Container not found');
            return;
        }
        
        target.innerHTML = ''; // Clear previous content
        target.className = 'game-wrapper'; // Add a class for styling hook if needed

        switch(gameType) {
            case 'alias':
                this.games.alias(target, data);
                break;
            case 'multiple-choice':
                this.games.multipleChoice(target, data);
                break;
            case 'fill-blanks':
                this.games.fillBlanks(target, data);
                break;
            case 'drag-drop':
                this.games.dragDrop(target, data);
                break;
            case 'matching':
                this.games.matching(target, data);
                break;
            case 'find-error':
                this.games.findError(target, data);
                break;
            case 'sentence-builder':
                this.games.sentenceBuilder(target, data);
                break;
            default:
                target.innerHTML = `<div class="error">Unknown game type: ${gameType}</div>`;
        }
    },

    games: {
        // --- ALIAS ---
        // Data format: [{ ru: "Word", da: "Description/Translation" }, ...]
        alias: function(container, data) {
            let currentIndex = 0;
            const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 10); // Limit to 10

            function renderCard() {
                if (currentIndex >= shuffled.length) {
                    container.innerHTML = `
                        <div class="game-container">
                            <h3>Færdig!</h3>
                            <button class="btn" onclick="GameEngine.init(this.closest('.game-wrapper'), 'alias', ${JSON.stringify(data).replace(/"/g, '&quot;')})">Prøv igen</button>
                        </div>`;
                    return;
                }
                
                container.innerHTML = `
                    <div class="game-container">
                        <h3>Alias (Forklar ordet)</h3>
                        <p>Prøv at forklare dette udtryk på russisk eller dansk:</p>
                        <div class="alias-card" style="background: white; padding: 40px; text-align: center; border: 2px solid var(--accent-color); border-radius: 10px; margin: 20px 0; font-size: 1.5em;">
                            ${shuffled[currentIndex].ru}
                            <div style="font-size: 0.6em; color: #666; margin-top: 10px;">(${shuffled[currentIndex].da})</div>
                        </div>
                        <div style="text-align: center;">
                            <button class="btn" id="next-alias-btn">Næste kort</button>
                        </div>
                    </div>
                `;
                
                container.querySelector('#next-alias-btn').addEventListener('click', () => {
                    currentIndex++;
                    renderCard();
                });
            }
            renderCard();
        },

        // --- MULTIPLE CHOICE ---
        // Data format: [{ q: "Question", options: ["A", "B", "C"], correct: 0, expl: "Explanation" }, ...]
        multipleChoice: function(container, data) {
            let currentIndex = 0;
            let score = 0;

            function renderQuestion() {
                if (currentIndex >= data.length) {
                    container.innerHTML = `
                        <div class="game-container">
                            <h4>Godt gået! Du fik ${score} ud af ${data.length} rigtige.</h4>
                            <button class="btn" id="restart-mc-btn">Prøv igen</button>
                        </div>`;
                    container.querySelector('#restart-mc-btn').addEventListener('click', () => {
                        GameEngine.init(container, 'multiple-choice', data);
                    });
                    return;
                }

                const q = data[currentIndex];
                let html = `
                    <div class="game-container">
                        <h3 style="margin-bottom: 10px;">Vælg det rigtige svar</h3>
                        <div class="progress-bar" style="height: 4px; background: #eee; margin-bottom: 20px; width: 100%;">
                            <div style="height: 100%; background: var(--accent-color); width: ${(currentIndex / data.length) * 100}%"></div>
                        </div>
                        <p style="font-size: 1.2em; margin-bottom: 20px;">${currentIndex + 1}. ${q.q}</p>
                        <div class="mc-options" style="display: flex; gap: 10px; flex-direction: column;">
                `;
                
                q.options.forEach((opt, index) => {
                    html += `<button class="btn btn-outline mc-option" data-index="${index}" style="text-align:left;">${opt}</button>`;
                });
                
                html += `
                        </div>
                        <div class="feedback" style="display:none; margin-top: 20px;"></div>
                        <button class="btn hidden next-btn" style="margin-top: 15px;">Næste</button>
                    </div>
                `;
                
                container.innerHTML = html;

                const options = container.querySelectorAll('.mc-option');
                const feedback = container.querySelector('.feedback');
                const nextBtn = container.querySelector('.next-btn');

                options.forEach(btn => {
                    btn.addEventListener('click', function() {
                        if (nextBtn.style.display === 'inline-block' || !nextBtn.classList.contains('hidden')) return; // Already answered

                        const selectedIndex = parseInt(this.getAttribute('data-index'));
                        
                        // Disable all
                        options.forEach(b => {
                            b.disabled = true;
                            if (parseInt(b.getAttribute('data-index')) === q.correct) {
                                b.style.backgroundColor = 'var(--success-color)';
                                b.style.color = 'white';
                                b.style.borderColor = 'var(--success-color)';
                            }
                        });

                        if (selectedIndex === q.correct) {
                            score++;
                            feedback.innerHTML = "<strong>Korrekt!</strong> " + (q.expl || "");
                            feedback.className = 'feedback correct';
                            this.style.backgroundColor = 'var(--success-color)';
                        } else {
                            feedback.innerHTML = "<strong>Forkert.</strong> " + (q.expl || "");
                            feedback.className = 'feedback incorrect';
                            this.style.backgroundColor = 'var(--error-color)';
                            this.style.color = 'white';
                            this.style.borderColor = 'var(--error-color)';
                        }
                        
                        feedback.style.display = 'block';
                        nextBtn.classList.remove('hidden');
                    });
                });

                nextBtn.addEventListener('click', () => {
                    currentIndex++;
                    renderQuestion();
                });
            }
            renderQuestion();
        },

        // --- FILL BLANKS ---
        // Data format: [{ sent: "Text with input", ans: ["correct"], hint: "Hint" }, ...]
        fillBlanks: function(container, data) {
            function checkAnswers() {
                const inputs = container.querySelectorAll('.fb-input');
                let correctCount = 0;
                
                inputs.forEach(inp => {
                    const idx = inp.getAttribute('data-idx');
                    const val = inp.value.toLowerCase().trim();
                    if (data[idx].ans.includes(val)) {
                        inp.style.borderColor = 'green';
                        inp.style.backgroundColor = '#d4edda';
                        correctCount++;
                    } else {
                        inp.style.borderColor = 'red';
                        inp.style.backgroundColor = '#f8d7da';
                    }
                });
                
                const feedback = container.querySelector('.fb-feedback');
                feedback.innerText = `Du fik ${correctCount} ud af ${data.length} rigtige.`;
                feedback.className = correctCount === data.length ? 'feedback correct fb-feedback' : 'feedback incorrect fb-feedback';
                feedback.style.display = 'block';
            }

            container.innerHTML = `
                <div class="game-container">
                    <h3>Udfyld hullerne (Skriv ordet i rigtig form)</h3>
                    <div class="fb-questions">
                        ${data.map((q, i) => `
                            <div style="margin-bottom: 15px;">
                                <span class="q-num">${i+1}.</span> ${q.sent.replace(/\[BLANK\]|___/g, `<input type='text' class='fb-input' data-idx='${i}' placeholder='?'>`)}
                                ${q.hint ? `<div style="font-size: 0.8em; color: #666; margin-left: 20px; margin-top: 4px;">Tip: ${q.hint}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="fb-feedback feedback" style="display:none;"></div>
                    <button class="btn check-btn">Tjek svar</button>
                </div>
            `;

            container.querySelector('.check-btn').addEventListener('click', checkAnswers);
        },

        // --- DRAG & DROP (Click version) ---
        // Data format: [{ sent: "Text [DROP] text", correct: "word", options: ["word", "wrong1", "wrong2"] }, ...]
        dragDrop: function(container, data) {
            let currentIndex = 0;

            function render() {
                if (currentIndex >= data.length) {
                    container.innerHTML = `
                        <div class="game-container">
                            <h4>Færdig!</h4>
                            <button class="btn" id="restart-dd-btn">Prøv igen</button>
                        </div>`;
                    container.querySelector('#restart-dd-btn').addEventListener('click', () => {
                        GameEngine.init(container, 'drag-drop', data);
                    });
                    return;
                }
                
                const q = data[currentIndex];
                const parts = q.sent.split('[DROP]');
                
                container.innerHTML = `
                    <div class="game-container">
                        <h3>Vælg det rigtige ord</h3>
                        <div class="progress-bar" style="height: 4px; background: #eee; margin-bottom: 20px; width: 100%;">
                            <div style="height: 100%; background: var(--accent-color); width: ${(currentIndex / data.length) * 100}%"></div>
                        </div>
                        
                        <p style="font-size: 1.3em; line-height: 1.6; margin-bottom: 30px;">
                            ${parts[0]} 
                            <span class="dd-slot" style="display: inline-block; min-width: 60px; border-bottom: 2px solid var(--accent-color); font-weight: bold; color: var(--accent-color); text-align: center;">???</span> 
                            ${parts[1]}
                        </p>
                        
                        <div class="dd-options" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                            ${q.options.map(opt => `<button class="btn btn-outline dd-opt-btn">${opt}</button>`).join('')}
                        </div>
                        
                        <div class="feedback" style="display:none; margin-top: 20px;"></div>
                        <button class="btn hidden next-btn" style="margin-top: 15px;">Næste</button>
                    </div>
                `;

                const slot = container.querySelector('.dd-slot');
                const feedback = container.querySelector('.feedback');
                const nextBtn = container.querySelector('.next-btn');
                const optBtns = container.querySelectorAll('.dd-opt-btn');

                optBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        if (nextBtn.style.display === 'inline-block' || !nextBtn.classList.contains('hidden')) return;

                        const val = this.innerText;
                        slot.innerText = val;
                        
                        if (val === q.correct) {
                            feedback.innerText = "Korrekt!";
                            feedback.className = 'feedback correct';
                            slot.style.color = 'green';
                            slot.style.borderBottomColor = 'green';
                            this.style.backgroundColor = 'var(--success-color)';
                            this.style.color = 'white';
                            nextBtn.classList.remove('hidden');
                        } else {
                            feedback.innerText = "Forkert. Prøv igen.";
                            feedback.className = 'feedback incorrect';
                            slot.style.color = 'red';
                            slot.style.borderBottomColor = 'red';
                            this.style.backgroundColor = 'var(--error-color)';
                            this.style.color = 'white';
                        }
                        feedback.style.display = 'block';
                    });
                });

                nextBtn.addEventListener('click', () => {
                    currentIndex++;
                    render();
                });
            }
            render();
        },

        // --- MATCHING ---
        // Data format: [{ id: 1, left: "Word", right: "Translation" }, ...]
        matching: function(container, data) {
            let selected = null; // { side: 'left'|'right', id: num, btn: el }
            let solvedCount = 0;
            
            // Prepare items
            const leftItems = data.map(d => ({ id: d.id, text: d.left })).sort(() => Math.random() - 0.5);
            const rightItems = data.map(d => ({ id: d.id, text: d.right })).sort(() => Math.random() - 0.5);

            container.innerHTML = `
                <div class="game-container">
                    <h3>Match ordene</h3>
                    <p>Klik på et udtryk og derefter på den tilsvarende oversættelse.</p>
                    <div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                        <div class="match-col match-left" style="flex: 1; min-width: 200px;"></div>
                        <div class="match-col match-right" style="flex: 1; min-width: 200px;"></div>
                    </div>
                    <div class="feedback" style="display:none; margin-top: 20px;"></div>
                </div>
            `;
            
            const leftContainer = container.querySelector('.match-left');
            const rightContainer = container.querySelector('.match-right');
            const feedback = container.querySelector('.feedback');

            function createBtn(item, side) {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline';
                btn.style.width = '100%';
                btn.style.marginBottom = '10px';
                btn.innerText = item.text;
                btn.dataset.id = item.id;
                btn.dataset.side = side;
                
                btn.addEventListener('click', () => handleClick(btn, item.id, side));
                return btn;
            }

            leftItems.forEach(i => leftContainer.appendChild(createBtn(i, 'left')));
            rightItems.forEach(i => rightContainer.appendChild(createBtn(i, 'right')));

            function handleClick(btn, id, side) {
                if (btn.disabled) return;

                if (!selected) {
                    selected = { btn, id, side };
                    btn.style.backgroundColor = 'var(--accent-color)';
                    btn.style.color = 'white';
                } else {
                    // Clicked same button
                    if (selected.btn === btn) {
                        selected = null;
                        btn.style.backgroundColor = '';
                        btn.style.color = '';
                        return;
                    }
                    
                    // Clicked same side
                    if (selected.side === side) {
                        selected.btn.style.backgroundColor = '';
                        selected.btn.style.color = '';
                        selected = { btn, id, side };
                        btn.style.backgroundColor = 'var(--accent-color)';
                        btn.style.color = 'white';
                        return;
                    }

                    // Clicked opposite side
                    if (selected.id === id) {
                        // Match!
                        btn.style.backgroundColor = 'var(--success-color)';
                        btn.style.color = 'white';
                        btn.disabled = true;
                        selected.btn.style.backgroundColor = 'var(--success-color)';
                        selected.btn.style.color = 'white';
                        selected.btn.disabled = true;
                        selected = null;
                        solvedCount++;
                        
                        if (solvedCount === data.length) {
                            feedback.innerText = "Alle par fundet! Godt arbejde.";
                            feedback.className = "feedback correct";
                            feedback.style.display = 'block';
                        }
                    } else {
                        // Mismatch
                        btn.style.backgroundColor = 'var(--error-color)';
                        btn.style.color = 'white';
                        const prevBtn = selected.btn;
                        selected = null;
                        
                        setTimeout(() => {
                            btn.style.backgroundColor = '';
                            btn.style.color = '';
                            prevBtn.style.backgroundColor = '';
                            prevBtn.style.color = '';
                        }, 800);
                    }
                }
            }
        },

        // --- FIND ERROR ---
        // Data: [{ sent: "Full sentence", words: ["Full", "sent", "ence"], errorIdx: 1, correction: "sentence", expl: "Explanation" }]
        findError: function(container, data) {
            let currentIndex = 0;

            function render() {
                if (currentIndex >= data.length) {
                    container.innerHTML = `
                        <div class="game-container">
                            <h3>Færdig!</h3>
                            <button class="btn" id="restart-err-btn">Prøv igen</button>
                        </div>`;
                    container.querySelector('#restart-err-btn').addEventListener('click', () => {
                        GameEngine.init(container, 'find-error', data);
                    });
                    return;
                }

                const d = data[currentIndex];
                
                container.innerHTML = `
                    <div class="game-container">
                        <h3>Find fejlen</h3>
                        <p>Klik på ordet, der er forkert. Hvis alt er rigtigt, klik på knappen "Ingen fejl".</p>
                        
                        <div class="sentence-display" style="font-size: 1.5em; margin: 30px 0; text-align: center; line-height: 1.5;">
                            ${d.words.map((w, i) => `<span class="err-word" data-idx="${i}" style="cursor: pointer; padding: 5px; border-radius: 4px; transition: 0.2s; display:inline-block; margin: 0 2px;">${w}</span>`).join('')}
                        </div>

                        <div style="text-align: center;">
                            <button class="btn btn-outline no-err-btn">Ingen fejl</button>
                        </div>
                        
                        <div class="feedback" style="display:none; margin-top: 20px;"></div>
                        <button class="btn hidden next-btn" style="margin-top: 15px;">Næste</button>
                    </div>
                `;

                const feedback = container.querySelector('.feedback');
                const nextBtn = container.querySelector('.next-btn');
                const words = container.querySelectorAll('.err-word');
                const noErrBtn = container.querySelector('.no-err-btn');

                function handleCheck(idx, el) {
                    if (nextBtn.style.display === 'inline-block' || !nextBtn.classList.contains('hidden')) return;

                    if (idx === d.errorIdx) {
                        feedback.innerHTML = `<strong>Korrekt!</strong> ${d.correction ? 'Rettelse: ' + d.correction : ''} <br> ${d.expl}`;
                        feedback.className = 'feedback correct';
                        if (el && el.classList.contains('err-word')) el.style.backgroundColor = '#d4edda';
                        if (el === noErrBtn) {
                            el.style.backgroundColor = 'var(--success-color)';
                            el.style.color = 'white';
                        }
                    } else {
                        feedback.innerText = "Forkert. Prøv igen.";
                        feedback.className = 'feedback incorrect';
                        if (el && el.classList.contains('err-word')) el.style.backgroundColor = '#f8d7da';
                    }
                    feedback.style.display = 'block';
                    nextBtn.classList.remove('hidden');
                }

                words.forEach(w => {
                    w.addEventListener('click', function() {
                        handleCheck(parseInt(this.dataset.idx), this);
                    });
                });

                noErrBtn.addEventListener('click', function() {
                    handleCheck(-1, this);
                });

                nextBtn.addEventListener('click', () => {
                    currentIndex++;
                    render();
                });
            }
            render();
        },

        // --- SENTENCE BUILDER ---
        // Data: [{ words: ["A", "B", "C"], correct: "A B C" }]
        sentenceBuilder: function(container, data) {
            let currentIndex = 0;
            let currentSentence = [];

            function render() {
                if (currentIndex >= data.length) {
                    container.innerHTML = `
                        <div class="game-container">
                            <h3>Færdig!</h3>
                            <button class="btn" id="restart-sb-btn">Prøv igen</button>
                        </div>`;
                    container.querySelector('#restart-sb-btn').addEventListener('click', () => {
                        GameEngine.init(container, 'sentence-builder', data);
                    });
                    return;
                }

                currentSentence = [];
                const d = data[currentIndex];
                const shuffled = [...d.words].sort(() => Math.random() - 0.5);

                container.innerHTML = `
                    <div class="game-container">
                        <h3>Byg sætningen</h3>
                        <p>Klik på ordene i den rigtige rækkefølge.</p>
                        
                        <div class="sb-result" style="min-height: 60px; border-bottom: 2px solid #eee; margin-bottom: 20px; font-size: 1.3em; padding: 10px;"></div>
                        
                        <div class="sb-pool" style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                            ${shuffled.map(w => `<button class="btn btn-outline sb-word">${w}</button>`).join('')}
                        </div>

                        <div style="margin-top: 20px;">
                            <button class="btn reset-btn" style="background-color: var(--error-color); margin-right: 10px;">Nulstil</button>
                            <button class="btn check-btn">Tjek</button>
                        </div>
                        
                        <div class="feedback" style="display:none; margin-top: 20px;"></div>
                        <button class="btn hidden next-btn" style="margin-top: 15px;">Næste</button>
                    </div>
                `;

                const resultDiv = container.querySelector('.sb-result');
                const wordBtns = container.querySelectorAll('.sb-word');
                const resetBtn = container.querySelector('.reset-btn');
                const checkBtn = container.querySelector('.check-btn');
                const feedback = container.querySelector('.feedback');
                const nextBtn = container.querySelector('.next-btn');

                wordBtns.forEach(btn => {
                    btn.addEventListener('click', function() {
                        currentSentence.push(this.innerText);
                        resultDiv.innerText = currentSentence.join(' ');
                        this.style.display = 'none';
                    });
                });

                resetBtn.addEventListener('click', () => {
                    currentSentence = [];
                    resultDiv.innerText = "";
                    wordBtns.forEach(b => b.style.display = 'inline-block');
                    feedback.style.display = 'none';
                });

                checkBtn.addEventListener('click', () => {
                    const built = currentSentence.join(' ');
                    if (built === d.correct) {
                        feedback.innerText = "Korrekt!";
                        feedback.className = "feedback correct";
                        nextBtn.classList.remove('hidden');
                    } else {
                        feedback.innerText = "Forkert. Prøv igen.";
                        feedback.className = "feedback incorrect";
                    }
                    feedback.style.display = 'block';
                });

                nextBtn.addEventListener('click', () => {
                    currentIndex++;
                    render();
                });
            }
            render();
        }
    }
};
