// Fisher-Yates shuffle for array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Shuffle answer texts, update correct answer value
function shuffleOptions(questionId, correctAnswer) {
    const container = document.getElementById(`${questionId}_options`);
    if (!container) return correctAnswer;

    const options = Array.from(container.querySelectorAll('.option-text'));
    const texts = options.map(opt => opt.innerHTML);
    const values = ['a', 'b', 'c', 'd'].slice(0, texts.length);

    const correctIndex = values.indexOf(correctAnswer);
    const correctText = texts[correctIndex];

    const shuffledTexts = shuffleArray([...texts]);
    let newCorrectValue = correctAnswer;
    options.forEach((opt, index) => {
        opt.innerHTML = shuffledTexts[index];
        const input = opt.parentElement.querySelector('input');
        input.value = values[index];
        if (shuffledTexts[index] === correctText) {
            newCorrectValue = values[index];
        }
    });

    return newCorrectValue;
}

// Disable or enable all inputs in a section
function toggleSectionInputs(sectionId, disable) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll('input[type="radio"], input[type="text"], textarea');
    inputs.forEach(input => {
        input.disabled = disable;
    });
}

// Reset incorrect or unanswered inputs in a section
function resetSectionInputs(sectionId) {
    const section = document.getElementById(sectionId);
    const radios = section.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        const parent = radio.parentElement;
        if (!radio.checked || parent.classList.contains('incorrect')) {
            radio.checked = false;
            parent.classList.remove('correct', 'incorrect');
        }
    });

    const textInputs = section.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        if (!input.classList.contains('correct')) {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        }
    });
}

// Check all answers in a section
function checkSectionAnswers(sectionId, button) {
    const section = document.getElementById(sectionId);
    const memos = section.querySelectorAll('.memo');
    const isVisible = memos[0].classList.contains('show');

    memos.forEach(memo => memo.classList.toggle('show'));
    button.textContent = isVisible ? 'Check Answer' : 'Hide Answer';
    button.setAttribute('aria-expanded', !isVisible);

    if (isVisible) {
        // On hide: reset incorrect/unanswered inputs, re-enable inputs
        resetSectionInputs(sectionId);
        toggleSectionInputs(sectionId, false);

        // Shuffle options for multiple-choice questions if incorrect or unanswered
        const radioQuestions = section.querySelectorAll('input[type="radio"]');
        radioQuestions.forEach(radio => {
            const name = radio.name;
            const selected = section.querySelector(`input[name="${name}"]:checked`);
            if (!selected || selected.parentElement.classList.contains('incorrect')) {
                const correctAnswer = radio.dataset.correct || 'a'; // Default or from data attribute
                const newCorrectAnswer = shuffleOptions(name, correctAnswer);
                // Update button onclick with new correct answer if needed (simplified here)
            }
        });
    } else {
        // On show: validate all answers, disable inputs
        toggleSectionInputs(sectionId, true);

        // Validate radio button questions
        const radioGroups = section.querySelectorAll('.options-container');
        radioGroups.forEach(container => {
            const name = container.querySelector('input').name;
            const selected = section.querySelector(`input[name="${name}"]:checked`);
            const correctAnswer = container.querySelector('input').dataset.correct || 'a'; // Assume first option or set via data-correct
            if (selected) {
                const isCorrect = selected.value === correctAnswer;
                selected.parentElement.classList.add(isCorrect ? 'correct' : 'incorrect');
                const reasonId = name.replace(/[^0-9]/g, '') + '_reason'; // e.g., q2_4_reason
                const reasonInput = document.getElementById(reasonId);
                if (reasonInput) {
                    const correctReason = reasonInput.dataset.correctReason || '';
                    const reasonText = reasonInput.value.toLowerCase();
                    const isReasonCorrect = correctReason ? reasonText.includes(correctReason) : true;
                    reasonInput.classList.add(isReasonCorrect ? 'correct' : 'incorrect');
                }
            }
        });

        // Validate text input or textarea questions
        const textInputs = section.querySelectorAll('input[type="text"], textarea');
        textInputs.forEach(input => {
            const id = input.id;
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.dataset.correct || 'numerical'; // Default or from data attribute
            let isCorrect = false;

            if (correctAnswer === 'numerical') {
                const userValue = parseFloat(userAnswer);
                const expectedValue = parseFloat(input.dataset.correctValue || userAnswer); // Graph-dependent
                isCorrect = !isNaN(userValue) && Math.abs(userValue - expectedValue) < 0.01;
            } else {
                isCorrect = userAnswer.includes(correctAnswer);
            }

            input.classList.add(isCorrect ? 'correct' : 'incorrect');
        });
    }
}

