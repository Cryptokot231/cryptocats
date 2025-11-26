// --- 1. Настройки игры и Манифест ресурсов ---
const GAME_WIDTH = 1080;
const GAME_HEIGHT = 1920; 

// Манифест ресурсов
const ASSET_MANIFEST = {
    // Фоновые изображения
    // ПУТЬ ИСПРАВЛЕН: Теперь оба фона используют map_background.png,
    // так как отдельный файл для меню не найден на скриншоте.
    'main_menu_bg': 'webapp/images/map_background.png', 
    'map_bg': 'webapp/images/map_background.png', 
    
    // Иконки Главного Меню (Остаются)
    'city_icon': 'webapp/images/city_icon.png',
    'shop_icon': 'webapp/images/shop_icon.png',
    'heroes_icon': 'webapp/images/heroes_icon.png',
    'settings_icon': 'webapp/images/settings_icon.png',
    
    // Иконки ресурсов (Плейсхолдеры для 5 ресурсов)
    'res_coin': 'webapp/images/icon_res_coin.png',
    'res_fish': 'webapp/images/icon_res_fish.png',
    'res_gem': 'webapp/images/icon_res_gem.png', // Не найден, но оставлен
    'res_energy': 'webapp/images/icon_res_energy.png', // Не найден, но оставлен
    'res_gold': 'webapp/images/icon_res_gold.png', // Не найден, но оставлен

    // Иконки действий нижней панели
    'icon_build': 'webapp/images/icon_build.png',
    'icon_train': 'webapp/images/icon_train.png', // Не найден, но оставлен
    'icon_upgrade': 'webapp/images/icon_upgrade.png', // Не найден, но оставлен
    'icon_map': 'webapp/images/icon_map.png',

    // Изображения Зданий
    'building_center': 'webapp/images/building_center.png', 
    'building_tank': 'webapp/images/building_tank.png',    
    'building_hq': 'webapp/images/building_hq.png',         
    'building_market': 'webapp/images/building_market.png', 
    'building_lab': 'webapp/images/building_lab.png',       
};

// --- 2. Базовый класс сцены (BaseScene) ---
class BaseScene extends PIXI.Container {
    constructor(name) {
        super();
        this.name = name;
        this.app = SceneManager.app;
        this.isInitialized = false;
    }

    onStart() {
        console.log(`[Scene] Запуск сцены: ${this.name}`);
        this.isInitialized = true;
    }

    onEnd() {
        console.log(`[Scene] Остановка сцены: ${this.name}`);
        this.destroy({ children: true });
    }

    update(delta) {
        // Логика обновления сцены
    }
}

// --- 3. Менеджер сцен (SceneManager) с анимацией перехода (Fade) ---
class SceneManager {
    static app = null;
    static currentScene = null;
    static transitionSprite = null;
    static isTransitioning = false;
    static targetSceneClass = null;
    
    // Инициализация менеджера
    static initialize(app) {
        this.app = app;
        
        // Создаем спрайт для анимации затемнения (fade)
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000); // Черный цвет
        graphics.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        graphics.endFill();
        this.transitionSprite = new PIXI.Sprite(this.app.renderer.generateTexture(graphics));
        this.transitionSprite.alpha = 0;
        this.transitionSprite.visible = false;
        this.app.stage.addChild(this.transitionSprite);

