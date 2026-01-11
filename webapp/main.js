// --- КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

let app;
let SceneManager; 
let __pointerActive = false; // флаг: пользователь взаимодействует с приложением (для предотвращения нативных тач-жестов)

// --- ДАННЫЕ ЗДАНИЙ (ДОБАВЛЯЕМ НОВЫЙ ОБЪЕКТ!) ---
const BUILDING_DATA = {
    DEFENSE_TOWER: {
        type: 'DEFENSE_TOWER',
        name: 'Defense Tower',
        levels: {
            1: { cost: { coin: 500, fish: 50 }, effect: { defenseLimit: 50 } },
            2: { cost: { coin: 1000, fish: 100 }, effect: { defenseLimit: 100 } },
            3: { cost: { coin: 2500, fish: 250 }, effect: { defenseLimit: 200 } }
        }
    }
};

// --- ДАННЫЕ ЮНИТОВ (4 ТИПА) ---
const UNIT_DATA = {
    ScoutCat: {
        type: 'ScoutCat',
        icon: 'icon_res_energy', 
        T1: { name: 'Scout T1', cost: { coin: 50 }, time: 3, power: 15, upkeep: 0.1 }, 
        T2: { name: 'Scout T2', cost: { coin: 400 }, time: 6, power: 75, upkeep: 0.2 }, 
        T3: { name: 'Scout T3', cost: { coin: 2000 }, time: 20, power: 375, upkeep: 0.5 }, 
        T4: { name: 'Scout T4', cost: { coin: 8000 }, time: 60, power: 1500, upkeep: 1.0 }, 
    },
    DefenderCat: {
        type: 'DefenderCat',
        icon: 'icon_res_gold',
        T1: { name: 'Defender T1', cost: { coin: 75 }, time: 4, power: 20, upkeep: 0.15 }, 
        T2: { name: 'Defender T2', cost: { coin: 800 }, time: 10, power: 100, upkeep: 0.3 }, 
        T3: { name: 'Defender T3', cost: { coin: 4000 }, time: 30, power: 500, upkeep: 0.75 }, 
        T4: { name: 'Defender T4', cost: { coin: 16000 }, time: 120, power: 2000, upkeep: 1.5 }, 
    },
    AttackerCat: {
        type: 'AttackerCat',
        icon: 'icon_res_gem',
        T1: { name: 'Attacker T1', cost: { coin: 100 }, time: 5, power: 25, upkeep: 0.2 }, 
        T2: { name: 'Attacker T2', cost: { coin: 1000 }, time: 12, power: 125, upkeep: 0.4 }, 
        T3: { name: 'Attacker T3', cost: { coin: 5000 }, time: 40, power: 600, upkeep: 1.0 }, 
        T4: { name: 'Attacker T4', cost: { coin: 20000 }, time: 180, power: 2500, upkeep: 2.0 }, 
    },
    EngineerCat: { 
        type: 'EngineerCat',
        icon: 'icon_build', 
        T1: { name: 'Engineer T1', cost: { coin: 30 }, time: 2, power: 10, upkeep: 0.05 }, 
        T2: { name: 'Engineer T2', cost: { coin: 600 }, time: 8, power: 50, upkeep: 0.1 }, 
        T3: { name: 'Engineer T3', cost: { coin: 3000 }, time: 25, power: 300, upkeep: 0.25 }, 
        T4: { name: 'Engineer T4', cost: { coin: 12000 }, time: 90, power: 1200, upkeep: 0.5 }, 
    },
};

// --- ДАННЫЕ ТРЕЙДЕРОВ ---
const TRADER_DATA = {
    T1: { name: 'Novice Trader', cost: { coin: 1000 }, incomePerHour: 60, limit: 5 },
    T2: { name: 'Expert Trader', cost: { coin: 5000 }, incomePerHour: 360, limit: 5 },
    T3: { name: 'Master Merchant', cost: { coin: 25000, gem: 100 }, incomePerHour: 1800, limit: 5 },
    T4: { name: 'Tycoon Cat', cost: { coin: 100000, gem: 500 }, incomePerHour: 10000, limit: 5 },
};

// --- НАЗВАНИЯ ЗДАНИЙ ДЛЯ UI ---
const BUILDING_NAMES = {
    CENTER: "Town Hall",
    BANK: "Bank",
    ACADEMY: "Academy",
    MARKET: "Market",
    TANK: "Crypto Lab",
    DEFENSE_TOWER: "Defense Tower"
};

// --- ЛИМИТЫ ЮНИТОВ В АКАДЕМИИ ПО УРОВНЯМ ---
const ACADEMY_UNIT_LIMITS = {
    1: 100,
    2: 250,
    3: 500,
    4: 1000,
    5: 2000,
    6: 4000,
    7: 8000,
    8: 15000,
    9: 30000,
    10: 60000
};

