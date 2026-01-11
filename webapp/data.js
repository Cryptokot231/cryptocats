// ==========================================
// data.js - НАСТРОЙКИ И БАЛАНС ИГРЫ
// ==========================================

const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

// --- ДАННЫЕ ЗДАНИЙ ---
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

// --- ДАННЫЕ ЮНИТОВ ---
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

// --- ДЕРЕВО ЛАБОРАТОРИИ ---
const LAB_NODES = [
    { id: 'mining_1', name: 'Eff. Mining', x: 360, y: 150, cost: { coin: 500 }, parent: null, desc: '+5% к добыче' },
    { id: 'mining_2', name: 'Deep Drill', x: 200, y: 300, cost: { coin: 2000 }, parent: 'mining_1', desc: '+10% к добыче' },
    { id: 'army_1', name: 'Basic Training', x: 520, y: 300, cost: { coin: 2000 }, parent: 'mining_1', desc: '-5% время тренировки' },
    { id: 'storage_1', name: 'Compact Storage', x: 360, y: 450, cost: { coin: 5000 }, parent: 'mining_1', desc: '+10% вместимость' },
    { id: 'hero_1', name: 'Heroic Spirit', x: 520, y: 550, cost: { coin: 10000 }, parent: 'army_1', desc: '+5% опыт герою' },
];

// --- ЛИМИТЫ АКАДЕМИИ ---
const ACADEMY_UNIT_LIMITS = {
    1: 100, 2: 250, 3: 500, 4: 1000, 5: 2000,
    6: 4000, 7: 8000, 8: 15000, 9: 30000, 10: 60000
};

// --- СПИСОК КАРТИНОК ---
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
    icon_res_coin: { alias: 'icon_res_coin', src: 'images/icon_res_coin.png' },
    icon_res_gem: { alias: 'icon_res_gem', src: 'images/icon_res_gem.png' },
    icon_res_gold: { alias: 'icon_res_gold', src: 'images/icon_res_gold.png' }, 
    icon_res_energy: { alias: 'icon_res_energy', src: 'images/icon_res_energy.png' },
    icon_res_fish: { alias: 'icon_res_fish', src: 'images/icon_res_fish.png' }, 
    icon_build: { alias: 'icon_build', src: 'images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'images/icon_map.png' }, 
    icon_friends: { alias: 'icon_friends', src: 'images/icon_train.png' },
};