        this.app.ticker.add(this.update.bind(this));
    }

    // Функция для переключения сцен
    static changeScene(newSceneClass) {
        if (this.isTransitioning) return;

        this.targetSceneClass = newSceneClass;
        this.isTransitioning = true;
        
        // Этап 1: Затемнение (Fade Out)
        this.transitionSprite.visible = true;
    }

    // Игровой цикл
    static update(ticker) {
        const delta = ticker.deltaTime;

        if (this.currentScene && this.currentScene.isInitialized && !this.isTransitioning) {
            this.currentScene.update(delta);
        }

        if (this.isTransitioning) {
            const FADE_SPEED = 0.05 * delta;

            // 1. Затемнение (Fade Out)
            if (this.transitionSprite.alpha < 1 && this.targetSceneClass) {
                this.transitionSprite.alpha += FADE_SPEED;
                if (this.transitionSprite.alpha >= 1) {
                    this.transitionSprite.alpha = 1;

                    // Удаляем старую сцену
                    if (this.currentScene) {
                        this.currentScene.onEnd();
                        this.app.stage.removeChild(this.currentScene);
                        this.currentScene = null;
                    }
                    
                    // Запускаем новую сцену
                    this.currentScene = new this.targetSceneClass();
                    this.app.stage.addChildAt(this.currentScene, 0);
                    this.currentScene.onStart();
                    
                    this.targetSceneClass = null;
                }
            } 
            // 2. Появление (Fade In)
            else if (this.transitionSprite.alpha > 0) {
                this.transitionSprite.alpha -= FADE_SPEED;
                if (this.transitionSprite.alpha <= 0) {
                    this.transitionSprite.alpha = 0;
                    this.transitionSprite.visible = false;
                    this.isTransitioning = false;
                    console.log("[Transition] Переход завершен.");
                }
            }
        }
    }
}

// --- 4. Вспомогательные функции для UI ---

// Создает кнопку для Главного меню (Меню "Город", "Магазин" и т.д.)
function createMenuButton(iconName, textLabel, action) {
    // Проверка наличия иконки
    let texture;
    try {
        texture = PIXI.Assets.get(iconName);
    } catch (e) {
        console.warn(`Texture not found for icon: ${iconName}. Using placeholder.`);
        // Используем заглушку, если иконка не найдена
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xFF0000);
        graphics.drawRect(0, 0, 100, 100);
        graphics.endFill();
        texture = PIXI.Texture.from(graphics.generateCanvas());
    }

    const icon = new PIXI.Sprite(texture);
    icon.anchor.set(0.5);
    icon.width = icon.height = 100;
    
    const text = new PIXI.Text(textLabel, {
        fontFamily: 'Arial', 
        fontSize: 36, 
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowColor: '0x000000',
        dropShadowDistance: 4,
    });
    text.anchor.set(0.5, 0); 
    text.y = 60;

    const buttonContainer = new PIXI.Container();
    buttonContainer.addChild(icon, text);
    buttonContainer.interactive = true;
    buttonContainer.cursor = 'pointer';
    buttonContainer.on('pointertap', action);
    buttonContainer.on('pointerdown', () => buttonContainer.scale.set(0.95));
    buttonContainer.on('pointerup', () => buttonContainer.scale.set(1));
    buttonContainer.on('pointerout', () => buttonContainer.scale.set(1));
    
    return buttonContainer;
}

// Создает здание на карте
function createBuilding(textureKey, name, x, y, size = 350, action) {
    // Проверка наличия текстуры здания
    let texture;
    try {
        texture = PIXI.Assets.get(textureKey);
    } catch (e) {
        console.warn(`Texture not found for building: ${textureKey}. Using placeholder.`);
        // Используем заглушку, если текстура не найдена
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x888888);
        graphics.drawRect(0, 0, size, size);
        graphics.endFill();
        texture = PIXI.Texture.from(graphics.generateCanvas());
    }

    const building = new PIXI.Sprite(texture);
    building.name = name;
    building.anchor.set(0.5); 
    building.width = size;
    building.height = size;
    building.x = x;
    building.y = y;
    building.interactive = true;
    building.cursor = 'pointer';
    
    building.on('pointertap', action);

    // Добавляем индикатор уровня (кружок с цифрой 1)
    const levelIndicator = new PIXI.Graphics();
    levelIndicator.beginFill(0x00FF00); // Зеленый цвет
    levelIndicator.drawCircle(0, 0, 30);
    levelIndicator.endFill();
    levelIndicator.x = 50;
    levelIndicator.y = -size / 2 + 50; 
    
    const levelText = new PIXI.Text('1', {
        fontFamily: 'Arial',
        fontSize: 30,
        fill: 0x000000,
        align: 'center',
    });
    levelText.anchor.set(0.5);
    
    levelIndicator.addChild(levelText);
    building.addChild(levelIndicator);

    return building;
}

