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
    
    // ИСПРАВЛЕНИЕ ОШИБКИ 404: Используем 'building_bank.png' как имя файла.
    // ПРИМЕЧАНИЕ: Если вы не переименовали файл в папке 'images', сделайте это сейчас.
    building_bank: { alias: 'building_bank', src: 'images/building_bank.png' }, 
    
    // Лаборатория (используется для Академии)
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
    console.log("Диагностика: init() запущена.");
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
        constructor(manager) {
            super(manager);
            this.activeMenu = null; // Для отслеживания открытого меню
        }

        init() {
            console.log("Диагностика: MainMenuScene.init() запущена.");
            // Настраиваем сцену на отслеживание кликов по всему полю, 
            // чтобы закрывать меню, если кликнуть в пустоту.
            this.eventMode = 'static';
            this.on('pointertap', this.handleMapClick, this);

            this.addBackgroundCover();
            this.addBuildings();
            this.addTopUI();
            this.addBottomPanel();
        }
        
        // Обработчик клика по карте (закрытие меню)
        handleMapClick() {
             if (this.activeMenu) {
                // Если клик не попал на само здание или меню, закрываем меню
                this.closeBuildingMenu();
            }
        }
        
        // ФУНКЦИЯ: Масштабирование фона по принципу "заполнить" (cover)
        addBackgroundCover() {
            const bgSprite = PIXI.Sprite.from('map_background');
            const textureWidth = bgSprite.texture.width;
            const textureHeight = bgSprite.texture.height;
            const scaleX = APP_WIDTH / textureWidth;
            const scaleY = APP_HEIGHT / textureHeight;
            const scale = Math.max(scaleX, scaleY);
            
            bgSprite.scale.set(scale);
            bgSprite.anchor.set(0.5);
            bgSprite.x = APP_WIDTH / 2;
            bgSprite.y = APP_HEIGHT / 2;
            
            this.addChild(bgSprite);
        }

        // --- ФУНКЦИЯ: Отрисовка кнопки-пятиугольника ---
        drawPentagonButton(labelText, color, action) {
            const container = new PIXI.Container();
            const size = 35; // Размер радиуса
            const vertices = [];
            
            // Расчет 5 вершин (начиная с верхней точки - 90 градусов)
            for (let i = 0; i < 5; i++) {
                // Угол в радианах
                const angle = (90 + i * (360 / 5)) * (Math.PI / 180); 
                vertices.push(size * Math.cos(angle), size * Math.sin(angle));
            }

            const pentagon = new PIXI.Graphics()
                .poly(vertices)
                .fill({ color: color, alpha: 1.0 })
                .stroke({ width: 3, color: 0xFFFFFF }); // Белая обводка для стиля
                
            container.addChild(pentagon);
            
            const label = new PIXI.Text(labelText, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xFFFFFF,
                fontWeight: 'bold'
            });
            label.anchor.set(0.5);
            container.addChild(label);
            
            container.eventMode = 'static';
            container.cursor = 'pointer';
            
            // Эффекты нажатия
            container.on('pointertap', (e) => {
                // Останавливаем всплытие, чтобы не закрыть меню сразу же (handleMapClick)
                e.stopPropagation(); 
                action();
                this.closeBuildingMenu(); // Закрываем меню после выбора действия
            });
            container.on('pointerover', () => container.scale.set(1.1));
            container.on('pointerout', () => container.scale.set(1.0));

            return container;
        }

        // --- ФУНКЦИЯ: Показать меню здания ---
        showBuildingMenu(buildingSprite, buildingType, buildingLevel = 1) {
            // Если уже открыто, закрываем
            if (this.activeMenu) {
                this.closeBuildingMenu();
            }

            const menu = new PIXI.Container();
            menu.zIndex = 5; // Поверх зданий, но под верхним UI
            menu.eventMode = 'static'; // Чтобы клики не проваливались на карту

            const levelText = new PIXI.Text(`${buildingType.toUpperCase()} LVL ${buildingLevel}`, {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xFFFFFF,
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: '#000000', 
                dropShadowAlpha: 0.8,
                dropShadowDistance: 1,
            });
            levelText.anchor.set(0.5);
            levelText.y = -65;
            menu.addChild(levelText);


            // 1. Кнопка UPGRADE (Оранжевый)
            const upAction = () => { console.log(`[${buildingType}] Нажата кнопка UP (Улучшение)`); };
            const upButton = this.drawPentagonButton('UP', 0xFF8C00, upAction);
            upButton.x = -45;
            upButton.y = 0;
            menu.addChild(upButton);

            // 2. Кнопка USE (Голубой)
            const useAction = () => {
                console.log(`[${buildingType}] Нажата кнопка USE (Вход)`);
                if (buildingType === 'BANK') {
                    this.manager.changeScene(BankScene);
                } else if (buildingType === 'LAB') {
                    this.manager.changeScene(AcademyScene);
                }
            };
            const useButton = this.drawPentagonButton('USE', 0x3C8CE7, useAction);
            useButton.x = 45;
            useButton.y = 0;
            menu.addChild(useButton);

            // Позиционируем меню прямо под зданием
            menu.x = buildingSprite.x;
            // Учитываем размер здания и ставим меню чуть ниже его центра
            menu.y = buildingSprite.y + buildingSprite.height * buildingSprite.scale.y * 0.6; 
            
            this.activeMenu = menu;
            this.addChild(menu);
        }

        // --- ФУНКЦИЯ: Закрыть меню здания ---
        closeBuildingMenu() {
            if (this.activeMenu) {
                this.activeMenu.destroy({ children: true });
                this.activeMenu = null;
            }
        }

        addBuildings() {
            const SCALE_CENTER = 0.913; 
            const SCALE_BANK = 0.69; 
            const SCALE_NORMAL = 0.345; 
            
            const UP_SHIFT = -50; 
            const HORIZ_OFFSET_TOP = 160; 
            const HORIZ_OFFSET_BOTTOM = 190; 

            // --- Центральное здание (Center) ---
            const center = PIXI.Sprite.from('building_center');
            center.anchor.set(0.5);
            center.x = APP_WIDTH / 2 + 60; 
            center.y = APP_HEIGHT / 2 + 70 + UP_SHIFT; 
            center.scale.set(SCALE_CENTER); 
            center.eventMode = 'static';
            center.cursor = 'pointer';
            center.on('pointertap', () => { 
                this.closeBuildingMenu(); 
                console.log('Нажато Center');
            });
            this.addChild(center);

            // --- Банк (Bank) - Использует новый алиас и правильный путь к файлу building_bank.png ---
            const bank = PIXI.Sprite.from('building_bank'); 
            bank.anchor.set(0.5);
            bank.x = APP_WIDTH / 2 - HORIZ_OFFSET_TOP; 
            bank.y = APP_HEIGHT / 2 - 100 + UP_SHIFT; 
            bank.scale.set(SCALE_BANK); 
            bank.eventMode = 'static';
            bank.cursor = 'pointer';
            bank.on('pointertap', (e) => {
                e.stopPropagation(); 
                this.showBuildingMenu(bank, 'BANK');
            }); 
            this.addChild(bank);

            // --- Лаборатория (Lab) / Академия ---
            const lab = PIXI.Sprite.from('building_lab');
            lab.anchor.set(0.5);
            lab.x = APP_WIDTH / 2 + HORIZ_OFFSET_TOP; 
            lab.y = APP_HEIGHT / 2 - 100 + UP_SHIFT; 
            lab.scale.set(SCALE_NORMAL); 
            lab.eventMode = 'static';
            lab.cursor = 'pointer';
            lab.on('pointertap', (e) => {
                e.stopPropagation(); 
                this.showBuildingMenu(lab, 'LAB');
            }); 
            this.addChild(lab);

            // --- Рынок (Market) ---
            const market = PIXI.Sprite.from('building_market');
            market.anchor.set(0.5);
            market.x = APP_WIDTH / 2 - HORIZ_OFFSET_BOTTOM; 
            market.y = APP_HEIGHT / 2 + 300 + UP_SHIFT; 
            market.scale.set(SCALE_NORMAL); 
            market.eventMode = 'static';
            market.cursor = 'pointer';
            market.on('pointertap', () => {
                this.closeBuildingMenu();
                console.log('Нажато Market');
            });
            this.addChild(market);

            // --- Танк/Военная База (Tank) ---
            const tank = PIXI.Sprite.from('building_tank');
            tank.anchor.set(0.5);
            tank.x = APP_WIDTH / 2 + HORIZ_OFFSET_BOTTOM; 
            tank.y = APP_HEIGHT / 2 + 300 + UP_SHIFT; 
            tank.scale.set(SCALE_NORMAL); 
            tank.eventMode = 'static';
            tank.cursor = 'pointer';
            tank.on('pointertap', () => {
                this.closeBuildingMenu();
                console.log('Нажато Tank');
            });
            this.addChild(tank);
        }

        addTopUI() {
            const PANEL_BG_ALPHA = 0.3; 
            const RESOURCE_BG_ALPHA = 1.0; 

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
                .fill({ color: 0x1A1A1A, alpha: PANEL_BG_ALPHA }); 
            topPanel.y = 0;
            topPanel.zIndex = 10; 
            this.addChild(topPanel);
            
            let startX = 50; 
            const spacing = 100; 
            resourceData.forEach((res, index) => {
                 this.addResourceDisplay(res.alias, res.value, startX + index * spacing, topBarHeight / 2, RESOURCE_BG_ALPHA);
            });
            
            // --- Правый верхний блок "Account Power" ---
            const POWER_PANEL_WIDTH = 200; 
            const ICON_POWER_CAT_SCALE = 1.69; 

            const powerPanel = new PIXI.Container();
            powerPanel.x = APP_WIDTH - POWER_PANEL_WIDTH - 10; 
            powerPanel.y = topBarHeight / 2; 
            powerPanel.zIndex = 10;
            this.addChild(powerPanel);

            const powerBg = new PIXI.Graphics()
                .roundRect(0, -25, POWER_PANEL_WIDTH, 50, 10) 
                .fill({ color: 0x1A1A1A, alpha: PANEL_BG_ALPHA }); 
            powerPanel.addChild(powerBg);

            const catIcon = PIXI.Sprite.from(ASSETS.icon_power_cat.alias);
            catIcon.anchor.set(0.5);
            catIcon.x = 25;
            catIcon.y = 0;
            catIcon.width = 40 * ICON_POWER_CAT_SCALE; 
            catIcon.height = 40 * ICON_POWER_CAT_SCALE;
            powerPanel.addChild(catIcon);

            const powerText = new PIXI.Text('Account Power: 125\nLevel 1', {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xFFFFFF,
                lineHeight: 18
            });
            powerText.x = 55 + (ICON_POWER_CAT_SCALE - 1.0) * 5; 
            powerText.y = -20;
            powerPanel.addChild(powerText);
            
            // --- Кнопка Настроек (Шестеренка) ---
            const ICON_SETTINGS_SCALE = 0.05 * 1.5; 
            
            const settingsButton = PIXI.Sprite.from(ASSETS.settings_icon.alias);
            settingsButton.anchor.set(0.5);
            settingsButton.x = APP_WIDTH - 15; 
            settingsButton.y = 80 + 30; 
            settingsButton.scale.set(ICON_SETTINGS_SCALE); 
            settingsButton.eventMode = 'static';
            settingsButton.cursor = 'pointer';
            settingsButton.on('pointertap', () => {
                this.closeBuildingMenu();
                console.log('Нажата кнопка Настроек');
            });
            this.addChild(settingsButton); 
        }

        addResourceDisplay(iconAlias, value, x, y, alpha) {
            const RESOURCE_ICON_SCALE = 0.06; 
            const container = new PIXI.Container();
            container.x = x;
            container.y = y;
            
            const BG_WIDTH = 115.5; 
            const BG_HEIGHT = 52.5;
            const BG_RADIUS = 25;

            // Фон ресурса с полной непрозрачностью
            const bg = new PIXI.Graphics()
                .roundRect(-BG_WIDTH/2, -BG_HEIGHT/2, BG_WIDTH, BG_HEIGHT, BG_RADIUS) 
                .fill({ color: 0x1A1A1A, alpha: alpha }); 
            container.addChild(bg);
            
            const icon = PIXI.Sprite.from(iconAlias);
            icon.anchor.set(0.5); 
            icon.x = -BG_WIDTH / 2 + 15; 
            icon.scale.set(RESOURCE_ICON_SCALE); 
            container.addChild(icon);

            // Стиль текста с тенью для яркости
            const textStyle = {
                fontFamily: 'Arial',
                fontSize: 22, 
                fill: 0xFFFFFF, 
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowColor: '#000000', 
                dropShadowAlpha: 0.8,
                dropShadowDistance: 2,
                dropShadowBlur: 1
            };

            const text = new PIXI.Text(value.toString(), textStyle);
            text.anchor.set(0, 0.5); 
            text.x = -BG_WIDTH / 2 + 40; 
            container.addChild(text);
            
            this.addChild(container);
        }

        addBottomPanel() {
            const BG_ALPHA = 0.3; 
            
            const bottomBarHeight = 100; 
            const bottomPanel = new PIXI.Graphics()
                .rect(0, 0, APP_WIDTH, bottomBarHeight)
                .fill({ color: 0x1A1A1A, alpha: BG_ALPHA }); 
            bottomPanel.y = APP_HEIGHT - bottomBarHeight; 
            bottomPanel.zIndex = 10; 
            this.addChild(bottomPanel);
            
            const ICON_BOTTOM_SCALE = 0.125; 

            const buttonCount = 4;
            const buttonWidth = APP_WIDTH / buttonCount; 
            const buttonY = bottomBarHeight / 2;
            
            this.createBottomPanelButton(ASSETS.icon_build.alias, 'Build', 0 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => { this.closeBuildingMenu(); console.log('Build pressed'); });
            this.createBottomPanelButton(ASSETS.icon_train.alias, 'Train', 1 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => { this.closeBuildingMenu(); console.log('Train (Barracks) pressed'); }); 
            this.createBottomPanelButton(ASSETS.icon_upgrade.alias, 'Upgrade', 2 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => { this.closeBuildingMenu(); console.log('Upgrade pressed'); });
            this.createBottomPanelButton(ASSETS.icon_map.alias, 'Map', 3 * buttonWidth + buttonWidth / 2, buttonY, bottomPanel, ICON_BOTTOM_SCALE, () => { this.closeBuildingMenu(); console.log('Map pressed'); });
        }

        createBottomPanelButton(iconAlias, labelText, x, y, parentContainer, iconScale, action) {
            const container = new PIXI.Container();
            container.x = x;
            container.y = y;
            
            const buttonBg = new PIXI.Graphics()
                .roundRect(-70, -35, 140, 70, 20) 
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
            container.on('pointerdown', () => container.scale.set(0.95));
            container.on('pointerup', () => container.scale.set(1.0));
            container.on('pointerout', () => container.scale.set(1.0));

            parentContainer.addChild(container);
        }
    }


    // --- СЦЕНЫ-ЗАГЛУШКИ ---
    
    // Сцена: Банк
    class BankScene extends BaseScene {
        init() {
            const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x8B0000 }); 
            this.addChild(bg);

            const text = new PIXI.Text('БАНК (BANK) - УРОВЕНЬ 1', {
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

    // Сцена: Академия (бывшая Лаборатория)
    class AcademyScene extends BaseScene {
        init() {
            const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x00BFFF }); 
            this.addChild(bg);

            const text = new PIXI.Text('АКАДЕМИЯ (ACADEMY) - УРОВЕНЬ 1', {
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


    // 1. Создание приложения PIXI
    console.log("Диагностика: Инициализация PIXI приложения.");
    app = new PIXI.Application();

    await app.init({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        background: '#000000',
        resolution: Math.max(window.devicePixelRatio, 1), 
        autoDensity: true,
    });
    
    // Добавление созданного PIXI холста внутрь DIV
    const container = document.getElementById('pixi-container');
    if (container) {
        container.innerHTML = ''; 
        container.appendChild(app.canvas);
        console.log("Диагностика: Холст PIXI добавлен.");
    }
    
    // Ресайз для адаптивности 
    window.addEventListener('resize', resize);
    resize();

    // 2. Загрузка всех ресурсов
    try {
        console.log("Диагностика: Начало загрузки ресурсов.");
        const assetList = Object.values(ASSETS);
        await PIXI.Assets.load(assetList); 
        console.log("Диагностика: Ресурсы успешно загружены. Запуск сцены.");
        
        // 3. Инициализация менеджера сцены и запуск первой сцены
        SceneManager = new SceneController(app);
        SceneManager.changeScene(MainMenuScene); 
        
    } catch (error) {
        // Усиленная диагностика ошибки загрузки ресурсов
        console.error("ОШИБКА КРИТИЧЕСКАЯ: Не удалось загрузить ресурсы! Проверьте, что ВСЕ 12 изображений существуют в папке 'images' с правильными именами. Подробности:", error.message || error);
        
        if (app && app.stage) {
            const errorText = new PIXI.Text('КРИТИЧЕСКАЯ ОШИБКА: Ресурсы не загружены. См. консоль.', { 
                fill: 0xFF0000, 
                fontSize: 35,
                fontWeight: 'bold'
            });
            errorText.anchor.set(0.5);
            errorText.x = APP_WIDTH / 2;
            errorText.y = APP_HEIGHT / 2;
            app.stage.addChild(errorText);
        } else {
            console.error("Ошибка: приложение PIXI не было инициализировано для отображения ошибки.");
        }
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