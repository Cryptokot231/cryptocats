import * as PIXI from 'https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/browser/pixi.min.js';

// --- КОНФИГУРАЦИЯ РЕСУРСОВ И ИНИЦИАЛИЗАЦИЯ ---

// 1. Правильное указание путей к ресурсам
// Используйте имена файлов из вашего скриншота, включая unnamed.jpg как фон с сеткой
const ASSETS = {
    // Фоны
    bg_space: { alias: 'bg_space', src: 'webapp-images/bg_space.png' }, // Старый фон 
    bg_grid: { alias: 'bg_grid', src: 'webapp-images/unnamed.jpg' }, // Новый фон с синей сеткой
    
    // Здания (новые имена, как вы указали)
    building_center: { alias: 'building_center', src: 'webapp-images/building_center.png' },
    building_hq: { alias: 'building_hq', src: 'webapp-images/building_hq.png' }, 
    building_lab: { alias: 'building_lab', src: 'webapp-images/building_lab.png' }, 
    building_market: { alias: 'building_market', src: 'webapp-images/building_market.png' }, 
    building_tank: { alias: 'building_tank', src: 'webapp-images/building_tank.png' }, 

    // Иконки UI и ресурсов
    icon_power_cat: { alias: 'icon_power_cat', src: 'webapp-images/icon_power_cat.png' }, // Иконка кота для power
    icon_close: { alias: 'icon_close', src: 'webapp-images/icon_close.png' }, // Иконка "X"
    settings_icon: { alias: 'settings_icon', src: 'webapp-images/settings_icon.png' }, // Иконка настроек/меню

    // Иконки ресурсов (5 иконок)
    icon_res_coin: { alias: 'icon_res_coin', src: 'webapp-images/icon_res_coin.png' },
    icon_res_gem: { alias: 'icon_res_gem', src: 'webapp-images/icon_res_gem.png' },
    icon_res_gold: { alias: 'icon_res_gold', src: 'webapp-images/icon_res_gold.png' },
    icon_res_energy: { alias: 'icon_res_energy', src: 'webapp-images/icon_res_energy.png' },
    icon_res_fish: { alias: 'icon_res_fish', src: 'webapp-images/icon_res_fish.png' }, 

    // Иконки нижней панели
    icon_build: { alias: 'icon_build', src: 'webapp-images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'webapp-images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'webapp-images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'webapp-images/icon_map.png' }, 
};

// Размеры приложения
const APP_WIDTH = 720; // Оптимальный размер для мобильного портрета (как на скриншоте)
const APP_HEIGHT = 1280; // (как на скриншоте)

// Инициализация приложения PIXI
const app = new PIXI.Application();
let SceneManager; // Менеджер сцены будет инициализирован после загрузки

async function init() {
    // 1. Создание приложения PIXI
    await app.init({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        background: '#000000',
        canvas: document.getElementById('pixi-container'),
        resolution: Math.max(window.devicePixelRatio, 1), 
        autoDensity: true,
    });
    
    // Добавление холста в контейнер
    document.getElementById('pixi-container').appendChild(app.canvas);
    
    // Ресайз для адаптивности (чтобы игра занимала все доступное место)
    window.addEventListener('resize', resize);
    resize();

    // 2. Загрузка всех ресурсов
    try {
        console.log("Начало загрузки ресурсов...");
        const assetList = Object.values(ASSETS);
        await PIXI.Assets.load(assetList); 
        console.log("Ресурсы успешно загружены.");
        
        // 3. Инициализация менеджера сцены и запуск первой сцены
        SceneManager = new SceneController(app);
        SceneManager.changeScene(MainMenuScene); // Запускаем MainMenuScene
        
    } catch (error) {
        console.error("Ошибка при загрузке ресурсов! Проверьте пути в ASSETS и наличие папки 'webapp-images'.", error);
        const errorText = new PIXI.Text('ОШИБКА: Ресурсы не загружены. Проверьте консоль.', { fill: 0xFF0000, fontSize: 30 });
        app.stage.addChild(errorText);
    }
}

// Функция для адаптивности (масштабирование)
function resize() {
    const parent = app.canvas.parentNode;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    const ratio = APP_WIDTH / APP_HEIGHT; 
    let newWidth, newHeight;

    if (parentWidth / parentHeight > ratio) {
        newHeight = parentHeight;
        newWidth = parentHeight * ratio;
    } else {
        newWidth = parentWidth;
        newHeight = parentWidth / ratio;
    }

    app.canvas.style.width = `${newWidth}px`;
    app.canvas.style.height = `${newHeight}px`;
    app.renderer.resize(APP_WIDTH, APP_HEIGHT);
}

// --- МЕНЕДЖЕР СЦЕН (SCENE MANAGER) ---

class SceneController {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
        this.transitionOverlay = null; 
    }

    async changeScene(NewSceneClass) {
        if (this.currentScene && this.currentScene.constructor === NewSceneClass) return; 

        const duration = 500; 
        
        await this.startTransition('fade-out', duration);

        if (this.currentScene) {
            this.currentScene.destroy({ children: true, texture: false, baseTexture: false });
            this.app.stage.removeChild(this.currentScene);
            this.currentScene = null;
        }

        const newScene = new NewSceneClass(this);
        this.app.stage.addChild(newScene);
        this.currentScene = newScene;
        
        await this.startTransition('fade-in', duration);
    }
    
    startTransition(type, duration) {
        return new Promise(resolve => {
            if (!this.transitionOverlay) {
                this.transitionOverlay = new PIXI.Graphics()
                    .rect(0, 0, APP_WIDTH, APP_HEIGHT)
                    .fill({ color: 0x000000 });
                this.transitionOverlay.zIndex = Infinity; 
                this.app.stage.addChild(this.transitionOverlay);
            }

            let startAlpha, endAlpha;
            if (type === 'fade-out') {
                startAlpha = 0;
                endAlpha = 1; 
            } else { 
                startAlpha = 1; 
                endAlpha = 0; 
            }
            this.transitionOverlay.alpha = startAlpha;

            let elapsed = 0;
            const animate = (ticker) => {
                elapsed += ticker.deltaTime; 
                const progress = Math.min(elapsed / (duration * app.ticker.FPS / 1000), 1);
                
                this.transitionOverlay.alpha = startAlpha + (endAlpha - startAlpha) * progress;

                if (progress === 1) {
                    this.app.ticker.remove(animate);
                    if (type === 'fade-in') {
                         this.app.stage.removeChild(this.transitionOverlay);
                         this.transitionOverlay = null;
                    }
                    resolve();
                }
            };

            this.app.ticker.add(animate);
        });
    }
}

