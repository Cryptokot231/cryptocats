// --- КОНФИГУРАЦИЯ РЕСУРСОВ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---

const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

let app;
let SceneManager; 

// --- СТРУКТУРА ДАННЫХ ЮНИТОВ ---
const UNIT_DATA = {
    TraderCat: {
        type: 'TraderCat',
        icon: 'icon_res_coin', 
        T1: { name: 'Apprentice Trader T1', cost: { coin: 100, fish: 50 }, time: 1, power: 10 }, // time: 1с для быстрого теста
        T2: { name: 'Journeyman Trader T2', cost: { coin: 500, fish: 250 }, time: 3, power: 50 }, 
        T3: { name: 'Master Trader T3', cost: { coin: 2500, fish: 1250 }, time: 10, power: 250 }, 
        T4: { name: 'Grandmaster Trader T4', cost: { coin: 10000, fish: 5000 }, time: 30, power: 1000 }, 
    },
    ScoutCat: {
        type: 'ScoutCat',
        icon: 'icon_res_energy',
        T1: { name: 'Prowler Scout T1', cost: { fish: 150, energy: 20 }, time: 2, power: 15 }, 
        T2: { name: 'Tracker Scout T2', cost: { fish: 750, energy: 100 }, time: 6, power: 75 }, 
        T3: { name: 'Phantom Scout T3', cost: { fish: 3750, energy: 500 }, time: 20, power: 375 }, 
        T4: { name: 'Ghost Scout T4', cost: { fish: 15000, energy: 2000 }, time: 60, power: 1500 }, 
    },
    DefenderCat: {
        type: 'DefenderCat',
        icon: 'icon_res_gold',
        T1: { name: 'Guard Defender T1', cost: { gold: 50, fish: 100 }, time: 2, power: 12 }, 
        T2: { name: 'Sentinel Defender T2', cost: { gold: 250, fish: 500 }, time: 5, power: 60 }, 
        T3: { name: 'Fortress Defender T3', cost: { gold: 1250, fish: 2500 }, time: 18, power: 300 }, 
        T4: { name: 'Titan Defender T4', cost: { gold: 5000, fish: 10000 }, time: 50, power: 1200 }, 
    },
    AttackerCat: {
        type: 'AttackerCat',
        icon: 'icon_res_gem',
        T1: { name: 'Fighter Attacker T1', cost: { gem: 10, fish: 100 }, time: 3, power: 14 }, 
        T2: { name: 'Warrior Attacker T2', cost: { gem: 50, fish: 500 }, time: 7, power: 70 }, 
        T3: { name: 'Conqueror Attacker T3', cost: { gem: 250, fish: 2500 }, time: 25, power: 350 }, 
        T4: { name: 'Warlord Attacker T4', cost: { gem: 1000, fish: 10000 }, time: 80, power: 1400 }, 
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
    buildQueue: [], 
    totalPower: 0, 
    // Данные зданий
    buildings: {
        BANK: { 
            level: 1,
            description: "Банк производит монеты и хранит ваши сбережения. Это жизненно важное здание для вашей экономики."
        },
        ACADEMY: { 
            level: 1,
            description: "Академия позволяет нанимать и тренировать боевых котов, улучшая их навыки и боевую мощь.",
            // Данные для апгрейда
            upgradeStartTime: 0,
            upgradeDuration: 3000, 
            isUpgrading: false,
            // Стоимость апгрейда на уровень 2
            upgradeCost: { coin: 500, gold: 200 }
        },
    }
};

const ASSETS = {
    map_background: { alias: 'map_background', src: 'images/map_background.png' }, 
    fon_academy: { alias: 'fon_academy', src: 'images/fon_academy.png' }, 
    
    building_center: { alias: 'building_center', src: 'images/building_center.png' },
    building_bank: { alias: 'building_bank', src: 'images/building_bank.png' }, 
    building_lab: { alias: 'building_lab', src: 'images/building_lab.png' }, 
    building_market: { alias: 'building_market', src: 'images/building_market.png' }, 
    building_tank: { alias: 'building_tank', src: 'images/building_tank.png' }, 

    icon_power_cat: { alias: 'icon_power_cat', src: 'images/heroes_icon.png' }, 
    settings_icon: { alias: 'settings_icon', src: 'images/settings_icon.png' }, 

    icon_res_coin: { alias: 'icon_res_coin', src: 'images/icon_res_coin.png' },
    icon_res_gem: { alias: 'icon_res_gem', src: 'images/icon_res_gem.png' },
    icon_res_gold: { alias: 'icon_res_gold', src: 'images/icon_res_gold.png' },
    icon_res_energy: { alias: 'icon_res_energy', src: 'images/icon_res_energy.png' },
    icon_res_fish: { alias: 'icon_fish', src: 'images/icon_res_fish.png' }, 

    icon_build: { alias: 'icon_build', src: 'images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'images/icon_map.png' }, 
};

// =========================================================================
// ================== ОПРЕДЕЛЕНИЕ КЛАССОВ PIXI =================
// =========================================================================

class BaseScene extends PIXI.Container {
    constructor(manager) {
        super();
        this.manager = manager;
        this.sortableChildren = true; 
        // ИСПРАВЛЕНИЕ: Удален вызов this.init() отсюда. 
        // Теперь он вызывается в SceneController.changeScene после завершения конструктора.
    }
    
    // МЕТОД init() остается как точка входа для логики сцены
    init() {} 
    
    // --- НОВЫЙ МЕТОД: Модальное окно с информацией ---
    showInfoModal(titleText, contentText) {
        // Проверяем, существует ли уже модальное окно, и удаляем его
        if (this.infoModal) {
            this.infoModal.destroy({ children: true });
            this.infoModal = null;
        }

        const MODAL_WIDTH = APP_WIDTH * 0.8;
        const MODAL_HEIGHT = APP_HEIGHT * 0.4;
        const BORDER_COLOR = 0x39FF14; // Неоновый зеленый
        const BORDER_THICKNESS = 4;
        const BACKGROUND_COLOR = 0x000000;
        const NEON_STYLE = {
            fontFamily: 'Arial',
            fontSize: 24, 
            fill: BORDER_COLOR, 
            align: 'center',
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: `#${BORDER_COLOR.toString(16)}`,
            dropShadowBlur: 10,
            dropShadowAlpha: 1,
            dropShadowDistance: 0,
        };

        const modal = new PIXI.Container();
        modal.zIndex = 100; // Поверх всех элементов
        modal.x = APP_WIDTH / 2;
        modal.y = APP_HEIGHT / 2;
        modal.eventMode = 'static'; // Блокируем клики под модальным окном
        this.infoModal = modal;
        this.addChild(modal);

        // 1. Фон (Черный)
        const bg = new PIXI.Graphics()
            .roundRect(-MODAL_WIDTH / 2, -MODAL_HEIGHT / 2, MODAL_WIDTH, MODAL_HEIGHT, 20)
            .fill({ color: BACKGROUND_COLOR, alpha: 0.9 });
        modal.addChild(bg);

        // 2. Неоновая обводка
        const border = new PIXI.Graphics()
            .roundRect(-MODAL_WIDTH / 2, -MODAL_HEIGHT / 2, MODAL_WIDTH, MODAL_HEIGHT, 20)
            .stroke({ 
                width: BORDER_THICKNESS, 
                color: BORDER_COLOR, 
                alpha: 1.0, 
            });
        
        const glow = new PIXI.Graphics()
            .roundRect(-MODAL_WIDTH / 2 - 2, -MODAL_HEIGHT / 2 - 2, MODAL_WIDTH + 4, MODAL_HEIGHT + 4, 22)
            .stroke({ width: 2, color: BORDER_COLOR, alpha: 0.5 });
        modal.addChild(glow);
        
        modal.addChild(border);

        // 3. Заголовок
        const title = new PIXI.Text(titleText, NEON_STYLE);
        title.anchor.set(0.5);
        title.y = -MODAL_HEIGHT / 2 + 40;
        modal.addChild(title);

        // 4. Текст контента
        const content = new PIXI.Text(contentText, {
            ...NEON_STYLE,
            fontSize: 20,
            wordWrap: true,
            wordWrapWidth: MODAL_WIDTH - 60,
            align: 'left',
            lineHeight: 28,
            fill: 0xFFFFFF, // Белый текст для контраста
            dropShadowColor: `#000000`, // Отключаем неоновое свечение для основного текста
            dropShadowBlur: 0
        });
        content.anchor.set(0.5, 0);
        content.x = 0;
        content.y = -MODAL_HEIGHT / 2 + 80;
        modal.addChild(content);

        // 5. Кнопка "Закрыть"
        const closeButton = this.createSimpleButton('Закрыть', () => {
            this.infoModal.destroy({ children: true });
            this.infoModal = null;
        }, 0xDC3545, 150, 40, 10);
        closeButton.x = 0;
        closeButton.y = MODAL_HEIGHT / 2 - 30;
        modal.addChild(closeButton);
    }
    
    createSimpleButton(text, action, color, width = 240, height = 60, radius = 15) {
        const button = new PIXI.Graphics()
            .roundRect(-width / 2, -height / 2, width, height, radius) 
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
    
    createScaledButton(text, action, color, baseScale, width, height) {
         const btn = this.createSimpleButton(text, action, color, width, height);
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
        for (const typeKey in GAME_STATE.units) {
            const unitCount = GAME_STATE.units[typeKey];
            // Используем мощь T1 для простоты
            const unitPower = UNIT_DATA[typeKey]?.T1?.power || 0; 
            total += unitCount * unitPower;
        }
        GAME_STATE.totalPower = total; 
        
        if (SceneManager && SceneManager.currentScene) {
            SceneManager.currentScene.updateTopUI();
        }
    }
    
    addResourceDisplay(iconAlias, value, x, y, alpha) {
        const RESOURCE_ICON_SCALE = 0.06; 
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;
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
    
    addTopUIElements() {
        const PANEL_BG_ALPHA = 0.3; 
        const RESOURCE_BG_ALPHA = 1.0; 

        const resourceData = [
            { alias: ASSETS.icon_res_coin.alias, value: GAME_STATE.resources.coin }, 
            { alias: ASSETS.icon_res_gem.alias, value: GAME_STATE.resources.gem }, 
            { alias: ASSETS.icon_res_gold.alias, value: GAME_STATE.resources.gold }, 
            { alias: ASSETS.icon_res_energy.alias, value: GAME_STATE.resources.energy }, 
            { alias: ASSETS.icon_res_fish.alias, value: GAME_STATE.resources.fish }, 
        ];
        
        const topBarHeight = 80;
        const topPanel = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, topBarHeight)
            .fill({ color: 0x1A1A1A, alpha: PANEL_BG_ALPHA }); 
        topPanel.y = 0;
        topPanel.zIndex = 10; 
        topPanel.isTopUIElement = true; 
        this.addChild(topPanel);
        
        let startX = 50; 
        const spacing = 100; 
        resourceData.forEach((res, index) => {
             this.addResourceDisplay(res.alias, res.value, startX + index * spacing, topBarHeight / 2, RESOURCE_BG_ALPHA);
        });
        
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
        
        // Уровень здания Академии
        const academyLevel = GAME_STATE.buildings.ACADEMY.level;

        const catIcon = PIXI.Sprite.from(ASSETS.icon_power_cat.alias);
        catIcon.anchor.set(0.5);
        catIcon.x = 25;
        catIcon.y = 0;
        catIcon.width = 40 * ICON_POWER_CAT_SCALE; 
        catIcon.height = 40 * ICON_POWER_CAT_SCALE;
        powerPanel.addChild(catIcon);

        const powerText = new PIXI.Text(`Мощь: ${GAME_STATE.totalPower.toLocaleString()}\nАкадемия: ${academyLevel} LVL`, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            lineHeight: 18
        });
        powerText.x = 55 + (ICON_POWER_CAT_SCALE - 1.0) * 5; 
        powerText.y = -20;
        powerPanel.addChild(powerText);
        
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
            if (this.manager.currentScene instanceof MainMenuScene) {
                this.manager.currentScene.closeBuildingMenu();
            }
            console.log('Нажата кнопка Настроек');
        });
        this.addChild(settingsButton); 
    }
    
    updateTopUI() {
         this.children
            .filter(child => child.isTopUIElement)
            .forEach(child => child.destroy({ children: true }));
         
         this.addTopUIElements();
    }
    
    addBackgroundCover(alias = 'map_background') { 
        if (!PIXI.Assets.cache.has(alias)) {
            const fallback = new PIXI.Graphics().rect(0,0,APP_WIDTH,APP_HEIGHT).fill(0x333333);
            this.addChild(fallback);
            return;
        }

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

// --- МЕНЕДЖЕР СЦЕН ---
class SceneController {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
    }

    async changeScene(NewSceneClass) {
        if (this.currentScene && this.currentScene.constructor === NewSceneClass) return; 

        if (this.currentScene) {
            this.currentScene.destroy({ children: true, texture: false, baseTexture: false });
            this.app.stage.removeChild(this.currentScene);
            this.currentScene = null;
        }

        const newScene = new NewSceneClass(this);
        this.app.stage.addChild(newScene);
        this.currentScene = newScene;
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Вызываем init() здесь, чтобы убедиться, 
        // что конструктор NewSceneClass (инициализация this.queueCountLabels = {}) завершен.
        this.currentScene.init(); 
    }
}

// --- СЦЕНА: ГЛАВНОЕ МЕНЮ ---
class MainMenuScene extends BaseScene {
    constructor(manager) {
        super(manager);
        this.activeMenu = null;
        this.updateTotalPower(); 
        
        // Биндим функцию обновления таймера для меню, чтобы можно было удалять
        this.boundMenuUpdate = this.updateMenuTimer.bind(this);
    }

    init() {
        this.eventMode = 'static';
        this.on('pointertap', this.handleMapClick, this);

        this.addBackgroundCover(); 
        
        this.addBuildings();
        this.addTopUIElements(); 
        this.addBottomPanel();
        
        // Запускаем тикер для обновления таймеров в меню
        this.manager.app.ticker.add(this.boundMenuUpdate);
    }
    
    destroy(options) {
        if (this.manager.app.ticker) {
            this.manager.app.ticker.remove(this.boundMenuUpdate);
        }
        // Дополнительно: закрываем модальное окно при выходе из сцены
        if (this.infoModal) {
             this.infoModal.destroy({ children: true });
             this.infoModal = null;
        }
        super.destroy(options);
    }
    
    // Функция обновления таймеров в открытом меню
    updateMenuTimer() {
        if (!this.activeMenu || !this.activeMenu.buildingType) return;
        
        const bData = GAME_STATE.buildings[this.activeMenu.buildingType];
        
        // Проверка апгрейда Академии
        if (this.activeMenu.buildingType === 'ACADEMY' && bData.isUpgrading) {
            const now = Date.now();
            const finishTime = bData.upgradeStartTime + bData.upgradeDuration;
            const remaining = Math.ceil(Math.max(0, finishTime - now) / 1000);
            
            if (remaining > 0) {
                // Обновляем текст на кнопке, если она существует
                if (this.activeMenu.upButtonLabel) {
                    this.activeMenu.upButtonLabel.text = `${remaining}s`;
                }
            } else {
                // Апгрейд завершен (это должно происходить в processBuildQueue, но для UI обновления)
                if (this.activeMenu.upButtonLabel) {
                    this.activeMenu.upButtonLabel.text = "UP";
                }
                // Если апгрейд ЗАВЕРШЕН в gameLoop, но меню было открыто, 
                // мы просто показываем UP. Обновление уровня произойдет в processBuildQueue.
            }
        }
    }
    
    updateTopUI() {
         super.updateTopUI();
    }

    handleMapClick() {
         if (this.activeMenu) {
            this.closeBuildingMenu();
        }
        if (this.infoModal) {
            this.infoModal.destroy({ children: true });
            this.infoModal = null;
        }
    }
    
    // Функция рисования кнопок меню (пятиугольники)
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
             // Не закрываем меню сразу, если это UP, чтобы видеть таймер
             if (labelText !== 'UP') {
                 this.closeBuildingMenu(); 
             }
         });
         container.on('pointerover', () => container.scale.set(1.1));
         container.on('pointerout', () => container.scale.set(1.0));
         
         // Сохраняем ссылку на текст, чтобы менять его
         container.labelObj = label;

         return container;
    }
    
    // Вспомогательная кнопка "i" (круг)
    drawCircleButton(text, color, action) {
        const container = new PIXI.Container();
        const circle = new PIXI.Graphics()
            .circle(0, 0, 15)
            .fill({ color: color })
            .stroke({ width: 2, color: 0xFFFFFF });
        
        const label = new PIXI.Text(text, {
            fontFamily: 'Arial', fontSize: 16, fill: 0xFFFFFF, fontWeight: 'bold'
        });
        label.anchor.set(0.5);
        
        container.addChild(circle, label);
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointertap', (e) => {
            e.stopPropagation();
            action();
        });
        
        return container;
    }

    showBuildingMenu(buildingSprite, buildingType) {
        if (this.activeMenu) {
            this.closeBuildingMenu();
        }
        
        const bData = GAME_STATE.buildings[buildingType];
        const level = bData.level;

        const menu = new PIXI.Container();
        menu.zIndex = 5; 
        menu.eventMode = 'static'; 
        menu.buildingType = buildingType; // Сохраняем тип для обновления

        const levelText = new PIXI.Text(`${buildingType} LVL ${level}`, {
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
        let upButtonText = "UP";
        const upAction = () => { 
            // Если уже идет апгрейд, ничего не делаем
            if (bData.isUpgrading) return;
            
            // Если апгрейд доступен (проверяем ресурсы для Академии)
            if (buildingType === 'ACADEMY') {
                const cost = bData.upgradeCost;
                // Проверка ресурсов
                if (GAME_STATE.resources.coin >= cost.coin && GAME_STATE.resources.gold >= cost.gold) {
                    // Списание
                    GAME_STATE.resources.coin -= cost.coin;
                    GAME_STATE.resources.gold -= cost.gold;
                    this.updateTopUI();
                    
                    // Старт апгрейда
                    bData.isUpgrading = true;
                    bData.upgradeStartTime = Date.now();
                    console.log(`[ACADEMY] Апгрейд на уровень ${bData.level + 1} начат. Списано: ${cost.coin} Coin, ${cost.gold} Gold.`);
                    // UI обновится в next tick через updateMenuTimer
                } else {
                    console.log('Недостаточно ресурсов для апгрейда!');
                    this.showInfoModal('ОШИБКА АПГРЕЙДА', `Недостаточно ресурсов для улучшения ${buildingType} до уровня ${bData.level + 1}.\nТребуется: ${cost.coin} Coin, ${cost.gold} Gold.`);
                }
            } else {
                console.log(`[${buildingType}] Заглушка апгрейда`);
            }
        };
        
        // Устанавливаем текст, если апгрейд уже идет
        if (buildingType === 'ACADEMY' && bData.isUpgrading) {
            const now = Date.now();
            const finishTime = bData.upgradeStartTime + bData.upgradeDuration;
            const remaining = Math.ceil(Math.max(0, finishTime - now) / 1000);
            upButtonText = remaining > 0 ? `${remaining}s` : "UP";
        }
        
        const upButton = this.drawPentagonButton(upButtonText, 0xFF8C00, upAction);
        upButton.x = -45;
        upButton.y = 0;
        menu.addChild(upButton);
        
        // Сохраняем ссылку на текст кнопки UP в меню для обновления таймера
        menu.upButtonLabel = upButton.labelObj;

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
        
        // 3. Кнопка INFO (Маленькая круглая "i")
        const infoAction = () => {
            this.showInfoModal(`${buildingType} УРОВЕНЬ ${level}`, bData.description || "Информация отсутствует.");
        };
        const infoButton = this.drawCircleButton('i', 0x333333, infoAction);
        infoButton.x = 0;
        infoButton.y = -35; // Чуть выше между кнопками
        menu.addChild(infoButton);

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
        center.on('pointertap', (e) => { 
            e.stopPropagation(); 
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
        market.on('pointertap', (e) => {
            e.stopPropagation();
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
        tank.on('pointertap', (e) => {
            e.stopPropagation();
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
    constructor(manager) {
        super(manager);
    }
    init() {
        const bg = new PIXI.Graphics().rect(0, 0, APP_WIDTH, APP_HEIGHT).fill({ color: 0x8B0000 }); 
        this.addChild(bg);
        
        this.addTopUIElements(); 

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
        // УЛУЧШЕНИЕ: Инициализация массивов и объектов в конструкторе для максимальной стабильности
        this.unitPanels = []; 
        this.boundUpdateBars = this.updateUnitProgressBars.bind(this);
        this.queueCountLabels = {}; // ЭТОТ ОБЪЕКТ ТЕПЕРЬ ГАРАНТИРОВАННО СУЩЕСТВУЕТ
    }

    init() {
        this.addBackgroundCover('fon_academy'); 
        this.addTopUIElements(); 

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

        this.displayUnitData();

        const backButton = this.createSimpleButton('Назад в Меню', () => {
            this.manager.changeScene(MainMenuScene);
        }, 0xFFD700);
        backButton.x = APP_WIDTH / 2;
        backButton.y = APP_HEIGHT - 60; 
        this.addChild(backButton);
        
        // Запускаем обновление прогресс-баров каждый кадр с использованием boundUpdateBars
        this.manager.app.ticker.add(this.boundUpdateBars);
    }

    updateTopUI() {
         super.updateTopUI(); 
    }
    
    // --- Метод для обновления прогресс-баров ---
    updateUnitProgressBars() {
        if (this.destroyed) return;

        const now = Date.now();

        if (this.unitPanels) {
            this.unitPanels.forEach(panel => {
                if (panel.destroyed) return;

                const unitType = panel.unitType;
                const progressContainer = panel.progressContainer;
                const progressBar = panel.progressBar;
                
                // 1. Фильтруем очередь для текущего типа юнита
                const unitQueue = GAME_STATE.buildQueue.filter(job => job.unitType === unitType);
                
                // 2. Находим текущий активный юнит (тот, что сейчас тренируется)
                const activeJob = unitQueue.find(job => now >= job.startTime && now < job.finishTime);
                
                // 3. Подсчитываем количество в очереди (исключая активный, если он есть)
                const totalInQueue = unitQueue.length;
                const remainingInQueue = Math.max(0, totalInQueue - (activeJob ? 1 : 0));
                
                // 4. Обновляем счетчик очереди
                if (this.queueCountLabels[unitType]) {
                    this.queueCountLabels[unitType].text = `Очередь: ${remainingInQueue}`;
                    this.queueCountLabels[unitType].visible = totalInQueue > 0;
                }

                if (activeJob) {
                    const totalDuration = activeJob.finishTime - activeJob.startTime;
                    const elapsed = now - activeJob.startTime; 
                    const progress = Math.min(elapsed / totalDuration, 1);
                    
                    progressContainer.visible = true;
                    // Плавное обновление ширины каждый кадр
                    progressBar.width = APP_WIDTH * progress; 
                    
                } else {
                    // Если нет активного юнита, но есть в очереди
                    progressContainer.visible = totalInQueue > 0; 
                    progressBar.width = 0; 
                }
            });
        }
    }

    destroy(options) {
         if (this.manager.app.ticker) {
             this.manager.app.ticker.remove(this.boundUpdateBars);
         }
         if (this.infoModal) {
             this.infoModal.destroy({ children: true });
             this.infoModal = null;
         }
         super.destroy(options);
    }
    
    displayUnitData() {
        const unitTypes = Object.keys(UNIT_DATA);
        const START_Y = 180; 
        const UNIT_HEIGHT = 180; 
        
        const unitsContainer = new PIXI.Container();
        unitsContainer.y = START_Y;
        
        unitTypes.forEach((typeKey, index) => {
            const unitTypeData = UNIT_DATA[typeKey];
            const tier1 = unitTypeData.T1;
            
            const unitPanel = this.createUnitPanel(typeKey, unitTypeData, tier1, index);
            unitPanel.y = index * UNIT_HEIGHT;
            unitsContainer.addChild(unitPanel);
            
            this.unitPanels.push(unitPanel);
        });
        
        this.addChild(unitsContainer);
    }
    
    createUnitPanel(unitTypeKey, unitTypeData, unitTier, index) {
        const container = new PIXI.Container();
        container.unitType = unitTypeKey; 
        
        let quantity = 1; 

        const panelBg = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, 170) 
            .fill({ color: index % 2 === 0 ? 0x1A1A1A : 0x000000, alpha: 0.5 });
        container.addChild(panelBg);
        
        // --- Заготовка под иконку ---
        const placeholderIcon = new PIXI.Graphics()
            .rect(0, 0, 100, 100)
            .fill({ color: 0x555555 }); 
        placeholderIcon.x = 20;
        placeholderIcon.y = 35;
        container.addChild(placeholderIcon);

        // --- Имя юнита ---
        const unitName = new PIXI.Text(
            `${unitTier.name}`, 
            { fontFamily: 'Arial', fontSize: 28, fill: 0xFFFFFF, fontWeight: 'bold' }
        );
        unitName.x = 140; 
        unitName.y = 15;
        container.addChild(unitName);
        
        // --- Цена и иконки ---
        const costX = 140; 
        let currentCostY = 55;
        let currentCostX = costX;

        for (const resKey in unitTier.cost) {
            const iconAlias = ASSETS[`icon_res_${resKey}`] ? ASSETS[`icon_res_${resKey}`].alias : 'icon_res_coin'; 
            const costValue = unitTier.cost[resKey];

            const icon = PIXI.Sprite.from(iconAlias);
            icon.scale.set(0, 0.5);
            icon.x = currentCostX;
            icon.y = currentCostY;
            container.addChild(icon);

            const costText = new PIXI.Text(
                `${costValue.toLocaleString()}`, 
                { fontFamily: 'Arial', fontSize: 20, fill: 0xFFFFFF, fontWeight: 'bold' }
            );
            costText.anchor.set(0, 0.5);
            costText.x = currentCostX + icon.width + 5;
            costText.y = currentCostY;
            container.addChild(costText);
            
            currentCostX = costText.x + costText.width + 15; 
        }
        
        const infoText = new PIXI.Text(
            `Мощь: ${unitTier.power} | Время: ${unitTier.time}с`, 
            { fontFamily: 'Arial', fontSize: 16, fill: 0xCCCCCC }
        );
        infoText.x = 140;
        infoText.y = 85;
        container.addChild(infoText);
        
        // --- Индивидуальная шкала прогресса ---
        const progressContainer = new PIXI.Container();
        progressContainer.visible = false; 
        progressContainer.y = 160; 
        
        const progressBg = new PIXI.Graphics()
            .rect(0, 0, APP_WIDTH, 10)
            .fill({ color: 0x333333, alpha: 0.5 });
        progressContainer.addChild(progressBg);
        
        const progressBar = new PIXI.Graphics()
            .rect(0, 0, 1, 10) 
            .fill({ color: 0x00FF00, alpha: 0.8 });
        progressContainer.addChild(progressBar);
        
        container.addChild(progressContainer);
        
        container.progressContainer = progressContainer;
        container.progressBar = progressBar;

        // --- Счетчик очереди ---
        const queueCountLabel = new PIXI.Text(
            `Очередь: 0`, 
            { fontFamily: 'Arial', fontSize: 16, fill: 0x00FFFF }
        );
        queueCountLabel.anchor.set(1, 0.5); // Привязка к правому краю
        queueCountLabel.x = APP_WIDTH - 10; 
        queueCountLabel.y = 145;
        queueCountLabel.visible = false;
        container.addChild(queueCountLabel);
        
        // ТЕПЕРЬ 'this.queueCountLabels' ГАРАНТИРОВАННО НЕ undefined
        this.queueCountLabels[unitTypeKey] = queueCountLabel; 

        // --- Управление количеством ---
        const CONTROL_Y = 125;
        const CONTROL_X = APP_WIDTH - 250;
        
        const totalCostLabel = new PIXI.Text(
            `Цена: ${this.formatTotalCost(unitTier.cost, quantity)}`, 
            { fontFamily: 'Arial', fontSize: 16, fill: 0xFFD700 }
        );
        totalCostLabel.anchor.set(0, 0.5); 
        totalCostLabel.x = 140; 
        totalCostLabel.y = 115;
        container.addChild(totalCostLabel);
        
        const quantityText = new PIXI.Text(quantity.toString(), { fontFamily: 'Arial', fontSize: 26, fill: 0xFFFFFF, fontWeight: 'bold' });
        quantityText.anchor.set(0.5);
        quantityText.x = CONTROL_X + 60;
        quantityText.y = CONTROL_Y;
        container.addChild(quantityText);

        const updateUI = () => {
            quantityText.text = quantity.toString();
            totalCostLabel.text = `Цена: ${this.formatTotalCost(unitTier.cost, quantity)}`;
            
            let hasResources = this.checkResources(unitTier.cost, quantity);
            totalCostLabel.style.fill = hasResources ? 0xFFD700 : 0xFF4444;
            buildButton.alpha = hasResources ? 1.0 : 0.5; 
            buildButton.eventMode = hasResources ? 'static' : 'none';
        };

        // --- Квадратные кнопки ---
        const createQuantityButton = (text, action, color, x, y) => {
             const btnSize = 50; 
             const btn = this.createScaledButton(text, action, color, 1.0, btnSize, btnSize);
             btn.x = x;
             btn.y = y;
             return btn;
        };

        const minusButton = createQuantityButton('-', () => {
            if (quantity > 1) {
                quantity--;
                updateUI();
            }
        }, 0xDC3545, CONTROL_X, CONTROL_Y);
        container.addChild(minusButton);

        const plusButton = createQuantityButton('+', () => {
            quantity++;
            updateUI();
        }, 0x28A745, CONTROL_X + 120, CONTROL_Y);
        container.addChild(plusButton);
        
        const buildButton = this.createScaledButton('НАЙМ', () => {
            const hasResources = this.checkResources(unitTier.cost, quantity);
            if (!hasResources) {
                this.showInfoModal('НЕДОСТАТОЧНО РЕСУРСОВ', `Недостаточно ресурсов для найма ${quantity}x ${unitTypeKey}.`);
                return; 
            }

            this.startUnitTraining(
                unitTypeKey, 
                'T1', 
                quantity, 
                unitTier.cost, 
                unitTier.time, 
                unitTier.power
            );

            quantity = 1; 
            updateUI();
            
        }, 0x28A745, 0.8, 180, 50); 
        
        buildButton.x = APP_WIDTH - 120; 
        buildButton.y = 35; 
        container.addChild(buildButton);
        
        updateUI(); 
        
        return container;
    }
    
    formatTotalCost(cost, quantity) {
         return Object.keys(cost).map(key => 
            `${(cost[key] * quantity).toLocaleString()}` 
         ).join(', ');
    }
    
    checkResources(cost, quantity) {
        for (const resKey in cost) {
            const required = cost[resKey] * quantity;
            if (GAME_STATE.resources[resKey] === undefined || GAME_STATE.resources[resKey] < required) {
                return false;
            }
        }
        return true;
    }

    startUnitTraining(unitType, tier, quantity, cost, timePerUnit, powerPerUnit) {
        // Списание ресурсов
        for (const resKey in cost) {
            GAME_STATE.resources[resKey] -= cost[resKey] * quantity;
        }
        this.updateTopUI(); 
        
        const unitDurationMs = timePerUnit * 1000; 
        
        // Определяем время начала первого юнита
        let firstJobStartTime = Date.now();
        if (GAME_STATE.buildQueue.length > 0) {
             // Если очередь не пуста, первый юнит в этой партии начнется после последнего юнита в очереди
             const lastJobFinishTime = GAME_STATE.buildQueue[GAME_STATE.buildQueue.length - 1].finishTime;
             // Убеждаемся, что он начнется не раньше текущего момента
             firstJobStartTime = Math.max(Date.now(), lastJobFinishTime);
        }
        
        let currentBatchStartTime = firstJobStartTime;
        const newJobs = [];
        
        for (let i = 0; i < quantity; i++) {
             const finishTime = currentBatchStartTime + unitDurationMs;

             newJobs.push({
                 unitType,
                 tier,
                 timePerUnit: timePerUnit, 
                 startTime: currentBatchStartTime,
                 finishTime, 
                 powerPerUnit
             });
             // Следующий юнит начнется сразу после окончания текущего
             currentBatchStartTime = finishTime; 
        }
        
        GAME_STATE.buildQueue.push(...newJobs);

        console.log(`[НАЙМ УСПЕШЕН] ${quantity}x ${unitType}. Первая партия начнет/продолжит в ${new Date(newJobs[0].startTime).toLocaleTimeString()}.`);
        this.updateUnitProgressBars(); // Принудительно обновляем прогресс-бары и счетчики
    }
}

class CityScene extends BaseScene {
    constructor(manager) {
        super(manager);
    }
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


// --- ОСНОВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ---
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

    // 2. Загрузка ресурсов
    try {
        const assetList = Object.values(ASSETS);
        await PIXI.Assets.load(assetList); 
        
        // 3. Инициализация менеджера
        SceneManager = new SceneController(app);
        // Запускаем первую сцену, которая теперь сама вызывает .init()
        SceneManager.changeScene(MainMenuScene); 
        
        // --- ЗАПУСК ИГРОВОГО ЦИКЛА ---
        app.ticker.add(gameLoop); 
        
    } catch (error) {
        console.error("ОШИБКА: Не удалось загрузить ресурсы! Убедитесь, что все файлы (изображения) существуют в папке 'images' с правильными именами. Подробности:", error.message || error);
        
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

function processBuildQueue() {
    const now = Date.now();
    let queueChanged = false;

    // 1. Обработка очереди юнитов
    if (GAME_STATE.buildQueue.length > 0) {
        let currentJob = GAME_STATE.buildQueue[0];
        
        // Проверка: гарантируем существование объекта GAME_STATE.units и свойства юнита
        if (!GAME_STATE.units || !GAME_STATE.units.hasOwnProperty(currentJob.unitType)) {
             console.error(`[КРИТИЧЕСКАЯ ОШИБКА ОЧЕРЕДИ] Тип юнита '${currentJob.unitType}' не существует в GAME_STATE.units. Задание удалено.`);
             GAME_STATE.buildQueue.shift(); 
             return; 
        }

        // Проверка, завершился ли юнит
        if (now >= currentJob.finishTime) {
            
            GAME_STATE.units[currentJob.unitType]++; 
            GAME_STATE.totalPower += currentJob.powerPerUnit; 
            
            console.log(`[ЮНИТ ГОТОВ] 1x ${currentJob.unitType}. Всего: ${GAME_STATE.units[currentJob.unitType]}`);
            GAME_STATE.buildQueue.shift(); 
            queueChanged = true;
        }
    }
    
    // 2. Обработка апгрейдов зданий
    for (const key in GAME_STATE.buildings) {
        const bData = GAME_STATE.buildings[key];
        if (bData.isUpgrading) {
            if (now >= bData.upgradeStartTime + bData.upgradeDuration) {
                bData.level++;
                bData.isUpgrading = false;
                console.log(`[ЗДАНИЕ] ${key} улучшено до уровня ${bData.level}!`);
                queueChanged = true;
            }
        }
    }

    // Если что-то выполнилось, обновляем UI
    if (queueChanged && SceneManager && SceneManager.currentScene) {
         SceneManager.currentScene.updateTotalPower(); 
         
         // Если мы в Академии, принудительно обновим бары, чтобы увидеть, как начинается следующий юнит
         if (SceneManager.currentScene instanceof AcademyScene) {
             SceneManager.currentScene.updateUnitProgressBars(); 
         }
    }
}

// Интервал проверки очереди сокращен до 50 мс для более плавной анимации
let lastQueueCheck = 0;
const CHECK_INTERVAL_MS = 50; 

function gameLoop(ticker) {
    // Проверка очереди
    if (Date.now() - lastQueueCheck > CHECK_INTERVAL_MS) {
        processBuildQueue();
        lastQueueCheck = Date.now();
    }
    // Прогресс-бары обновляются в updateUnitProgressBars, привязанном к тикеру в AcademyScene.init
}

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

window.onload = init;