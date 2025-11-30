// --- КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
const APP_WIDTH = 720; 
const APP_HEIGHT = 1280; 

let app;
let SceneManager; 

// --- ДАННЫЕ ЮНИТОВ (4 ТИПА) ---
const UNIT_DATA = {
    ScoutCat: {
        type: 'ScoutCat',
        icon: 'icon_res_energy', 
        T1: { name: 'Scout T1', cost: { coin: 100 }, time: 3, power: 15 }, 
        T2: { name: 'Scout T2', cost: { fish: 500 }, time: 6, power: 75 }, 
        T3: { name: 'Scout T3', cost: { fish: 2500 }, time: 20, power: 375 }, 
        T4: { name: 'Scout T4', cost: { fish: 10000 }, time: 60, power: 1500 }, 
    },
    DefenderCat: {
        type: 'DefenderCat',
        icon: 'icon_res_gold',
        T1: { name: 'Defender T1', cost: { coin: 150 }, time: 4, power: 20 }, 
        T2: { name: 'Defender T2', cost: { coin: 1000, fish: 200 }, time: 10, power: 100 }, 
        T3: { name: 'Defender T3', cost: { coin: 5000, fish: 1000 }, time: 30, power: 500 }, 
        T4: { name: 'Defender T4', cost: { coin: 20000, fish: 5000 }, time: 120, power: 2000 }, 
    },
    AttackerCat: {
        type: 'AttackerCat',
        icon: 'icon_res_gem',
        T1: { name: 'Attacker T1', cost: { coin: 200 }, time: 5, power: 25 }, 
        T2: { name: 'Attacker T2', cost: { gem: 50, fish: 500 }, time: 12, power: 125 }, 
        T3: { name: 'Attacker T3', cost: { gem: 250, fish: 2500 }, time: 40, power: 600 }, 
        T4: { name: 'Attacker T4', cost: { gem: 1000, fish: 10000 }, time: 180, power: 2500 }, 
    },
    // 4-Й ЮНИТ
    EngineerCat: { 
        type: 'EngineerCat',
        icon: 'icon_build', 
        T1: { name: 'Engineer T1', cost: { coin: 50, fish: 50 }, time: 2, power: 10 }, 
        T2: { name: 'Engineer T2', cost: { fish: 2000 }, time: 8, power: 50 }, 
        T3: { name: 'Engineer T3', cost: { coin: 10000, gem: 50 }, time: 25, power: 300 }, 
        T4: { name: 'Engineer T4', cost: { coin: 50000, gem: 250 }, time: 90, power: 1200 }, 
    },
};