// Initialize: Add data attributes for correct answers (to be set manually or dynamically)
document.addEventListener('DOMContentLoaded', () => {
    // Example: Set data-correct for radio questions
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        const name = radio.name;
        const correctAnswers = {
            'q1_1': 'b', 'q1_2': 'd', 'q1_3': 'a', 'q1_4': 'c', 'q1_5': 'c', 'q1_6': 'a',
            'q1_7': 'a', 'q1_8': 'c', 'q1_9': 'd', 'q1_10': 'd', 'q2_4': 'a', 'q6_2': 'a',
            'q7_5': 'a', 'q8_4': 'b', 'q8_5': 'c', 'q9_1_1': 'a', 'q9_1_4': 'a', 'q10_3': 'a'
        };
        if (correctAnswers[name]) radio.dataset.correct = correctAnswers[name];

        // Set data-correct-reason for questions with explanations
        const reasonIds = {'q2_4_reason': 'normal force increases', 'q8_4_explain': 'circuit configuration', 'q10_3_reason': 'lowest threshold frequency'};
        Object.keys(reasonIds).forEach(id => {
            const reasonInput = document.getElementById(id);
            if (reasonInput) reasonInput.dataset.correctReason = reasonIds[id];
        });

        // Set data-correct for text/numerical questions
        const textCorrect = {
            'q2_1': 'force opposes stationary', 'q2_2': 'tension friction horizontal', 'q3_1': 'gravity only',
            'q4_1': 'mass velocity product', 'q5_1': 'work path dependent', 'q6_1': 'frequency change relative motion',
            'q7_3': 'force per charge', 'q8_1': 'maximum potential difference', 'q8_2': 'current internal resistance',
            'q9_1_2': 'electrical to mechanical', 'q9_1_3': 'commutator', 'q9_2_1': 'equivalent DC voltage',
            'q10_1': 'photoelectric effect', 'q10_2': 'threshold frequency', 'q10_4': 'minimum energy',
            'q2_3_1': '0.45', 'q2_3_2': '1.20', 'q3_2_1': '0.05', 'q3_2_2': '0.30', 'q3_2_3': '4.43',
            'q3_2_4': '0.64', 'q4_2_1': '-3.00', 'q4_2_2': '2.40', 'q5_2': '-1200', 'q5_3': '9.30',
            'q5_4': '2626.67', 'q6_3': '20.00', 'q6_4': '17.50', 'q7_1': '2.50e13', 'q7_2': '337.50',
            'q7_4': '2.25e6', 'q7_6': '2.00e-6', 'q8_3_1': '3.00', 'q8_3_2': '4.00', 'q8_3_3': '13.50',
            'q9_2_2': '242.00', 'q9_2_3': '558000', 'q10_5_1': '6.35e-19', 'q10_5_2': '1.10e15'
        };
        Object.keys(textCorrect).forEach(id => {
            const input = document.getElementById(id);
            if (input) input.dataset.correct = textCorrect[id];
            if (['q2_3_1', 'q2_3_2', 'q3_2_1', 'q3_2_2', 'q3_2_3', 'q3_2_4', 'q4_2_1', 'q4_2_2', 'q5_2', 'q5_3', 'q5_4', 'q6_3', 'q6_4', 'q7_1', 'q7_2', 'q7_4', 'q7_6', 'q8_3_1', 'q8_3_2', 'q8_3_3', 'q9_2_2', 'q9_2_3', 'q10_5_1', 'q10_5_2'].includes(id)) {
                input.dataset.correctValue = textCorrect[id];
            }
        });
    });
});