// --- КЛАССЫ СЦЕН (SCENE CLASSES) ---

// Базовый класс для всех сцен (просто контейнер Pixi)
class BaseScene extends PIXI.Container {
    constructor(manager) {
        super();
        this.manager = manager;
        this.sortableChildren = true; 
        this.init();
    }
    
    init() {}
}

// --- СЦЕНА: ГЛАВНОЕ МЕНЮ (MainMenuScene) ---
class MainMenuScene extends BaseScene {
    init() {
        // 1. Фон (bg_grid - новая синяя сетка)
        const bgSprite = PIXI.Sprite.from('bg_grid');
        bgSprite.width = APP_WIDTH;
        bgSprite.height = APP_HEIGHT;
        this.addChild(bgSprite);

        // 2. Здания (возвращаем их на сцену)
        this.addBuildings();

        // 3. Верхний UI (Ресурсы, Power, X, ...)
        this.addTopUI();

        // 4. Нижняя панель (Build, Train, Upgrade, Map)
        this.addBottomPanel();

        // 5. Дополнительная кнопка для тестирования перехода (можно удалить)
        const goToCityButton = this.createSimpleButton('Перейти в Город', () => this.manager.changeScene(CityScene), 0xFFFFFF);
        goToCityButton.x = APP_WIDTH / 2;
        goToCityButton.y = APP_HEIGHT - 200; // Позиция для видимости над нижней панелью
        this.addChild(goToCityButton);
    }

