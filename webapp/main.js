// --- КОНФИГУРАЦИЯ РЕСУРСОВ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---

// Размеры приложения
const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

// Глобальные переменные для доступа после инициализации
let app;
let SceneManager; 

// 1. Правильное указание путей к ресурсам.
const ASSETS = {
    map_background: { alias: 'map_background', src: 'images/map_background.png' }, 
    
    // Здания 
    building_center: { alias: 'building_center', src: 'images/building_center.png' },
    building_hq: { alias: 'building_hq', src: 'images/building_hq.png' }, 
    building_lab: { alias: 'building_lab', src: 'images/building_lab.png' }, 
    building_market: { alias: 'building_market', src: 'images/building_market.png' }, 
    building_tank: { alias: 'building_tank', src: 'images/building_tank.png' }, 

    // Иконки UI и ресурсов 
    icon_power_cat: { alias: 'icon_power_cat', src: 'images/heroes_icon.png' }, 
    settings_icon: { alias: 'settings_icon', src: 'images/settings_icon.png' }, 

    // Иконки ресурсов (5 иконок)
    icon_res_coin: { alias: 'icon_res_coin', src: 'images/icon_res_coin.png' },
    icon_res_gem: { alias: 'icon_res_gem', src: 'images/icon_res_gem.png' },
    icon_res_gold: { alias: 'icon_res_gold', src: 'images/icon_res_gold.png' },
    icon_res_energy: { alias: 'icon_energy', src: 'images/icon_res_energy.png' },
    icon_res_fish: { alias: 'icon_fish', src: 'images/icon_res_fish.png' }, 

    // Иконки нижней панели
    icon_build: { alias: 'icon_build', src: 'images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'images/icon_map.png' }, 
};

// --- ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ, ЗАПУСКАЕМАЯ ПОСЛЕ window.onload ---
async function init() {
    // Аварийная проверка на случай, если PIXI все еще не загружен
    if (typeof PIXI === 'undefined') {
        console.error("КРИТИЧЕСКАЯ ОШИБКА: Объект PIXI не определен.");
        const container = document.getElementById('pixi-container');
        if (container) {
            container.innerHTML = '<h1 style="color: red; text-align: center;">Ошибка: PIXI не загружен.</h1>';
        }
        return;
    }
    
    // =========================================================================
    // ================== ОПРЕДЕЛЕНИЕ КЛАССОВ PIXI ВНУТРИ INIT =================
    // =========================================================================

    // Базовый класс для всех сцен
    class BaseScene extends PIXI.Container {
        constructor(manager) {
            super();
            this.manager = manager;
            this.sortableChildren = true; 
            this.init();
        }
        
        init() {}
        
        // Вспомогательная функция для создания простой кнопки
        createSimpleButton(text, action, color) {
            // Используем roundRect() для скругленного прямоугольника
            const button = new PIXI.Graphics()
                .roundRect(-120, -30, 240, 60, 15) // x, y, width, height, radius
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

    // --- МЕНЕДЖЕР СЦЕН (SCENE CONTROLLER) ---
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
                // Анимация перехода использует ticker PIXI для плавности
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

    // --- СЦЕНА: ГЛАВНОЕ МЕНЮ (MainMenuScene) ---
    class MainMenuScene extends BaseScene {
        init() {
            // 1. Фон - Реализована логика масштабирования по принципу "cover"
            this.addBackgroundCover();

            // 2. Здания
            this.addBuildings();

            // 3. Верхний UI 
            this.addTopUI();

            // 4. Нижняя панель 
            this.addBottomPanel();
        }
        
        // ФУНКЦИЯ: Масштабирование фона по принципу "заполнить" (cover)
        addBackgroundCover() {
            const bgSprite = PIXI.Sprite.from('map_background');
            
            // Получаем исходные размеры текстуры
            const textureWidth = bgSprite.texture.width;
            const textureHeight = bgSprite.texture.height;
            
            // Определяем масштаб, чтобы покрыть всю область (APP_WIDTH x APP_HEIGHT)
            // Берем больший из двух коэффициентов масштабирования
            const scaleX = APP_WIDTH / textureWidth;
            const scaleY = APP_HEIGHT / textureHeight;
            const scale = Math.max(scaleX, scaleY);
            
            // Применяем масштаб
            bgSprite.scale.set(scale);
            
            // Центрируем спрайт
            bgSprite.anchor.set(0.5);
            bgSprite.x = APP_WIDTH / 2;
            bgSprite.y = APP_HEIGHT / 2;
            
            this.addChild(bgSprite);
        }


        addBuildings() {
            // Единый масштаб для всех зданий для удобства
            const BASE_SCALE = 0.15; // Текущий маленький масштаб
            
            // --- Центральное здание (Center) ---
            const center = PIXI.Sprite.from('building_center');
            center.anchor.set(0.5);
            center.x = APP_WIDTH / 2;
            center.y = APP_HEIGHT / 2 + 100; // Немного сдвигаем вниз
            center.scale.set(BASE_SCALE * 1.2); // Центр чуть крупнее
            center.eventMode = 'static';
            center.cursor = 'pointer';
            center.on('pointertap', () => console.log('Нажато Center'));
            this.addChild(center);

            // --- Штаб (HQ) - Лево-верхний ---
            const hq = PIXI.Sprite.from('building_hq');
            hq.anchor.set(0.5);
            hq.x = APP_WIDTH / 2 - 200;
            hq.y = APP_HEIGHT / 2 - 100;
            hq.scale.set(BASE_SCALE);
            hq.eventMode = 'static';
            hq.cursor = 'pointer';
            hq.on('pointertap', () => this.manager.changeScene(HQScene)); // Переход в Штаб
            this.addChild(hq);

            // --- Лаборатория (Lab) - Право-верхний ---
            const lab = PIXI.Sprite.from('building_lab');
            lab.anchor.set(0.5);
            lab.x = APP_WIDTH / 2 + 200;
            lab.y = APP_HEIGHT / 2 - 100;
            lab.scale.set(BASE_SCALE);
            lab.eventMode = 'static';
            lab.cursor = 'pointer';
            lab.on('pointertap', () => this.manager.changeScene(LabScene)); // Переход в Лабораторию
            this.addChild(lab);

            // --- Рынок (Market) - Лево-нижний ---
            const market = PIXI.Sprite.from('building_market');
            market.anchor.set(0.5);
            market.x = APP_WIDTH / 2 - 250;
            market.y = APP_HEIGHT / 2 + 300;
            market.scale.set(BASE_SCALE);
            market.eventMode = 'static';
            market.cursor = 'pointer';
            market.on('pointertap', () => console.log('Нажато Market'));
            this.addChild(market);

            // --- Танк/Военная База (Tank) - Право-нижний ---
            const tank = PIXI.Sprite.from('building_tank');
            tank.anchor.set(0.5);
            tank.x = APP_WIDTH / 2 + 250;
            tank.y = APP_HEIGHT / 2 + 300;
            tank.scale.set(BASE_SCALE);
            tank.eventMode = 'static';
            tank.cursor = 'pointer';
            tank.on('pointertap', () => console.log('Нажато Tank'));
            this.addChild(tank);
        }

        addTopUI() {
            const resourceData = [
                { alias: ASSETS.icon_res_coin.alias, value: 1500 }, 
                { alias: ASSETS.icon_res_gem.alias, value: 1660 }, 
                { alias: ASSETS.icon_res_gold.alias, value: 1510 }, 
                { alias: ASSETS.icon_res_energy.alias, value: 1180 }, 
                { alias: ASSETS.icon_res_fish.alias, value: 22520 }, 
            ];
            
            const topBarHeight = 80;
            const topPanel = new PIXI.Graphics()
                .rect(0, 0, APP_WIDTH, topBarHeight)
                .fill({ color: 0x1A1A1A, alpha: 0.7 });
            topPanel.y = 0;
            topPanel.zIndex = 10; 
            this.addChild(topPanel);
            
            // Уменьшаем отступ, чтобы вместить все 5 ресурсов
            let startX = 200; 
            const spacing = 100; 
            resourceData.forEach((res, index) => {
                 this.addResourceDisplay(res.alias, res.value, startX + index * spacing, topBarHeight / 2);
            });
            
            // --- Правые верхние кнопки (Настройки) ---
            
            // Масштаб для иконки "Настройки" (0.05)
            const ICON_SETTINGS_SCALE = 0.05; 
            
            // Иконка "Сити" удалена
            const settingsButton = PIXI.Sprite.from(ASSETS.settings_icon.alias);
            settingsButton.anchor.set(0.5);
            settingsButton.x = APP_WIDTH - 40; 
            settingsButton.y = topBarHeight / 2;
            settingsButton.scale.set(ICON_SETTINGS_SCALE); 
            settingsButton.eventMode = 'static';
            settingsButton.cursor = 'pointer';
            settingsButton.on('pointertap', () => console.log('Нажата кнопка Настроек'));
            topPanel.addChild(settingsButton);

            // --- Левый верхний блок "Account Power" ---
            const powerPanel = new PIXI.Container();
            powerPanel.x = 20;
            powerPanel.y = topBarHeight / 2; 
            powerPanel.zIndex = 10;
            this.addChild(powerPanel);

            // Фон для блока Power
            const powerBg = new PIXI.Graphics()
                .roundRect(0, -25, 180, 50, 10) // x, y, width, height, radius
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
            // Масштаб для иконок ресурсов (0.04)
            const RESOURCE_ICON_SCALE = 0.04; 

            const container = new PIXI.Container();
            container.x = x;
            container.y = y;
            
            // Фон для ресурса
            const bg = new PIXI.Graphics()
                .roundRect(-55, -25, 110, 50, 25) // x, y, width, height, radius
                .fill({ color: 0x1A1A1A, alpha: 0.7 });
            container.addChild(bg);
            
            const icon = PIXI.Sprite.from(iconAlias);
            icon.anchor.set(0.5); 
            icon.x = -30; 
            // Применяем новый масштаб
            icon.scale.set(RESOURCE_ICON_SCALE); 
            container.addChild(icon);

            const text = new PIXI.Text(value.toString(), {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF,
                fontWeight: 'bold'
            });
            text.anchor.set(0, 0.5); 
            text.x = -5; 
            container.addChild(text);
            
            this.addChild(container);
        }

        addBottomPanel() {
            const bottomBarHeight = 100; 
            const bottomPanel = new PIXI.Graphics()
                .rect(0, 0, APP_WIDTH, bottomBarHeight)
                .fill({ color: 0x1A1A1A, alpha: 0.7 });
            bottomPanel.y = APP_HEIGHT - bottomBarHeight; 
            bottomPanel.zIndex = 10; 
            this.addChild(bottomPanel);
            
            // Масштаб для иконок нижней панели (0.125)
            const ICON_BOTTOM_SCALE = 0.125; 

            const buttonCount = 4;
            const buttonWidth = APP_WIDTH / buttonCount; 
            const buttonY = bottomBarHeight / 2;
            
            this.createBottomPanelButton(ASSETS.icon_build.alias, 'Build', 0 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => console.log('Build button pressed'));
            this.createBottomPanelButton(ASSETS.icon_train.alias, 'Train', 1 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => console.log('Train (Barracks) button pressed')); 
            this.createBottomPanelButton(ASSETS.icon_upgrade.alias, 'Upgrade', 2 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => console.log('Upgrade button pressed'));
            this.createBottomPanelButton(ASSETS.icon_map.alias, 'Map', 3 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => console.log('Map button pressed'));
        }

        createBottomPanelButton(iconAlias, labelText, x, y, parentContainer, iconScale, action) {
            const container = new PIXI.Container();
            container.x = x;
            container.y = y;
            
            // Фон кнопки
            const buttonBg = new PIXI.Graphics()
                .roundRect(-70, -35, 140, 70, 20) // x, y, width, height, radius
                .fill({ color: 0x3C8CE7, alpha: 0.9 })
                .stroke({ width: 2, color: 0x8AA8C7 });
            container.addChild(buttonBg);
            
            const icon = PIXI.Sprite.from(iconAlias);
            icon.anchor.set(0.5);
            icon.y = -10; 
            icon.scale.set(iconScale); 
            container.addChild(icon);

            const label = new PIXI.Text(labelText, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xFFFFFF
            });
            label.anchor.set(0.5);
            label.y = 20; 
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
    }


    // --- СЦЕНЫ-ЗАГЛУШКИ (Оставлены для сохранения структуры) ---

    class CityScene extends BaseScene {
        init() {
            const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x228B22 }); 
            this.addChild(bg);

            const text = new PIXI.Text('ДОБРО ПОЖАЛОВАТЬ В ГОРОД (ЗАГЛУШКА)', {
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

    class HQScene extends BaseScene {
        init() {
            const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x8B0000 }); 
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

    class LabScene extends BaseScene {
        init() {
            const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x00BFFF }); 
            this.addChild(bg);

            const text = new PIXI.Text('ЛАБОРАТОРИЯ (LAB)', {
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


    // 1. Создание приложения PIXI
    app = new PIXI.Application();

    await app.init({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        background: '#000000',
        // PIXI сам создаст canvas
        resolution: Math.max(window.devicePixelRatio, 1), 
        autoDensity: true,
    });
    
    // ИСПРАВЛЕНИЕ: Добавление созданного PIXI холста внутрь DIV
    const container = document.getElementById('pixi-container');
    if (container) {
        // Удаляем временный текст "Загрузка игры..."
        container.innerHTML = ''; 
        // Добавляем созданный PIXI холст
        container.appendChild(app.canvas);
    }
    
    // Ресайз для адаптивности 
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
        SceneManager.changeScene(MainMenuScene); 
        
    } catch (error) {
        console.error("ОШИБКА КРИТИЧЕСКАЯ: Не удалось загрузить ресурсы! Проверьте, что ВСЕ 12 изображений существуют в папке 'images'.", error);
        
        // Отображаем красный текст ошибки
        const errorText = new PIXI.Text('ОШИБКА: Ресурсы не загружены. Проверьте консоль.', { fill: 0xFF0000, fontSize: 30 });
        errorText.anchor.set(0.5);
        errorText.x = APP_WIDTH / 2;
        errorText.y = APP_HEIGHT / 2;
        app.stage.addChild(errorText);
    }
}

// Функция для адаптивности (масштабирование)
function resize() {
    if (!app || !app.canvas) return;
    
    const parent = app.canvas.parentNode;
    
    if (!parent || parent.nodeType !== 1) return; 

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

// Запускаем инициализацию при загрузке страницы
window.onload = init;