// --- СОСТОЯНИЕ ИГРЫ ---
let GAME_STATE = {
    resources: {
        coin: 2000, 
        gem: 100,
        fish: 1000,
    },
    storageCapacity: {
        base: 1000, 
        coin: 1000, 
        gem: 500,
        fish: 1000,
    },
    // --- ВСТАВИТЬ ПОСЛЕ storageCapacity ---
    hero: {
        level: 1,
        xp: 0,
        maxXp: 100,
        skillPoints: 0,
        stats: {
            str: 0, // Сила (Дает бонус к Account Power)
            cha: 0, // Харизма (Увеличивает лимит в Академии)
            int: 0  // Интеллект (Увеличивает получаемый опыт)
        }
    },
    units: { ScoutCat: 0, DefenderCat: 0, AttackerCat: 0, EngineerCat: 0 }, 
    traders: { T1: 0, T2: 0, T3: 0, T4: 0 },
    unitQueues: { ScoutCat: [], DefenderCat: [], AttackerCat: [], EngineerCat: [] }, 
    totalPower: 0,
    incomePerSecond: 0,
    upkeepPerHour: 0, // Новое поле: содержание юнитов в час
    lastIncomeTime: Date.now(),
    
    // Новое поле: юниты на обороне
    defenseUnits: { ScoutCat: 0, DefenderCat: 0, AttackerCat: 0, EngineerCat: 0 },
    maxDefenseUnits: 0, // Будет рассчитываться от уровня башни
    
    quests: {
        telegram_sub: { completed: false, claimed: false }
    },

    // Состояние промокодов
    codes: {
        "CRYPTOKOT": { used: false, reward: { coin: 1000 } }
    },
    
    // Реферальная система (заглушка)
    referrals: {
        count: 0,
        link: "https://t.me/CryptoCatsBot?start=ref_12345"
    },

    buildings: {
        CENTER: {
            level: 1,
            isBuilt: true, 
            description: "Центр управления.",
            upgradeStartTime: 0, upgradeDuration: 10000, isUpgrading: false,
            upgradeCost: { coin: 1000 }
        },
        BANK: { 
            level: 1,
            isBuilt: false,
            buildCost: { coin: 100 }, 
            buildDuration: 3000, 
            isConstructing: false,
            constructionStartTime: 0,
            description: "Банк хранит ресурсы.",
            upgradeStartTime: 0, upgradeDuration: 5000, isUpgrading: false,
            upgradeCost: { coin: 500 }
        },
        ACADEMY: { 
            level: 1,
            isBuilt: false,
            buildCost: { coin: 200 }, // Изменено с 100 на 200
            buildDuration: 3000,
            isConstructing: false,
            constructionStartTime: 0,
            description: "Казарма, здесь обучаются боевые коты.",
            upgradeStartTime: 0, upgradeDuration: 3000, isUpgrading: false,
            upgradeCost: { coin: 1000 } // Изменено с 500 на 1000
        },
        MARKET: { 
            level: 1, 
            isBuilt: false,
            buildCost: { coin: 100 },
            buildDuration: 3000,
            isConstructing: false,
            constructionStartTime: 0,
            description: "Рынок обеспечивает базовый доход.", 
            upgradeStartTime: 0, upgradeDuration: 5000, isUpgrading: false,
            upgradeCost: { coin: 800 }
        },
        TANK: { 
            level: 1, 
            isBuilt: false,
            buildCost: { coin: 100 },
            buildDuration: 3000,
            isConstructing: false,
            constructionStartTime: 0,
            description: "Лаборатория исследований.", 
            isUpgrading: false,
            upgradeStartTime: 0, upgradeDuration: 8000,
            upgradeCost: { coin: 1500 }
        },
        DEFENSE_TOWER: { 
            level: 0, // Начинаем с 0
            isBuilt: false,
            buildCost: { coin: 500, fish: 50 }, 
            buildDuration: 10000, // 10 секунд
            isConstructing: false,
            constructionStartTime: 0,
            description: "Оборонительная Вышка. Увеличивает лимит защитных юнитов.", 
            isUpgrading: false,
            upgradeStartTime: 0, 
            upgradeDuration: 15000, // 15 секунд на апгрейд
            upgradeCost: { coin: 1000, fish: 100 }
        }
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
    building_defense: { alias: 'building_defense', src: 'images/building_tank.png' },

    icon_power_cat: { alias: 'icon_power_cat', src: 'images/heroes_icon.png' }, 
    settings_icon: { alias: 'settings_icon', src: 'images/settings_icon.png' }, 

    // Пользовательская модель (поместите файл images/satoshi.png в папку webapp/images)
    satoshi: { alias: 'satoshi', src: 'images/satoshi.png' },

    icon_res_coin: { alias: 'icon_res_coin', src: 'images/icon_res_coin.png' },
    icon_res_gem: { alias: 'icon_res_gem', src: 'images/icon_res_gem.png' },
    icon_res_gold: { alias: 'icon_res_gold', src: 'images/icon_res_gold.png' }, 
    icon_res_energy: { alias: 'icon_res_energy', src: 'images/icon_res_energy.png' },
    icon_res_fish: { alias: 'icon_res_fish', src: 'images/icon_res_fish.png' }, 

    icon_build: { alias: 'icon_build', src: 'images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'images/icon_map.png' }, 
    // Используем icon_train как иконку друзей пока нет спец иконки
    icon_friends: { alias: 'icon_friends', src: 'images/icon_train.png' },
};

function updateGameCalculations() {
    // ВАЖНО: Делаем общую проверку на наличие основных структур
    if (!GAME_STATE || !GAME_STATE.buildings || !GAME_STATE.storageCapacity) {
        return; 
    }
    
    const BASE = GAME_STATE.storageCapacity.base;
    
    // 1. Расчет Хранилища (BANK) - ТОЛЬКО для монет
    const bank = GAME_STATE.buildings.BANK;
    
    if(bank && bank.isBuilt) { 
        const bankLvl = bank.level;
        GAME_STATE.storageCapacity.coin = BASE + (bankLvl * 1000); 
    } else {
        GAME_STATE.storageCapacity.coin = BASE;
    }
    
    // 2. Расчет Лимита Защиты (DEFENSE_TOWER) - ИСПРАВЛЕННАЯ ЛОГИКА
    let totalDefenseLimit = 0;
    const defenseTower = GAME_STATE.buildings.DEFENSE_TOWER;
    
    if(defenseTower && defenseTower.isBuilt && defenseTower.level > 0) { 
        // ПРОСТАЯ ЛОГИКА: каждый уровень дает +50 слотов защиты
        totalDefenseLimit = defenseTower.level * 50;
    }
    GAME_STATE.maxDefenseUnits = totalDefenseLimit; 
    
    // 3. Расчет Дохода (MARKET и TRADERS)
    let totalIncomePerHour = 0;
    const market = GAME_STATE.buildings.MARKET;
    
    if(market && market.isBuilt) { 
        const marketLvl = market.level;
        totalIncomePerHour += marketLvl * 50; 
    }
    
    for(let tier in TRADER_DATA) {
        totalIncomePerHour += (GAME_STATE.traders[tier] || 0) * TRADER_DATA[tier].incomePerHour;
    }
    GAME_STATE.incomePerSecond = totalIncomePerHour / 3600; 
    
    // 4. Расчет содержания армии (UPKEEP)
    let totalUpkeepPerHour = 0;
    for(let unitType in GAME_STATE.units) {
        const unitCount = GAME_STATE.units[unitType] || 0;
        const unitData = UNIT_DATA[unitType];
        if(unitData && unitData.T1) {
            totalUpkeepPerHour += unitCount * (unitData.T1.upkeep || 0);
        }
    }
    // Добавляем содержание юнитов на защите
    for(let unitType in GAME_STATE.defenseUnits) {
        const defenseCount = GAME_STATE.defenseUnits[unitType] || 0;
        const unitData = UNIT_DATA[unitType];
        if(unitData && unitData.T1) {
            totalUpkeepPerHour += defenseCount * (unitData.T1.upkeep || 0);
        }
    }
    GAME_STATE.upkeepPerHour = totalUpkeepPerHour;
    
    // 5. Обновление UI (с защитой от ошибок)
    if(SceneManager && SceneManager.currentScene && SceneManager.currentScene.updateTopUI) {
        SceneManager.currentScene.updateTopUI();
    }
}

// =========================================================================
// ================== СОХРАНЕНИЕ / ЗАГРУЗКА ИГРЫ ===========================
// =========================================================================

const SAVE_KEY = 'cryptocats_save_v3'; // Изменил ключ для новой версии

function saveGame() {
    try {
        GAME_STATE.lastSaveTime = Date.now();
        
        // Глубокое копирование без функций и visualRef
        const stateToSave = JSON.parse(JSON.stringify(GAME_STATE));
        
        // Удаляем временные поля (visualRef и т.д.)
        for(let key in stateToSave.buildings) {
            if(stateToSave.buildings[key]) {
                delete stateToSave.buildings[key].visualRef;
            }
        }
        
        // Добавляем версию сохранения
        stateToSave.saveVersion = 3;
        stateToSave.saveTimestamp = Date.now();
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        console.log("Игра сохранена успешно", new Date().toLocaleTimeString());
    } catch (e) {
        console.error("Ошибка сохранения игры:", e);
    }
}

function loadGame() {
    try {
        const serializedState = localStorage.getItem(SAVE_KEY);
        if (serializedState === null) {
            console.log("Сохранение не найдено. Начинаем новую игру.");
            return; 
        }
        
        const loadedState = JSON.parse(serializedState);
        
        // Проверка версии сохранения
        if (!loadedState.saveVersion || loadedState.saveVersion < 3) {
            console.log("Старая версия сохранения, создаем новую игру");
            localStorage.removeItem(SAVE_KEY);
            return;
        }
        
        console.log("Загружаем сохраненную игру...");
        
        // --- БЕЗОПАСНОЕ ВОССТАНОВЛЕНИЕ СТЕЙТА ---
        // Восстанавливаем только нужные поля, а не весь объект
        if (loadedState.resources) {
            Object.assign(GAME_STATE.resources, loadedState.resources);
        }
        
        if (loadedState.storageCapacity) {
            Object.assign(GAME_STATE.storageCapacity, loadedState.storageCapacity);
        }
        
        if (loadedState.units) {
            Object.assign(GAME_STATE.units, loadedState.units);
        }
        
        if (loadedState.traders) {
            Object.assign(GAME_STATE.traders, loadedState.traders);
        }
        
        // Восстанавливаем очереди юнитов
        if (loadedState.unitQueues) {
            for(let key in loadedState.unitQueues) {
                if(GAME_STATE.unitQueues[key]) {
                    // Фильтруем старые записи в очереди
                    const now = Date.now();
                    GAME_STATE.unitQueues[key] = loadedState.unitQueues[key].filter(item => {
                        // Если юнит уже должен был быть готов, добавляем его сразу
                        if(item.finish <= now) {
                            GAME_STATE.units[item.type] = (GAME_STATE.units[item.type] || 0) + 1;
                            return false;
                        }
                        return true;
                    });
                }
            }
        }
        
        if (loadedState.buildings) {
            for(let key in loadedState.buildings) {
                if(GAME_STATE.buildings[key]) {
                    // Сохраняем основные поля, но не перезаписываем объекты PIXI
                    const target = GAME_STATE.buildings[key];
                    const source = loadedState.buildings[key];
                    
                    target.level = source.level || target.level;
                    target.isBuilt = source.isBuilt !== undefined ? source.isBuilt : target.isBuilt;
                    target.isConstructing = source.isConstructing !== undefined ? source.isConstructing : target.isConstructing;
                    target.constructionStartTime = source.constructionStartTime || target.constructionStartTime;
                    target.isUpgrading = source.isUpgrading !== undefined ? source.isUpgrading : target.isUpgrading;
                    target.upgradeStartTime = source.upgradeStartTime || target.upgradeStartTime;
                    
                    // Исправление бага: если здание строилось, но время прошло - завершаем строительство
                    const now = Date.now();
                    if(target.isConstructing && target.constructionStartTime + target.buildDuration <= now) {
                        target.isBuilt = true;
                        target.isConstructing = false;
                        if(key === 'DEFENSE_TOWER' && target.level === 0) {
                            target.level = 1;
                        }
                    }
                    
                    // Исправление бага: если апгрейд прошел - завершаем его
                    if(target.isUpgrading && target.upgradeStartTime + target.upgradeDuration <= now) {
                        target.level = (target.level || 1) + 1;
                        target.isUpgrading = false;
                    }
                }
            }
        }
        
        // Восстанавливаем дополнительные поля если они есть
        if (loadedState.defenseUnits) {
            GAME_STATE.defenseUnits = loadedState.defenseUnits;
        }
        
        if (loadedState.maxDefenseUnits !== undefined) {
            GAME_STATE.maxDefenseUnits = loadedState.maxDefenseUnits;
        }
        
        if (loadedState.totalPower !== undefined) {
            GAME_STATE.totalPower = loadedState.totalPower;
        }
        
        if (loadedState.incomePerSecond !== undefined) {
            GAME_STATE.incomePerSecond = loadedState.incomePerSecond;
        }
        
        if (loadedState.upkeepPerHour !== undefined) {
            GAME_STATE.upkeepPerHour = loadedState.upkeepPerHour;
        }
        
        if (loadedState.lastIncomeTime !== undefined) {
            GAME_STATE.lastIncomeTime = loadedState.lastIncomeTime;
        }
        
        if (loadedState.quests) {
            Object.assign(GAME_STATE.quests, loadedState.quests);
        }
        
        if (loadedState.codes) {
            Object.assign(GAME_STATE.codes, loadedState.codes);
        }
        
        if (loadedState.referrals) {
            Object.assign(GAME_STATE.referrals, loadedState.referrals);
        }
        
        // --- ОБРАБОТКА ОФФЛАЙН-ПРОГРЕССА ---
        const now = Date.now();
        const lastSave = loadedState.lastSaveTime || now;
        const timeSinceLastSave = Math.max(0, now - lastSave); 
        const secondsOffline = Math.floor(timeSinceLastSave / 1000);
        
        if (secondsOffline > 1) { 
            // Расчет дохода и содержания
            let incomeGained = (GAME_STATE.incomePerSecond || 0) * secondsOffline;
            let upkeepCost = (GAME_STATE.upkeepPerHour || 0) / 3600 * secondsOffline;
            
            const currentCoin = GAME_STATE.resources.coin || 0;
            const maxCoin = GAME_STATE.storageCapacity.coin || Infinity;
            
            // Расчет монеты (доход минус содержание)
            if (currentCoin < maxCoin) {
                const netGain = Math.max(0, incomeGained - upkeepCost);
                const coinGain = Math.min(netGain, maxCoin - currentCoin);
                GAME_STATE.resources.coin = currentCoin + coinGain;
                if (coinGain > 0) console.log(`Оффлайн-прогресс: +${coinGain.toFixed(0)} монет за ${secondsOffline} секунд.`);
                if (upkeepCost > 0) console.log(`Содержание: -${upkeepCost.toFixed(1)} монет`);
            }
        }
        
        // Обновляем расчеты после загрузки
        updateGameCalculations();
        
        console.log("Игра загружена успешно. Время сохранения:", new Date(loadedState.saveTimestamp).toLocaleString());

    } catch (e) {
        console.error("Ошибка загрузки игры. Начинаем новую игру.", e);
        localStorage.removeItem(SAVE_KEY); 
    }
}

// =========================================================================
// ================== БАЗОВЫЙ КЛАСС ========================================
// =========================================================================

class BaseScene extends PIXI.Container {
    constructor(manager) {
        super();
        this.manager = manager;
        this.sortableChildren = true; 
        this.infoModal = null; 
    }
    
    init() {
        this.updateTotalPower();let total = 0;
        // Считаем силу юнитов
        for (const typeKey in UNIT_DATA) {
            const unitCount = (GAME_STATE.units[typeKey] || 0) + (GAME_STATE.defenseUnits[typeKey] || 0);
            const uData = UNIT_DATA[typeKey];
            if(uData) {
                const unitPower = uData.T1.power || 0; 
                total += unitCount * unitPower;
            }
        }
        
        // --- НОВОЕ: Добавляем силу героя (1 STR = 100 Power) ---
        if(GAME_STATE.hero) {
            total += (GAME_STATE.hero.stats.str * 100);
        }

        GAME_STATE.totalPower = total; 
        this.addTopUI(); 
    }
    
    addTopUI() {
        this.children.filter(c => c.isTopUI).forEach(c => c.destroy({children:true}));

        const topBar = new PIXI.Graphics().rect(0, 0, APP_WIDTH, 100).fill({ color: 0x1A1A1A, alpha: 0.9 });
        topBar.zIndex = 100;
        topBar.isTopUI = true;
        this.addChild(topBar);
        
        const caps = GAME_STATE.storageCapacity;
        
        // --- ОБМЕНЯЛИ МЕСТАМИ GEM и FISH ---
        const resList = [
            { icon: ASSETS.icon_res_coin.alias, val: Math.floor(GAME_STATE.resources.coin), cap: caps.coin },
            { icon: ASSETS.icon_res_fish.alias, val: Math.floor(GAME_STATE.resources.fish), cap: caps.fish },
            { icon: ASSETS.icon_res_gem.alias, val: Math.floor(GAME_STATE.resources.gem), cap: caps.gem },
        ];
        
        let startX = 80; 
        const spacing = 160; 
        
        resList.forEach((res, i) => {
             this.createResDisplay(topBar, res.icon, res.val, res.cap, startX + i * spacing, 50);
        });
        
        const powerCont = new PIXI.Container();
        powerCont.position.set(APP_WIDTH - 20, 30); 
        topBar.addChild(powerCont);
        
        const iconP = PIXI.Sprite.from(ASSETS.icon_power_cat.alias);
        iconP.anchor.set(0.5); iconP.scale.set(0.045); 
        iconP.x = -135; iconP.y = 5; 
        powerCont.addChild(iconP);

        const pTextLabel = new PIXI.Text(`ACCOUNT POWER`, {fontFamily:'Arial', fontSize:12, fill:0xFFFFFF});
        pTextLabel.anchor.set(1, 0.5);
        pTextLabel.x = 0; pTextLabel.y = -10; 
        powerCont.addChild(pTextLabel);

        const pTextVal = new PIXI.Text(`${GAME_STATE.totalPower.toLocaleString()}`, {fontFamily:'Arial', fontSize:18, fill:0xFFD700, fontWeight:'bold'});
        pTextVal.anchor.set(1, 0.5);
        pTextVal.x = 0; pTextVal.y = 15;
        powerCont.addChild(pTextVal);
        
        // Доход и содержание
        let incomePerHour = (GAME_STATE.incomePerSecond * 3600).toFixed(0);
        let upkeepPerHour = GAME_STATE.upkeepPerHour || 0;
        let netIncome = incomePerHour - upkeepPerHour;
        
        const incText = new PIXI.Text(`Чистый доход: ${netIncome >= 0 ? '+' : ''}${netIncome.toFixed(0)}/ч`, {
            fontFamily:'Arial', 
            fontSize:14, 
            fill: netIncome >= 0 ? 0x00FF00 : 0xFF4444
        });
        incText.anchor.set(1, 0.5);
        incText.position.set(APP_WIDTH - 20, 80);
        topBar.addChild(incText);
        
        // --- НАСТРОЙКИ (ШЕСТЕРЕНКА) ---
        const settBtn = PIXI.Sprite.from(ASSETS.settings_icon.alias);
        settBtn.anchor.set(0.5); settBtn.scale.set(0.06);
        settBtn.x = APP_WIDTH - 25; settBtn.y = 130;
        settBtn.eventMode='static'; settBtn.cursor='pointer';
        settBtn.isTopUI = true; 
        settBtn.on('pointertap', () => this.openSettingsMenu());
        this.addChild(settBtn);
    }

    createResDisplay(parent, iconAlias, val, cap, x, y) {
        const cont = new PIXI.Container();
        cont.position.set(x, y);
        
        const bg = new PIXI.Graphics().roundRect(-60, -25, 120, 50, 15).fill({color:0x333333});
        cont.addChild(bg);
        
        if(PIXI.Assets.cache.has(iconAlias)) {
            const icon = PIXI.Sprite.from(iconAlias);
            icon.anchor.set(0.5); icon.scale.set(0.05); icon.x = -40;
            cont.addChild(icon);
        }
        
        const isFull = val >= cap;
        const txt = new PIXI.Text(`${val.toLocaleString()}/${cap.toLocaleString()}`, { 
            fontFamily:'Arial', fontSize: 14, 
            fill: isFull ? 0xFFD700 : 0xFFFFFF, 
            fontWeight:'bold'
        });
        txt.anchor.set(0, 0.5); txt.x = -20;
        cont.addChild(txt);
        parent.addChild(cont);
    }

    updateTotalPower() {
        let total = 0;
        for (const typeKey in UNIT_DATA) {
            const unitCount = (GAME_STATE.units[typeKey] || 0) + (GAME_STATE.defenseUnits[typeKey] || 0);
            const uData = UNIT_DATA[typeKey];
            if(uData) {
                const unitPower = uData.T1.power || 0; 
                total += unitCount * unitPower;
            }
        }
        GAME_STATE.totalPower = total; 
        this.addTopUI(); 
    }

    formatCost(cost) {
        return Object.keys(cost).map(key => `${cost[key].toLocaleString()} ${key}`).join(', ');
    }
    
    showInfoModal(title, text) {
        // Закрываем активное меню (например, меню здания), чтобы модалка была сверху
        try {
            if (this.manager && this.manager.currentScene && this.manager.currentScene.activeMenu) {
                this.manager.currentScene.closeMenu();
            }
        } catch (e) {
            // ignore
        }
        if(this.infoModal) this.infoModal.destroy({children:true});
        const W = APP_WIDTH * 0.85, H = APP_HEIGHT * 0.4;
        const m = new PIXI.Container();
        m.zIndex = 200; m.x = APP_WIDTH/2; m.y = APP_HEIGHT/2;
        m.eventMode='static';
        this.infoModal = m;
        this.addChild(m);
        
        const bg = new PIXI.Graphics().roundRect(-W/2, -H/2, W, H, 20)
            .fill({color:0x000000, alpha:0.95}).stroke({width:4, color:0x39FF14});
        m.addChild(bg);
        
        const t = new PIXI.Text(title, {fontFamily:'Arial', fontSize:24, fill:0x39FF14, fontWeight:'bold', wordWrap:true, wordWrapWidth:W-20, align:'center'});
        t.anchor.set(0.5, 0); t.y = -H/2 + 20;
        m.addChild(t);
        
        const c = new PIXI.Text(text, {fontFamily:'Arial', fontSize:18, fill:0xFFFFFF, wordWrap:true, wordWrapWidth:W-40, align:'center'});
        c.anchor.set(0.5); m.addChild(c);
        
        const close = this.createSimpleButton("Закрыть", ()=>m.destroy({children:true}), 0xDC3545, 120, 40);
        close.y = H/2 - 40;
        m.addChild(close);
    }

    createSimpleButton(text, cb, color, w=200, h=60, r=15) {
        const c = new PIXI.Container();
        const g = new PIXI.Graphics().roundRect(-w/2, -h/2, w, h, r).fill({color:color});
        const t = new PIXI.Text(text, {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF, fontWeight:'bold'});
        t.anchor.set(0.5);
        c.addChild(g, t);
        c.eventMode='static'; c.cursor='pointer';
        c.on('pointertap', cb);
        c.on('pointerdown', ()=>c.scale.set(0.95));
        c.on('pointerup', ()=>c.scale.set(1));
        c.on('pointerout', ()=>c.scale.set(1));
        return c;
    }
    
    createSlider(min, max, initial, onChange) {
        const container = new PIXI.Container();
        const width = 200;
        const height = 30;
        
        // Фон слайдера (темный)
        const bg = new PIXI.Graphics()
            .roundRect(0, 0, width, height, height/2)
            .fill({color: 0x111111})
            .stroke({width: 2, color: 0x333333});
        container.addChild(bg);
        
        // Заполненная часть (зеленая)
        const fill = new PIXI.Graphics()
            .roundRect(0, 0, width * ((initial - min) / (max - min)), height, height/2)
            .fill({color: 0x4CAF50});
        container.addChild(fill);
        
        // Ползунок (белый круг)
        const slider = new PIXI.Graphics()
            .circle(0, 0, 20)
            .fill({color: 0xFFFFFF})
            .stroke({width: 3, color: 0x333333});
        slider.x = width * ((initial - min) / (max - min));
        slider.y = height / 2;
        container.addChild(slider);
        
        // Текст значения
        const valueText = new PIXI.Text(initial.toString(), {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        valueText.anchor.set(0.5);
        valueText.x = width / 2;
        valueText.y = -20;
        container.addChild(valueText);
        
        // Интерактивная область
        const hitArea = new PIXI.Graphics()
            .rect(-20, -20, width + 40, height + 40)
            .fill({color: 0xFFFFFF, alpha: 0.01});
        container.addChild(hitArea);
        hitArea.eventMode = 'static';
        hitArea.cursor = 'pointer';
        
        let isDragging = false;
        
        const updateSlider = (x) => {
            let percent = Math.max(0, Math.min(1, x / width));
            const value = Math.round(min + percent * (max - min));
            
            slider.x = percent * width;
            fill.width = percent * width;
            valueText.text = value.toString();
            
            if (onChange) {
                onChange(value);
            }
            
            return value;
        };
        
        hitArea.on('pointerdown', (e) => {
            if (e.stopPropagation) e.stopPropagation();
            try { if (e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); } catch(_){}
            isDragging = true;
            const local = container.toLocal(e.global);
            updateSlider(local.x);
        });
        
        hitArea.on('pointermove', (e) => {
            if (e.stopPropagation) e.stopPropagation();
            try { if (e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); } catch(_){}
            if (isDragging) {
                const local = container.toLocal(e.global);
                updateSlider(local.x);
            }
        });
        
        hitArea.on('pointerup', (e) => {
            if (e.stopPropagation) e.stopPropagation();
            try { if (e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); } catch(_){}
            isDragging = false;
        });
        
        hitArea.on('pointerupoutside', (e) => {
            if (e.stopPropagation) e.stopPropagation();
            try { if (e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); } catch(_){}
            isDragging = false;
        });
        
        container.sliderValue = initial;
        container.updateValue = (val) => {
            updateSlider((val - min) / (max - min) * width);
        };
        
        return container;
    }

    // --- МЕНЮ НАСТРОЕК ---
    openSettingsMenu() {
        // Закрываем активное меню перед открытием модалки
        try { this.closeMenu(); } catch (_) {}
        if(this.infoModal) this.infoModal.destroy({children:true});
        const W = APP_WIDTH * 0.85, H = APP_HEIGHT * 0.4;
        const m = new PIXI.Container();
        m.zIndex = 1000; m.x = APP_WIDTH/2; m.y = APP_HEIGHT/2;
        m.eventMode='static';
        this.infoModal = m;
        this.addChild(m);

        // Фон как у зданий
        const bg = new PIXI.Graphics().roundRect(-W/2, -H/2, W, H, 20)
            .fill({color:0x111111, alpha:0.98}).stroke({width:3, color:0xAAAAAA});
        m.addChild(bg);

        const title = new PIXI.Text("НАСТРОЙКИ", {fontFamily:'Arial', fontSize:28, fill:0xFFFFFF, fontWeight:'bold'});
        title.anchor.set(0.5); title.y = -H/2 + 30;
        m.addChild(title);

        // Кнопка ввода кода
        const inputBtn = this.createSimpleButton("ВВЕСТИ КОД", ()=>{
            const code = prompt("Введите промокод:");
            if(code) {
                this.checkBonusCode(code.trim().toUpperCase());
            }
        }, 0x3C8CE7, 250, 60);
        inputBtn.y = -20;
        m.addChild(inputBtn);

        const hint = new PIXI.Text("Попробуй: CRYPTOKOT", {fontFamily:'Arial', fontSize:14, fill:0x777777});
        hint.anchor.set(0.5); hint.y = 25;
        m.addChild(hint);

        // Кнопка сохранения
        const saveBtn = this.createSimpleButton("СОХРАНИТЬ", ()=>{
            saveGame();
            alert("Игра сохранена!");
        }, 0x28A745, 200, 50);
        saveBtn.y = 70;
        m.addChild(saveBtn);

        const close = this.createSimpleButton("Закрыть", ()=>m.destroy({children:true}), 0xDC3545, 120, 40);
        close.y = H/2 - 40;
        m.addChild(close);
    }

    checkBonusCode(code) {
        if (GAME_STATE.codes[code]) {
            if (!GAME_STATE.codes[code].used) {
                GAME_STATE.codes[code].used = true;
                const reward = GAME_STATE.codes[code].reward;
                
                let msg = "Награда получена:\n";
                if(reward.coin) {
                    GAME_STATE.resources.coin += reward.coin;
                    msg += `+${reward.coin} Coin\n`;
                }
                updateGameCalculations();
                this.addTopUI();
                alert(msg);
            } else {
                alert("Этот код уже использован!");
            }
        } else {
            alert("Неверный код!");
        }
    }

    addBackgroundCover(alias) {
        if(!PIXI.Assets.cache.has(alias)) return;
        const sp = PIXI.Sprite.from(alias);
        const sc = Math.max(APP_WIDTH/sp.width, APP_HEIGHT/sp.height);
        sp.scale.set(sc); sp.anchor.set(0.5); sp.x=APP_WIDTH/2; sp.y=APP_HEIGHT/2; sp.zIndex=-10;
        this.addChild(sp);
    }
}

// --- МЕНЕДЖЕР СЦЕН ---
class SceneController {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
    }
    async changeScene(Class, param) {
        if(this.currentScene) {
            this.currentScene.destroy({children:true});
            this.app.stage.removeChild(this.currentScene);
        }
        this.currentScene = new Class(this);
        this.app.stage.addChild(this.currentScene);
        // Удаляем DOM-экран загрузки при переходе между сценами (если остался)
        try {
            const loaderEl = document.getElementById('loading-screen');
            if (loaderEl) loaderEl.remove();
        } catch(e) {}
        this.currentScene.init(param);
    }
}

// --- ГЛАВНОЕ МЕНЮ ---
class MainMenuScene extends BaseScene {
    constructor(manager) { super(manager); this.activeMenu = null; this.buildingsContainer = null; }
    
    init() {
        super.init(); 
        this.addBackgroundCover('map_background');
        
        // Контейнер зданий должен быть ниже UI, но выше фона.
        this.buildingsContainer = new PIXI.Container();
        this.buildingsContainer.sortableChildren = true; // Важно для Z-index внутри зданий
        this.addChild(this.buildingsContainer);
        
        this.renderBuildings();
        
        this.addBottomNavigation();
        this.eventMode='static';
        this.on('pointertap', ()=>this.closeMenu());
        
        this.timerFn = ()=>this.updateMenuTimers();
        app.ticker.add(this.timerFn);
    }
    
    destroy(opt) {
        if(this.timerFn) app.ticker.remove(this.timerFn);
        super.destroy(opt);
    }
    
    renderBuildings() {
        this.buildingsContainer.removeChildren();

        const addB = (alias, x, y, type, scale) => {
            const bData = GAME_STATE.buildings[type];
            const cont = new PIXI.Container();
            
            // --- ФИКС БАГА С НАЖАТИЕМ ---
            cont.x = x; 
            cont.y = y;
            cont.zIndex = y + (type === 'CENTER' ? -5000 : 0);

            if (bData.isBuilt) {
                const sp = PIXI.Sprite.from(alias);
                sp.anchor.set(0.5); sp.scale.set(scale); 
                sp.eventMode='static'; sp.cursor='pointer';
                sp.on('pointertap', (e)=>{ 
                    e.stopPropagation();
                    this.openMenu(cont, type); 
                });
                cont.addChild(sp);
            } else {
                // --- 3D "ПЛИТКА" (ФУНДАМЕНТ) ---
                const w = 150 * scale * 2.5; 
                const h = 150 * scale * 2.5;
                
                const g = new PIXI.Graphics();
                
                // Рисуем изометрический ромб
                g.poly([
                    0, -h/3,
                    w/2, 0,
                    0, h/3,
                    -w/2, 0
                ]).fill({color:0x111111});
                
                // Боковая грань (толщина) - для 3D эффекта
                g.poly([
                    -w/2, 0,
                    0, h/3,
                    0, h/3 + 15,
                    -w/2, 15
                ]).fill({color:0x000000});
                
                g.poly([
                    0, h/3,
                    w/2, 0,
                    w/2, 15,
                    0, h/3 + 15
                ]).fill({color:0x000000});

                // Обводка
                g.moveTo(0, -h/3).lineTo(w/2, 0).lineTo(0, h/3).lineTo(-w/2, 0).closePath().stroke({width:2, color:0xFFFFFF, alpha:0.5});

                cont.addChild(g);
                
                // Хитбокс для клика
                g.eventMode='static'; g.cursor='pointer';
                g.on('pointertap', (e) => {
                    e.stopPropagation();
                    this.tryBuild(type);
                });

                if(bData.isConstructing) {
                    const t = new PIXI.Text("...", {fontFamily:'Arial', fontSize:20, fill:0xFFA500, fontWeight:'bold'});
                    t.anchor.set(0.5); t.y = -10;
                    cont.addChild(t);
                    cont.timerLabel = t; 
                } else {
                    const plus = new PIXI.Text("+", {fontFamily:'Arial', fontSize:50, fill:0xFFFFFF, fontWeight:'bold'});
                    plus.anchor.set(0.5); plus.y = -20;
                    cont.addChild(plus);
                    
                    const price = new PIXI.Text(`${bData.buildCost.coin}`, {fontFamily:'Arial', fontSize:16, fill:0xFFD700});
                    price.anchor.set(0.5); price.y = 20;
                    cont.addChild(price);
                }
            }

            this.buildingsContainer.addChild(cont);
            bData.visualRef = cont;
        };

        const SCALE_CENTER = 0.41;
        const SCALE_BANK = 0.3;
        const SCALE_OTHER = 0.3;

        addB('building_center', APP_WIDTH/2 + 80, APP_HEIGHT/2 + 40, 'CENTER', SCALE_CENTER); 
        addB('building_bank', APP_WIDTH/2 - 190, APP_HEIGHT/2 - 100, 'BANK', SCALE_BANK); 
        addB('building_lab', APP_WIDTH/2 + 220, APP_HEIGHT/2 - 100, 'ACADEMY', SCALE_OTHER); 
        addB('building_market', APP_WIDTH/2 + 220, APP_HEIGHT/2 + 250, 'MARKET', SCALE_OTHER); 
        addB('building_tank', APP_WIDTH/2 - 190, APP_HEIGHT/2 + 250, 'TANK', SCALE_OTHER);
        addB('building_defense', APP_WIDTH/2 - 10, APP_HEIGHT/2 - 200, 'DEFENSE_TOWER', SCALE_OTHER);
    }

    tryBuild(type) {
        const b = GAME_STATE.buildings[type];
        if(b.isConstructing) return;
        
        if(GAME_STATE.resources.coin >= b.buildCost.coin && 
           (!b.buildCost.fish || GAME_STATE.resources.fish >= b.buildCost.fish)) {
            GAME_STATE.resources.coin -= b.buildCost.coin;
            if(b.buildCost.fish) GAME_STATE.resources.fish -= b.buildCost.fish;
            b.isConstructing = true;
            b.constructionStartTime = Date.now();
            this.updateTotalPower();
            this.renderBuildings(); 
        } else {
            let msg = `Нужно: ${b.buildCost.coin} монет`;
            if(b.buildCost.fish) msg += ` и ${b.buildCost.fish} рыбы`;
            this.showInfoModal("Стройка", msg);
        }
    }

    openMenu(container, type) {
        this.closeMenu();
        const bData = GAME_STATE.buildings[type];
        if(!bData) return;

        const m = new PIXI.Container();
        m.zIndex=500; 
        m.x = container.x; 
        
        let yOffsetBase = 70;

        // --- ТАУН ХОЛЛ (CENTER): кнопки ровно под зданием ---
        if(type === 'CENTER') {
            yOffsetBase = 120;
            m.x -= 65;
        }
        
        // --- БАНК (BANK): кнопки немного выше ---
        else if(type === 'BANK') {
            yOffsetBase = 90;
        }
        
        // --- DEFENSE_TOWER: тоже выше ---
        else if(type === 'DEFENSE_TOWER') {
            yOffsetBase = 90;
        }

        m.y = container.y + yOffsetBase; 

        this.addChild(m);
        this.activeMenu = { container: m, type: type, upLabel: null };

        const upBtn = this.createPentagon("UP", 0xFFA500, ()=>{
            if(bData.isUpgrading) return;
            const cost = bData.upgradeCost || {coin:1000};
            let ok = true;
            for(let k in cost) if(GAME_STATE.resources[k] < cost[k]) ok=false;
            
            if(ok) {
                for(let k in cost) GAME_STATE.resources[k] -= cost[k];
                this.updateTotalPower();
                bData.isUpgrading=true; 
                bData.upgradeStartTime=Date.now();
                saveGame(); // Сохраняем после начала апгрейда
            } else {
                this.showInfoModal("Ошибка", "Не хватает ресурсов!");
            }
        });
        upBtn.x = -70; upBtn.y = 0;
        m.addChild(upBtn);
        this.activeMenu.upLabel = upBtn.lbl;

        let useTxt = "Вход", useCol = 0x3C8CE7, useAct = ()=>{};
        let infoText = bData.description;
        
        if(type === 'ACADEMY') { 
            useTxt="Найм"; useCol=0x00FF00; useAct=()=>this.manager.changeScene(AcademyScene); 
        }
        else if(type === 'CENTER') { 
            useTxt="Юниты"; useCol=0x00FF00; useAct=()=>this.showUnitList(); 
        }
        else if(type === 'MARKET') { 
            useTxt="Трейдеры"; useCol=0x00FF00; useAct=()=>this.manager.changeScene(MarketScene); 
            const marketLvl = GAME_STATE.buildings.MARKET.level;
            const baseIncome = marketLvl * 50;
            const traderIncome = ((GAME_STATE.incomePerSecond * 3600) - baseIncome);
            const upkeep = GAME_STATE.upkeepPerHour || 0;
            infoText = `Рынок дает пассивный базовый доход монетами (Coin) за свой уровень.\n\nТекущий уровень: ${marketLvl}\nБазовый доход: ${baseIncome}/час\nДоход от трейдеров: ${traderIncome.toFixed(0)}/час\nСодержание армии: ${upkeep.toFixed(1)}/час`;
        }
        else if(type === 'BANK') { 
            useTxt="Банк"; useCol=0x0000FF; useAct=()=>this.showInfoModal("Банк", `Текущий лимит Coin: ${GAME_STATE.storageCapacity.coin.toLocaleString()}`); 
            infoText = `${bData.description}\n\nТекущий лимит Coin: ${GAME_STATE.storageCapacity.coin.toLocaleString()}`;
        }
        else if(type === 'TANK') {
            useTxt="Research"; useCol=0x9B59B6; useAct=()=>this.manager.changeScene(CryptoLabScene);
            infoText = "Лаборатория исследований новых технологий для котов и экономики.";
        }
        else if(type === 'DEFENSE_TOWER') {
            useTxt="Оборона"; useCol=0xFF4444; useAct=()=>this.manager.changeScene(DefenseScene);
            infoText = `${bData.description}\n\nТекущий уровень: ${bData.level}\nМакс. защитных юнитов: ${GAME_STATE.maxDefenseUnits}\n\nНажми "Оборона" для управления защитой.`;
        }

        const useBtn = this.createPentagon(useTxt, useCol, useAct);
        useBtn.x = 70; useBtn.y = 0;
        m.addChild(useBtn);

        const iBtnY = 70; 
        const iBtn = new PIXI.Graphics().circle(0, iBtnY, 20).fill({color:0x000000}).stroke({width:2, color:0xFFFFFF});
        iBtn.eventMode='static'; iBtn.cursor='pointer';
        iBtn.on('pointertap', ()=>this.showInfoModal(type, infoText));
        m.addChild(iBtn);
        
        const iTxt = new PIXI.Text("i", {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF, fontWeight:'bold'});
        iTxt.anchor.set(0.5); iTxt.y=iBtnY;
        m.addChild(iTxt);
        
        const levelBubble = new PIXI.Container();
        levelBubble.y = -85; 
        m.addChild(levelBubble);

        const bubbleG = new PIXI.Graphics();
        bubbleG.circle(0,0, 25).fill({color:0x0088FF}).stroke({width:3, color:0xFFFFFF});
        levelBubble.addChild(bubbleG);

        const lvlNum = new PIXI.Text(`${bData.level}`, {fontFamily:'Arial', fontSize:22, fill:0xFFFFFF, fontWeight:'bold'});
        lvlNum.anchor.set(0.5);
        levelBubble.addChild(lvlNum);
    }

    closeMenu() {
        if(this.activeMenu) {
            this.activeMenu.container.destroy({children:true});
            this.activeMenu = null;
        }
    }

    updateMenuTimers() {
        const now = Date.now();
        if(this.activeMenu && this.activeMenu.upLabel) {
            const b = GAME_STATE.buildings[this.activeMenu.type];
            if(b.isUpgrading) {
                const rem = Math.ceil((b.upgradeStartTime + b.upgradeDuration - now)/1000);
                this.activeMenu.upLabel.text = rem > 0 ? rem + "s" : "UP";
            } else {
                if(this.activeMenu.upLabel.text !== "UP") this.activeMenu.upLabel.text = "UP";
            }
        }
        
        for(let k in GAME_STATE.buildings) {
            const b = GAME_STATE.buildings[k];
            if(b.isConstructing && b.visualRef && b.visualRef.timerLabel) {
                const rem = Math.ceil((b.constructionStartTime + b.buildDuration - now)/1000);
                b.visualRef.timerLabel.text = rem > 0 ? `${rem}s` : "OK";
            }
        }
    }

    createPentagon(txt, col, cb) {
        const c = new PIXI.Container();
        const g = new PIXI.Graphics();
        const path = [];
        for(let i=0; i<5; i++) {
            const a = (i*72 - 90)*Math.PI/180;
            path.push(45*Math.cos(a), 45*Math.sin(a)); 
        }
        g.poly(path).fill({color:col}).stroke({width:2, color:0xFFFFFF});
        const t = new PIXI.Text(txt, {fontFamily:'Arial', fontSize:14, fill:0xFFFFFF, fontWeight:'bold', align:'center'});
        t.anchor.set(0.5);
        c.addChild(g, t);
        c.eventMode='static'; c.cursor='pointer';
        c.on('pointertap', (e)=>{e.stopPropagation(); cb();});
        c.lbl = t;
        return c;
    }

    showUnitList() {
        // Закрываем активное меню (например, открытое меню здания), чтобы кнопки не оставались сверху
        try { this.closeMenu(); } catch (_) {}
        if(this.infoModal) this.infoModal.destroy({children:true});
        const W = APP_WIDTH*0.9, H = APP_HEIGHT*0.7;
        const c = new PIXI.Container();
        c.zIndex=1000; c.x=APP_WIDTH/2; c.y=APP_HEIGHT/2;
        c.eventMode='static';
        this.infoModal = c;
        this.addChild(c);
        
        const bg = new PIXI.Graphics().roundRect(-W/2,-H/2,W,H,20).fill({color:0x000000, alpha:0.95}).stroke({width:4, color:0x00FFFF});
        c.addChild(bg);
        
        const title = new PIXI.Text("ВАША АРМИЯ", {fontFamily:'Arial', fontSize:30, fill:0x00FFFF});
        title.anchor.set(0.5); title.y = -H/2 + 40;
        c.addChild(title);

        let y = -H/2 + 100;
        let totalPower = 0;
        
        for(let k in UNIT_DATA) {
            const u = UNIT_DATA[k];
            const num = GAME_STATE.units[k];
            const unitPower = u.T1.power || 0; 
            const pow = num * unitPower;
            totalPower += pow;
            
            const txt = new PIXI.Text(`${u.type}: ${num} шт. (Сила: ${pow})`, {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF});
            txt.anchor.set(0, 0.5); txt.x = -W/2 + 40; txt.y = y;
            c.addChild(txt);
            y += 50;
        }
        
        const tot = new PIXI.Text(`ВСЕГО СИЛА: ${totalPower}`, {fontFamily:'Arial', fontSize:24, fill:0xFFD700});
        tot.anchor.set(0.5); tot.y = y + 20;
        c.addChild(tot);
        
        const close = this.createSimpleButton("Закрыть", ()=>c.destroy({children:true}), 0xDC3545, 150,50);
        close.y = H/2 - 50;
        c.addChild(close);
    }
    
    addBottomNavigation() {
        const H_POS = APP_HEIGHT - 60; 
        
        if(this.navContainer) this.navContainer.destroy({children:true});

        const navContainer = new PIXI.Container();
        navContainer.position.set(0, H_POS);
        navContainer.zIndex = 1000; 
        this.addChild(navContainer);
        this.navContainer = navContainer;
        
        const bg = new PIXI.Graphics().rect(0, -50, APP_WIDTH, 110).fill({color:0x000000, alpha:0.85}).stroke({width:2, color:0x333333, alignment:0});
        navContainer.addChild(bg);
        
        const buttons = [
            { icon: ASSETS.icon_map.alias, text: "Карта", action: ()=>this.showInfoModal("Карта", "Переход на карту (в разработке)") },
            { icon: ASSETS.icon_train.alias, text: "Атака", action: ()=>this.showInfoModal("Атака", "Сцена атаки (в разработке)") },
            { icon: ASSETS.icon_upgrade.alias, text: "Герои", action: ()=>this.manager.changeScene(HeroesScene) },
            { icon: ASSETS.icon_friends.alias, text: "Друзья", action: ()=>this.manager.changeScene(FriendsScene) },
            { icon: ASSETS.icon_power_cat.alias, text: "Задания", action: ()=>this.manager.changeScene(QuestsScene) }
        ];

        const btnWidth = APP_WIDTH / buttons.length;

        buttons.forEach((btn, i) => {
            const btnCont = new PIXI.Container();
            btnCont.x = (i * btnWidth) + (btnWidth / 2); 
            btnCont.y = 0;
            
            const hitArea = new PIXI.Graphics()
                .rect(-btnWidth/2, -50, btnWidth, 110) 
                .fill({color:0xFFFFFF, alpha:0.001}); 
            
            hitArea.eventMode='static'; 
            hitArea.cursor='pointer';
            hitArea.on('pointertap', btn.action);
            
            hitArea.on('pointerdown', () => btnCont.scale.set(0.95));
            hitArea.on('pointerup', () => btnCont.scale.set(1));
            hitArea.on('pointerupoutside', () => btnCont.scale.set(1));

            btnCont.addChild(hitArea);

            let icon;
            // Для кнопки "Герои" показываем модель satoshi если она доступна
            if (btn.text === "Герои" && ASSETS.satoshi && PIXI.Assets.cache.has(ASSETS.satoshi.alias)) {
                icon = PIXI.Sprite.from(ASSETS.satoshi.alias);
                icon.anchor.set(0.5); icon.scale.set(0.06); icon.y = -10;
                // Чтобы кнопка ловила события, делаем модель неинтерактивной
                try { icon.eventMode = 'none'; } catch(_) {}
            } else if(PIXI.Assets.cache.has(btn.icon)) {
                icon = PIXI.Sprite.from(btn.icon);
                icon.anchor.set(0.5); icon.scale.set(0.08); icon.y = -10; 
                icon.eventMode = 'none';
            } else {
                icon = new PIXI.Text("?", {fontSize:24, fill:0xFFFFFF});
                icon.anchor.set(0.5); icon.y=-10;
                icon.eventMode = 'none';
            }
            
            const text = new PIXI.Text(btn.text, {fontFamily:'Arial', fontSize:14, fill:0xFFFFFF, fontWeight:'bold'});
            text.anchor.set(0.5); text.y = 30; 
            text.eventMode = 'none';

            btnCont.addChild(icon, text);
            navContainer.addChild(btnCont);
        });
    }
}

// --- СЦЕНА: ОБОРОНА (DEFENSE SCENE) ---
class DefenseScene extends BaseScene {
    constructor(manager) {
        super(manager);
        this.unitPanels = [];
        this.selectedCounts = {};
    }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');
        // Убираем стандартный верхний UI для полноэкранного героя
        try { this.children.filter(c => c.isTopUI).forEach(c => c.destroy({children:true})); } catch(_) {}

        // Заголовок сцены
        const title = new PIXI.Text("СИСТЕМА ОБОРОНЫ", {fontFamily:'Arial', fontSize:32, fill:0xFF4444, fontWeight:'bold', stroke: 0x000000, strokeThickness: 4});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 110;
        this.addChild(title);

        // Информация о защите
        const defenseTower = GAME_STATE.buildings.DEFENSE_TOWER;
        const defenseInfo = new PIXI.Text(
            `Уровень башни: ${defenseTower.level}\nЛимит защиты: ${GAME_STATE.defenseUnits.ScoutCat + GAME_STATE.defenseUnits.DefenderCat + GAME_STATE.defenseUnits.AttackerCat + GAME_STATE.defenseUnits.EngineerCat}/${GAME_STATE.maxDefenseUnits}`,
            {fontFamily:'Arial', fontSize:20, fill: 0x00FF00, fontWeight:'bold', align: 'center'}
        );
        defenseInfo.anchor.set(0.5); defenseInfo.x = APP_WIDTH/2; defenseInfo.y = 160;
        this.addChild(defenseInfo);
        this.defenseInfo = defenseInfo;

        // Пустое пространство сверху
        const spacer = new PIXI.Graphics().rect(0, 190, APP_WIDTH, 30).fill({color:0x000000, alpha:0});
        this.addChild(spacer);

        // Область прокрутки (Scroll View) - начинаем ниже
        this.viewY = 220;
        this.viewH = APP_HEIGHT - 300;
        this.scrollContent = new PIXI.Container();
        // Помещаем scrollContent на ту же Y-координату, что и маска,
        // чтобы внутренние дочерние элементы начинались с 0 внутри скролла.
        this.scrollContent.y = this.viewY;

        // Маска для обрезания лишнего
        const mask = new PIXI.Graphics().rect(0, this.viewY, APP_WIDTH, this.viewH).fill(0xFFFFFF);
        this.addChild(mask);
        this.scrollContent.mask = mask;
        this.addChild(this.scrollContent);

        // Рендерим панели юнитов
        this.renderDefenseUnits();

        // Кнопка НАЗАД
        const back = this.createSimpleButton("Назад", ()=>{ this.manager.changeScene(MainMenuScene); }, 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);

        // Логика скролла
        this.isDragging = false; this.lastY = 0;
        const inputBg = new PIXI.Graphics().rect(0,this.viewY,APP_WIDTH,this.viewH).fill({color:0x000000, alpha:0.01});
        inputBg.eventMode='static';
        // Переносим inputBg наверх, чтобы он перехватывал тачи/драг события
        this.addChildAt(inputBg, 0);

        inputBg.on('pointerdown', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging = true; this.lastY = e.global.y; });
        inputBg.on('globalpointermove', (e)=>{ 
            if(e.stopPropagation) e.stopPropagation();
            try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ }
            if(this.isDragging) {
                const dy = e.global.y - this.lastY;
                this.scrollContent.y += dy;
                this.lastY = e.global.y;
                this.clampScroll();
            }
        });
        inputBg.on('pointerup', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });
        inputBg.on('pointerupoutside', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });
    }

    clampScroll() {
        if(this.scrollContent.y > this.viewY) this.scrollContent.y = this.viewY;
        const contentHeight = (this._defenseContentHeight || 1000);
        const minY = Math.min(this.viewY + this.viewH - contentHeight, this.viewY);
        if(this.scrollContent.y < minY) this.scrollContent.y = minY;
    }

    renderDefenseUnits() {
        this.scrollContent.removeChildren();
        let y = 0;
        
        // Заголовок внутри скролла
        const title = new PIXI.Text("РАЗМЕСТИТЕ ЮНИТЫ НА ОБОРОНУ", {fontFamily:'Arial', fontSize:24, fill:0xFFAAAA, fontWeight:'bold'});
        title.x = 20; title.y = y;
        this.scrollContent.addChild(title);
        y += 50;

        // Панели для каждого типа юнита
        for(let key in UNIT_DATA) {
            const data = UNIT_DATA[key];
            const panel = this.createDefenseUnitPanel(key, data, y);
            this.scrollContent.addChild(panel);
            y += 190; // Увеличил отступ между панелями
        }

        this._defenseContentHeight = y + 50;
    }

    createDefenseUnitPanel(typeKey, data, y) {
        const tier = data.T1;
        const p = new PIXI.Container();
        p.x = 10; p.y = y;

        // Фон карточки - увеличенная высота
        const bg = new PIXI.Graphics().roundRect(0,0, APP_WIDTH-20, 180, 10)
            .fill({color: 0x222222, alpha:0.95})
            .stroke({width:2, color: 0xFF4444});
        p.addChild(bg);

        // В этой панели не показываем полноэкранного героя — только данные по юниту
        const available = GAME_STATE.units[typeKey] || 0;
        const statsTxt = new PIXI.Text(`Доступно: ${available}`, {fontFamily:'Arial', fontSize:14, fill:0xAAAAAA});
        statsTxt.x = 100; statsTxt.y = 45; p.addChild(statsTxt);

        // Сила
        const powerInfo = new PIXI.Text(`Мощь: +${tier.power || 0}`, {fontFamily:'Arial', fontSize:14, fill:0x00FFFF});
        powerInfo.x=100; powerInfo.y=70; p.addChild(powerInfo);

        // Слайдер для выбора количества
        const maxToPlace = Math.min(available, GAME_STATE.maxDefenseUnits - 
            (GAME_STATE.defenseUnits.ScoutCat + GAME_STATE.defenseUnits.DefenderCat + 
             GAME_STATE.defenseUnits.AttackerCat + GAME_STATE.defenseUnits.EngineerCat));
        
        const slider = this.createSlider(0, maxToPlace, 0, (value) => {
            p.selectedCount = value;
            countText.text = `Выбрано: ${value}`;
        });
        slider.x = 100;
        slider.y = 95;
        p.addChild(slider);
        p.slider = slider;

        // Текст выбранного количества
        const countText = new PIXI.Text(`Выбрано: 0`, {fontFamily:'Arial', fontSize:14, fill:0xFFD700});
        countText.x = 320; countText.y = 95;
        p.addChild(countText);
        p.countText = countText;

        // Кнопка РАЗМЕСТИТЬ
        const placeBtn = this.createSimpleButton("РАЗМЕСТИТЬ", ()=>{
            const count = p.selectedCount || 0;
            if(count > 0 && count <= available) {
                // Проверяем общий лимит защиты
                const currentTotalDefense = GAME_STATE.defenseUnits.ScoutCat + GAME_STATE.defenseUnits.DefenderCat + 
                                          GAME_STATE.defenseUnits.AttackerCat + GAME_STATE.defenseUnits.EngineerCat;
                
                if(currentTotalDefense + count <= GAME_STATE.maxDefenseUnits) {
                    GAME_STATE.defenseUnits[typeKey] = (GAME_STATE.defenseUnits[typeKey] || 0) + count;
                    // Юниты уходят из общей армии на оборону
                    GAME_STATE.units[typeKey] -= count;
                    
                    // Обновляем UI
                    this.updateDefenseInfo();
                    this.renderDefenseUnits();
                    this.updateTotalPower(); // Обновляем общую мощь
                    updateGameCalculations(); // Обновляем расчет содержания
                    saveGame(); // Сохраняем прогресс
                } else {
                    this.showInfoModal("Ошибка", `Превышен лимит защиты! Максимум: ${GAME_STATE.maxDefenseUnits}`);
                }
            }
        }, 0xFF4444, 120, 40, 10);
        placeBtn.x = APP_WIDTH - 80; placeBtn.y = 140;
        p.addChild(placeBtn);

        // Кнопка СНЯТЬ С ОБОРОНЫ
        const removeBtn = this.createSimpleButton("СНЯТЬ", ()=>{
            if(onDefense > 0) {
                const removeCount = Math.min(onDefense, 10); // Можно снять до 10 за раз
                GAME_STATE.defenseUnits[typeKey] -= removeCount;
                GAME_STATE.units[typeKey] += removeCount;
                
                // Обновляем UI
                this.updateDefenseInfo();
                this.renderDefenseUnits();
                this.updateTotalPower(); // Обновляем общую мощь
                updateGameCalculations(); // Обновляем расчет содержания
                saveGame(); // Сохраняем прогресс
            }
        }, 0x4444FF, 80, 30, 5);
        removeBtn.x = APP_WIDTH - 180; removeBtn.y = 140;
        p.addChild(removeBtn);

        p.selectedCount = 0;
        return p;
    }

    updateDefenseInfo() {
        const defenseTower = GAME_STATE.buildings.DEFENSE_TOWER;
        const totalDefense = GAME_STATE.defenseUnits.ScoutCat + GAME_STATE.defenseUnits.DefenderCat + 
                           GAME_STATE.defenseUnits.AttackerCat + GAME_STATE.defenseUnits.EngineerCat;
        
        this.defenseInfo.text = `Уровень башни: ${defenseTower.level}\nЛимит защиты: ${totalDefense}/${GAME_STATE.maxDefenseUnits}`;
    }
}

