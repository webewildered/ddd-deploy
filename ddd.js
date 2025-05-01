var _a, _b, _c;
import { Deck } from './deck.js';
// Fit text in an element by adjusting font size
export function setTextAndFit(el, text, minSize = 10, maxSize = 100) {
    el.textContent = text;
    el.style.whiteSpace = 'nowrap';
    el.style.overflow = 'hidden';
    el.style.display = 'inline-block';
    let low = minSize;
    let high = maxSize;
    let best = minSize;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = `${mid}rem`;
        const fitsWidth = el.scrollWidth <= el.clientWidth;
        const fitsHeight = el.scrollHeight <= el.clientHeight;
        if (fitsWidth && fitsHeight) {
            best = mid;
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    el.style.fontSize = `${best}rem`;
}
let genusText = '';
let deck;
let question;
// Initialize the application
async function init() {
    genusText = await fetch('genus.txt').then(res => res.text());
    const stored = localStorage.getItem('ddd') || JSON.stringify({ cards: [] });
    deck = new Deck(genusText, stored);
    draw();
}
function draw() {
    question = deck.draw();
    const wordEl = document.getElementById('word');
    if (wordEl)
        setTextAndFit(wordEl, question.card.word, 1, 4);
}
(_a = document.getElementById('btn-der')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => chooseAnswer('m'));
(_b = document.getElementById('btn-die')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => chooseAnswer('f'));
(_c = document.getElementById('btn-das')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => chooseAnswer('n'));
function chooseAnswer(answer) {
    let text;
    switch (question.answer) {
        case 'm':
            text = 'der';
            break;
        case 'f':
            text = 'die';
            break;
        case 'n':
            text = 'das';
            break;
    }
    if (answer === question.answer) {
        text = '✔️ ' + text;
        deck.answer(question.card, true);
    }
    else {
        text = '❌ ' + text;
        deck.answer(question.card, false);
    }
    localStorage.setItem('ddd', deck.save());
    const resultEl = document.getElementById('result');
    if (resultEl)
        resultEl.textContent = text;
    setTimeout(() => {
        if (resultEl)
            resultEl.textContent = '';
        draw();
    }, 1000);
}
// Start the app on load
window.addEventListener('DOMContentLoaded', init);
//# sourceMappingURL=ddd.js.map