    addBuildings() {
        // --- Центральное здание (Center) ---
        const center = PIXI.Sprite.from('building_center');
        center.anchor.set(0.5);
        center.x = APP_WIDTH / 2;
        center.y = APP_HEIGHT / 2 + 50; 
        center.scale.set(0.7); 
        center.eventMode = 'static';
        center.cursor = 'pointer';
        center.on('pointertap', () => console.log('Нажато Center'));
        this.addChild(center);

        // --- Штаб (HQ) - Лево-верхний ---
        const hq = PIXI.Sprite.from('building_hq');
        hq.anchor.set(0.5);
        hq.x = APP_WIDTH / 2 - 200;
        hq.y = APP_HEIGHT / 2 - 150;
        hq.scale.set(0.6);
        hq.eventMode = 'static';
        hq.cursor = 'pointer';
        hq.on('pointertap', () => console.log('Нажато HQ'));
        this.addChild(hq);

        // --- Лаборатория (Lab) - Право-верхний ---
        const lab = PIXI.Sprite.from('building_lab');
        lab.anchor.set(0.5);
        lab.x = APP_WIDTH / 2 + 200;
        lab.y = APP_HEIGHT / 2 - 150;
        lab.scale.set(0.6);
        lab.eventMode = 'static';
        lab.cursor = 'pointer';
        lab.on('pointertap', () => console.log('Нажато Lab'));
        this.addChild(lab);

        // --- Рынок (Market) - Лево-нижний ---
        const market = PIXI.Sprite.from('building_market');
        market.anchor.set(0.5);
        market.x = APP_WIDTH / 2 - 250;
        market.y = APP_HEIGHT / 2 + 250;
        market.scale.set(0.65);
        market.eventMode = 'static';
        market.cursor = 'pointer';
        market.on('pointertap', () => console.log('Нажато Market'));
        this.addChild(market);

        // --- Танк/Военная База (Tank) - Право-нижний ---
        const tank = PIXI.Sprite.from('building_tank');
        tank.anchor.set(0.5);
        tank.x = APP_WIDTH / 2 + 250;
        tank.y = APP_HEIGHT / 2 + 250;
        tank.scale.set(0.65);
        tank.eventMode = 'static';
        tank.cursor = 'pointer';
        tank.on('pointertap', () => console.log('Нажато Tank'));
        this.addChild(tank);

        // TODO: Добавить цифры '1' над зданиями как PIXI.Text или спрайты
    }

    addTopUI() {
        const topBarHeight = 80;
        const topPanel = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, topBarHeight)
            .fill({ color: 0x1A1A1A, alpha: 0.7 }); // Темный полупрозрачный фон
        topPanel.y = 0;
        topPanel.zIndex = 10; // Верхний слой
        this.addChild(topPanel);

        // --- 5 Ресурсов сверху ---
        // Значения для примера
        const resourceData = [
            { alias: ASSETS.icon_res_coin.alias, value: 1500 }, // Монета
            { alias: ASSETS.icon_res_gem.alias, value: 1660 }, // Голубой гем
            { alias: ASSETS.icon_res_gold.alias, value: 1510 }, // Зеленый гем
            { alias: ASSETS.icon_res_energy.alias, value: 1180 }, // Фиолетовый
            { alias: ASSETS.icon_res_fish.alias, value: 22520 }, // Синий кристалл/Рыба
        ];
        