// Создает элемент верхней панели (иконка + текст ресурса)
function createResourceItem(iconKey, amount, color = 0xFFFFFF) {
    const container = new PIXI.Container();
    
    // 1. Фон 
    const background = new PIXI.Graphics();
    background.beginFill(0x000000, 0.5); // Полупрозрачный черный
    background.drawRoundedRect(0, 0, 200, 50, 20);
    background.endFill();
    container.addChild(background);
    
    // 2. Иконка ресурса
    let icon;
    try {
        icon = PIXI.Sprite.from(iconKey);
    } catch (e) {
        console.warn(`Resource icon not found: ${iconKey}. Using placeholder.`);
        const graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        graphics.drawCircle(0, 0, 20);
        graphics.endFill();
        icon = new PIXI.Sprite(PIXI.Texture.from(graphics.generateCanvas()));
        icon.x = 25; // Сдвигаем, т.к. якорь по умолчанию 0.5
        icon.y = 25;
    }
    
    icon.anchor.set(0, 0.5);
    icon.x = 5;
    icon.y = 25;
    icon.width = icon.height = 40;
    container.addChild(icon);

    // 3. Текст (количество)
    const text = new PIXI.Text(amount.toString(), {
        fontFamily: 'Arial',
        fontSize: 26,
        fill: color,
        align: 'right',
    });
    text.anchor.set(1, 0.5);
    text.x = 190;
    text.y = 25;
    container.addChild(text);

    return container;
}


// --- 5. Классы конкретных сцен ---

// --- Главное Меню (Остается без изменений) ---
class MainMenuScene extends BaseScene {
    constructor() {
        super('MainMenuScene');
    }

    onStart() {
        super.onStart();

        // 1. Фон
        const background = PIXI.Sprite.from('main_menu_bg'); // Использует map_background.png
        background.width = GAME_WIDTH;
        background.height = GAME_HEIGHT;
        this.addChild(background);

        // 2. Заголовок
        const title = new PIXI.Text('CRYPTO CATS', {
            fontFamily: 'Arial Black',
            fontSize: 120,
            fill: 0xFFD700,
            stroke: 0x000000,
            strokeThickness: 10,
        });
        title.anchor.set(0.5);
        title.x = GAME_WIDTH / 2;
        title.y = 200;
        this.addChild(title);

        // 3. Контейнер для кнопок
        const buttonContainer = new PIXI.Container();
        buttonContainer.y = GAME_HEIGHT - 300; 
        this.addChild(buttonContainer);

        // 4. Кнопки (City теперь ведет на MapScene)
        const cityButton = createMenuButton('city_icon', 'City', () => {
            SceneManager.changeScene(MapScene); // ПЕРЕХОД НА НОВЫЙ ЭКРАН КАРТЫ
        });
        
        const shopButton = createMenuButton('shop_icon', 'Shop', () => {
            console.log("Нажата кнопка Shop");
        });

        const heroesButton = createMenuButton('heroes_icon', 'Heroes', () => {
            console.log("Нажата кнопка Heroes");
        });
        
        const settingsButton = createMenuButton('settings_icon', 'Settings', () => {
            console.log("Нажата кнопка Settings");
        });

        // Размещение кнопок горизонтально
        const BUTTON_SPACING = 200;
        const buttons = [cityButton, shopButton, heroesButton, settingsButton];
        
        let currentX = 0;
        buttons.forEach(btn => {
            btn.x = currentX;
            buttonContainer.addChild(btn);
            currentX += btn.width + BUTTON_SPACING;
        });
        
        // Смещение всего контейнера так, чтобы он был по центру
        buttonContainer.x = (GAME_WIDTH / 2) - (currentX - BUTTON_SPACING) / 2;
    }
}


// --- Экран Карты/Города (Новая логика по скриншоту) ---
class MapScene extends BaseScene {
    constructor() {
        super('MapScene');
    }