// --- СЦЕНА: ДРУЗЬЯ (FRIENDS) ---
class FriendsScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');
        this.addTopUI();

        const title = new PIXI.Text("ДРУЗЬЯ", {fontFamily:'Arial', fontSize:36, fill:0xFFD700, fontWeight:'bold', stroke:0x000000, strokeThickness:4});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 120;
        this.addChild(title);

        // Инфо о бонусе
        const bonusPanel = new PIXI.Container();
        bonusPanel.x = APP_WIDTH/2; bonusPanel.y = 220;
        this.addChild(bonusPanel);

        const bg = new PIXI.Graphics().roundRect(-300, -60, 600, 120, 20).fill({color:0x222222, alpha:0.9}).stroke({width:2, color:0x00FF00});
        bonusPanel.addChild(bg);

        const t1 = new PIXI.Text("Пригласи друг и получи:", {fontFamily:'Arial', fontSize:24, fill:0xFFFFFF});
        t1.anchor.set(0.5); t1.y = -20;
        bonusPanel.addChild(t1);

        const t2 = new PIXI.Text("+1000 Coin  и  +1 Gem", {fontFamily:'Arial', fontSize:28, fill:0xFFD700, fontWeight:'bold'});
        t2.anchor.set(0.5); t2.y = 20;
        bonusPanel.addChild(t2);

        // Кнопка приглашения
        const inviteBtn = this.createSimpleButton("ПРИГЛАСИТЬ ДРУГА", ()=>{
            if (navigator.clipboard) {
                navigator.clipboard.writeText(GAME_STATE.referrals.link).then(() => {
                    alert("Реферальная ссылка скопирована: " + GAME_STATE.referrals.link);
                });
            } else {
                alert("Твоя ссылка: " + GAME_STATE.referrals.link);
            }
        }, 0x3C8CE7, 300, 70, 20);
        inviteBtn.x = APP_WIDTH/2; inviteBtn.y = 350;
        this.addChild(inviteBtn);

        // Список друзей (Заглушка)
        const listY = 450;
        const listTitle = new PIXI.Text("Твои рефералы (0):", {fontFamily:'Arial', fontSize:22, fill:0xAAAAAA});
        listTitle.anchor.set(0.5); listTitle.x = APP_WIDTH/2; listTitle.y = listY;
        this.addChild(listTitle);

        const emptyText = new PIXI.Text("Пока никого нет...", {fontFamily:'Arial', fontSize:20, fill:0x555555});
        emptyText.anchor.set(0.5); emptyText.x = APP_WIDTH/2; emptyText.y = listY + 50;
        this.addChild(emptyText);

        const back = this.createSimpleButton("Назад", ()=>this.manager.changeScene(MainMenuScene), 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);
    }
}