        let startX = 200; 
        const spacing = 100; // Расстояние между центрами иконок
        resourceData.forEach((res, index) => {
             // Используем сдвиг, чтобы 5 иконок уместились в правой части
             this.addResourceDisplay(res.alias, res.value, startX + index * spacing, topBarHeight / 2);
        });
        
        // --- Правые верхние кнопки ---
        // Кнопка "X" (закрытия/выхода)
        const closeButton = PIXI.Sprite.from(ASSETS.icon_close.alias);
        closeButton.anchor.set(0.5);
        closeButton.x = APP_WIDTH - 30; // Крайний правый угол
        closeButton.y = topBarHeight / 2;
        closeButton.scale.set(0.6);
        closeButton.eventMode = 'static';
        closeButton.cursor = 'pointer';
        closeButton.on('pointertap', () => console.log('Нажата кнопка X'));
        topPanel.addChild(closeButton);

        // Кнопка Настроек (или Меню) - settings_icon
        const settingsButton = PIXI.Sprite.from(ASSETS.settings_icon.alias);
        settingsButton.anchor.set(0.5);
        settingsButton.x = APP_WIDTH - 80; // Левее кнопки X
        settingsButton.y = topBarHeight / 2;
        settingsButton.scale.set(0.6);
        settingsButton.eventMode = 'static';
        settingsButton.cursor = 'pointer';
        settingsButton.on('pointertap', () => console.log('Нажата кнопка Настроек'));
        topPanel.addChild(settingsButton);

        // --- Левый верхний блок "Account Power" ---
        const powerPanel = new PIXI.Container();
        powerPanel.x = 20;
        powerPanel.y = topBarHeight / 2; // Центрируем по высоте
        powerPanel.zIndex = 10;
        this.addChild(powerPanel);

        // Фон для блока Power
        const powerBg = new PIXI.Graphics()
            .rect(0, -25, 180, 50) 
            .round(10)
            .fill({ color: 0x1A1A1A, alpha: 0.7 });
        powerPanel.addChild(powerBg);

        const catIcon = PIXI.Sprite.from(ASSETS.icon_power_cat.alias);
        catIcon.anchor.set(0.5);
        catIcon.x = 25;
        catIcon.y = 0;
        catIcon.width = 40;
        catIcon.height = 40;
        powerPanel.addChild(catIcon);