    onStart() {
        super.onStart();

        // 1. Фон карты (темный, космический)
        const background = PIXI.Sprite.from('map_bg');
        background.width = GAME_WIDTH;
        background.height = GAME_HEIGHT;
        this.addChild(background);
        
        // Контейнер для всех зданий, чтобы потом его можно было двигать (камера)
        const mapContainer = new PIXI.Container();
        mapContainer.name = 'MapContainer';
        mapContainer.x = GAME_WIDTH / 2;
        mapContainer.y = GAME_HEIGHT / 2 + 100; // Немного сдвигаем вниз, чтобы освободить место для UI
        this.addChild(mapContainer);

        this.createBuildings(mapContainer);
        this.createTopBar();
        this.createBottomBar();
        
        // Профиль в левом верхнем углу
        this.createProfilePanel();

        // Кнопка закрытия/настроек в правом верхнем углу
        this.createSettingsButton();
    }
    
    // Создание и размещение 5 зданий в изометрическом стиле
    createBuildings(container) {
        // Координаты (относительно центра контейнера mapContainer)
        // Y-координата контролирует "глубину": чем меньше Y, тем дальше объект (и он должен быть отрисован раньше)
        
        // 1. Здание слева вверху (дальнее)
        const lab = createBuilding('building_lab', 'Lab', -300, -300, 300, 
            () => console.log('Нажато: Lab (дальнее)'));
        container.addChild(lab);

        // 2. Здание справа вверху (дальнее)
        const market = createBuilding('building_market', 'Market', 300, -300, 300, 
            () => console.log('Нажато: Market (дальнее)'));
        container.addChild(market);
        
        // 3. Главное здание (Центральное и самое большое)
        const center = createBuilding('building_center', 'Center', 0, 0, 450, 
            () => console.log('Нажато: Center (Главное)'));
        container.addChild(center);

        // 4. Здание слева внизу (ближнее)
        const tank = createBuilding('building_tank', 'Tank', -350, 200, 350, 
            () => console.log('Нажато: Tank (ближнее)'));
        container.addChild(tank);

        // 5. Здание справа внизу (ближнее)
        const hq = createBuilding('building_hq', 'HQ', 350, 200, 350, 
            () => console.log('Нажато: HQ (ближнее)'));
        container.addChild(hq);
        
        console.log("5 зданий размещены на карте.");
    }
    
    // Создание верхней панели с ресурсами
    createTopBar() {
        const barContainer = new PIXI.Container();
        barContainer.x = 20;
        barContainer.y = 20;
        this.addChild(barContainer);
        
        const resources = [
            { key: 'res_coin', amount: 1500, color: 0xFFD700 }, // Золото
            { key: 'res_fish', amount: 1660, color: 0x87CEEB }, // Рыба/вода
            { key: 'res_gem', amount: 1510, color: 0x33FF33 },  // Кристаллы
            { key: 'res_energy', amount: 1180, color: 0xEE82EE }, // Энергия
        ];
        
        let currentX = 0;
        resources.forEach(res => {
            const item = createResourceItem(res.key, res.amount, res.color);
            item.x = currentX;
            barContainer.addChild(item);
            currentX += item.width + 15; // Промежуток
        });

        // Дополнительный ресурс в правом верхнем углу (22520)
        const rightResource = createResourceItem('res_gold', 22520, 0xFFFFFF);
        rightResource.x = GAME_WIDTH - rightResource.width - 70; // Отступ справа
        rightResource.y = 20;
        this.addChild(rightResource);
    }
    