// --- СЦЕНА: ЗАДАНИЯ (QUESTS) ---
class QuestsScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');
        this.addTopUI();

        const title = new PIXI.Text("ЕЖЕДНЕВНЫЕ ЗАДАНИЯ", {fontFamily:'Arial', fontSize:36, fill:0xFFD700, fontWeight:'bold', stroke:0x000000, strokeThickness:4});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 120;
        this.addChild(title);

        this.renderQuests();

        const back = this.createSimpleButton("Назад", ()=>this.manager.changeScene(MainMenuScene), 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);
    }

    renderQuests() {
        const questData = {
            id: 'telegram_sub',
            text: "Подпишись на канал",
            reward: 1000,
            link: "https://t.me/+DRLHYNJFr0g0ODUy"
        };
        
        const y = 200;
        this.createQuestPanel(questData, y);
    }

    createQuestPanel(data, y) {
        const p = new PIXI.Container();
        p.x = APP_WIDTH/2; p.y = y;
        this.addChild(p);

        const w = APP_WIDTH - 40;
        const bg = new PIXI.Graphics().roundRect(-w/2, -50, w, 100, 15)
            .fill({color:0x222222, alpha:0.9}).stroke({width:2, color:0x00FF00});
        p.addChild(bg);

        // Иконка
        const icon = new PIXI.Text("📢", {fontSize:40});
        icon.anchor.set(0.5); icon.x = -w/2 + 50;
        p.addChild(icon);

        // Текст
        const desc = new PIXI.Text(data.text, {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF});
        desc.anchor.set(0, 0.5); desc.x = -w/2 + 100; desc.y = -15;
        p.addChild(desc);

        // Награда
        const rew = new PIXI.Text(`Награда: +${data.reward} Coin`, {fontFamily:'Arial', fontSize:18, fill:0xFFD700});
        rew.anchor.set(0, 0.5); rew.x = -w/2 + 100; rew.y = 15;
        p.addChild(rew);

        // Статус
        const qState = GAME_STATE.quests[data.id];
        
        if (qState.claimed) {
            const done = new PIXI.Text("ВЫПОЛНЕНО", {fontFamily:'Arial', fontSize:22, fill:0x00FF00, fontWeight:'bold'});
            done.anchor.set(0.5); done.x = w/2 - 80;
            p.addChild(done);
        } else {
            // Кнопка
            let btnText = qState.completed ? "ЗАБРАТЬ" : "ВЫПОЛНИТЬ";
            let btnCol = qState.completed ? 0x28A745 : 0x007BFF;

            const btn = this.createSimpleButton(btnText, ()=>{
                if(!qState.completed) {
                    window.open(data.link, '_blank');
                    qState.completed = true;
                    this.manager.changeScene(QuestsScene);
                } else {
                    qState.claimed = true;
                    GAME_STATE.resources.coin += data.reward;
                    updateGameCalculations();
                    this.manager.changeScene(QuestsScene);
                }
            }, btnCol, 140, 50, 10);
            
            btn.x = w/2 - 90;
            p.addChild(btn);
        }
    }
}

