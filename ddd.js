var _a, _b, _c;
import { Deck } from './deck.js';
import { GDriveAppData } from './drive.js';
const LOCAL_STORAGE_KEY = 'ddd';
const LOCAL_TOKEN_KEY = 'ddd';
const gamePage = document.getElementById('game');
const splashPage = document.getElementById('splash');
let tokenData = null;
function isTokenValid() {
    return tokenData !== null && new Date(tokenData.expiration) > new Date();
}
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
    const res = 0.25;
    while (low <= high - res) {
        const mid = Math.floor((low + high) / 2);
        el.style.fontSize = `${mid}rem`;
        const fitsWidth = el.scrollWidth <= el.clientWidth;
        const fitsHeight = el.scrollHeight <= el.clientHeight;
        if (fitsWidth && fitsHeight) {
            low = mid;
        }
        else {
            high = mid;
        }
    }
    console.log('fit: ' + low);
    el.style.fontSize = `${low}rem`;
}
let deck;
let question = null;
let drive = new GDriveAppData();
let genus = null;
function hideElement(page) {
    page.style.display = 'none';
}
function showElement(page) {
    page.style.display = 'flex';
}
function showSplash() {
    hideElement(gamePage);
    showElement(splashPage);
}
function showGame() {
    hideElement(splashPage);
    showElement(gamePage);
}
// Initialize the application
function init() {
    // Load the app data
    const loadGenus = fetch('genus.txt')
        .then(res => res.text())
        .then(genusText => {
        log('Genus loaded');
        genus = genusText;
    })
        .catch(error => console.error('Error loading genus: ', error));
    // Load the Google Drive API
    const loadDrive = drive.init()
        .then(() => log('GDriveAppData initialized'))
        .catch(error => console.error('Error initializing GDriveAppData: ', error));
    // After everything loads
    Promise.all([loadGenus, loadDrive])
        .then(() => {
        log('All loaded');
        // Check for a token
        const tokenDataStr = localStorage.getItem(LOCAL_TOKEN_KEY);
        if (tokenDataStr) {
            tokenData = JSON.parse(tokenDataStr);
            if (isTokenValid()) {
                begin(); // User is already logged in
            }
            else {
                // User logged in previously but the token expired. They probably want to log in.
                showSplash();
            }
        }
        else {
            // User never logged in, start the game and they can log in later if they want.
            begin();
        }
    });
}
function begin() {
    showGame();
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    deck = new Deck(genus, stored);
    draw();
}
function draw() {
    question = deck.draw();
    setTextAndFit(document.getElementById('word'), question.card.word, 1, 4);
}
(_a = document.getElementById('btn-der')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => chooseAnswer('m'));
(_b = document.getElementById('btn-die')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => chooseAnswer('f'));
(_c = document.getElementById('btn-das')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => chooseAnswer('n'));
const splashLoginButton = document.getElementById('g_id_signin');
const lateLoginButton = document.getElementById('btn-login');
function onLogin() {
    drive.signIn((error) => {
        if (error) {
            log('Sign in error: ' + error.message);
        }
        else {
            drive.load()
                .then(data => {
                log('Loaded');
                if (data.length > 0) {
                    localStorage.setItem(LOCAL_STORAGE_KEY, data);
                    begin();
                } // else, probably first login, so keep the local data
                lateLoginButton.style.visibility = "hidden";
            })
                .catch(error => log('Error loading data: ' + error));
        }
    });
}
splashLoginButton.addEventListener('click', onLogin);
lateLoginButton.addEventListener('click', onLogin);
const skipLogin = document.getElementById('skipLogin');
skipLogin.addEventListener('click', begin);
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