        const powerText = new PIXI.Text('Account Power: 125\nLevel 1', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            lineHeight: 18
        });
        powerText.x = 50;
        powerText.y = -20;
        powerPanel.addChild(powerText);
    }

    addResourceDisplay(iconAlias, value, x, y) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        
        // Фон для ресурса (как на скриншоте)
        const bg = new PIXI.Graphics()
            .rect(-55, -25, 110, 50)
            .round(25)
            .fill({ color: 0x1A1A1A, alpha: 0.7 });
        container.addChild(bg);
        
        const icon = PIXI.Sprite.from(iconAlias);
        icon.anchor.set(0.5); 
        icon.x = -30; // Слева от текста
        icon.scale.set(0.5); // Размер иконки
        container.addChild(icon);

        const text = new PIXI.Text(value.toString(), {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        text.anchor.set(0, 0.5); 
        text.x = -5; // Справа от иконки
        container.addChild(text);
        
        this.addChild(container);
    }

    addBottomPanel() {
        const bottomBarHeight = 100; // Немного уменьшим высоту
        const bottomPanel = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, bottomBarHeight)
            .fill({ color: 0x1A1A1A, alpha: 0.7 });
        bottomPanel.y = APP_HEIGHT - bottomBarHeight; // Внизу экрана
        bottomPanel.zIndex = 10; // Верхний слой
        this.addChild(bottomPanel);

        // У нас 4 кнопки (Build, Train, Upgrade, Map)
        const buttonCount = 4;
        const buttonWidth = APP_WIDTH / buttonCount; 
        const buttonY = bottomBarHeight / 2;
        
        // Размещаем 4 кнопки
        this.createBottomPanelButton(ASSETS.icon_build.alias, 'Build', 0 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, () => console.log('Build'));
        this.createBottomPanelButton(ASSETS.icon_train.alias, 'Train', 1 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, () => console.log('Train'));
        this.createBottomPanelButton(ASSETS.icon_upgrade.alias, 'Upgrade', 2 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, () => console.log('Upgrade'));
        this.createBottomPanelButton(ASSETS.icon_map.alias, 'Map', 3 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, () => console.log('Map'));
    }

    createBottomPanelButton(iconAlias, labelText, x, y, parentContainer, action) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        
        // Фон кнопки (синий прямоугольник со скруглением)
        const buttonBg = new PIXI.Graphics()
            .rect(-70, -35, 140, 70)
            .round(20)
            .fill({ color: 0x3C8CE7, alpha: 0.9 })
            .stroke({ width: 2, color: 0x8AA8C7 });
        container.addChild(buttonBg);
        
        const icon = PIXI.Sprite.from(iconAlias);
        icon.anchor.set(0.5);
        icon.y = -10; // Выше текста
        icon.scale.set(0.5); // Масштабирование иконки
        container.addChild(icon);

        const label = new PIXI.Text(labelText, {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xFFFFFF
        });
        label.anchor.set(0.5);
        label.y = 20; // Под иконкой
        container.addChild(label);

        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointertap', action);
        // Эффект нажатия
        container.on('pointerdown', () => container.scale.set(0.95));
        container.on('pointerup', () => container.scale.set(1.0));
        container.on('pointerout', () => container.scale.set(1.0));

        parentContainer.addChild(container);
    }

    // Вспомогательная функция для создания простой кнопки (для тестов)
    createSimpleButton(text, action, color) {
        const button = new PIXI.Graphics()
            .rect(-120, -30, 240, 60)
            .round(15)
            .fill({ color: color });
        
        const label = new PIXI.Text(text, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0x000000,
            fontWeight: 'bold'
        });
        label.anchor.set(0.5);
        
        const container = new PIXI.Container();
        container.addChild(button, label);
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointertap', action);
        container.on('pointerdown', () => container.scale.set(0.95));
        container.on('pointerup', () => container.scale.set(1.0));
        container.on('pointerout', () => container.scale.set(1.0));
        return container;
    }
}


// --- СЦЕНЫ-ЗАГЛУШКИ (для демонстрации переходов) ---
// Эти сцены показывают, как легко переключаться между экранами.

class CityScene extends BaseScene {
    init() {
        const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x228B22 }); // Зеленый фон
        this.addChild(bg);

        const text = new PIXI.Text('ДОБРО ПОЖАЛОВАТЬ В ГОРОД', {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.anchor.set(0.5);
        text.x = APP_WIDTH / 2;
        text.y = APP_HEIGHT / 2 - 100;
        this.addChild(text);

        const backButton = this.createSimpleButton('Назад в Меню', () => this.manager.changeScene(MainMenuScene), 0xFFD700); // Золотая кнопка
        backButton.x = APP_WIDTH / 2;
        backButton.y = APP_HEIGHT / 2 + 100;
        this.addChild(backButton);
    }
}

class HQScene extends BaseScene {
    init() {
        const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x8B0000 }); // Красный фон
        this.addChild(bg);

        const text = new PIXI.Text('ШТАБ (HQ)', {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 0xFFFFFF,
            align: 'center'
        });
        text.anchor.set(0.5);
        text.x = APP_WIDTH / 2;
        text.y = APP_HEIGHT / 2 - 100;
        this.addChild(text);

        const backButton = this.createSimpleButton('Назад в Меню', () => this.manager.changeScene(MainMenuScene), 0xFFD700);
        backButton.x = APP_WIDTH / 2;
        backButton.y = APP_HEIGHT / 2 + 100;
        this.addChild(backButton);
    }
}


// Запускаем инициализацию при загрузке страницы
window.onload = init;;