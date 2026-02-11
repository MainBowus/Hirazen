// --- 1. ข้อมูลตัวอักษรและคลังความรู้ ---
const DATA = {
    basic: [{c:'あ',r:'a'},{c:'い',r:'i'},{c:'う',r:'u'},{c:'え',r:'e'},{c:'お',r:'o'},{c:'か',r:'ka'},{c:'き',r:'ki'},{c:'く',r:'ku'},{c:'け',r:'ke'},{c:'こ',r:'ko'},{c:'さ',r:'sa'},{c:'し',r:'shi'},{c:'す',r:'su'},{c:'せ',r:'se'},{c:'そ',r:'so'},{c:'た',r:'ta'},{c:'ち',r:'chi'},{c:'つ',r:'tsu'},{c:'て',r:'te'},{c:'と',r:'to'},{c:'な',r:'na'},{c:'に',r:'ni'},{c:'ぬ',r:'nu'},{c:'ね',r:'ne'},{c:'の',r:'no'},{c:'は',r:'ha'},{c:'ひ',r:'hi'},{c:'ふ',r:'fu'},{c:'へ',r:'he'},{c:'ほ',r:'ho'},{c:'ま',r:'ma'},{c:'み',r:'mi'},{c:'む',r:'mu'},{c:'め',r:'me'},{c:'も',r:'mo'},{c:'や',r:'ya'},{c:'ゆ',r:'yu'},{c:'よ',r:'yo'},{c:'ら',r:'ra'},{c:'り',r:'ri'},{c:'る',r:'ru'},{c:'れ',r:'re'},{c:'ろ',r:'ro'},{c:'わ',r:'wa'},{c:'を',r:'wo'},{c:'ん',r:'n'}],
    dakuon: [{c:'が',r:'ga'},{c:'ぎ',r:'gi'},{c:'ぐ',r:'gu'},{c:'げ',r:'ge'},{c:'ご',r:'go'},{c:'ざ',r:'za'},{c:'じ',r:'ji'},{c:'ず',r:'zu'},{c:'ぜ',r:'ze'},{c:'ぞ',r:'zo'},{c:'だ',r:'da'},{c:'ぢ',r:'ji'},{c:'づ',r:'zu'},{c:'で',r:'de'},{c:'ど',r:'do'},{c:'ば',r:'ba'},{c:'び',r:'bi'},{c:'ぶ',r:'bu'},{c:'べ',r:'be'},{c:'ぼ',r:'bo'},{c:'ぱ',r:'pa'},{c:'ぴ',r:'pi'},{c:'ぷ',r:'pu'},{c:'ぺ',r:'pe'},{c:'ぽ',r:'po'}],
    yoon: [{c:'きゃ',r:'kya'},{c:'きゅ',r:'kyu'},{c:'きょ',r:'kyo'},{c:'しゃ',r:'sha'},{c:'しゅ',r:'shu'},{c:'しょ',r:'sho'},{c:'ちゃ',r:'cha'},{c:'ちゅ',r:'chu'},{c:'ちょ',r:'cho'}]
};

const QUICK_TIPS = [
    "ตัวอักษร <b>ぬ (nu)</b> ให้จำว่าเหมือนเส้นบะหมี่ที่มีรูตรงปลายตะเกียบ!",
    "ตัวอักษร <b>あ (a)</b> มีเครื่องหมายกางเขน ให้จำว่า 'Amen'",
    "ตัวอักษร <b>し (shi)</b> เหมือนเบ็ดตกปลา (Fishing Hook)",
    "ตัวอักษร <b>く (ku)</b> เหมือนปากนกคุกคูที่กำลังอ้าปากกว้าง",
    "ตัวอักษร <b>り (ri)</b> เหมือนต้นข้าว (Rice) ที่พริ้วตามลม",
    "ตัวอักษร <b>の (no)</b> เหมือนป้ายห้าม (No Entry) หรือจมูก (Nose)",
    "ตัวอักษร <b>つ (tsu)</b> เหมือนคลื่นยักษ์สึนามิ (Tsunami)",
    "ตัวอักษร <b>へ (he)</b> เหมือนภูเขา (Hill) หรือยอดเขา",
    "ตัวอักษร <b>ゆ (yu)</b> เหมือนปลาเทราต์ที่กำลังว่ายน้ำ (You are a fish!)",
    "ตัวอักษร <b>む (mu)</b> เหมือนวัวที่กำลังร้อง 'มออออ' (Moo)",
    "ตัวอักษร <b>そ (so)</b> เหมือนคนกำลังเย็บผ้า (Sewing)",
    "ตัวอักษร <b>ろ (ro)</b> เหมือนเลข 3 แต่ไม่มีหัว ให้จำว่า 'Road' (ถนนที่เลี้ยวลดคดเคี้ยว)",
    "ฝึกในโหมด <b>Hard</b> ได้คะแนนข้อละ 20 แต้ม! (โหมดปกติได้ 10)",
    "ยศ <b>KAMI</b> ต้องการ 50,000 คะแนน คุณคือตำนานที่ยังมีลมหายใจ!",
    "อาจจะยังไม่สมบูรณ์ แต่ขอพักก่อน เดี๋ยวจะเพิ่มคาตาคานะและฟีเจอร์อื่นๆ เร็วๆ นี้"
];