// --- СЦЕНА: ГЕРОИ (HEROES) ---
// --- СЦЕНА: ГЕРОИ (RPG PRO) ---
class HeroesScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');
        this.addTopUI();

        // Герой и его данные
        const hero = GAME_STATE.hero || { level:1, xp:0, maxXp:100, skillPoints:0, stats:{str:0, cha:0, int:0} };
        // Лимит уровня героя зависит от Ратуши
        const centerLvl = GAME_STATE.buildings.CENTER ? GAME_STATE.buildings.CENTER.level : 1;
        const maxHeroLevel = centerLvl * 5;

        // Показываем модель `satoshi` крупно в центре сцены
        let heroAlias = null;
        try { if (ASSETS.satoshi && PIXI.Assets.cache.has(ASSETS.satoshi.alias)) heroAlias = ASSETS.satoshi.alias; } catch(_){ }
        if (!heroAlias) {
            try { if (PIXI.Assets.cache.has(ASSETS.icon_power_cat.alias)) heroAlias = ASSETS.icon_power_cat.alias; } catch(_){ }
        }
        if (heroAlias) {
            const model = PIXI.Sprite.from(heroAlias);
            model.anchor.set(0.5);
            // Масштабируем модель почти на весь экран (оставляем место под UI)
            try {
                const t = model.texture;
                const w = (t.orig && t.orig.width) || t.width || 100;
                const h = (t.orig && t.orig.height) || t.height || 100;
                const maxW = APP_WIDTH * 0.95;
                const maxH = (APP_HEIGHT - 160) * 0.95; // учитываем место для top UI и кнопки назад
                const s = Math.min(maxW / w, maxH / h);
                model.scale.set(s * 1.35); // немного увеличить модель дополнительно
            } catch(_) { model.scale.set(0.7); }
            model.position.set(APP_WIDTH/2, APP_HEIGHT/2 - 160); // поднять героя чуть выше
            try { model.eventMode = 'none'; } catch(_) {}
            this.addChild(model);
        }

        // Позиционируем элементы UI под моделью героя, если модель есть
        const barW = APP_WIDTH * 0.78; const barH = 18;
        let baseY = APP_HEIGHT/2 + 80; // fallback
        if (typeof model !== 'undefined' && model && model.height) {
            baseY = model.position.y + (model.height / 2) + 80; // сдвигаем UI ниже под моделью
        }

        // Уровень героя
        const lvlTxt = new PIXI.Text(`Уровень ${hero.level} / ${maxHeroLevel}`, {fontFamily:'Arial', fontSize:22, fill:0xFFD700, fontWeight:'bold'});
        lvlTxt.anchor.set(0.5); lvlTxt.position.set(APP_WIDTH/2, baseY - 28);
        this.addChild(lvlTxt);

        // Полоска опыта
        const barBg = new PIXI.Graphics().roundRect(-barW/2, -barH/2, barW, barH, 8).fill({color:0x222222}).stroke({width:2, color:0x333333});
        barBg.position.set(APP_WIDTH/2, baseY + 4);
        const pct = Math.max(0, Math.min(1, (hero.xp || 0) / (hero.maxXp || 100)));
        const barFill = new PIXI.Graphics().roundRect(-barW/2, -barH/2, barW * pct, barH, 8).fill({color:0x39FF14});
        barBg.addChild(barFill);
        const xpTxt = new PIXI.Text(`${Math.floor(hero.xp || 0)} / ${hero.maxXp} XP`, {fontFamily:'Arial', fontSize:14, fill:0xFFFFFF});
        xpTxt.anchor.set(0.5); xpTxt.position.set(0, 0);
        barBg.addChild(xpTxt);
        this.addChild(barBg);

        // Очки навыков
        const ptsTxt = new PIXI.Text(`Очки: ${hero.skillPoints || 0}`, {fontFamily:'Arial', fontSize:16, fill:0x00FF00, fontWeight:'bold'});
        ptsTxt.anchor.set(0.5); ptsTxt.position.set(APP_WIDTH/2, baseY + 34);
        this.addChild(ptsTxt);

        // Кнопка тренировки — даёт XP за рыбу
        const xpGain = 50 + ((hero.stats && hero.stats.int) ? hero.stats.int * 5 : 0);
        const fishCost = 200;
        const trainBtn = this.createSimpleButton(`ТРЕНИРОВАТЬ (+${xpGain} XP)`, () => {
            if (hero.level >= maxHeroLevel) { this.showInfoModal("Лимит", "Уровень героя ограничен уровнем Ратуши!"); return; }
            if (GAME_STATE.resources.fish >= fishCost) {
                GAME_STATE.resources.fish -= fishCost;
                this.addXp(xpGain);
                saveGame();
                this.init();
            } else {
                this.showInfoModal("Ошибка", "Не хватает рыбы для тренировки!");
            }
        }, 0xFF8C00, 220, 48);
        trainBtn.x = APP_WIDTH/2; trainBtn.y = baseY + 72; trainBtn.zIndex = 1000; this.addChild(trainBtn);

        // Строки характеристик — показываем сразу под кнопкой тренировки
        const startY = baseY + 120;
        this.createStatRow("СИЛА (+Power)", hero.stats.str, startY, 'str');
        this.createStatRow("ХАРИЗМА (+Unit Limit)", hero.stats.cha, startY + 40, 'cha');
        this.createStatRow("ИНТЕЛЛЕКТ (+XP Gain)", hero.stats.int, startY + 80, 'int');

        // Кнопка назад — маленькая и в левом верхнем углу
        const back = this.createSimpleButton("Назад", ()=>this.manager.changeScene(MainMenuScene), 0x555555, 110, 40);
        back.x = 70; back.y = 40; back.zIndex = 1000; this.addChild(back);

        // Нижняя навигация (копия из MainMenuScene.addBottomNavigation)
        (function(self){
            const H_POS = APP_HEIGHT - 60;
            const navContainer = new PIXI.Container();
            navContainer.position.set(0, H_POS);
            navContainer.zIndex = 1000;
            self.addChild(navContainer);
            const bg = new PIXI.Graphics().rect(0, -50, APP_WIDTH, 110).fill({color:0x000000, alpha:0.85}).stroke({width:2, color:0x333333, alignment:0});
            navContainer.addChild(bg);

            const buttons = [
                { icon: ASSETS.icon_map.alias, text: "Карта", action: ()=>self.showInfoModal("Карта", "Переход на карту (в разработке)") },
                { icon: ASSETS.icon_train.alias, text: "Атака", action: ()=>self.showInfoModal("Атака", "Сцена атаки (в разработке)") },
                { icon: ASSETS.icon_upgrade.alias, text: "Герои", action: ()=>self.manager.changeScene(HeroesScene) },
                { icon: ASSETS.icon_friends.alias, text: "Друзья", action: ()=>self.manager.changeScene(FriendsScene) },
                { icon: ASSETS.icon_power_cat.alias, text: "Задания", action: ()=>self.manager.changeScene(QuestsScene) }
            ];

            const btnWidth = APP_WIDTH / buttons.length;
            buttons.forEach((btn, i) => {
                const btnCont = new PIXI.Container();
                btnCont.x = (i * btnWidth) + (btnWidth / 2);
                btnCont.y = 0;

                const hitArea = new PIXI.Graphics()
                    .rect(-btnWidth/2, -50, btnWidth, 110)
                    .fill({color:0xFFFFFF, alpha:0.001});
                hitArea.eventMode='static'; hitArea.cursor='pointer';
                hitArea.on('pointertap', btn.action);
                hitArea.on('pointerdown', () => btnCont.scale.set(0.95));
                hitArea.on('pointerup', () => btnCont.scale.set(1));
                hitArea.on('pointerupoutside', () => btnCont.scale.set(1));

                btnCont.addChild(hitArea);

                let icon;
                if(PIXI.Assets.cache.has(btn.icon)) {
                    icon = PIXI.Sprite.from(btn.icon);
                    icon.anchor.set(0.5); icon.scale.set(0.08); icon.y = -10;
                } else {
                    icon = new PIXI.Text("?", {fontSize:24, fill:0xFFFFFF}); icon.anchor.set(0.5); icon.y=-10;
                }
                icon.eventMode = 'none';

                const text = new PIXI.Text(btn.text, {fontFamily:'Arial', fontSize:14, fill:0xFFFFFF, fontWeight:'bold'});
                text.anchor.set(0.5); text.y = 30; text.eventMode='none';

                btnCont.addChild(icon, text);
                navContainer.addChild(btnCont);
            });
        })(this);
    }

    createStatRow(label, val, y, statKey) {
        const row = new PIXI.Container();
        row.y = y; row.x = APP_WIDTH/2 - 150;
        
        const txt = new PIXI.Text(`${label}: ${val}`, {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF});
        txt.y = 10;
        row.addChild(txt);
        
        // Кнопка плюсика (если есть очки)
        if (GAME_STATE.hero.skillPoints > 0) {
            const plus = this.createSimpleButton("+", () => {
                if(GAME_STATE.hero.skillPoints > 0) {
                    GAME_STATE.hero.skillPoints--;
                    GAME_STATE.hero.stats[statKey]++;
                    saveGame();
                    this.init();
                }
            }, 0x00FF00, 50, 40, 5);
            plus.x = 280; plus.y = 20;
            row.addChild(plus);
        }
        this.addChild(row);
    }
    
    addXp(amount) {
        const hero = GAME_STATE.hero;
        hero.xp += amount;
        if(hero.xp >= hero.maxXp) {
            hero.xp -= hero.maxXp;
            hero.level++;
            hero.skillPoints++;
            hero.maxXp = Math.floor(hero.maxXp * 1.5);
            this.showInfoModal("LEVEL UP!", `Герой достиг ${hero.level} уровня!`);
        }
    }
}

