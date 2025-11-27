// --- КОНФИГУРАЦИЯ РЕСУРСОВ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---

// Размеры приложения
const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

// Глобальные переменные для доступа после инициализации
let app;
let SceneManager; 

// --- СТРУКТУРА ДАННЫХ ЮНИТОВ ---
const UNIT_DATA = {
    // Время изменено для более быстрого тестирования
    TraderCat: {
        type: 'TraderCat',
        icon: 'icon_res_coin', 
        T1: { name: 'Apprentice Trader T1', cost: { coin: 100, fish: 50 }, time: 1, power: 10 }, 
        T2: { name: 'Journeyman Trader T2', cost: { coin: 500, fish: 250 }, time: 3, power: 50 }, 
        T3: { name: 'Master Trader T3', cost: { coin: 2500, fish: 1250 }, time: 10, power: 250 }, 
        T4: { name: 'Grandmaster Trader T4', cost: { coin: 10000, fish: 5000 }, time: 30, power: 1000 }, 
    },
    ScoutCat: {
        type: 'ScoutCat',
        icon: 'icon_res_energy',
        T1: { name: 'Prowler Scout T1', cost: { fish: 150, energy: 20 }, time: 2, power: 15 }, 
        T2: { name: 'Tracker Scout T2', cost: { fish: 750, energy: 100 }, time: 4, power: 75 }, 
        T3: { name: 'Phantom Scout T3', cost: { fish: 3750, energy: 500 }, time: 15, power: 375 }, 
        T4: { name: 'Ghost Scout T4', cost: { fish: 15000, energy: 2000 }, time: 45, power: 1500 }, 
    },
    DefenderCat: {
        type: 'DefenderCat',
        icon: 'icon_res_gold',
        T1: { name: 'Guard Defender T1', cost: { gold: 50, fish: 100 }, time: 1, power: 12 }, 
        T2: { name: 'Sentinel Defender T2', cost: { gold: 250, fish: 500 }, time: 3, power: 60 }, 
        T3: { name: 'Fortress Defender T3', cost: { gold: 1250, fish: 2500 }, time: 12, power: 300 }, 
        T4: { name: 'Titan Defender T4', cost: { gold: 5000, fish: 10000 }, time: 36, power: 1200 }, 
    },
    AttackerCat: {
        type: 'AttackerCat',
        icon: 'icon_res_gem',
        T1: { name: 'Fighter Attacker T1', cost: { gem: 10, fish: 100 }, time: 2, power: 14 }, 
        T2: { name: 'Warrior Attacker T2', cost: { gem: 50, fish: 500 }, time: 4, power: 70 }, 
        T3: { name: 'Conqueror Attacker T3', cost: { gem: 250, fish: 2500 }, time: 18, power: 350 }, 
        T4: { name: 'Warlord Attacker T4', cost: { gem: 1000, fish: 10000 }, time: 54, power: 1400 }, 
    },
};

// --- ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ ---
let GAME_STATE = {
    resources: {
        coin: 15000, 
        gem: 16600,
        gold: 15100,
        energy: 11800,
        fish: 22520,
    },
    units: {
        TraderCat: 0,
        ScoutCat: 0,
        DefenderCat: 0,
        AttackerCat: 0,
    },
    // Очередь строительства
    buildQueue: [], 
    totalPower: 0, 
    buildings: {
        BANK: { level: 1 },
        ACADEMY: { level: 1 },
    }
};

