// Добавь переменную масштаба в начало файла
let zoom = 5;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const nicknameInput = document.getElementById('nickname');
const standartnickname = 'player'
const maxsize = 250
//let leaderboard = document.getElementById('leader-board')
//leaderboard.innerHTML='';
// Настройки игры
let gameActive = false;
let score = 0;
const mapSize = { width: 3000, height: 3000 };
let viewPort = { x: 0, y: 0 };
function about(){
    window.open(URL = "https://youtube.com/shorts/UCla3mBkUTw?si=RuED2k2avhuqBs6J");//url
}


// Данные игрока
const player = {
    x: mapSize.width / 2,
    y: mapSize.height / 2,
    radius: 20,
    color: '#00b5e2',
    speed: 1,
    nickname: 'Guest'
};

// Хранилище объектов
let foods = [];
let bots = [];
const botCount = 99; // Количество ботов
const foodCount = 10000;

// Инициализация Canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Генерация еды
function spawnFood() {
    for (let i = 0; i < foodCount; i++) {
        foods.push({
            x: Math.random() * mapSize.width,
            y: Math.random() * mapSize.height,
            radius: 5,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
}

function spawnBots() {
    for (let i = 0; i < botCount; i++) {
        bots.push({
            x: Math.random() * mapSize.width,
            y: Math.random() * mapSize.height,
            radius: Math.random() * 20 + 15,
            color: `hsl(${Math.random() * 360}, 60%, 50%)`,
            nickname: "player" + (i + 1),
            // Направление движения (от -1 до 1)
            targetX: Math.random() * mapSize.width,
            targetY: Math.random() * mapSize.height,
            changeDirTime: Date.now() + Math.random() * 3000
        });
    }
}





// Управление мышью
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Запуск игры
startBtn.addEventListener('click', () => {
    player.nickname = nicknameInput.value || 'player';
    player.x = Math.random() * mapSize.width;
    player.y = Math.random() * mapSize.height;
    player.radius = 20;
    score = 0;
    scoreElement.innerText = score;
    overlay.style.display = 'none';
    gameActive = true;
});

let counter = 0
//let leaderlist = Array(bots)[0];
//leaderlist[leaderlist.length] = player;
function update() {
    if (!gameActive){
        return;
    } 
    //if (counter>=100){
    //    counter = 0;
    //    //appending
    //    for (let i = 0; i<leaderlist.length; i++){
    //        for (let i2 = 0; i2<leaderlist.length-1; i2++){
    //            if (leaderlist[i2].radius<=leaderlist[i2+1].radius){
    //                continue;
    //            } else {
    //                var el = leaderlist[i2];
    //                leaderlist[i2] = leaderlist[i2+1];
    //                leaderlist[i2+1] = el;
    //            }
    //        }
    //    }
    //    for (let nick = 0; nick<leaderlist.length; i++){
    //        leaderboard.innerHTML+=leaderlist[nick].nickname+'\n';
    //    }
    //} else counter += 1; 



    // Плавное изменение зума в зависимости от радиуса игрока
    let targetZoom = 50 / player.radius; 
    if (targetZoom < 0.5) targetZoom = 0.5; // Не отдалять слишком сильно
    zoom += (targetZoom - zoom) * 0.1; // Плавность перехода

    // Логика ботов
    bots.forEach((bot, index) => {
        // Внутри bots.forEach((bot, index) => { ...
        bots.forEach((otherBot, otherIndex) => {
            if (index === otherIndex) return; // Не едим самих себя
        
            const dx = bot.x - otherBot.x;
            const dy = bot.y - otherBot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
        
            // Если бот больше другого на 5% и они соприкоснулись
            if (dist < bot.radius && bot.radius > otherBot.radius * 1.05) {
                bot.radius += otherBot.radius * 0.3; // Забираем часть массы
                // Респаун съеденного бота в новом месте
                otherBot.x = Math.random() * mapSize.width;
                otherBot.y = Math.random() * mapSize.height;
                otherBot.radius = 20;
            }
        });
        // Потеря массы (Decay) - чем больше бот, тем быстрее худеет
        if (bot.radius > player.radius*1.1) bot.radius -= bot.radius * 0.005;

        // Оптимизированная проверка столкновений ботов
        // Проверяем только с каждым вторым ботом для экономии ресурсов
        for (let i = index + 1; i < bots.length; i++) {
            let otherBot = bots[i];
            const dx = bot.x - otherBot.x;
            const dy = bot.y - otherBot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < Math.max(bot.radius, otherBot.radius)) {
                if (bot.radius > otherBot.radius * 1.1 && bot.radius < maxsize) {
                    bot.radius += otherBot.radius * 0.2;
                    otherBot.x = Math.random() * mapSize.width;
                    otherBot.y = Math.random() * mapSize.height;
                    otherBot.radius = 20;
                } else if (otherBot.radius > bot.radius * 1.1 && otherBot.radius < maxsize) {
                    otherBot.radius += bot.radius * 0.2;
                    bot.x = Math.random() * mapSize.width;
                    bot.y = Math.random() * mapSize.height;
                    bot.radius = 20;
                }
            }
        }

        // Движение ботов
        if (Date.now() > bot.changeDirTime) {
            bot.targetX = Math.random() * mapSize.width;
            bot.targetY = Math.random() * mapSize.height;
            bot.changeDirTime = Date.now() + Math.random() * 5000;
        }

        const dx = bot.targetX - bot.x;
        const dy = bot.targetY - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const botSpeed = Math.max(0.8, 3.5 - (bot.radius / 80));
            bot.x += (dx / dist) * botSpeed;
            bot.y += (dy / dist) * botSpeed;
        }

        bot.x = Math.max(bot.radius, Math.min(mapSize.width - bot.radius, bot.x));
        bot.y = Math.max(bot.radius, Math.min(mapSize.height - bot.radius, bot.y));

        // Поедание еды ботами (делаем реже для оптимизации)
        if (index % 2 === 0) { // Каждый второй кадр для каждого бота
            foods.forEach((f, fIndex) => {
                const d = Math.sqrt((bot.x - f.x)**2 + (bot.y - f.y)**2);
                if (d < bot.radius) {
                    if (bot.radius < maxsize) bot.radius += 0.1;
                    foods.splice(fIndex, 1);
                }
            });
        }

        // Взаимодействие игрока с ботами
        const dToPlayer = Math.sqrt((player.x - bot.x)**2 + (player.y - bot.y)**2);
        if (dToPlayer < player.radius && player.radius > bot.radius * 1.1) {
            if (player.radius < maxsize) player.radius += bot.radius * 0.2;
            bot.x = Math.random() * mapSize.width;
            bot.y = Math.random() * mapSize.height;
            bot.radius = 20;
            score += 10;
        } else if (dToPlayer < bot.radius && bot.radius > player.radius * 1.1) {
            gameActive = false;
            overlay.style.display = 'flex';
            alert("Вас съел " + bot.nickname);
        }
    });

    // Движение игрока
    const dx = mouse.x - canvas.width / 2;
    const dy = mouse.y - canvas.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const currentSpeed = Math.max(1.2, 4.5 - (player.radius / 70));

    if (distance > 5) {
        player.x += (dx / distance) * currentSpeed;
        player.y += (dy / distance) * currentSpeed;
    }

    player.x = Math.max(player.radius, Math.min(mapSize.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(mapSize.height - player.radius, player.y));

    viewPort.x = player.x - (canvas.width / 2) / zoom;
    viewPort.y = player.y - (canvas.height / 2) / zoom;

    // Поедание еды игроком
    foods = foods.filter(f => {
        const dist = Math.sqrt((player.x - f.x) ** 2 + (player.y - f.y) ** 2);
        if (dist < player.radius) {
            if (player.radius < maxsize) player.radius += 0.1;
            score += 1;
            scoreElement.innerText = Math.floor(score);
            return false;
        }
        return true;
    });

    if (foods.length < foodCount) {
        spawnFood(); // Респаун пачками для оптимизации
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Применяем зум
    ctx.scale(zoom, zoom);
    ctx.translate(-viewPort.x, -viewPort.y);

    // Рисуем границы карты
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, mapSize.width, mapSize.height);

    // Сетка
    ctx.beginPath();
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let x = 0; x <= mapSize.width; x += 100) {
        ctx.moveTo(x, 0); ctx.lineTo(x, mapSize.height);
    }
    for (let y = 0; y <= mapSize.height; y += 100) {
        ctx.moveTo(0, y); ctx.lineTo(mapSize.width, y);
    }
    ctx.stroke();

    foods.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
    });

    bots.forEach(bot => {
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
        ctx.fillStyle = bot.color;
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = `${bot.radius / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(bot.nickname, bot.x, bot.y + bot.radius/6);
    });

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = '#008eb3';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = `${player.radius / 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(player.nickname, player.x, player.y + player.radius/6);

    ctx.restore();

    requestAnimationFrame(draw);
}
// Вызов update вынесем отдельно или оставим в requestAnimationFrame
setInterval(update, 1000/60);

// Поехали!
spawnFood();
spawnBots();
draw();