// --- 2. สถานะระบบ ---
let state = {
    pool: [], target: null, selected: null, locked: false,
    score: 0, streak: 0,
    best: parseInt(localStorage.getItem('zen_best')) || 0,
    total: parseInt(localStorage.getItem('zen_total')) || 0,
    daily: parseInt(localStorage.getItem('zen_daily')) || 0,
    lastDate: localStorage.getItem('zen_date') || "",
    isHard: false,
    hardType: '',
    timer: null,
    timeLeft: 300 
};

// --- 3. ระบบจัดการสถิติและยศ (Rank System) ---
function checkDailyReset() {
    const today = new Date().toDateString();
    if (state.lastDate !== today) {
        state.daily = 0;
        state.lastDate = today;
        localStorage.setItem('zen_daily', 0);
        localStorage.setItem('zen_date', today);
    }
}

function updateStats() {
    checkDailyReset();
    
    // แสดงผลคะแนนแบบมีคอมม่า
    document.getElementById('stat-score').innerText = state.best.toLocaleString();
    document.getElementById('stat-total').innerText = state.total.toLocaleString();
    
    // เป้าหมายรายวัน (Progress Bar)
    const dailyGoal = 100;
    const progressPercent = Math.min((state.daily / dailyGoal) * 100, 100);
    document.getElementById('daily-count').innerText = state.daily;
    document.getElementById('daily-progress').style.width = progressPercent + "%";

    // ระบบคำนวณยศตามเกณฑ์ใหม่ (1K / 5K / 20K / 50K)
    const rankIcon = document.getElementById('rank-icon');
    const rankName = document.getElementById('rank-name');
    const rankNext = document.getElementById('rank-next');
    
    rankName.classList.remove('rank-kami');
    let rank = ""; let icon = ""; let msg = "";

    if (state.best >= 50000) { 
        rank = "KAMI"; icon = "⛩️"; msg = "บรรลุขั้นเทพเจ้าไร้ผู้ต้าน!"; 
        rankName.classList.add('rank-kami');
    }
    else if (state.best >= 20000) { rank = "SHOGUN"; icon = "👑"; msg = `อีก ${(50000 - state.best).toLocaleString()} แต้ม สู่ยศ KAMI`; }
    else if (state.best >= 5000) { rank = "SENSEI"; icon = "🎓"; msg = `อีก ${(20000 - state.best).toLocaleString()} แต้ม สู่ยศ SHOGUN`; }
    else if (state.best >= 1000) { rank = "SAMURAI"; icon = "⚔️"; msg = `อีก ${(5000 - state.best).toLocaleString()} แต้ม สู่ยศ SENSEI`; }
    else { rank = "DANGO"; icon = "🍡"; msg = `อีก ${(1000 - state.best).toLocaleString()} แต้ม สู่ยศ SAMURAI`; }

    rankIcon.innerText = icon;
    rankName.innerText = rank;
    rankNext.innerText = msg;
}

function refreshQuickTip() {
    const tip = QUICK_TIPS[Math.floor(Math.random() * QUICK_TIPS.length)];
    document.getElementById('quick-tip-text').innerHTML = tip;
}

// --- 4. ระบบการเดินหน้าจอ (Navigation) ---
function showView(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.getElementById('nav-' + id);
    if (navItem) navItem.classList.add('active');
    
    if (window.innerWidth <= 900) document.getElementById('sidebar').classList.remove('open');
    
    if (id !== 'quiz') {
        clearInterval(state.timer);
        state.streak = 0;
        updateStreakUI();
    }
    
    if (id === 'home') {
        updateStats();
        refreshQuickTip();
    }
}

function toggleNav() { document.getElementById('sidebar').classList.toggle('open'); }

// --- 5. ระบบโหมดท้าทาย (Hard Mode) ---
function prepareHard(type) {
    state.hardType = type;
    const names = { basic: 'พื้นฐาน', dakuon: 'เสียงขุ่น', yoon: 'เสียงควบ' };
    document.getElementById('mission-text').innerHTML = `<b>ภารกิจ:</b> ตอบถูกต่อเนื่อง 20 ข้อ<br><b>โหมด:</b> ${names[type]} (18 ตัวเลือก)<br><b>เวลา:</b> 5 นาที`;
    document.getElementById('hard-overlay').style.display = 'flex';
}

function confirmHard() {
    document.getElementById('hard-overlay').style.display = 'none';
    state.isHard = true;
    state.pool = DATA[state.hardType];
    state.score = 0;
    state.streak = 0;
    state.timeLeft = 300;
    
    document.getElementById('hard-ui').style.display = 'block';
    document.getElementById('choices-area').classList.add('hard-mode');
    document.getElementById('current-score').innerText = "0";
    document.getElementById('hard-streak-count').innerText = "0";
    document.getElementById('hard-progress').style.width = "0%";
    
    updateStreakUI();
    startTimer();
    showView('quiz');
    generateQ();
}