// --- ДАННЫЕ ТРЕЙДЕРОВ ---
const TRADER_DATA = {
    T1: { name: 'Novice Trader', cost: { coin: 1000 }, incomePerHour: 60, limit: 5 },
    T2: { name: 'Expert Trader', cost: { coin: 5000 }, incomePerHour: 360, limit: 5 },
    T3: { name: 'Master Merchant', cost: { coin: 25000, gem: 100 }, incomePerHour: 1800, limit: 5 },
    T4: { name: 'Tycoon Cat', cost: { coin: 100000, gem: 500 }, incomePerHour: 10000, limit: 5 },
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
    units: { ScoutCat: 0, DefenderCat: 0, AttackerCat: 0, EngineerCat: 0 }, 
    traders: { T1: 0, T2: 0, T3: 0, T4: 0 },
    unitQueues: { ScoutCat: [], DefenderCat: [], AttackerCat: [], EngineerCat: [] }, 
    totalPower: 0,
    incomePerSecond: 0,
    lastIncomeTime: Date.now(),
    
    buildings: {
        CENTER: {
            level: 1,
            description: "Центр управления.",
            upgradeStartTime: 0, upgradeDuration: 10000, isUpgrading: false,
            upgradeCost: { coin: 1000 }
        },
        BANK: { 
            level: 1,
            description: "Банк хранит ресурсы.",
            upgradeStartTime: 0, upgradeDuration: 5000, isUpgrading: false,
            upgradeCost: { coin: 500 }
        },
        ACADEMY: { 
            level: 1,
            description: "Казарма, здесь обучаются боевые коты.",
            upgradeStartTime: 0, upgradeDuration: 3000, isUpgrading: false,
            upgradeCost: { coin: 500 }
        },
        MARKET: { 
            level: 1, 
            description: "Рынок обеспечивает базовый доход и позволяет нанимать трейдеров.", 
            upgradeStartTime: 0, upgradeDuration: 5000, isUpgrading: false,
            upgradeCost: { coin: 800 }
        },
        TANK: { level: 1, description: "Военная база.", isUpgrading: false }
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
    icon_res_fish: { alias: 'icon_res_fish', src: 'images/icon_res_fish.png' }, 

    icon_build: { alias: 'icon_build', src: 'images/icon_build.png' }, 
    icon_train: { alias: 'icon_train', src: 'images/icon_train.png' },
    icon_upgrade: { alias: 'icon_upgrade', src: 'images/icon_upgrade.png' },
    icon_map: { alias: 'icon_map', src: 'images/icon_map.png' }, // Используется как иконка для Навигации
};

function updateGameCalculations() {
    const BASE = GAME_STATE.storageCapacity.base;
    const bankLvl = GAME_STATE.buildings.BANK.level;
    GAME_STATE.storageCapacity.coin = BASE + (bankLvl * 1000); 
    
    const marketLvl = GAME_STATE.buildings.MARKET.level;
    const marketBaseIncome = marketLvl * 50; 
    
    let totalIncomePerHour = marketBaseIncome; 
    for(let tier in TRADER_DATA) {
        totalIncomePerHour += GAME_STATE.traders[tier] * TRADER_DATA[tier].incomePerHour;
    }
    GAME_STATE.incomePerSecond = totalIncomePerHour / 3600; 
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
        this.updateTotalPower();
    } 
    
    // --- UI РЕСУРСОВ ---
    addTopUI() {
        // Очистка старого UI
        this.children.filter(c => c.isTopUI).forEach(c => c.destroy({children:true}));

        const topBar = new PIXI.Graphics().rect(0, 0, APP_WIDTH, 80).fill({ color: 0x1A1A1A, alpha: 0.9 });
        topBar.zIndex = 100;
        topBar.isTopUI = true;
        this.addChild(topBar);
        
        const caps = GAME_STATE.storageCapacity;
        
        // Список ресурсов для отображения
        const resList = [
            { icon: ASSETS.icon_res_coin.alias, val: Math.floor(GAME_STATE.resources.coin), cap: caps.coin },
            { icon: ASSETS.icon_res_gem.alias, val: Math.floor(GAME_STATE.resources.gem), cap: caps.gem },
            { icon: ASSETS.icon_res_fish.alias, val: Math.floor(GAME_STATE.resources.fish), cap: caps.fish },
        ];
        
        let startX = 80; 
        const spacing = 160; 
        
        resList.forEach((res, i) => {
             this.createResDisplay(topBar, res.icon, res.val, res.cap, startX + i * spacing, 40);
        });
        
        // --- ACCOUNT POWER ---
        const powerCont = new PIXI.Container();
        powerCont.position.set(APP_WIDTH - 20, 25); 
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
        
        // Доход (смещен вниз)
        let incomePerHour = (GAME_STATE.incomePerSecond * 3600).toFixed(0);
        if(incomePerHour > 0) {
            const incText = new PIXI.Text(`+${incomePerHour}/ч`, {fontFamily:'Arial', fontSize:14, fill:0x00FF00});
            incText.anchor.set(1, 0.5);
            incText.position.set(APP_WIDTH - 20, 65);
            topBar.addChild(incText);
        }
        
        // Кнопка настроек
        const settBtn = PIXI.Sprite.from(ASSETS.settings_icon.alias);
        settBtn.anchor.set(0.5); settBtn.scale.set(0.06);
        settBtn.x = APP_WIDTH - 25; settBtn.y = 110;
        settBtn.eventMode='static'; settBtn.cursor='pointer';
        settBtn.isTopUI = true; 
        this.addChild(settBtn);
    }

    createResDisplay(parent, iconAlias, val, cap, x, y) {
        const cont = new PIXI.Container();
        cont.position.set(x, y);
        
        const bg = new PIXI.Graphics().roundRect(-60, -25, 120, 50, 15).fill({color:0x333333});
        cont.addChild(bg);
        
        // Проверка наличия текстуры
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
            const unitCount = GAME_STATE.units[typeKey];
            const uData = UNIT_DATA[typeKey];
            if(uData) {
                // Предполагаем, что юнит первого тира дает базовую силу
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
    
    // Вспомогательные функции UI
    showInfoModal(title, text) {
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
        this.currentScene.init(param);
    }
}

// --- ГЛАВНОЕ МЕНЮ ---
class MainMenuScene extends BaseScene {
    constructor(manager) { super(manager); this.activeMenu = null; }
    
    init() {
        super.init(); 
        this.addBackgroundCover('map_background');
        this.addBuildings();
        this.addBottomNavigation(); // <<< ДОБАВЛЕНА НИЖНЯЯ ПАНЕЛЬ
        this.eventMode='static';
        this.on('pointertap', ()=>this.closeMenu());
        
        this.timerFn = ()=>this.updateMenuTimers();
        app.ticker.add(this.timerFn);
    }
    
    destroy(opt) {
        if(this.timerFn) app.ticker.remove(this.timerFn);
        super.destroy(opt);
    }

    addBuildings() {
        const addB = (alias, x, y, type, scale) => {
            const sp = PIXI.Sprite.from(alias);
            sp.anchor.set(0.5); sp.scale.set(scale); sp.x=x; sp.y=y;
            sp.eventMode='static'; sp.cursor='pointer';
            sp.on('pointertap', (e)=>{ e.stopPropagation(); this.openMenu(sp, type); });
            this.addChild(sp);
        };

        // --- ОБНОВЛЕННЫЕ РАЗМЕРЫ И ПОЗИЦИИ ---
        // Уменьшение CENTER и BANK
        const SCALE_CENTER = 0.41; // БЫЛО 0.9
        const SCALE_BANK = 0.3;   // БЫЛО 0.6
        const SCALE_OTHER = 0.3;  // Без изменений

        // CENTER: (scale 0.41) - по центру, чуть ниже
        addB('building_center', APP_WIDTH/2 + 80, APP_HEIGHT/2 + 40, 'CENTER', SCALE_CENTER); 
        
        // BANK: (scale 0.3) - слева вверху
        addB('building_bank', APP_WIDTH/2 - 190, APP_HEIGHT/2 - 100, 'BANK', SCALE_BANK); 
        
        // ACADEMY: (scale 0.3) - справа вверху
        addB('building_lab', APP_WIDTH/2 + 220, APP_HEIGHT/2 - 100, 'ACADEMY', SCALE_OTHER); 
        
        // MARKET: (scale 0.3) - справа внизу
        addB('building_market', APP_WIDTH/2 + 220, APP_HEIGHT/2 + 250, 'MARKET', SCALE_OTHER); 
        
        // TANK: (scale 0.3) - слева внизу
        addB('building_tank', APP_WIDTH/2 - 190, APP_HEIGHT/2 + 250, 'TANK', SCALE_OTHER); 
    }

    openMenu(sprite, type) {
        this.closeMenu();
        const bData = GAME_STATE.buildings[type];
        if(!bData) return;

        const m = new PIXI.Container();
        m.zIndex=50; 
        m.x = sprite.x; 
        
        // Замените предыдущий блок на этот:

        // === СКОРРЕКТИРОВАННЫЙ ОФФСЕТ МЕНЮ ДЛЯ НОВЫХ МАСШТАБОВ ===
        let yOffsetBase = 70; // Базовый оффсет для масштаба 0.3
        
        if(type === 'CENTER') {
            yOffsetBase = 140; // Для масштаба 0.41 (Центр)
            m.x -= 65; // <--- НОВОЕ: Смещаем меню на 100 пикселей влево
        }
        else if(type === 'BANK') yOffsetBase = 120; // Для масштаба 0.3 (Банк)
        
        m.y = sprite.y + yOffsetBase; 

        this.addChild(m);
        this.activeMenu = { container: m, type: type, upLabel: null };

        // Кнопка UPGRADE (Слева, y=0)
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
            } else {
                this.showInfoModal("Ошибка", "Не хватает ресурсов!");
            }
        });
        upBtn.x = -70; upBtn.y = 0;
        m.addChild(upBtn);
        this.activeMenu.upLabel = upBtn.lbl;

        // Кнопка USE / ВХОД (Справа, y=0)
        let useTxt = "Вход", useCol = 0x3C8CE7, useAct = ()=>{};
        let infoText = bData.description; // Текст по умолчанию для INFO
        
        if(type === 'ACADEMY') { 
            useTxt="Найм"; useCol=0x00FF00; useAct=()=>this.manager.changeScene(AcademyScene); 
        }
        else if(type === 'CENTER') { 
            useTxt="Юниты"; useCol=0x00FF00; useAct=()=>this.showUnitList(); 
        }
        else if(type === 'MARKET') { 
            useTxt="Трейдеры"; useCol=0x00FF00; useAct=()=>this.manager.changeScene(MarketScene); 
            // Инфо о рынке
            const marketLvl = GAME_STATE.buildings.MARKET.level;
            const baseIncome = marketLvl * 50;
            const traderIncome = ((GAME_STATE.incomePerSecond * 3600) - baseIncome);
            infoText = `Рынок дает пассивный базовый доход монетами (Coin) за свой уровень.

Текущий уровень: ${marketLvl}
Базовый доход (Coin): ${baseIncome}/час
Доход от трейдеров (Coin): ${traderIncome.toFixed(0)}/час
`;
        }
        else if(type === 'BANK') { 
            useTxt="Банк"; useCol=0x0000FF; useAct=()=>this.showInfoModal("Банк", `Текущий лимит Coin: ${GAME_STATE.storageCapacity.coin.toLocaleString()}`); 
            infoText = `${bData.description}\n\nТекущий лимит Coin: ${GAME_STATE.storageCapacity.coin.toLocaleString()}`;
        }
        else { useTxt="--"; useCol=0x555555; }

        const useBtn = this.createPentagon(useTxt, useCol, useAct);
        useBtn.x = 70; useBtn.y = 0;
        m.addChild(useBtn);

        // Инфо (По центру СНИЗУ)
        const iBtnY = 70; // Смещаем Инфо вниз
        const iBtn = new PIXI.Graphics().circle(0, iBtnY, 20).fill({color:0x000000}).stroke({width:2, color:0xFFFFFF});
        iBtn.eventMode='static'; iBtn.cursor='pointer';
        iBtn.on('pointertap', ()=>this.showInfoModal(type, infoText));
        m.addChild(iBtn);
        
        const iTxt = new PIXI.Text("i", {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF, fontWeight:'bold'});
        iTxt.anchor.set(0.5); iTxt.y=iBtnY;
        m.addChild(iTxt);
        
        // Уровень здания (По центру СВЕРХУ)
        const lvlTxt = new PIXI.Text(`Lv.${bData.level}`, {fontFamily:'Arial', fontSize:16, fill:0xFFFFFF, stroke:0x000000, strokeThickness:3});
        lvlTxt.anchor.set(0.5); lvlTxt.y = -70; // Смещаем вверх над кнопками
        m.addChild(lvlTxt);
    }

    closeMenu() {
        if(this.activeMenu) {
            this.activeMenu.container.destroy({children:true});
            this.activeMenu = null;
        }
    }

    updateMenuTimers() {
        if(this.activeMenu && this.activeMenu.upLabel) {
            const b = GAME_STATE.buildings[this.activeMenu.type];
            if(b.isUpgrading) {
                const rem = Math.ceil((b.upgradeStartTime + b.upgradeDuration - Date.now())/1000);
                this.activeMenu.upLabel.text = rem > 0 ? rem + "s" : "UP";
            } else {
                if(this.activeMenu.upLabel.text !== "UP") this.activeMenu.upLabel.text = "UP";
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
        if(this.infoModal) this.infoModal.destroy({children:true});
        const W = APP_WIDTH*0.9, H = APP_HEIGHT*0.7;
        const c = new PIXI.Container();
        c.zIndex=200; c.x=APP_WIDTH/2; c.y=APP_HEIGHT/2;
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
    
    // --- НОВАЯ ФУНКЦИЯ: НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ ---
    addBottomNavigation() {
        const H_POS = APP_HEIGHT - 60; // Позиция по Y внизу
        const SPACING = 150; 
        
        // Расчет начальной позиции для центрирования 4 кнопок
        const START_X = APP_WIDTH / 2 - (1.5 * SPACING); 
        
        const navContainer = new PIXI.Container();
        navContainer.position.set(0, H_POS);
        navContainer.zIndex = 100; // Поверх зданий
        this.addChild(navContainer);
        
        // Фон для кнопок
        const bg = new PIXI.Graphics().rect(0, -50, APP_WIDTH, 100).fill({color:0x000000, alpha:0.8});
        navContainer.addChild(bg);
        
        // Список кнопок: [Иконка, Текст, Действие]
        const buttons = [
            { icon: ASSETS.icon_map.alias, text: "Карта", action: ()=>this.showInfoModal("Карта", "Переход на карту (в разработке)") },
            { icon: ASSETS.icon_train.alias, text: "Атака", action: ()=>this.showInfoModal("Атака", "Сцена атаки (в разработке)") },
            { icon: ASSETS.icon_upgrade.alias, text: "Герои", action: ()=>this.showInfoModal("Герои", "Список героев (в разработке)") },
            { icon: ASSETS.icon_power_cat.alias, text: "Задания", action: ()=>this.showInfoModal("Задания", "Ежедневные задания (в разработке)") }
        ];

        buttons.forEach((btn, i) => {
            const btnCont = new PIXI.Container();
            // Позиционируем относительно START_X, а не центра контейнера
            btnCont.x = START_X + i * SPACING; 
            btnCont.y = 0;
            
            const icon = PIXI.Sprite.from(btn.icon);
            icon.anchor.set(0.5); icon.scale.set(0.06); icon.y = -15; // Иконка выше
            
            const text = new PIXI.Text(btn.text, {fontFamily:'Arial', fontSize:14, fill:0xFFFFFF, fontWeight:'bold'});
            text.anchor.set(0.5); text.y = 20; // Текст ниже

            // Создаем невидимую область для клика
            const clickArea = new PIXI.Graphics().circle(0, 0, 40).fill({color:0x555555, alpha:0.01});
            clickArea.eventMode='static'; clickArea.cursor='pointer';
            clickArea.on('pointertap', btn.action);
            
            btnCont.addChild(clickArea, icon, text);
            navContainer.addChild(btnCont);
        });
    }
}

// --- СЦЕНА: РЫНОК (ПАССИВНЫЙ ДОХОД) ---
class MarketScene extends BaseScene {
    constructor(manager) { super(manager); }

    init() {
        super.init();
        this.addBackgroundCover('fon_academy'); 
        this.addTopUI();
        
        const t = new PIXI.Text("РЫНОК ТРЕЙДЕРОВ", {fontFamily:'Arial', fontSize:36, fill:0xFFD700, stroke:0x000000, strokeThickness:4});
        t.anchor.set(0.5); t.x = APP_WIDTH/2; t.y = 120;
        this.addChild(t);
        
        // Информация о базовом доходе
        const marketLvl = GAME_STATE.buildings.MARKET.level;
        const baseIncome = marketLvl * 50;
        const infoBase = new PIXI.Text(`Базовый доход Рынка (Lv.${marketLvl}): +${baseIncome}/час`, {fontFamily:'Arial', fontSize:22, fill:0x00FF00, fontWeight:'bold'});
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
        
        const title = new PIXI.Text("КАЗАРМА (4 ТИПА ЮНИТОВ)", {fontFamily:'Arial', fontSize:32, fill:0x00FF00, fontWeight:'bold'});
        title.anchor.set(0.5); title.x = APP_WIDTH/2; title.y = 110;
        this.addChild(title);

        this.unitPanels = []; 
        this.renderUnits();

        const back = this.createSimpleButton("Назад", ()=>{ 
            this.manager.changeScene(MainMenuScene); 
        }, 0xFFD700);
        back.x = APP_WIDTH/2; back.y = APP_HEIGHT - 60;
        this.addChild(back);

        this.updFn = ()=>this.updateBars();
        app.ticker.add(this.updFn);
    }

    destroy(opt) {
        if(this.updFn) app.ticker.remove(this.updFn);
        super.destroy(opt);
    }

    renderUnits() {
        let y = 160;
        for(let key in UNIT_DATA) {
            this.createPanel(key, UNIT_DATA[key], y);
            y += 180;
        }
    }

    createPanel(typeKey, data, y) {
        const tier = data.T1;
        const p = new PIXI.Container();
        p.x = 10; p.y = y;
        this.addChild(p);

        const bg = new PIXI.Graphics().roundRect(0,0, APP_WIDTH-20, 170, 10).fill({color:0x202020, alpha:0.9}).stroke({width:2, color:0x555555});
        p.addChild(bg);

        const iconAlias = data.icon || 'icon_power_cat';
        if(PIXI.Assets.cache.has(iconAlias)){
            const ic = PIXI.Sprite.from(iconAlias);
            ic.anchor.set(0.5); ic.scale.set(0.07); ic.x=50; ic.y=50;
            p.addChild(ic);
        }

        const name = new PIXI.Text(tier.name, {fontFamily:'Arial', fontSize:20, fill:0xFFFFFF, fontWeight:'bold'});
        name.x=100; name.y=10; p.addChild(name);

        const costTxt = this.formatCost(tier.cost);
        const cost = new PIXI.Text(`Цена: ${costTxt}`, {fontFamily:'Arial', fontSize:16, fill:0xFFD700});
        cost.x=100; cost.y=40; p.addChild(cost);
        
        // Отображение силы юнита
        const powerInfo = new PIXI.Text(`Мощь: +${tier.power}`, {fontFamily:'Arial', fontSize:16, fill:0x00FFFF});
        powerInfo.x=100; powerInfo.y=65; p.addChild(powerInfo);

        // Кнопки кол-ва
        let count = 1;
        const cntLbl = new PIXI.Text("1", {fontFamily:'Arial', fontSize:24, fill:0xFFFFFF});
        cntLbl.anchor.set(0.5); cntLbl.x = APP_WIDTH - 160; cntLbl.y = 50;
        p.addChild(cntLbl);

        const btnMinus = this.createSimpleButton("-", ()=>{ if(count>1) count--; cntLbl.text=count; }, 0xDC3545, 40,40,5);
        btnMinus.x = APP_WIDTH - 210; btnMinus.y = 50;
        p.addChild(btnMinus);

        const btnPlus = this.createSimpleButton("+", ()=>{ count++; cntLbl.text=count; }, 0x28A745, 40,40,5);
        btnPlus.x = APP_WIDTH - 110; btnPlus.y = 50;
        p.addChild(btnPlus);

        // Кнопка НАЙМ
        const hireBtn = this.createSimpleButton("НАЙМ", ()=>{
            this.startTrain(typeKey, count, tier.cost, tier.time, tier.power);
            count=1; cntLbl.text="1";
        }, 0x00FF00, 120, 40, 10);
        hireBtn.x = APP_WIDTH - 80; hireBtn.y = 110;
        p.addChild(hireBtn);

        // Прогресс
        const barBg = new PIXI.Graphics().rect(100, 145, 300, 10).fill(0x000000);
        const barFill = new PIXI.Graphics().rect(100, 145, 300, 10).fill(0x00FF00);
        barFill.width = 0;
        p.addChild(barBg, barFill);

        const qLbl = new PIXI.Text("", {fontFamily:'Arial', fontSize:14, fill:0x00FFFF});
        qLbl.x = 100; qLbl.y = 125;
        p.addChild(qLbl);

        this.unitPanels.push({ type: typeKey, bar: barFill, qLabel: qLbl });
    }

    startTrain(type, count, costObj, time, power) {
        let ok = true;
        for(let r in costObj) if(GAME_STATE.resources[r] < costObj[r] * count) ok=false;

        if(ok) {
            for(let r in costObj) GAME_STATE.resources[r] -= costObj[r] * count;
            this.addTopUI();
            
            const queue = GAME_STATE.unitQueues[type];
            let startTime = Date.now();
            if(queue.length > 0) startTime = Math.max(startTime, queue[queue.length-1].finish);

            for(let i=0; i<count; i++) {
                const finish = startTime + (time*1000);
                queue.push({ type, startTime, finish, power });
                startTime = finish;
            }
        } else {
            this.showInfoModal("Ошибка", "Не хватает ресурсов!");
        }
    }

    updateBars() {
        const now = Date.now();
        this.unitPanels.forEach(p => {
            const q = GAME_STATE.unitQueues[p.type];
            if(q.length > 0) {
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

function gameTick() {
    const now = Date.now();
    let updated = false;

    // 1. Очереди строительства юнитов (каждая отдельно)
    for(let k in GAME_STATE.unitQueues) {
        const q = GAME_STATE.unitQueues[k];
        if(q.length > 0) {
            if(now >= q[0].finish) {
                const done = q.shift();
                GAME_STATE.units[done.type]++;
                updated = true;
            }
        }
    }

    // 2. Апгрейды зданий
    for(let k in GAME_STATE.buildings) {
        const b = GAME_STATE.buildings[k];
        if(b.isUpgrading) {
            if(now >= b.upgradeStartTime + b.upgradeDuration) {
                b.level++;
                b.isUpgrading = false;
                if(k === 'BANK') updateGameCalculations(); 
                if(k === 'MARKET') updateGameCalculations(); 
                updated = true;
            }
        }
    }

    // 3. Пассивный доход (раз в секунду)
    if(now - GAME_STATE.lastIncomeTime >= 1000) {
        if(GAME_STATE.incomePerSecond > 0) {
            if(GAME_STATE.resources.coin < GAME_STATE.storageCapacity.coin) {
                GAME_STATE.resources.coin += GAME_STATE.incomePerSecond;
                if(GAME_STATE.resources.coin > GAME_STATE.storageCapacity.coin) {
                    GAME_STATE.resources.coin = GAME_STATE.storageCapacity.coin;
                }
                updated = true;
            }
        }
        GAME_STATE.lastIncomeTime = now;
    }

    if(updated && SceneManager.currentScene) {
        SceneManager.currentScene.updateTotalPower(); 
    }
}

// =========================================================================
// ================== ИНИЦИАЛИЗАЦИЯ ========================================
// =========================================================================

async function init() {
    console.log("Start Init");
    app = new PIXI.Application();
    await app.init({ width: APP_WIDTH, height: APP_HEIGHT, background: '#000000' });
    document.getElementById('pixi-container').appendChild(app.canvas);
    
    // Ресайз
    window.addEventListener('resize', resize);
    resize();

    try {
        await PIXI.Assets.load(Object.values(ASSETS));
    } catch(e) {
        console.error("Asset load error", e);
    }

    SceneManager = new SceneController(app);
    updateGameCalculations();
    
    SceneManager.changeScene(MainMenuScene);
    
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

window.onload = init;