const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const nicknameInput = document.getElementById('nickname');

// Настройки игры
let gameActive = false;
let score = 0;
const mapSize = { width: 3000, height: 3000 };
let viewPort = { x: 0, y: 0 };

// Данные игрока
const player = {
    x: mapSize.width / 2,
    y: mapSize.height / 2,
    radius: 20,
    color: '#00b5e2',
    speed: 2,
    nickname: 'Guest'
};

// Хранилище объектов
let foods = [];
let bots = [];
const botCount = 50; // Количество ботов
const foodCount = 1000;

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
            nickname: "Bot " + (i + 1),
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
    player.nickname = nicknameInput.value || 'Cell';
    player.x = Math.random() * mapSize.width;
    player.y = Math.random() * mapSize.height;
    player.radius = 20;
    score = 0;
    scoreElement.innerText = score;
    overlay.style.display = 'none';
    gameActive = true;
});

function update() {
    if (!gameActive) return;

// Логика ботов
    bots.forEach(bot => {
        // Меняем цель движения время от времени
        if (Date.now() > bot.changeDirTime) {
            bot.targetX = Math.random() * mapSize.width;
            bot.targetY = Math.random() * mapSize.height;
            bot.changeDirTime = Date.now() + Math.random() * 5000;
        }

        const dx = bot.targetX - bot.x;
        const dy = bot.targetY - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const botSpeed = Math.max(0.5, 3 - (bot.radius / 100));
            bot.x += (dx / dist) * botSpeed;
            bot.y += (dy / dist) * botSpeed;
        }

        // Ограничение границами
        bot.x = Math.max(bot.radius, Math.min(mapSize.width - bot.radius, bot.x));
        bot.y = Math.max(bot.radius, Math.min(mapSize.height - bot.radius, bot.y));

        // Боты едят еду
        foods = foods.filter(f => {
            const d = Math.sqrt((bot.x - f.x)**2 + (bot.y - f.y)**2);
            if (d < bot.radius) {
                bot.radius += 0.1;
                return false;
            }
            return true;
        });

        // Игрок ест бота (или бот игрока)
        const dToPlayer = Math.sqrt((player.x - bot.x)**2 + (player.y - bot.y)**2);
        
        // Мы едим бота, если мы больше на 10%
        if (dToPlayer < player.radius && player.radius > bot.radius * 1.1 && player.radius < canvas.height/2) {
            player.radius += bot.radius * 0.5;
            bot.x = Math.random() * mapSize.width; // Респаун бота
            bot.y = Math.random() * mapSize.height;
            bot.radius = 20;
        } 
        // Бот ест нас
        else if (dToPlayer < bot.radius && bot.radius > player.radius * 1.1) {
            gameActive = false;
            overlay.style.display = 'flex';
            alert("Вас съел " + bot.nickname);
        }
    });

    // Рассчитываем направление к мыши
    const dx = mouse.x - canvas.width / 2;
    const dy = mouse.y - canvas.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Движение (скорость падает с ростом массы)
    const currentSpeed = Math.max(1, player.speed - (player.radius / 100));
    if (distance > 5) {
        player.x += (dx / distance) * currentSpeed;
        player.y += (dy / distance) * currentSpeed;
    }

    // Ограничение границами карты
    player.x = Math.max(player.radius, Math.min(mapSize.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(mapSize.height - player.radius, player.y));

    // Камера центрируется на игроке
    viewPort.x = player.x - canvas.width / 2;
    viewPort.y = player.y - canvas.height / 2;

    // Проверка поедания еды
    foods = foods.filter(f => {
        const dist = Math.sqrt((player.x - f.x) ** 2 + (player.y - f.y) ** 2);
        if (dist < player.radius) {
            player.radius += 0.2; // Рост
            score += 1;
            scoreElement.innerText = Math.floor(score);
            return false;
        }
        return true;
    });

    // Респаун еды
    if (foods.length < foodCount) {
        foods.push({
            x: Math.random() * mapSize.width,
            y: Math.random() * mapSize.height,
            radius: 5,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Сдвигаем контекст рисования под "камеру"
    ctx.translate(-viewPort.x, -viewPort.y);

    // Рисуем сетку (на заднем плане)
    ctx.beginPath();
    for (let x = 0; x <= mapSize.width; x += 50) {
        ctx.moveTo(x, 0); ctx.lineTo(x, mapSize.height);
    }
    for (let y = 0; y <= mapSize.height; y += 50) {
        ctx.moveTo(0, y); ctx.lineTo(mapSize.width, y);
    }
    ctx.strokeStyle = '#eee';
    ctx.stroke();

    // Рисуем еду
    foods.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.fill();
    });


// Рисуем ботов
    bots.forEach(bot => {
        ctx.beginPath();
        ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
        ctx.fillStyle = bot.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = `${Math.max(10, bot.radius / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(bot.nickname, bot.x, bot.y + 5);
    });


    // Рисуем игрока
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = '#008eb3';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Никнейм
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(10, player.radius / 2)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(player.nickname, player.x, player.y + 5);

    ctx.restore();

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

// Поехали!
spawnFood();
spawnBots();
draw();