    // Создание нижней панели с кнопками действий
    createBottomBar() {
        const barContainer = new PIXI.Container();
        barContainer.x = GAME_WIDTH / 2;
        barContainer.y = GAME_HEIGHT - 100;
        this.addChild(barContainer);

        const actions = [
            { icon: 'icon_build', label: 'Build', action: () => console.log('Action: Build') },
            { icon: 'icon_train', label: 'Train', action: () => console.log('Action: Train') },
            { icon: 'icon_upgrade', label: 'Upgrade', action: () => console.log('Action: Upgrade') },
            // ... дополнительная кнопка конверта
        ];
        
        const BUTTON_SPACING = 120;
        let currentX = 0;
        
        actions.forEach(act => {
            const btn = new PIXI.Text(act.label, { // Пока используем текст как кнопку
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 0xFFFFFF,
                stroke: 0x000000,
                strokeThickness: 5,
            });
            btn.anchor.set(0.5);
            btn.interactive = true;
            btn.cursor = 'pointer';
            btn.on('pointertap', act.action);
            
            btn.x = currentX;
            barContainer.addChild(btn);
            currentX += btn.width + BUTTON_SPACING;
        });
        
        // Центрирование контейнера кнопок
        barContainer.x = (GAME_WIDTH / 2) - (currentX - BUTTON_SPACING) / 2;
        
        // Кнопка Map/Назад (Возврат в главное меню)
        const mapButton = createMenuButton('icon_map', 'Map', () => {
            SceneManager.changeScene(MainMenuScene);
        });
        mapButton.x = GAME_WIDTH - 150;
        mapButton.y = GAME_HEIGHT - 100;
        this.addChild(mapButton);
    }

    // Создание панели "Account Power"
    createProfilePanel() {
        const container = new PIXI.Container();
        container.x = 20;
        container.y = 100;
        this.addChild(container);

        // Временный значок (можно заменить на иконку кошки)
        const icon = new PIXI.Graphics();
        icon.beginFill(0x87CEEB);
        icon.drawCircle(0, 0, 30);
        icon.endFill();
        icon.x = 30;
        icon.y = 30;
        container.addChild(icon);

        const textStyle = { fontFamily: 'Arial', fontSize: 24, fill: 0xFFFFFF };

        const powerText = new PIXI.Text('Account Power: 125', textStyle);
        powerText.x = 80;
        powerText.y = 10;
        container.addChild(powerText);

        const levelText = new PIXI.Text('Level 1', textStyle);
        levelText.x = 80;
        levelText.y = 40;
        container.addChild(levelText);
    }
    
    // Кнопка закрытия/настроек в правом верхнем углу
    createSettingsButton() {
        const button = createMenuButton('settings_icon', '', () => {
             console.log('Нажата кнопка закрытия/настроек');
        });
        button.x = GAME_WIDTH - 50;
        button.y = 50;
        this.addChild(button);
    }
}


// --- 6. Инициализация и Запуск Игры ---

async function initGame() {
    // 1. Инициализация Pixi Application
    const app = new PIXI.Application({
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        background: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    
    // Добавление холста в документ
    document.body.appendChild(app.view);
    
    // Скрытие экрана загрузки после добавления холста
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';

    // 2. Инициализация Telegram WebApp API
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.setHeaderColor('#1a1a2e');
            Telegram.WebApp.setBackgroundColor('#1a1a2e');
            console.log("Telegram WebApp API готов.");
        }
    } catch (e) {
        console.warn("Не удалось инициализировать Telegram WebApp API:", e);
    }
    
    // 3. Загрузка ресурсов
    try {
        console.log("Начинаем загрузку ресурсов...");
        
        for (const [key, path] of Object.entries(ASSET_MANIFEST)) {
            PIXI.Assets.add({ alias: key, src: path });
        }
        
        await PIXI.Assets.load(Object.keys(ASSET_MANIFEST));
        console.log("Все ресурсы загружены успешно!");

        // 4. Инициализация Менеджера Сцен
        SceneManager.initialize(app);

        // 5. Запуск первой сцены
        SceneManager.changeScene(MainMenuScene);
        
    } catch (error) {
        console.error("ОШИБКА ЗАГРУЗКИ РЕСУРСОВ. Проверьте пути в ASSET_MANIFEST и наличие файлов:", error);
        loadingScreen.innerHTML = 'Ошибка загрузки! Проверьте консоль.';
        return;
    }
    
    // 6. Скрытие экрана загрузки и запуск игры
    loadingScreen.style.display = 'none';
}

// Запуск игры
window.onload = initGame;