// --- СЦЕНА: CRYPTO LAB (ИССЛЕДОВАНИЯ) - BLUE NEON + "паутинка" --- 
class CryptoLabScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');

        // --- Скролл зона ---
        this.viewY = 80;
        this.viewH = APP_HEIGHT - 140;
        this.scrollContent = new PIXI.Container();
        this.scrollContent.y = this.viewY;

        // Маска и контейнер
        const mask = new PIXI.Graphics().rect(0, this.viewY, APP_WIDTH, this.viewH).fill(0xFFFFFF);
        this.addChild(mask);
        this.scrollContent.mask = mask;
        this.addChild(this.scrollContent);

        // Контейнер для узлов (чтобы было проще ориентироваться)
        this.nodesContainer = new PIXI.Container();
        this.linesLayer = new PIXI.Graphics(); // линии неона
        this.scrollContent.addChild(this.linesLayer);
        this.scrollContent.addChild(this.nodesContainer);

        this.drawTechTree();

        this.addTopUI();
        const back = this.createSimpleButton("Назад", ()=>this.manager.changeScene(MainMenuScene), 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);

        // --- ЛОГИКА СКРОЛЛА (drag) ---
        this.isDragging = false;
        this.lastY = 0;

        const inputBg = new PIXI.Graphics().rect(0, this.viewY, APP_WIDTH, this.viewH).fill({color:0x000000, alpha:0.01});
        inputBg.eventMode = 'static';
        this.addChildAt(inputBg, 0);

        inputBg.on('pointerdown', (e)=>{
            if(e.stopPropagation) e.stopPropagation();
            try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ }
            this.isDragging = true;
            this.lastY = e.global.y;
        });
        inputBg.on('globalpointermove', (e)=>{
            if(e.stopPropagation) e.stopPropagation();
            try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ }
            if(this.isDragging) {
                const dy = e.global.y - this.lastY;
                this.scrollContent.y += dy;
                this.lastY = e.global.y;
                this.clampScroll();
            }
        });
        inputBg.on('pointerup', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });
        inputBg.on('pointerupoutside', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });
    }

    clampScroll() {
        if(this.scrollContent.y > this.viewY) this.scrollContent.y = this.viewY;
        const contentHeight = (this._computedMaxY || 1200);
        const minY = Math.min(this.viewY + this.viewH - contentHeight, this.viewY - 150);
        if(this.scrollContent.y < minY) this.scrollContent.y = minY;
    }

    drawTechTree() {
        // Очистка
        this.nodesContainer.removeChildren();
        this.linesLayer.clear();

        const rootX = APP_WIDTH/2;
        let startY = 150;

        const nodes = [];

        const addNode = (x,y,label,iconChar, locked) => {
            const c = new PIXI.Container();
            c.x = x; c.y = y;
            c.eventMode = 'static';
            this.nodesContainer.addChild(c);

            // НЕОН КРУГ (фон)
            const bg = new PIXI.Graphics()
                .beginFill(0x001122)
                .lineStyle(3, 0x00FFFF, 0.9)
                .drawCircle(0,0,40)
                .endFill();
            c.addChild(bg);

            // Иконка (эмоджи/текст)
            const icon = new PIXI.Text(iconChar, {fontSize:28});
            icon.anchor.set(0.5);
            c.addChild(icon);

            // Надпись
            const lbl = new PIXI.Text(label, {fontFamily:'Arial', fontSize:12, fill:0xCCFFFF, fontWeight:'bold', align:'center', wordWrap:true, wordWrapWidth:120});
            lbl.anchor.set(0.5,0); lbl.y = 46;
            c.addChild(lbl);

            // Внешняя неоновая "аура" - добавляем слабый круг (для эффекта glow)
            const aura = new PIXI.Graphics();
            aura.beginFill(0x00FFFF, 0.06).drawCircle(0,0,60).endFill();
            aura.y = 0; aura.x = 0;
            c.addChildAt(aura, 0);

            if(locked) {
                // затемняем и добавляем замок
                const cover = new PIXI.Graphics().beginFill(0x000000, 0.6).drawCircle(0,0,40).endFill();
                c.addChild(cover);
                const lock = new PIXI.Text("🔒", {fontSize:22});
                lock.anchor.set(0.5);
                c.addChild(lock);
                const dev = new PIXI.Text("В РАЗРАБОТКЕ", {fontFamily:'Arial', fontSize:10, fill:0xFF5555, fontWeight:'bold'});
                dev.anchor.set(0.5); dev.y = 70;
                c.addChild(dev);
                c.interactive = false;
            } else {
                c.on('pointertap', ()=>this.showInfoModal(label, "Исследование пока недоступно."));
            }

            nodes.push({x, y, cont: c});
            this._computedMaxY = Math.max((this._computedMaxY || 0), y + 200);
            return c;
        };

        // Рисуем структуру подобно старому - но теперь собираем nodes и рисуем НЕОНОВЫЕ линии
        // Корневой узел
        addNode(rootX, startY, "Base Grade", "🏠");

        const branches = [
            { offsetX: -270, name: "Economy", icon: "💰" },
            { offsetX: -90,  name: "Units", icon: "⚔️" },
            { offsetX: 90,   name: "Builds", icon: "🏗️" },
            { offsetX: 270,  name: "Raids", icon: "🔥" }
        ];

        const branchStartY = startY + 150;

        branches.forEach(b => {
            const bX = rootX + b.offsetX;

            // линия от корня к голове ветки (нарисуем позже)
            // рисуем 4 грейда
            let currentY = branchStartY;
            for(let i=1; i<=4; i++) {
                // добавляем узел
                const isLocked = false;
                addNode(bX, currentY, `${b.name} ${i}`, b.icon, isLocked);
                if(i === 4) {
                    // Tier2 замок (locked)
                    addNode(bX, currentY + 150, "Tier 2", "🔒", true);
                }
                currentY += 150;
            }
        });

        // Теперь рисуем неоновые линии (паутину) между связанными узлами.
        // Простая логика: соединяем каждый узел с ближайшим выше по Y (имитация дерева)
        // Соберём все узлы из nodesContainer
        const allNodes = this.nodesContainer.children.filter(c => c.x !== undefined);
        // Преобразуем в массив позиций
        const positions = allNodes.map(c => ({x: c.x, y: c.y}));

        // Для "паутинки" соединим корень с каждой головы ветки и каждую пару вертикально
        this.linesLayer.lineStyle(4, 0x00FFFF, 0.7);
        // соединяем root с heads
        const rootPos = {x: rootX, y: startY};
        branches.forEach(b => {
            const headX = rootX + b.offsetX, headY = branchStartY;
            this._drawNeonLine(this.linesLayer, rootPos.x, rootPos.y, headX, headY);
            // vertical chain down the branch
            for(let i=0;i<4;i++){
                const y1 = branchStartY + i*150;
                const y2 = branchStartY + (i+1)*150;
                this._drawNeonLine(this.linesLayer, headX, y1, headX, y2);
            }
        });

        // дополнительно — соединения между близкими соседними ветками (чтобы выглядела как сеть)
        for(let i=0;i<branches.length-1;i++){
            const x1 = rootX + branches[i].offsetX;
            const x2 = rootX + branches[i+1].offsetX;
            const yline = branchStartY + 150;
            this._drawNeonLine(this.linesLayer, x1, yline, x2, yline);
        }

        // Заголовок
        const title = new PIXI.Text("RESEARCH LAB", {fontFamily:'Arial', fontSize:32, fill:0x00FFFF, align:'center', fontWeight:'bold', dropShadow:true, dropShadowColor:0x0000FF, dropShadowBlur:10});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 60;
        this.scrollContent.addChild(title);

        // send linesLayer behind nodes
        this.scrollContent.addChildAt(this.linesLayer, 0);
    }

    // helper: рисует "неоновую" линию между двумя точками с небольшим градиентом/эффектом
    _drawNeonLine(g, x1, y1, x2, y2) {
        // основной свет
        g.lineStyle(4, 0x00FFFF, 0.85);
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);

        // слабый glow (повторяем тонкой линией с альфа)
        g.lineStyle(8, 0x00FFFF, 0.12);
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);

        // пару точек "искр"
        const midX = (x1 + x2)/2;
        const midY = (y1 + y2)/2;
        const sparks = new PIXI.Graphics();
        sparks.beginFill(0xFFFFFF, 0.9).drawCircle(midX, midY, 2).endFill();
        this.scrollContent.addChild(sparks);
    }
}

class MarketScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy'); 
        this.addTopUI();
        
        const t = new PIXI.Text("РЫНОК ТРЕЙДЕРОВ", {fontFamily:'Arial', fontSize:36, fill:0xFFD700, stroke:0x000000, strokeThickness:4});
        t.anchor.set(0.5); t.x = APP_WIDTH/2; t.y = 120;
        this.addChild(t);
        
        const marketLvl = GAME_STATE.buildings.MARKET.level;
        const baseIncome = marketLvl * 50;
        const upkeep = GAME_STATE.upkeepPerHour || 0;
        const netIncome = (GAME_STATE.incomePerSecond * 3600) - upkeep;
        
        const infoBase = new PIXI.Text(`Базовый доход Рынка (Lv.${marketLvl}): +${baseIncome}/час\nЧистый доход: ${netIncome >= 0 ? '+' : ''}${netIncome.toFixed(0)}/час`, 
            {fontFamily:'Arial', fontSize:20, fill: netIncome >= 0 ? 0x00FF00 : 0xFF4444, fontWeight:'bold'});
        infoBase.anchor.set(0.5); infoBase.x = APP_WIDTH/2; infoBase.y = 170;
        this.addChild(infoBase);

        let y = 220;
        for(let k in TRADER_DATA) {
            this.createTraderPanel(k, TRADER_DATA[k], y);
            y += 180;
        }

        const back = this.createSimpleButton("Назад", ()=>this.manager.changeScene(MainMenuScene), 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);
    }

    createTraderPanel(key, data, y) {
        const p = new PIXI.Container();
        p.x = 10; p.y = y;
        this.addChild(p);

        const bg = new PIXI.Graphics().roundRect(0,0, APP_WIDTH-20, 160, 10).fill({color:0x1a1a1a, alpha:0.9}).stroke({width:2, color:0xFFD700});
        p.addChild(bg);

        const name = new PIXI.Text(`${data.name}`, {fontFamily:'Arial', fontSize:22, fill:0xFFFFFF, fontWeight:'bold'});
        name.x=20; name.y=15; p.addChild(name);

        const income = new PIXI.Text(`Доход: +${data.incomePerHour}/час`, {fontFamily:'Arial', fontSize:18, fill:0x00FF00});
        income.x=20; income.y=50; p.addChild(income);

        const costTxt = this.formatCost(data.cost);
        const cost = new PIXI.Text(`Цена: ${costTxt}`, {fontFamily:'Arial', fontSize:18, fill:0xFFD700});
        cost.x=20; cost.y=80; p.addChild(cost);

        const current = GAME_STATE.traders[key];
        const status = new PIXI.Text(`Куплено: ${current} / ${data.limit}`, {fontFamily:'Arial', fontSize:20, fill: current >= data.limit ? 0xFF4444 : 0xFFFFFF});
        status.x=APP_WIDTH - 220; status.y=20; 
        p.addChild(status);

        if(current < data.limit) {
            const buyBtn = this.createSimpleButton("НАНЯТЬ", ()=>{
                this.buyTrader(key, data);
                const newCount = GAME_STATE.traders[key];
                status.text = `Куплено: ${newCount} / ${data.limit}`;
                if(newCount >= data.limit) buyBtn.visible = false;
            }, 0x28A745, 140, 50);
            buyBtn.x = APP_WIDTH - 100; buyBtn.y = 100;
            p.addChild(buyBtn);
        } else {
            const sold = new PIXI.Text("МАКСИМУМ", {fontFamily:'Arial', fontSize:24, fill:0xFF4444, fontWeight:'bold'});
            sold.anchor.set(0.5); sold.x = APP_WIDTH - 100; sold.y = 100;
            p.addChild(sold);
        }
    }

    buyTrader(key, data) {
        let canAfford = true;
        for(let res in data.cost) {
            if(GAME_STATE.resources[res] < data.cost[res]) canAfford = false;
        }

        if(canAfford) {
            for(let res in data.cost) GAME_STATE.resources[res] -= data.cost[res];
            GAME_STATE.traders[key]++;
            updateGameCalculations();
            this.addTopUI();
            saveGame(); // Сохраняем прогресс
        } else {
            this.showInfoModal("Ошибка", "Не хватает ресурсов для найма!");
        }
    }
}

// --- СЦЕНА: АКАДЕМИЯ (НАЙМ БОЕВЫХ) --- 
class AcademyScene extends BaseScene {
    constructor(manager) {
        super(manager);
        this.unitPanels = [];
    }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy');
        this.addTopUI();

        // Заголовок сцены
        const title = new PIXI.Text("КАЗАРМА (АРМИЯ)", {fontFamily:'Arial', fontSize:32, fill:0x00FF00, fontWeight:'bold', stroke: 0x000000, strokeThickness: 4});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 110;
        this.addChild(title);

      // Получаем текущий лимит юнитов
        const academyLevel = GAME_STATE.buildings.ACADEMY.level;
        const baseLimit = ACADEMY_UNIT_LIMITS[academyLevel] || ACADEMY_UNIT_LIMITS[1];
        
        // --- НОВОЕ: Бонус Харизмы (1 CHA = +10 мест) ---
        const charismaBonus = (GAME_STATE.hero ? GAME_STATE.hero.stats.cha * 10 : 0);
        const unitLimit = baseLimit + charismaBonus;

        const currentUnits = Object.values(GAME_STATE.units).reduce((a, b) => a + b, 0);
        
        // Информация о лимите
        const limitInfo = new PIXI.Text(`Лимит юнитов: ${currentUnits}/${unitLimit} (Lv.${academyLevel} + Герой:${charismaBonus})`, 
            {fontFamily:'Arial', fontSize:18, fill: currentUnits >= unitLimit ? 0xFF4444 : 0x00FF00, fontWeight:'bold'});
        
        this.limitInfoText = limitInfo;

        // Пустое пространство сверху
        const spacer = new PIXI.Graphics().rect(0, 180, APP_WIDTH, 30).fill({color:0x000000, alpha:0});
        this.addChild(spacer);

        // Область прокрутки (Scroll View) - начинаем ниже
        this.viewY = 210;
        this.viewH = APP_HEIGHT - 290;
        this.scrollContent = new PIXI.Container();
        this.scrollContent.y = this.viewY;

        // Маска для обрезания лишнего
        const mask = new PIXI.Graphics().rect(0, this.viewY, APP_WIDTH, this.viewH).fill(0xFFFFFF);
        this.addChild(mask);
        this.scrollContent.mask = mask;
        this.addChild(this.scrollContent);

        // Рендерим панели юнитов
        this.unitPanels = [];
        this.renderUnitsInScroll();

        // Кнопка НАЗАД
        const back = this.createSimpleButton("Назад", ()=>{ this.manager.changeScene(MainMenuScene); }, 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);

        // Логика скролла (перетаскивание пальцем/мышкой)
        this.isDragging = false; this.lastY = 0;
        const inputBg = new PIXI.Graphics().rect(0,this.viewY,APP_WIDTH,this.viewH).fill({color:0x000000, alpha:0.01});
        inputBg.eventMode='static';
        this.addChildAt(inputBg, 0);

        inputBg.on('pointerdown', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging = true; this.lastY = e.global.y; });
        inputBg.on('globalpointermove', (e)=>{ 
            if(e.stopPropagation) e.stopPropagation();
            try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ }
            if(this.isDragging) {
                const dy = e.global.y - this.lastY;
                this.scrollContent.y += dy;
                this.lastY = e.global.y;
                this.clampScroll();
            }
        });
        inputBg.on('pointerup', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });
        inputBg.on('pointerupoutside', (e)=>{ if(e.stopPropagation) e.stopPropagation(); try{ if(e.data && e.data.originalEvent) e.data.originalEvent.preventDefault(); }catch(_){ } this.isDragging=false; });

        // Запускаем обновление прогресс-баров
        this.updFn = ()=>this.updateBars();
        app.ticker.add(this.updFn);
    }

    destroy(opt) {
        if(this.updFn) app.ticker.remove(this.updFn);
        super.destroy(opt);
    }

    // Ограничение прокрутки
    clampScroll() {
        if(this.scrollContent.y > this.viewY) this.scrollContent.y = this.viewY;
        const contentHeight = (this._academyContentHeight || 1000);
        const minY = Math.min(this.viewY + this.viewH - contentHeight, this.viewY);
        if(this.scrollContent.y < minY) this.scrollContent.y = minY;
    }

    renderUnitsInScroll() {
        this.scrollContent.removeChildren();
        let y = 0;
        
        // --- ЗАГОЛОВОК TIER 1 ---
        const t1Title = new PIXI.Text("TIER 1 - НОВИЧКИ", {fontFamily:'Arial', fontSize:24, fill:0xAAAAAA, fontWeight:'bold'});
        t1Title.x = 20; t1Title.y = y;
        this.scrollContent.addChild(t1Title);
        y += 40;

        // --- ЦИКЛ 1: Сначала рисуем ВСЕХ юнитов T1 ---
        for(let key in UNIT_DATA) {
            const data = UNIT_DATA[key];
            // Создаем панель T1 (locked = false)
            const p = this._createUnitPanel(key, data, y, false);
            this.scrollContent.addChild(p);
            y += 220; // Увеличил высоту отступа между панелями
        }

        y += 30; // Большой отступ между Тирами

        // --- ЗАГОЛОВОК TIER 2 ---
        const t2Title = new PIXI.Text("TIER 2 - ПРОФИ (Закрыто)", {fontFamily:'Arial', fontSize:24, fill:0xAAAAAA, fontWeight:'bold'});
        t2Title.x = 20; t2Title.y = y;
        this.scrollContent.addChild(t2Title);
        y += 40;

        // --- ЦИКЛ 2: Потом рисуем ВСЕХ юнитов T2 ---
        for(let key in UNIT_DATA) {
            const data = UNIT_DATA[key];
            // Создаем панель T2 (locked = true). 
            // Хитрость: мы передаем данные T2 в поле T1 функции, чтобы она их отрисовала
            const dummyData = { T1: data.T2, icon: data.icon };
            const locked = this._createUnitPanel(key, dummyData, y, true);
            this.scrollContent.addChild(locked);
            y += 180;
        }

        this._academyContentHeight = y + 50;
    }

    // Создание одной карточки юнита - ИСПРАВЛЕНО: увеличен размер панелей
    _createUnitPanel(typeKey, data, y, locked=false) {
        const tier = data.T1; // Берем данные (имя, цена, сила)
        const p = new PIXI.Container();
        p.x = 10; p.y = y;

        // Фон карточки - увеличенная высота
        const bg = new PIXI.Graphics().roundRect(0,0, APP_WIDTH-20, locked ? 160 : 210, 10)
            .fill({color: locked ? 0x151515 : 0x222222, alpha:0.95})
            .stroke({width:2, color: locked ? 0x333333 : 0x555555});
        p.addChild(bg);

        // Иконка
        const iconAlias = data.icon || 'icon_power_cat';
        if(PIXI.Assets.cache.has(iconAlias)){
            const ic = PIXI.Sprite.from(iconAlias);
            ic.anchor.set(0.5); ic.scale.set(0.07); ic.x=50; ic.y=60;
            p.addChild(ic);
        }

        // Название
        const nameTxt = new PIXI.Text(tier.name, {fontFamily:'Arial', fontSize:20, fill: locked ? 0x777777 : 0xFFFFFF, fontWeight:'bold'});
        nameTxt.x=100; nameTxt.y=15; p.addChild(nameTxt);

        // Цена за ОДНОГО (только монеты)
        const singleCost = tier.cost.coin || 0;
        const costTxt = `${singleCost.toLocaleString()} Coin`;
        const cost = new PIXI.Text(`Цена: ${costTxt}`, {fontFamily:'Arial', fontSize:14, fill: locked ? 0x666666 : 0xFFD700});
        cost.x=100; cost.y=45; p.addChild(cost);

        // Сила
        const powerInfo = new PIXI.Text(`Мощь: +${tier.power || 0}`, {fontFamily:'Arial', fontSize:14, fill: locked ? 0x666666 : 0x00FFFF});
        powerInfo.x=100; powerInfo.y=70; p.addChild(powerInfo);

        // Содержание в час
        const upkeep = tier.upkeep || 0;
        const upkeepText = new PIXI.Text(`Содержание: ${upkeep.toFixed(1)}/ч`, {fontFamily:'Arial', fontSize:14, fill: locked ? 0x666666 : 0xFF5555});
        upkeepText.x=100; upkeepText.y=95; p.addChild(upkeepText);

        if(!locked) {
            // -- Если открыто (T1) --
            
            // Счетчик количества для найма (теперь через слайдер)
            let count = 1;
            
            // Слайдер для выбора количества
            const academyLevel = GAME_STATE.buildings.ACADEMY.level;
            const unitLimit = ACADEMY_UNIT_LIMITS[academyLevel] || ACADEMY_UNIT_LIMITS[1];
            const currentUnits = Object.values(GAME_STATE.units).reduce((a, b) => a + b, 0);
            const maxCanHire = Math.min(100, unitLimit - currentUnits); // Максимум 100 за раз или до лимита
            
            const slider = this.createSlider(1, maxCanHire, 1, (value) => {
                count = value;
                p.selectedCount = value;
                totalCostLabel.text = `Всего: ${singleCost * value} Coin`;
                if (p.countNearBtn) p.countNearBtn.text = `x${value}`;
            });
            slider.x = 100;
            slider.y = 120;
            p.addChild(slider);
            p.slider = slider;
            p.selectedCount = 1;
            
            // Отображение общей стоимости
            const totalCostLabel = new PIXI.Text(`Всего: ${singleCost} Coin`, 
                {fontFamily:'Arial', fontSize:14, fill:0xFFD700});
            totalCostLabel.x = 350; totalCostLabel.y = 120;
            p.addChild(totalCostLabel);
            p.totalCostLabel = totalCostLabel;

            // Кнопка НАЙМ
            const hireBtn = this.createSimpleButton("НАЙМ", ()=>{
                const academyLevel = GAME_STATE.buildings.ACADEMY.level;
                const unitLimit = ACADEMY_UNIT_LIMITS[academyLevel] || ACADEMY_UNIT_LIMITS[1];
                const currentUnits = Object.values(GAME_STATE.units).reduce((a, b) => a + b, 0);
                
                if(currentUnits + count > unitLimit) {
                    this.showInfoModal("Лимит", `Нельзя нанять ${count} юнитов! Лимит: ${unitLimit}, У вас: ${currentUnits}`);
                    return;
                }
                
                console.log("Пытаюсь нанять:", typeKey, "кол-во:", count);
                this.startTrain(typeKey, count, tier.cost || {coin: singleCost}, tier.time || 1, tier.power || 0);
                // Сброс слайдера до 1
                slider.updateValue(1);
                count = 1;
                p.selectedCount = 1;
                totalCostLabel.text = `Всего: ${singleCost} Coin`;
                if (p.countNearBtn) p.countNearBtn.text = `x${p.selectedCount}`;
            }, 0x00FF00, 120, 40, 10);
            hireBtn.x = APP_WIDTH - 80; hireBtn.y = 170;
            p.addChild(hireBtn);

            // Показываем выбранное количество рядом с кнопкой НАЙМ
            const countNearBtn = new PIXI.Text(`x${p.selectedCount}`, {fontFamily:'Arial', fontSize:16, fill:0xFFFFFF, fontWeight:'bold'});
            countNearBtn.anchor.set(1, 0.5);
            countNearBtn.x = APP_WIDTH - 100; countNearBtn.y = 170;
            p.countNearBtn = countNearBtn;
            p.addChild(countNearBtn);

            // Прогресс бар
            const barContainer = new PIXI.Container();
            barContainer.position.set(100, 195);
            p.addChild(barContainer);
            const barBg = new PIXI.Graphics().rect(0, 0, 300, 10).fill(0x000000);
            barContainer.addChild(barBg);
            const barFill = new PIXI.Graphics().rect(0, 0, 300, 10).fill(0x00FF00);
            barFill.width = 0;
            barContainer.addChild(barFill);
            const qLbl = new PIXI.Text("", {fontFamily:'Arial', fontSize:14, fill:0x00FFFF});
            qLbl.x = 100; qLbl.y = 175;
            p.addChild(qLbl);

            this.unitPanels.push({ type: typeKey, bar: barFill, qLabel: qLbl });
        } else {
            // -- Если закрыто (T2) --
            const lock = new PIXI.Text("🔒", {fontSize:28});
            lock.anchor.set(0.5); lock.x = APP_WIDTH - 80; lock.y = 60;
            p.addChild(lock);

            const dev = new PIXI.Text("Нужен Tier 2", {fontFamily:'Arial', fontSize:16, fill:0xFF5555, fontWeight:'bold'});
            dev.anchor.set(0.5); dev.x = APP_WIDTH/2 - 20; dev.y = 110;
            p.addChild(dev);
        }

        return p;
    }

    startTrain(type, count, costObj, time, power) {
        let ok = true;
        const totalCost = costObj.coin * count;
        
        // Проверяем ресурсы (только монеты)
        if (GAME_STATE.resources.coin < totalCost) {
            ok = false;
        }

        if(ok) {
            // Списываем ресурсы (только монеты)
            GAME_STATE.resources.coin -= totalCost;
            this.addTopUI(); // Обновляем UI ресурсов
            
            // Обновляем информацию о лимите
            const academyLevel = GAME_STATE.buildings.ACADEMY.level;
            const unitLimit = ACADEMY_UNIT_LIMITS[academyLevel] || ACADEMY_UNIT_LIMITS[1];
            const currentUnits = Object.values(GAME_STATE.units).reduce((a, b) => a + b, 0);
            this.limitInfoText.text = `Лимит юнитов: ${currentUnits}/${unitLimit} (Уровень Академии: ${academyLevel})`;
            this.limitInfoText.style.fill = currentUnits >= unitLimit ? 0xFF4444 : 0x00FF00;

            const queue = GAME_STATE.unitQueues[type];
            let startTime = Date.now();
            if(queue.length > 0) startTime = Math.max(startTime, queue[queue.length-1].finish);

            for(let i=0; i<count; i++) {
                const finish = startTime + (time*1000);
                queue.push({ type, startTime, finish, power });
                startTime = finish;
            }
            
            saveGame(); // Сохраняем прогресс после найма
        } else {
            this.showInfoModal("Мало ресурсов", `Не хватает монет! Нужно: ${totalCost} Coin`);
        }
    }

    updateBars() {
        const now = Date.now();
        this.unitPanels.forEach(p => {
            const q = GAME_STATE.unitQueues[p.type];
            if(q && q.length > 0) {
                const cur = q[0];
                if(now >= cur.startTime) {
                    const tot = cur.finish - cur.startTime;
                    const el = now - cur.startTime;
                    p.bar.width = 300 * Math.min(el/tot, 1);
                } else {
                    p.bar.width = 0;
                }
                p.qLabel.text = `В очереди: ${q.length}`;
            } else {
                p.bar.width = 0;
                p.qLabel.text = "";
            }
        });
    }
}