function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.timeLeft--;
        let m = Math.floor(state.timeLeft / 60);
        let s = state.timeLeft % 60;
        document.getElementById('timer-text').innerText = `⏱️ ${m}:${s < 10 ? '0' : ''}${s}`;
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            alert("👻 หมดเวลา! ภารกิจล้มเหลว คะแนนรอบนี้ถูกรีเซ็ต");
            showView('home');
        }
    }, 1000);
}

// --- 6. ระบบเกมเพลย์หลัก ---
function startQuiz(mode) {
    state.isHard = false;
    state.pool = DATA[mode];
    state.score = 0;
    state.streak = 0;
    document.getElementById('hard-ui').style.display = 'none';
    document.getElementById('choices-area').classList.remove('hard-mode');
    document.getElementById('current-score').innerText = "0";
    updateStreakUI();
    showView('quiz');
    generateQ();
}

function generateQ() {
    state.locked = false;
    const btn = document.getElementById('next-btn');
    btn.disabled = true; 
    btn.innerText = "ยืนยันคำตอบ";
    document.getElementById('quiz-feedback').innerText = "";
    
    state.target = state.pool[Math.floor(Math.random() * state.pool.length)];
    document.getElementById('target-char').innerText = state.target.c;

    const area = document.getElementById('choices-area');
    area.innerHTML = '';
    
    let count = state.isHard ? 18 : 9;
    let allOthers = DATA.basic.concat(DATA.dakuon).filter(x => x.r !== state.target.r);
    let wrongs = allOthers.sort(() => 0.5 - Math.random()).slice(0, count - 1);
    let choices = [...wrongs, state.target].sort(() => 0.5 - Math.random());

    choices.forEach(item => {
        const b = document.createElement('button');
        b.className = 'choice-btn';
        b.innerText = item.r;
        b.onclick = () => {
            if (state.locked) return;
            document.querySelectorAll('.choice-btn').forEach(el => el.classList.remove('selected'));
            b.classList.add('selected');
            state.selected = item.r;
            btn.disabled = false;
        };
        area.appendChild(b);
    });
}

function handleQuizAction() {
    if (state.locked) { generateQ(); return; }
    state.locked = true;
    
    state.total++;
    state.daily++;
    localStorage.setItem('zen_total', state.total);
    localStorage.setItem('zen_daily', state.daily);

    const fb = document.getElementById('quiz-feedback');
    const btns = document.querySelectorAll('.choice-btn');
    let selBtn, corBtn;

    btns.forEach(b => {
        if (b.innerText === state.target.r) corBtn = b;
        if (b.classList.contains('selected')) selBtn = b;
        b.disabled = true;
    });

    if (state.selected === state.target.r) {
        state.score += (state.isHard ? 20 : 10);
        state.streak++;
        selBtn.classList.add('correct');
        fb.innerText = "ถูกต้องแม่นยำ! ✨";
        fb.style.color = "#6b8e23";
    } else {
        state.streak = 0;
        if (selBtn) selBtn.classList.add('wrong');
        corBtn.classList.add('correct');
        fb.innerText = "พลาดแล้ว! คำตอบคือ " + state.target.r;
        fb.style.color = "#e9967a";
    }

    if (state.score > state.best) {
        state.best = state.score;
        localStorage.setItem('zen_best', state.best);
    }

    if (state.isHard) {
        document.getElementById('hard-streak-count').innerText = state.streak;
        document.getElementById('hard-progress').style.width = (state.streak / 20 * 100) + '%';
        if (state.streak >= 20) {
            clearInterval(state.timer);
            setTimeout(() => { 
                alert("🎉 ภารกิจสำเร็จ! จิตใจคุณนิ่งดั่งหินผา"); 
                showView('home'); 
            }, 500);
            return;
        }
    }

    updateStreakUI();
    document.getElementById('current-score').innerText = state.score.toLocaleString();
    document.getElementById('next-btn').disabled = false;
    document.getElementById('next-btn').innerText = "ข้อถัดไป";
}

function updateStreakUI() {
    const badge = document.getElementById('streak-display');
    const count = document.getElementById('streak-count');
    if (!badge || !count) return;

    count.innerText = state.streak;
    if (state.streak > 0) {
        badge.classList.add('active');
        if (state.streak >= 5) badge.classList.add('mega-streak');
        else badge.classList.remove('mega-streak');
    } else {
        badge.classList.remove('active', 'mega-streak');
    }
}

function initTable() {
    const create = (id, list) => {
        const g = document.getElementById(id);
        if (!g) return;
        g.innerHTML = '';
        list.forEach(item => {
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

window.onload = () => { 
    initTable(); 
    updateStats(); 
    refreshQuickTip(); 
};