// --- РЕСУРСЫ ---
const ASSETS = {
    map_background: { alias: 'map_background', src: 'images/map_background.png' }, 
    fon_academy: { alias: 'fon_academy', src: 'images/fon_academy.png' }, 
    
    // Здания 
    building_center: { alias: 'building_center', src: 'images/building_center.png' },
    building_bank: { alias: 'building_bank', src: 'images/building_bank.png' }, 
    building_lab: { alias: 'building_lab', src: 'images/building_lab.png' }, 
    building_market: { alias: 'building_market', src: 'images/building_market.png' }, 
    building_tank: { alias: 'building_tank', src: 'images/building_tank.png' }, 

    // Иконки UI и ресурсов 
    icon_power_cat: { alias: 'icon_power_cat', src: 'images/heroes_icon.png' }, 
    settings_icon: { alias: 'settings_icon', src: 'images/settings_icon.png' }, 

    // Иконки ресурсов
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

// =========================================================================
// ================== ОПРЕДЕЛЕНИЕ КЛАССОВ PIXI =================
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
    
    // --- Общая вспомогательная функция для создания кнопок ---
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
        
        const originalScale = 1.0;
        const clickScale = 0.95;
        const hoverScale = 1.05; 
        
        container.on('pointertap', action);
        container.on('pointerdown', () => container.scale.set(clickScale));
        container.on('pointerup', () => container.scale.set(hoverScale)); 
        container.on('pointerover', () => container.scale.set(hoverScale));
        container.on('pointerout', () => container.scale.set(originalScale));
        
        return container;
    }
    
    // Вспомогательная функция для создания масштабируемых кнопок (для Академии)
    createScaledButton(text, action, color, baseScale) {
         const btn = this.createSimpleButton(text, action, color);
         btn.scale.set(baseScale);
         
         const clickScale = baseScale * 0.95;
         const hoverScale = baseScale * 1.05;
         
         btn.removeAllListeners();
         btn.eventMode = 'static';
         btn.cursor = 'pointer';
         btn.on('pointertap', action);

         btn.on('pointerdown', () => btn.scale.set(clickScale));
         btn.on('pointerup', () => btn.scale.set(hoverScale));
         btn.on('pointerover', () => btn.scale.set(hoverScale));
         btn.on('pointerout', () => btn.scale.set(baseScale));
         
         return btn;
    }

    updateTotalPower() {
        let total = 0;
        // Расчет общей мощи на основе юнитов T1 (пока)
        for (const typeKey in GAME_STATE.units) {
            const unitCount = GAME_STATE.units[typeKey];
            const unitPower = UNIT_DATA[typeKey]?.T1?.power || 0;
            total += unitCount * unitPower;
        }
        GAME_STATE.totalPower = total; 
        
        // Обновление UI, если возможно
        if (SceneManager && SceneManager.currentScene) {
            SceneManager.currentScene.updateTopUI();
        }
    }
    
    // --- ПЕРЕМЕЩЕННАЯ ЛОГИКА UI РЕСУРСОВ ---

    // Вспомогательная функция для отображения одного ресурса
    addResourceDisplay(iconAlias, value, x, y, alpha) {
        const RESOURCE_ICON_SCALE = 0.06; 
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
        // Помечаем элемент, чтобы его можно было легко удалить при обновлении
        container.isTopUIElement = true; 
        
        const BG_WIDTH = 115.5; 
        const BG_HEIGHT = 52.5;
        const BG_RADIUS = 25;

        const bg = new PIXI.Graphics()
            .roundRect(-BG_WIDTH/2, -BG_HEIGHT/2, BG_WIDTH, BG_HEIGHT, BG_RADIUS) 
            .fill({ color: 0x1A1A1A, alpha: alpha }); 
        container.addChild(bg);
        
        const icon = PIXI.Sprite.from(iconAlias);
        icon.anchor.set(0.5); 
        icon.x = -BG_WIDTH / 2 + 15; 
        icon.scale.set(RESOURCE_ICON_SCALE); 
        container.addChild(icon);

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

        const text = new PIXI.Text(value.toLocaleString(), textStyle);
        text.anchor.set(0, 0.5); 
        text.x = -BG_WIDTH / 2 + 40; 
        container.addChild(text);
        
        this.addChild(container);
        return container; 
    }
    
    // Основная логика отрисовки всей верхней панели UI
    addTopUIElements() {
        const PANEL_BG_ALPHA = 0.3; 
        const RESOURCE_BG_ALPHA = 1.0; 

        // 1. Resources Data
        const resourceData = [
            { alias: ASSETS.icon_res_coin.alias, value: GAME_STATE.resources.coin }, 
            { alias: ASSETS.icon_res_gem.alias, value: GAME_STATE.resources.gem }, 
            { alias: ASSETS.icon_res_gold.alias, value: GAME_STATE.resources.gold }, 
            { alias: ASSETS.icon_res_energy.alias, value: GAME_STATE.resources.energy }, 
            { alias: ASSETS.icon_res_fish.alias, value: GAME_STATE.resources.fish }, 
        ];
        
        // 2. Background Panel
        const topBarHeight = 80;
        const topPanel = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, topBarHeight)
            .fill({ color: 0x1A1A1A, alpha: PANEL_BG_ALPHA }); 
        topPanel.y = 0;
        topPanel.zIndex = 10; 
        topPanel.isTopUIElement = true; // Помечаем для обновления
        this.addChild(topPanel);
        
        // 3. Resource Icons
        let startX = 50; 
        const spacing = 100; 
        resourceData.forEach((res, index) => {
             // Используем унаследованный (или собственный) addResourceDisplay
             this.addResourceDisplay(res.alias, res.value, startX + index * spacing, topBarHeight / 2, RESOURCE_BG_ALPHA);
        });
        
        // 4. Power Panel
        const POWER_PANEL_WIDTH = 200; 
        const ICON_POWER_CAT_SCALE = 1.69; 

        const powerPanel = new PIXI.Container();
        powerPanel.x = APP_WIDTH - POWER_PANEL_WIDTH - 10; 
        powerPanel.y = topBarHeight / 2; 
        powerPanel.zIndex = 10;
        powerPanel.isTopUIElement = true; 
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

        const powerText = new PIXI.Text(`Мощь: ${GAME_STATE.totalPower.toLocaleString()}\nУровень: ${GAME_STATE.buildings.ACADEMY.level}`, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            lineHeight: 18
        });
        powerText.x = 55 + (ICON_POWER_CAT_SCALE - 1.0) * 5; 
        powerText.y = -20;
        powerPanel.addChild(powerText);
        
        // 5. Settings Button
        const ICON_SETTINGS_SCALE = 0.05 * 1.5; 
        
        const settingsButton = PIXI.Sprite.from(ASSETS.settings_icon.alias);
        settingsButton.anchor.set(0.5);
        settingsButton.x = APP_WIDTH - 15; 
        settingsButton.y = 80 + 30; 
        settingsButton.scale.set(ICON_SETTINGS_SCALE); 
        settingsButton.eventMode = 'static';
        settingsButton.cursor = 'pointer';
        settingsButton.isTopUIElement = true;
        settingsButton.on('pointertap', () => {
            // Безопасный вызов closeBuildingMenu, если текущая сцена поддерживает его
            if (this.manager.currentScene instanceof MainMenuScene) {
                this.manager.currentScene.closeBuildingMenu();
            }
            console.log('Нажата кнопка Настроек');
        });
        this.addChild(settingsButton); 
    }
    
    // Функция для очистки и перерисовки верхнего UI
    updateTopUI() {
         // Удаляем все элементы, помеченные как isTopUIElement
         this.children
            .filter(child => child.isTopUIElement)
            .forEach(child => child.destroy({ children: true }));
         
         // Перерисовываем
         this.addTopUIElements();
    }
    
    // --- Общая функция для фона ---
    addBackgroundCover(alias = 'map_background') { 
        const bgSprite = PIXI.Sprite.from(alias);
        const textureWidth = bgSprite.texture.width;
        const textureHeight = bgSprite.texture.height;
        const scaleX = APP_WIDTH / textureWidth;
        const scaleY = APP_HEIGHT / textureHeight;
        const scale = Math.max(scaleX, scaleY);
        
        bgSprite.scale.set(scale);
        bgSprite.anchor.set(0.5);
        bgSprite.x = APP_WIDTH / 2;
        bgSprite.y = APP_HEIGHT / 2;
        bgSprite.zIndex = -1; 
        
        this.addChild(bgSprite);
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

        const duration = 300; 
        
        // Плавный переход
        await this.startTransition('fade-out', duration);

        if (this.currentScene) {
            // Очищаем старую сцену
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

            this.transitionOverlay.eventMode = 'static'; 
            this.transitionOverlay.cursor = 'default';
            
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
                // deltaTime - время, прошедшее с последнего кадра, в миллисекундах. 
                // Преобразование в "единицы" для независимости от FPS.
                elapsed += ticker.deltaTime; 
                const progress = Math.min(elapsed / (duration * (app.ticker.FPS / 1000)), 1); 
                
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
        this.activeMenu = null;
        this.updateTotalPower(); 
    }

    init() {
        this.eventMode = 'static';
        this.on('pointertap', this.handleMapClick, this);

        this.addBackgroundCover(); 
        
        this.addBuildings();
        this.addTopUIElements(); // Используем унаследованный метод
        this.addBottomPanel();
    }
    
    // Упрощенный метод, который вызывает базовый для обновления
    updateTopUI() {
         super.updateTopUI();
    }

    handleMapClick() {
         if (this.activeMenu) {
            this.closeBuildingMenu();
        }
    }
    
    drawPentagonButton(labelText, color, action) {
         const container = new PIXI.Container();
         const size = 35; 
         const vertices = [];
        
         for (let i = 0; i < 5; i++) {
             const angle = (90 + i * (360 / 5)) * (Math.PI / 180); 
             vertices.push(size * Math.cos(angle), size * Math.sin(angle));
         }

         const pentagon = new PIXI.Graphics()
             .poly(vertices)
             .fill({ color: color, alpha: 1.0 })
             .stroke({ width: 3, color: 0xFFFFFF }); 
            
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
        
         container.on('pointertap', (e) => {
             e.stopPropagation(); 
             action();
             this.closeBuildingMenu(); 
         });
         container.on('pointerover', () => container.scale.set(1.1));
         container.on('pointerout', () => container.scale.set(1.0));

         return container;
    }

    showBuildingMenu(buildingSprite, buildingType) {
        if (this.activeMenu) {
            this.closeBuildingMenu();
        }
        
        const level = GAME_STATE.buildings[buildingType].level;

        const menu = new PIXI.Container();
        menu.zIndex = 5; 
        menu.eventMode = 'static'; 

        const levelText = new PIXI.Text(`${buildingType.toUpperCase()} LVL ${level}`, {
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
        const upAction = () => { 
            console.log(`[${buildingType}] Нажата кнопка UP (Улучшение)`);
        };
        const upButton = this.drawPentagonButton('UP', 0xFF8C00, upAction);
        upButton.x = -45;
        upButton.y = 0;
        menu.addChild(upButton);

        // 2. Кнопка USE (Голубой)
        const useAction = () => {
            console.log(`[${buildingType}] Нажата кнопка USE (Вход)`);
            if (buildingType === 'BANK') {
                this.manager.changeScene(BankScene);
            } else if (buildingType === 'ACADEMY') {
                this.manager.changeScene(AcademyScene);
            }
        };
        const useButton = this.drawPentagonButton('USE', 0x3C8CE7, useAction);
        useButton.x = 45;
        useButton.y = 0;
        menu.addChild(useButton);

        menu.x = buildingSprite.x;
        menu.y = buildingSprite.y + buildingSprite.height * buildingSprite.scale.y * 0.6; 
        
        this.activeMenu = menu;
        this.addChild(menu);
    }

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

        // --- Банк (Bank) ---
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
            this.showBuildingMenu(lab, 'ACADEMY'); 
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
        
        const originalScale = 1.0;
        const clickScale = 0.95;
        const hoverScale = 1.05;

        container.on('pointerdown', () => container.scale.set(clickScale));
        container.on('pointerup', () => container.scale.set(hoverScale)); 
        container.on('pointerover', () => container.scale.set(hoverScale));
        container.on('pointerout', () => container.scale.set(originalScale));

        parentContainer.addChild(container);
    }
}


// --- СЦЕНА: БАНК ---
class BankScene extends BaseScene {
    init() {
        const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x8B0000 }); 
        this.addChild(bg);
        
        this.addTopUIElements(); // Отображаем ресурсы сверху

        const text = new PIXI.Text('БАНК (BANK) - УРОВЕНЬ 1\nВ этом окне будут финансовые операции.', {
            fontFamily: 'Arial',
            fontSize: 40,
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

// --- СЦЕНА: АКАДЕМИЯ ---
class AcademyScene extends BaseScene {
    constructor(manager) {
        super(manager);
        this.queueContainer = null;
    }

    init() {
        this.addBackgroundCover('map_background'); 
        this.addTopUIElements(); 

        // --- Заголовок ---
        const NEON_GREEN_STYLE = {
            fontFamily: 'Arial',
            fontSize: 32, 
            fill: 0x39FF14, 
            align: 'center',
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4, 
            dropShadow: true,
            dropShadowColor: '#39FF14',
            dropShadowBlur: 10,
            dropShadowAlpha: 1,
            dropShadowDistance: 0,
        };

        const text = new PIXI.Text('АКАДЕМИЯ КОТОВ (НАЙМ ЮНИТОВ)', NEON_GREEN_STYLE);
        text.anchor.set(0.5);
        text.x = APP_WIDTH / 2;
        text.y = 120; 
        this.addChild(text);

        this.createQueueDisplay(); 
        this.displayUnitData();

        const backButton = this.createSimpleButton('Назад в Меню', () => {
            this.manager.changeScene(MainMenuScene);
            // Удаляем слушатель при выходе
            this.manager.app.ticker.remove(this.updateQueueDisplay.bind(this)); 
        }, 0xFFD700);
        backButton.x = APP_WIDTH / 2;
        backButton.y = APP_HEIGHT - 60; 
        this.addChild(backButton);
        
        // Запускаем обновление очереди каждый кадр (для плавного прогресс-бара)
        this.manager.app.ticker.add(this.updateQueueDisplay.bind(this));
    }

    // --- Переопределение для отображения ресурсов вверху Академии ---
    updateTopUI() {
         super.updateTopUI(); 
    }

    // --- Создание блока очереди ---
    createQueueDisplay() {
        const QUEUE_Y = 170;
        const QUEUE_HEIGHT = 160; 
        
        const bg = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, QUEUE_HEIGHT) 
            .fill({ color: 0x000000, alpha: 0.7 });
        bg.y = QUEUE_Y;
        bg.zIndex = 1;
        this.addChild(bg);
        
        const title = new PIXI.Text('ОЧЕРЕДЬ НАЙМА:', { 
            fontFamily: 'Arial', 
            fontSize: 20, 
            fill: 0xFFFFFF 
        });
        title.x = 20;
        title.y = QUEUE_Y + 10;
        this.addChild(title);
        
        this.queueContainer = new PIXI.Container();
        this.queueContainer.x = 20;
        this.queueContainer.y = QUEUE_Y + 40;
        this.addChild(this.queueContainer);
        
        this.updateQueueDisplay(true); 
    }
    
    // --- Обновление отображения очереди и прогресс-бара ---
    updateQueueDisplay(forceUpdate = false) {
        if (!this.queueContainer) return;

        // Если очередь пуста и контейнер уже пуст, выходим
        if (GAME_STATE.buildQueue.length === 0 && !this.queueContainer.children.length) return;

        const currentJob = GAME_STATE.buildQueue[0];
        
        // Если очередь опустела, и нам не нужно форсированное обновление, выходим
        if (!currentJob && !forceUpdate) return;
        
        this.queueContainer.removeChildren(); // Очищаем старую очередь

        if (!currentJob) {
             const text = new PIXI.Text('Очередь пуста. Начните найм!', { 
                fontFamily: 'Arial', 
                fontSize: 24, 
                fill: 0x888888 
            });
            this.queueContainer.addChild(text);
            return;
        }

        const now = Date.now();
        
        const totalDuration = currentJob.finishTime - currentJob.startTime;
        const elapsed = now - currentJob.startTime;
        const progress = Math.min(elapsed / totalDuration, 1);
        
        const remainingTimeSec = Math.ceil((currentJob.finishTime - now) / 1000);
        
        // Общее время всей очереди (включая текущий)
        const totalQueueTimeSec = GAME_STATE.buildQueue.reduce((sum, job) => sum + (job.finishTime - Date.now()) / 1000, 0);

        // --- Статус текущего задания ---
        const statusText = `Строится: 1x ${currentJob.unitType} (T${currentJob.tier.replace('T', '')}) - Осталось: ${remainingTimeSec} сек.`;

        const statusLabel = new PIXI.Text(statusText, { 
            fontFamily: 'Arial', 
            fontSize: 20, 
            fill: 0xFFFFFF 
        });
        statusLabel.x = 0;
        statusLabel.y = 0;
        this.queueContainer.addChild(statusLabel);
        
        // --- Прогресс-бар ---
        const BAR_WIDTH = APP_WIDTH - 40;
        const BAR_HEIGHT = 20;
        const BAR_Y = 30;

        // Фон бара (исправлено на более светлый серый для видимости)
        const backgroundBar = new PIXI.Graphics()
            .rect(0, 0, BAR_WIDTH, BAR_HEIGHT)
            .fill({ color: 0x666666 }); // Фон (Серый)
        backgroundBar.y = BAR_Y;
        this.queueContainer.addChild(backgroundBar);

        // Заполненная часть бара
        const progressBar = new PIXI.Graphics()
            .rect(0, 0, BAR_WIDTH * progress, BAR_HEIGHT)
            .fill({ color: 0x00FF00 }); // Прогресс (Ярко-зеленый)
        progressBar.y = BAR_Y;
        this.queueContainer.addChild(progressBar);

        // Текст процента
        const percentText = new PIXI.Text(`${Math.round(progress * 100)}% (${Math.ceil(totalQueueTimeSec)} сек)`, { 
            fontFamily: 'Arial', 
            fontSize: 14, 
            fill: 0x000000, 
            fontWeight: 'bold' 
        });
        percentText.anchor.set(0.5);
        percentText.x = BAR_WIDTH / 2;
        percentText.y = BAR_Y + BAR_HEIGHT / 2;
        this.queueContainer.addChild(percentText);
        
        // --- Список следующих в очереди ---
        const nextJobs = GAME_STATE.buildQueue.slice(1);
        if (nextJobs.length > 0) {
             const groupedJobs = nextJobs.reduce((acc, job) => {
                 const key = `${job.unitType}_${job.tier}`;
                 if (!acc[key]) {
                     acc[key] = { count: 0, unitType: job.unitType, totalTime: 0 };
                 }
                 acc[key].count++;
                 acc[key].totalTime += job.timePerUnit;
                 return acc;
             }, {});
             
             const queueList = Object.values(groupedJobs).map(group => 
                 `> ${group.count}x ${group.unitType} (Суммарно: ${group.totalTime} сек.)`
             ).join('\n');
             
             const nextQueueText = new PIXI.Text(queueList, {
                 fontFamily: 'Arial', 
                 fontSize: 16, 
                 fill: 0xAAAAAA,
                 lineHeight: 20
             });
             nextQueueText.y = BAR_Y + BAR_HEIGHT + 10; 
             this.queueContainer.addChild(nextQueueText);
        }
    }

    // Удаление слушателей при выходе из сцены
    destroy(options) {
         if (this.manager.app.ticker) {
             // Важно удалить слушатель, чтобы он не запускался в других сценах
             this.manager.app.ticker.remove(this.updateQueueDisplay.bind(this));
         }
         super.destroy(options);
    }
    
    displayUnitData() {
        const unitTypes = Object.keys(UNIT_DATA);
        const START_Y = 350; 
        const UNIT_HEIGHT = 180; 
        
        const unitsContainer = new PIXI.Container();
        unitsContainer.y = START_Y;
        
        unitTypes.forEach((typeKey, index) => {
            const unitTypeData = UNIT_DATA[typeKey];
            const tier1 = unitTypeData.T1;
            
            const unitPanel = this.createUnitPanel(unitTypeData, tier1, index);
            unitPanel.y = index * UNIT_HEIGHT;
            unitsContainer.addChild(unitPanel);
        });
        
        this.addChild(unitsContainer);
    }
    
    createUnitPanel(unitTypeData, unitTier, index) {
        const container = new PIXI.Container();
        let quantity = 1; 

        const panelBg = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, 170) 
            .fill({ color: index % 2 === 0 ? 0x1A1A1A : 0x000000, alpha: 0.5 });
        container.addChild(panelBg);
        
        const unitName = new PIXI.Text(
            `${unitTier.name}`, 
            { fontFamily: 'Arial', fontSize: 30, fill: 0xFFFFFF, fontWeight: 'bold' }
        );
        unitName.x = 20;
        unitName.y = 15;
        container.addChild(unitName);
        
        // --- Цена и иконки ресурсов ---
        const costX = 20;
        let currentCostY = 60;
        let currentCostX = costX;

        for (const resKey in unitTier.cost) {
            const iconAlias = ASSETS[`icon_res_${resKey}`] ? ASSETS[`icon_res_${resKey}`].alias : 'icon_res_coin'; 
            const costValue = unitTier.cost[resKey];

            const icon = PIXI.Sprite.from(iconAlias);
            icon.scale.set(0.05); 
            icon.anchor.set(0, 0.5);
            icon.x = currentCostX;
            icon.y = currentCostY;
            container.addChild(icon);

            const costText = new PIXI.Text(
                `${costValue.toLocaleString()}`, 
                { fontFamily: 'Arial', fontSize: 22, fill: 0xFFFFFF, fontWeight: 'bold' }
            );
            costText.anchor.set(0, 0.5);
            costText.x = currentCostX + icon.width + 5;
            costText.y = currentCostY;
            container.addChild(costText);
            
            currentCostX = costText.x + costText.width + 20; 
        }
        
        const infoText = new PIXI.Text(
            `Мощь: ${unitTier.power} | Время: ${unitTier.time} сек/юнит`, 
            { fontFamily: 'Arial', fontSize: 18, fill: 0xCCCCCC }
        );
        infoText.x = 20;
        infoText.y = 110;
        container.addChild(infoText);
        
        // --- Элементы управления количеством (Quantity Controls) ---
        const CONTROL_Y = 145;
        const CONTROL_X = APP_WIDTH - 250;
        const TOTAL_COST_LABEL_X = APP_WIDTH - 450; 
        const TOTAL_COST_LABEL_Y = 70;

        const quantityText = new PIXI.Text(quantity.toString(), { fontFamily: 'Arial', fontSize: 28, fill: 0xFFFFFF, fontWeight: 'bold' });
        quantityText.anchor.set(0.5);
        quantityText.x = CONTROL_X + 60;
        quantityText.y = CONTROL_Y;
        container.addChild(quantityText);

        const totalCostLabel = new PIXI.Text(
            `Общая цена: ${this.formatTotalCost(unitTier.cost, quantity)} (Время: ${unitTier.time * quantity} сек)`, 
            { fontFamily: 'Arial', fontSize: 18, fill: 0xFFD700 }
        );
        totalCostLabel.anchor.set(0.0, 0.5); 
        totalCostLabel.x = TOTAL_COST_LABEL_X; 
        totalCostLabel.y = TOTAL_COST_LABEL_Y;
        container.addChild(totalCostLabel);
        
        const updateUI = () => {
            quantityText.text = quantity.toString();
            const totalTime = unitTier.time * quantity;
            
            totalCostLabel.text = `Общая цена: ${this.formatTotalCost(unitTier.cost, quantity)} (Время: ${totalTime} сек)`;
            
            let hasResources = this.checkResources(unitTier.cost, quantity);
            totalCostLabel.style.fill = hasResources ? 0xFFD700 : 0xFF4444;
            buildButton.alpha = hasResources ? 1.0 : 0.5; 
        };

        const createQuantityButton = (text, action, color, x, y) => {
             const baseScale = 0.35;
             const btn = this.createSimpleButton(text, action, color);
             btn.scale.set(baseScale);
             btn.x = x;
             btn.y = y;

             const clickScale = baseScale * 0.90; 
             
             btn.removeAllListeners();
             btn.on('pointertap', action); 
             
             btn.on('pointerdown', () => btn.scale.set(clickScale));
             btn.on('pointerup', () => btn.scale.set(baseScale)); 
             btn.on('pointerout', () => btn.scale.set(baseScale));
             btn.on('pointerover', () => btn.scale.set(baseScale)); 
             
             return btn;
        };


        // Кнопка Уменьшить (-)
        const minusButton = createQuantityButton('-', () => {
            if (quantity > 1) {
                quantity--;
                updateUI();
            }
        }, 0xDC3545, CONTROL_X, CONTROL_Y);
        container.addChild(minusButton);

        // Кнопка Увеличить (+)
        const plusButton = createQuantityButton('+', () => {
            quantity++;
            updateUI();
        }, 0x28A745, CONTROL_X + 120, CONTROL_Y);
        container.addChild(plusButton);
        
        // Кнопка "Начать постройку" (ИСПРАВЛЕНО: Цвет изменен на зеленый)
        const buildButton = this.createScaledButton('НАЙМ', () => {
            const hasResources = this.checkResources(unitTier.cost, quantity);
            if (!hasResources) {
                console.log('НЕТ РЕСУРСОВ для найма!');
                return; 
            }

            this.startUnitTraining(
                unitTypeData.type, 
                'T1', 
                quantity, 
                unitTier.cost, 
                unitTier.time, 
                unitTier.power
            );

            quantity = 1; // Сброс количества
            updateUI();
            
        }, 0x28A745, 0.8); // 0x28A745 = Ярко-зеленый
        
        buildButton.x = APP_WIDTH - 120; 
        buildButton.y = 35; 
        container.addChild(buildButton);
        
        updateUI(); 
        
        return container;
    }
    
    // Вспомогательная функция для форматирования цены
    formatTotalCost(cost, quantity) {
         return Object.keys(cost).map(key => 
            `${(cost[key] * quantity).toLocaleString()} ${key.toUpperCase()}`
         ).join(', ');
    }
    
    // Вспомогательная функция для проверки ресурсов
    checkResources(cost, quantity) {
        for (const resKey in cost) {
            const required = cost[resKey] * quantity;
            if (GAME_STATE.resources[resKey] === undefined || GAME_STATE.resources[resKey] < required) {
                return false;
            }
        }
        return true;
    }

    // --- ФУНКЦИЯ: Запуск найма (поштучно) ---
    startUnitTraining(unitType, tier, quantity, cost, timePerUnit, powerPerUnit) {
        
        // 1. Списание ресурсов (общее для всей партии)
        for (const resKey in cost) {
            GAME_STATE.resources[resKey] -= cost[resKey] * quantity;
        }
        this.updateTopUI(); // Обновление ресурсов в UI
        
        // 2. Добавление в очередь 
        const unitDurationMs = timePerUnit * 1000; 
        let lastJobFinishTime = Date.now();
        
        if (GAME_STATE.buildQueue.length > 0) {
             lastJobFinishTime = GAME_STATE.buildQueue[GAME_STATE.buildQueue.length - 1].finishTime;
        }
        
        const newJobs = [];
        for (let i = 0; i < quantity; i++) {
             const startTime = lastJobFinishTime;
             const finishTime = startTime + unitDurationMs;

             newJobs.push({
                 unitType,
                 tier,
                 timePerUnit: timePerUnit, 
                 startTime,
                 finishTime, 
                 powerPerUnit
             });
             lastJobFinishTime = finishTime; 
        }
        
        GAME_STATE.buildQueue.push(...newJobs);

        console.log(`[НАЙМ УСПЕШЕН] ${quantity}x ${unitType}. Общее время: ${timePerUnit * quantity} сек.`);
        this.updateQueueDisplay(true); // Обновление отображения очереди
    }
}

class CityScene extends BaseScene {
    init() {
        const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x228B22 }); 
        this.addChild(bg);
        
        this.addTopUIElements(); 

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


// --- ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ, ЗАПУСКАЕМАЯ ПОСЛЕ window.onload ---
async function init() {
    console.log("Диагностика: init() запущена.");
    
    // 1. Создание приложения PIXI
    app = new PIXI.Application();

    await app.init({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        background: '#000000',
        resolution: Math.max(window.devicePixelRatio, 1), 
        autoDensity: true,
    });
    
    const container = document.getElementById('pixi-container');
    if (container) {
        container.innerHTML = ''; 
        container.appendChild(app.canvas);
    }
    
    window.addEventListener('resize', resize);
    resize();

    // 2. Загрузка всех ресурсов
    try {
        const assetList = Object.values(ASSETS);
        await PIXI.Assets.load(assetList); 
        
        // 3. Инициализация менеджера сцены и запуск первой сцены
        SceneManager = new SceneController(app);
        SceneManager.changeScene(MainMenuScene); 
        
        // --- ЗАПУСК ИГРОВОГО ЦИКЛА (app.ticker.add) ---
        app.ticker.add(gameLoop); 
        
    } catch (error) {
        console.error("ОШИБКА КРИТИЧЕСКАЯ: Не удалось загрузить ресурсы! Проверьте, что ВСЕ изображения существуют в папке 'images' с правильными именами. Подробности:", error.message || error);
        
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

// =========================================================================
// ================== ГЛОБАЛЬНЫЕ ФУНКЦИИ ИГРОВОГО ЦИКЛА ====================
// =========================================================================

// --- ГЛОБАЛЬНАЯ ФУНКЦИЯ: Обработка очереди строительства/найма ---
function processBuildQueue() {
    const now = Date.now();
    let queueChanged = false;

    if (GAME_STATE.buildQueue.length > 0) {
        let currentJob = GAME_STATE.buildQueue[0];

        if (now >= currentJob.finishTime) {
            // 1. Начисление юнита
            GAME_STATE.units[currentJob.unitType]++; 
            
            // 2. Начисление мощи
            GAME_STATE.totalPower += currentJob.powerPerUnit; 
            
            console.log(`[ЮНИТ ГОТОВ] 1x ${currentJob.unitType}. Начислена Мощь: ${currentJob.powerPerUnit}. Мощь аккаунта: ${GAME_STATE.totalPower}.`);
            
            // Удаляем завершенное задание
            GAME_STATE.buildQueue.shift(); 
            queueChanged = true;
        }
    }

    // Если что-то выполнилось, обновляем UI
    if (queueChanged && SceneManager && SceneManager.currentScene) {
         SceneManager.currentScene.updateTotalPower(); // Обновляет мощь и вызывает updateTopUI()
         
         // Если мы в Академии, обновляем и ее очередь
         if (SceneManager.currentScene instanceof AcademyScene) {
             SceneManager.currentScene.updateQueueDisplay(true); // Принудительное обновление
         }
    }
}

let lastQueueCheck = 0;
const CHECK_INTERVAL_MS = 1000; 

function gameLoop(ticker) {
    // Проверка очереди раз в секунду
    if (Date.now() - lastQueueCheck > CHECK_INTERVAL_MS) {
        processBuildQueue();
        lastQueueCheck = Date.now();
    }
    
    // Обновление прогресс-бара Академии каждый кадр
    if (SceneManager && SceneManager.currentScene instanceof AcademyScene) { 
        SceneManager.currentScene.updateQueueDisplay();
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