// =========================================================================
// ================== ГЛОБАЛЬНЫЙ ТИКЕР (ЛОГИКА) ============================
// =========================================================================

let lastSaveTime = Date.now();

function gameTick() {
    const now = Date.now();
    let updated = false;

    // Очередь юнитов
    for(let k in GAME_STATE.unitQueues) {
        const q = GAME_STATE.unitQueues[k];
        if(q && q.length > 0) {
            if(now >= q[0].finish) {
                const done = q.shift();
                GAME_STATE.units[done.type] = (GAME_STATE.units[done.type] || 0) + 1;
                updated = true;
                updateGameCalculations(); // Обновляем расчет содержания
                saveGame(); // Сохраняем когда юнит готов
            }
        }
    }

    // Апгрейды и ПОСТРОЙКА зданий
    for(let k in GAME_STATE.buildings) {
        const b = GAME_STATE.buildings[k];
        if(!b) continue;
        
        // Логика АПГРЕЙДА (уровня)
        if(b.isUpgrading) {
            if(now >= b.upgradeStartTime + b.upgradeDuration) {
                b.level = (b.level || 1) + 1;
                b.isUpgrading = false;
                // При апгрейде DEFENSE_TOWER обновляем расчеты
                if(k === 'BANK' || k === 'MARKET' || k === 'DEFENSE_TOWER') {
                    updateGameCalculations();
                }
                updated = true;
                saveGame(); // Сохраняем когда апгрейд завершен
            }
        }

        // Логика ПОСТРОЙКИ (с нуля)
        if(b.isConstructing) {
            if(now >= b.constructionStartTime + b.buildDuration) {
                b.isBuilt = true;
                b.isConstructing = false;
                updated = true;
                
                // При постройке DEFENSE_TOWER устанавливаем уровень 1
                if(k === 'DEFENSE_TOWER' && b.level === 0) {
                    b.level = 1;
                    updateGameCalculations(); // Обновляем лимиты защиты
                }
                
                // Если мы в главном меню, надо перерисовать здания
                if(SceneManager && SceneManager.currentScene && SceneManager.currentScene instanceof MainMenuScene) {
                    SceneManager.currentScene.renderBuildings();
                }
                saveGame(); // Сохраняем когда постройка завершена
            }
        }
    }

    // Доход и содержание (с защитой от переполнения)
    if(now - GAME_STATE.lastIncomeTime >= 1000) {
        if(GAME_STATE.incomePerSecond > 0 || GAME_STATE.upkeepPerHour > 0) {
            const maxCoin = GAME_STATE.storageCapacity.coin || Infinity;
            // Чистый доход (доход минус содержание)
            const netIncomePerSecond = GAME_STATE.incomePerSecond - (GAME_STATE.upkeepPerHour / 3600);
            
            if(netIncomePerSecond !== 0) {
                const newCoin = GAME_STATE.resources.coin + netIncomePerSecond;
                // Не позволяем уйти в минус из-за содержания
                GAME_STATE.resources.coin = Math.max(0, Math.min(newCoin, maxCoin));
                updated = true;
            }
        }
        GAME_STATE.lastIncomeTime = now;
    }

    if(updated && SceneManager && SceneManager.currentScene) {
        // Обновляем только один раз!
        if(SceneManager.currentScene.updateTotalPower) {
            SceneManager.currentScene.updateTotalPower();
        }
    }
    
    // Автосохранение каждые 30 секунд
    if(now - lastSaveTime > 30000) {
        saveGame();
        lastSaveTime = now;
    }
}

    // Прелоадер ассетов с прогресс-колбэком (используется для заполнения кубиков на loading-screen)
    function preloadAssetsWithProgress(assetArray, onProgress) {
        return new Promise((resolve) => {
            const urls = assetArray.map(a => a && (a.src || a.alias || a)).filter(Boolean);
            const total = urls.length;
            if (total === 0) { if(onProgress) onProgress(1); resolve(); return; }
            let loaded = 0;
            let finished = false;

            const finish = (force) => {
                if (finished) return; finished = true;
                if (force && onProgress) onProgress(1);
                resolve();
            };

            // Safety timeout: если что-то висит — завершаем через 8 секунд
            const timeoutId = setTimeout(() => {
                console.warn('Preload timeout reached, continuing startup');
                finish(true);
            }, 8000);

            urls.forEach(u => {
                try {
                    const img = new Image();
                    img.onload = img.onerror = () => {
                        if (finished) return;
                        loaded++;
                        if (onProgress) onProgress(loaded / total);
                        if (loaded === total) {
                            clearTimeout(timeoutId);
                            finish(false);
                        }
                    };
                    img.src = u;
                } catch (e) {
                    // В случае ошибки учитываем ресурс как "загруженный"
                    if (finished) return;
                    loaded++;
                    if (onProgress) onProgress(loaded / total);
                    if (loaded === total) { clearTimeout(timeoutId); finish(false); }
                }
            });
        });
    }

async function init() {
    console.log("Start Init");
    app = new PIXI.Application();
    
    try {
        await app.init({ width: APP_WIDTH, height: APP_HEIGHT, background: '#000000' });
    } catch (e) {
        console.error("Ошибка инициализации PIXI:", e);
        alert("Ошибка загрузки игры. Проверьте консоль.");
        return;
    }
    
    app.canvas.style.touchAction = 'none'; 
    app.canvas.style.overscrollBehavior = 'none';
    app.canvas.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';

    const container = document.getElementById('pixi-container');
    if (!container) {
        console.error("Элемент #pixi-container не найден!");
        return;
    }
    container.appendChild(app.canvas);
    // Блокируем нативные жесты при взаимодействии с канвой
    app.view.addEventListener('pointerdown', ()=>{ __pointerActive = true; }, {passive:false});
    document.addEventListener('pointerup', ()=>{ __pointerActive = false; }, {passive:false});
    document.addEventListener('pointercancel', ()=>{ __pointerActive = false; }, {passive:false});
    // Предотвращаем дефолтный touchmove, если пользователь держит палец в приложении
    document.addEventListener('touchmove', (e)=>{ if(__pointerActive) e.preventDefault(); }, {passive:false});
    
    window.addEventListener('resize', resize);
    resize();

    // Предзагрузка изображений чтобы показать прогресс (кубики)
    try {
        console.log('Init: starting image preloader');
        const progressEl = document.getElementById('loading-progress');
        const cubes = progressEl ? Array.from(progressEl.querySelectorAll('.cube')) : [];

        await preloadAssetsWithProgress(Object.values(ASSETS), (p) => {
            if (cubes.length) {
                const filled = Math.round(p * cubes.length);
                cubes.forEach((c, i) => c.classList.toggle('filled', i < filled));
            }
        });
        console.log('Init: preloader finished');

        // Затем даём PIXI зарегистрировать/зарузить ассеты (кэш браузера минимизирует повторную загрузку)
        try {
            await PIXI.Assets.load(Object.values(ASSETS));
            console.log('Init: PIXI.Assets.load finished');
        } catch(e) {
            console.error("Asset load error", e);
            // Продолжаем даже если ассеты не загрузились
        }
    } catch(e) {
        console.warn('Preload error:', e);
    }

    console.log('Init: creating SceneManager');
    SceneManager = new SceneController(app);

    // ЗАГРУЗКА ИГРЫ И ОБНОВЛЕНИЕ РАСЧЕТОВ
    try {
        console.log('Init: loading game state');
        loadGame();
        updateGameCalculations();
    } catch (e) {
        console.error('Init: error during loadGame/updateGameCalculations', e);
    }

    try {
        console.log('Init: changing to MainMenuScene');
        await SceneManager.changeScene(MainMenuScene);
        console.log('Init: MainMenuScene loaded');
    } catch (e) {
        console.error('Init: error while changing to MainMenuScene', e);
        // Попытка показать сцену все равно, чтобы приложение не висло
        try { SceneManager.currentScene = new MainMenuScene(SceneManager); app.stage.addChild(SceneManager.currentScene); SceneManager.currentScene.init(); } catch(err){ console.error('Init: fallback scene creation failed', err); }
    } finally {
        // Гарантированно удаляем DOM-экран загрузки
        try {
            const loaderEl = document.getElementById('loading-screen');
            if (loaderEl) loaderEl.remove();
        } catch (e) {
            console.warn('Не удалось удалить loading-screen:', e);
        }
    }
    
    app.ticker.add(gameTick);
}

function resize() {
    if (!app || !app.canvas) return;
    const parent = app.canvas.parentNode;
    if (!parent) return;
    const w = parent.clientWidth, h = parent.clientHeight;
    const ratio = APP_WIDTH / APP_HEIGHT;
    let nw, nh;
    if (w / h > ratio) { nh = h; nw = h * ratio; } else { nw = w; nh = w / ratio; }
    app.canvas.style.width = `${nw}px`; app.canvas.style.height = `${nh}px`;
}

// Проверяем, что PIXI загружен
if (typeof PIXI === 'undefined') {
    console.error("PIXI.js не загружен! Проверьте подключение библиотеки.");
} else {
    window.onload = init;
}