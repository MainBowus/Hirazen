// --- Data Resource ---
const DATA = {
    basic: [
            {c:'あ',r:'a'},{c:'い',r:'i'},{c:'う',r:'u'},{c:'え',r:'e'},{c:'お',r:'o'},
            {c:'か',r:'ka'},{c:'き',r:'ki'},{c:'く',r:'ku'},{c:'け',r:'ke'},{c:'こ',r:'ko'},
            {c:'さ',r:'sa'},{c:'し',r:'shi'},{c:'す',r:'su'},{c:'せ',r:'se'},{c:'そ',r:'so'},
            {c:'た',r:'ta'},{c:'ち',r:'chi'},{c:'つ',r:'tsu'},{c:'て',r:'te'},{c:'と',r:'to'},
            {c:'な',r:'na'},{c:'に',r:'ni'},{c:'ぬ',r:'nu'},{c:'ね',r:'ne'},{c:'の',r:'no'},
            {c:'は',r:'ha'},{c:'ひ',r:'hi'},{c:'ふ',r:'fu'},{c:'へ',r:'he'},{c:'ほ',r:'ho'},
            {c:'ま',r:'ma'},{c:'み',r:'mi'},{c:'む',r:'mu'},{c:'め',r:'me'},{c:'も',r:'mo'},
            {c:'や',r:'ya'},{c:'ゆ',r:'yu'},{c:'よ',r:'yo'},
            {c:'ら',r:'ra'},{c:'り',r:'ri'},{c:'る',r:'ru'},{c:'れ',r:'re'},{c:'ろ',r:'ro'},
            {c:'わ',r:'wa'},{c:'を',r:'wo'},{c:'ん',r:'n'}
        ],
        dakuon: [
            {c:'が',r:'ga'},{c:'ぎ',r:'gi'},{c:'ぐ',r:'gu'},{c:'げ',r:'ge'},{c:'ご',r:'go'},
            {c:'ざ',r:'za'},{c:'じ',r:'ji'},{c:'ず',r:'zu'},{c:'ぜ',r:'ze'},{c:'ぞ',r:'zo'},
            {c:'だ',r:'da'},{c:'ぢ',r:'ji'},{c:'づ',r:'zu'},{c:'で',r:'de'},{c:'ど',r:'do'},
            {c:'ば',r:'ba'},{c:'び',r:'bi'},{c:'ぶ',r:'bu'},{c:'べ',r:'be'},{c:'ぼ',r:'bo'},
            {c:'ぱ',r:'pa'},{c:'ぴ',r:'pi'},{c:'ぷ',r:'pu'},{c:'ぺ',r:'pe'},{c:'ぽ',r:'po'}
        ],
        yoon: [
            {c:'きゃ',r:'kya'},{c:'きゅ',r:'kyu'},{c:'きょ',r:'kyo'},
            {c:'しゃ',r:'sha'},{c:'しゅ',r:'shu'},{c:'しょ',r:'sho'},
            {c:'ちゃ',r:'cha'},{c:'ちゅ',r:'chu'},{c:'ちょ',r:'cho'}
        ]
    };

let state = {
    pool: [], target: null, selected: null, locked: false, score: 0, streak: 0,
    best: parseInt(localStorage.getItem('zen_best')) || 0,
    total: parseInt(localStorage.getItem('zen_total')) || 0
};

// --- Sound Engine (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === 'correct') {
        osc.frequency.setValueAtTime(523, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    }
}

// --- Navigation ---
function toggleNav() { document.getElementById('sidebar').classList.toggle('open'); }

function showView(id) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    const nav = document.getElementById('nav-' + id);
    if(nav) nav.classList.add('active');
    if(window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
    if(id === 'home') updateStats();
}

// --- Logic ---
function updateStats() {
    document.getElementById('stat-score').innerText = state.best;
    document.getElementById('stat-total').innerText = state.total;
}

function startQuiz(mode) {
    state.pool = DATA[mode];
    state.score = 0;
    state.streak = 0;
    document.getElementById('current-score').innerText = "0";
    updateStreakUI();
    showView('quiz');
    generateQ();
}

function generateQ() {
    state.locked = false; state.selected = null;
    const btn = document.getElementById('next-btn');
    btn.disabled = true; btn.innerText = "ยืนยันคำตอบ";
    document.getElementById('quiz-feedback').innerText = "";
    
    state.target = state.pool[Math.floor(Math.random() * state.pool.length)];
    document.getElementById('target-char').innerText = state.target.c;

    const area = document.getElementById('choices-area');
    area.innerHTML = '';
    
    let allWrong = DATA.basic.concat(DATA.dakuon).filter(x => x.r !== state.target.r);
    let wrongs = allWrong.sort(() => 0.5 - Math.random()).slice(0, 8);
    let choices = [...wrongs, state.target].sort(() => 0.5 - Math.random());

    choices.forEach(item => {
        const b = document.createElement('button');
        b.className = 'choice-btn';
        b.innerText = item.r;
        b.onclick = () => {
            if(state.locked) return;
            document.querySelectorAll('.choice-btn').forEach(el => el.classList.remove('selected'));
            b.classList.add('selected');
            state.selected = item.r;
            btn.disabled = false;
        };
        area.appendChild(b);
    });
}

function handleQuizAction() {
    if(state.locked) { generateQ(); return; }
    state.locked = true;
    state.total++;
    localStorage.setItem('zen_total', state.total);

    const fb = document.getElementById('quiz-feedback');
    const btns = document.querySelectorAll('.choice-btn');
    let selBtn, corBtn;

    btns.forEach(b => {
        if(b.innerText === state.target.r) corBtn = b;
        if(b.classList.contains('selected')) selBtn = b;
        b.disabled = true;
    });

    if(state.selected === state.target.r) {
        state.score += 10;
        state.streak++;
        playSound('correct');
        selBtn.classList.add('correct');
        fb.innerText = "ถูกต้องยอดเยี่ยม! ✨";
        fb.style.color = "#6b8e23";
        if(state.score > state.best) {
            state.best = state.score;
            localStorage.setItem('zen_best', state.best);
        }
    } else {
        state.streak = 0;
        playSound('wrong');
        if(selBtn) selBtn.classList.add('wrong');
        corBtn.classList.add('correct');
        fb.innerText = "คำตอบที่ถูกคือ " + state.target.r;
        fb.style.color = "#e9967a";
    }
    
    updateStreakUI();
    document.getElementById('current-score').innerText = state.score;
    document.getElementById('next-btn').disabled = false;
    document.getElementById('next-btn').innerText = "ข้อถัดไป";
}

function updateStreakUI() {
    const badge = document.getElementById('streak-display');
    const count = document.getElementById('streak-count');
    count.innerText = state.streak;
    
    if(state.streak > 0) {
        badge.classList.add('active');
        if(state.streak >= 5) badge.classList.add('mega');
        else badge.classList.remove('mega');
    } else {
        badge.classList.remove('active', 'mega');
    }
}

function initTable() {
    const create = (id, list) => {
        const g = document.getElementById(id);
        if(!g) return;
        const clean = list.filter((v,i,a)=>a.findIndex(t=>(t.c===v.c))===i);
        clean.forEach(item => {
            const box = document.createElement('div');
            box.className = 'char-box';
            box.innerHTML = `<span class="jp">${item.c}</span><span class="ro">${item.r}</span>`;
            g.appendChild(box);
        });
    };
    create('grid-basic', DATA.basic);
    create('grid-dakuon', DATA.dakuon);
    create('grid-yoon', DATA.yoon);
}

window.onload = () => { initTable(); updateStats(); };