var _a, _b, _c, _d;
import { Deck } from './deck.js';
import { GDriveAppData } from './drive.js';
const LOCAL_STORAGE_KEY = 'ddd';
function log(text) {
    console.log(text);
    //document.getElementById('log')!.textContent += text + '\n';
}
// Fit text in an element by adjusting font size
function setTextAndFit(el, text, minSize = 10, maxSize = 100) {
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
let deck;
let question = null;
let drive = new GDriveAppData();
let genus = null;
// Initialize the application
function init() {
    // Load the app data
    fetch('genus.txt')
        .then(res => res.text())
        .then(genusText => {
        genus = genusText;
        begin();
    })
        .catch(error => console.error('Error loading genus: ', error));
    drive.init()
        .then(() => {
        log('GDriveAppData initialized');
    })
        .catch(error => console.error('Error initializing GDriveAppData: ', error));
}
function begin() {
    if (genus) {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
        deck = new Deck(genus, stored);
        draw();
    }
}
function draw() {
    question = deck.draw();
    setTextAndFit(document.getElementById('word'), question.card.word, 1, 4);
}
(_a = document.getElementById('btn-der')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => chooseAnswer('m'));
(_b = document.getElementById('btn-die')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => chooseAnswer('f'));
(_c = document.getElementById('btn-das')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => chooseAnswer('n'));
(_d = document.getElementById('btn-login')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
    const button = document.getElementById('btn-login');
    button.disabled = true;
    drive.signIn((error) => {
        if (error) {
            log('Sign in error: ' + error.message);
        }
        else {
            drive.load()
                .then(data => {
                log('Loaded');
                localStorage.setItem(LOCAL_STORAGE_KEY, data);
                begin();
                button.style.visibility = "hidden";
            })
                .catch(error => console.error('Error loading data: ', error));
        }
    });
});
function chooseAnswer(answer) {
    if (!question)
        return;
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
    const userData = deck.save();
    localStorage.setItem(LOCAL_STORAGE_KEY, userData);
    if (drive.isSignedIn()) {
        drive.save(userData)
            .catch(error => console.error('Error saving data to Google Drive: ', error));
    }
    const resultEl = document.getElementById('result');
    if (resultEl)
        resultEl.textContent = text;
    setTimeout(() => {
        if (resultEl)
            resultEl.textContent = '';
        draw();
    }, 1000);
    // Disable the buttons until the next question
    question = null;
}
// Start the app on load
window.addEventListener('DOMContentLoaded', init);
//# sourceMappingURL=ddd.js.map