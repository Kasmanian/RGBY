import Game from './engine/game.js';
import HTML from './engine/html.js';
import Hist from './engine/hist.js';
import Timer from './engine/timer.js';
import { deci, sleep, redef } from './engine/funcs.js';

class App {
    constructor(data) {
        this.hasSave = data['save'] != undefined;
        this.save = this.hasSave? JSON.parse(data['save']) : {
            'size': 3,
            'blind': false,
            'practice': false,
            'blade': false,
            'dark': true,
            'ruler': false,
            'keybindsXAxis': {'a': 0, 's': 1, 'd': 2, 'f': 3, 'e': 4, 'r': 5, 'h': 6, 'j': 7, 'k': 8, 'l': 9, 'u': 10, 'i': 11},
            'keybindsYAxis': {'a': 0, 's': 1, 'd': 2, 'f': 3, 'e': 4, 'r': 5, 'h': 6, 'j': 7, 'k': 8, 'l': 9, 'u': 10, 'i': 11},
            'stats': {}
        }
        this.html = new HTML();
        this.resetGame();
        this.loadAppIntoDom();
    }
    resetGame() {
        this.handleToggleDark();
        if (!this.save['blind']) document.getElementById('shuffle').innerHTML = '<span class="table-cell">SHUFFLE</span>';
        this.state = 0;
        this.returnState = 0;
        this.moves = 0;
        this.axis = 1;
        this.time = undefined;
        this.game = new Game(this.save['size']);
        this.html.renderHUD(0, 0, this.state);
    }
    handleShuffleClicked() {
        if (this.state>1&&this.save['blind']) {
            let isSolved = this.game.isSolved();
            sleep(.1);
            this.time.pause();
            if (isSolved) {
                let mode = this.modeToKey();
                this.save['stats'][mode] = this.save['stats'][mode]!=undefined? this.save['stats'][mode] : {};
                mode = this.save['stats'][mode];
                mode['totalSolves'] = redef(mode['totalSolves'], 0)+1;
                mode['averageMoves'] = (redef(mode['averageMoves'], 0)+this.moves)/mode['totalSolves'];
                mode['averageTime'] = (redef(mode['averageTime'], 0)+redef(this.time.timeElapsed(), 0))/mode['totalSolves'];
                mode['averageMPS'] = Math.floor((redef(mode['averageMPS'], 0)+(mode['averageMoves']/(mode['averageTime']/1000)))/mode['totalSolves']*100)/100;
                window.localStorage['save'] = JSON.stringify(this.save);
            }
            this.state = -2;
            this.loadBoard();
        } else {
            this.resetGame();
            this.game.shuffle();
            this.state = 1;
            this.loadBoard();
            this.returnState = 1;
        }
    }
    handleKeyPressed(event) {
        if (this.state<1) return;
        if (event.key==' ') {
            this.state = this.state<2? 1 : 2;
            this.handleToggleAxis();
        } else {
            let bind = this.axis<0? this.save['keybindsXAxis'][event.key] : this.save['keybindsYAxis'][event.key];
            if (bind==undefined) return;
            let live = this.axis<0? this.game.liveX : this.game.liveY;
            let hasMoved = this.handleMove(this.axis, bind, live, this.game.size, this.game);
            this.handleHasMoved(hasMoved);
        }
    }
    handleDotClicked(event) {
        let coords = event.target.id.split('-');
        let bind = this.axis<0? deci(coords[0]) : deci(coords[1]);
        let live = this.axis<0? this.game.liveX : this.game.liveY;
        let hasMoved = this.handleMove(this.axis, bind, live, this.game.size, this.game);
        this.handleHasMoved(hasMoved);
    }
    handleMove(axis, bind, live, size, game) {
        let dist = 0;
        let temp = bind-live;
        if (!(Math.abs(temp)>=0&&Math.abs(temp)<size&&temp>0)) {
            dist = temp>0? bind-(live+size-1) : bind-live;
        }
        return game.shiftBy(dist, axis)? Math.abs(dist) : 0;
    }
    handleHasMoved(hasMoved) {
        if (hasMoved) {
            this.moves += hasMoved;
            if (this.time==undefined) this.clock();
            let isSolved = false;
            if (!this.save['blind']) {
                isSolved = this.game.isSolved();
                sleep(.1);
            } else {
                if (this.state<2) document.getElementById('shuffle').innerHTML = '<span class="table-cell">DONE</span>';
            }
            if (isSolved) {
                this.time.pause();
                let mode = this.modeToKey();
                this.save['stats'][mode] = this.save['stats'][mode]!=undefined? this.save['stats'][mode] : {};
                mode = this.save['stats'][mode];
                mode['totalSolves'] = redef(mode['totalSolves'], 0)+1;
                mode['averageMoves'] = (redef(mode['averageMoves'], 0)+this.moves)/mode['totalSolves'];
                mode['averageTime'] = (redef(mode['averageTime'], 0)+redef(this.time.timeElapsed(), 0))/mode['totalSolves'];
                mode['averageMPS'] = Math.floor((redef(mode['averageMPS'], 0)+(mode['averageMoves']/(mode['averageTime']/1000)))/mode['totalSolves']*100)/100;
                window.localStorage['save'] = JSON.stringify(this.save);
            }
            this.state = isSolved? -2 : 3;
            this.handleToggleAxis();
        }
        else this.state = 2;
    }
    handleMainMenuClicked() {
        this.hist = new Hist(['size', 'blind', 'practice', 'blade'], this.save);
        this.returnState = this.state;
        this.state = -1;
        const app = this;
        const $main = $('#main');
        $(this.html.renderMainMenu(this.save['blind'], this.save['practice'], this.save['blade'], this.save['size'])).insertAfter($main);
        const $misc = $('#misc');
        $($misc).on('click', '.menu-item', function(e) {app.handleMenuItemClicked(e)});
    }
    handleHelpMenuClicked() {
        this.hist = new Hist([], this.save);
        this.returnState = this.state;
        this.state = -1;
        const app = this;
        const $main = $('#main');
        $(this.html.renderHelpMenu()).insertAfter($main);
        const $misc = $('#misc');
        $($misc).on('click', '.menu-item', function(e) {app.handleMenuItemClicked(e)});
    }
    handleStatsMenuClicked() {
        this.hist = new Hist(['size', 'blind', 'practice', 'blade'], this.save);
        this.returnState = this.state;
        this.state = -1;
        const app = this;
        const $main = $('#main');
        $(this.html.renderStatsMenu(this.save['blind'], this.save['practice'], this.save['blade'], this.save['size'], this.save, this.modeToKey(), true)).insertAfter($main);
        const $misc = $('#misc');
        $($misc).on('click', '.menu-item', function(e) {app.handleMenuItemClicked(e)});
    }
    handleSettingsMenuClicked() {
        this.hist = new Hist(['dark', 'ruler', 'keybindsXAxis', 'keybindsYAxis'], this.save);
        this.returnState = this.state;
        this.state = -1;
        const app = this;
        const $main = $('#main');
        $(this.html.renderSettingsMenu(this.save['dark'], this.save['ruler'], this.save['keybindsXAxis'], this.save['keybindsYAxis'])).insertAfter($main);
        const $misc = $('#misc');
        $($misc).on('click', '.menu-item', function(e) {app.handleMenuItemClicked(e)});
        $($misc).on('keydown', '.keybind :input', function(e) {app.handleKeyItemClicked(e)});
    }
    handleMenuItemClicked(event) {
        let oldRender = '';
        let gameType = new Set(['blind', 'practice', 'blade']);
        let menuItem = event.currentTarget;
        switch (menuItem.id) {
            case 'x':
                if (document.getElementsByClassName('settings').length>0) {
                    if (document.getElementsByClassName('invalid').length==0) {
                        let xAxis = {}
                        let yAxis = {}
                        for (let i=0; i<12; i++) {
                            xAxis[document.getElementById(`keyx${i}`).value] = i;
                            yAxis[document.getElementById(`keyy${i}`).value] = i;
                        }
                        this.save['keybindsXAxis'] = xAxis;
                        this.save['keybindsYAxis'] = yAxis;
                    }
                }
                this.handleCloseMisc(event);
                return;
            case 'previous':
                this.save['size'] = this.save['size']-1<2? 4 : this.save['size']-1;
                oldRender = document.getElementById('size');
                $(this.html.renderSize(this.save['size'])).insertAfter(oldRender);
                oldRender.remove();
                if (!$($('#misc')).hasClass('mutateSave')) this.handleStatsModeUpdate();
                return;
            case 'next':
                this.save['size'] = (this.save['size']+1)%5<2? 2 : (this.save['size']+1)%5;
                oldRender = document.getElementById('size');
                $(this.html.renderSize(this.save['size'])).insertAfter(oldRender);
                oldRender.remove();
                if (!$($('#misc')).hasClass('mutateSave')) this.handleStatsModeUpdate();
                return;
            case 'share':
                let msg = {
                    title: 'RGBY',
                    text: "Can you solve this 2D Rubik's puzzle?",
                    url: 'https://www.playrgby.com'
                }
                navigator.share(msg);
                return;
            case 'donate':
                window.open('https://www.paypal.me/asimmskem', '_blank');
                return;
            case 'contact':
                window.open('mailto:asimms.kem@gmail.com', '_blank');
                return;
            case 'clearMode':
                delete this.save['stats'][this.modeToKey()];
                window.localStorage['save'] = JSON.stringify(this.save);
                this.handleStatsModeUpdate();
                return;
            case 'clearAll':
                this.save['stats'] = {};
                window.localStorage['save'] = JSON.stringify(this.save);
                this.handleStatsModeUpdate();
                return;
            case 'darkToggle':
                this.save['dark'] = menuItem.value!='on';
                menuItem.value = menuItem.value=='on'? 'off' : 'on';
                this.handleToggleDark();
                return;
            case 'rulerToggle':
                this.save['ruler'] = menuItem.value!='on';
                menuItem.value = menuItem.value=='on'? 'off' : 'on';
                return;
            default:
                if (gameType.has(menuItem.id)) {
                    this.save[menuItem.id] = !this.save[menuItem.id];
                    $(this.html.renderGameTypeOption(menuItem.id, this.save[menuItem.id])).insertAfter(menuItem);
                    menuItem.remove();
                    if (!$($('#misc')).hasClass('mutateSave')) this.handleStatsModeUpdate();
                }
                return;
        }
    }
    handleKeyItemClicked(event) {
        console.log(`${event.target.id}: "${event.key}"`);
        let ignoreIndex = parseInt(event.target.id.substring(4));
        let bind = event.target.id[3]!='y'? 'keyx' : 'keyy';
        let keys = {};
        let invalidKeys = [];
        for (let i=0; i<12; i++) {
            if (i==ignoreIndex) continue;
            let currentKey = document.getElementById(`${bind}${i}`);
            currentKey.classList.remove('invalid');
            if (keys[currentKey.value]==undefined&&currentKey.value.length==1&&currentKey.value!=''&&currentKey.value!=' ') keys[currentKey.value] = i;
            else invalidKeys.push(currentKey);
        }
        if (keys[event.key]!=undefined&&event.target.value!=' ') {
            if (ignoreIndex>keys[event.key]) invalidKeys.push(event.target);
            else {
                event.target.classList.remove('invalid');
                invalidKeys.push(document.getElementById(`${bind}${keys[event.key]}`));
            }
        } 
        else if (event.key.length>1||event.key==' ') {
            if (event.key=='Backspace') invalidKeys.push(event.target);
            else if (keys[event.target.value]!=undefined&&event.target.value!=' ') {
                if (ignoreIndex>keys[event.target.value]) invalidKeys.push(event.target);
                else {
                    event.target.classList.remove('invalid');
                    invalidKeys.push(document.getElementById(`${bind}${keys[event.target.value]}`));
                }
            }
        } else if (event.target.value!=' ') event.target.classList.remove('invalid');
        for (let key of invalidKeys) {
            console.log('invalid keys: '+key.id);
            key.classList.add('invalid');
        }
    }
    handleStatsModeUpdate() {
        let oldRender = document.getElementById('misc-overlay');
        $(this.html.renderStatsMenu(this.save['blind'], this.save['practice'], this.save['blade'], this.save['size'], this.save, this.modeToKey(), false)).insertAfter(oldRender);
        oldRender.remove();
        const app = this;
        const $misc = $('#misc');
        $($misc).on('click', '.menu-item', function(e) {app.handleMenuItemClicked(e)});
    }
    handleCloseMisc() {
        if (!$($('#misc')).hasClass('mutateSave')) this.hist.recover(this.save);
        if (this.hist.hasChanged(this.save)) {
            window.localStorage['save'] = JSON.stringify(this.save);
            if (document.getElementsByClassName('settings').length<1) this.resetGame();
        }
        this.state = this.returnState;
        document.getElementById('misc-overlay').remove();
        this.loadBoard();
    }
    handleToggleAxis() {
        this.axis *= -1;
        this.loadBoard();
    }
    handleToggleDark() {
        if (this.save['dark']) {
            document.documentElement.style.setProperty('--L', '#DADAE5');
            document.documentElement.style.setProperty('--T', '#717177');
            document.documentElement.style.setProperty('--N', '#717177');
            document.documentElement.style.setProperty('--O', '#717177');
            document.documentElement.style.setProperty('--A', '#2D2D30');
            document.documentElement.style.setProperty('--B', '#2D2D30');
            document.documentElement.style.setProperty('--M', '#202023');
            document.documentElement.style.setProperty('--D', '#141416');
        } else {
            document.documentElement.style.setProperty('--L', '#141416');
            document.documentElement.style.setProperty('--T', '#B7B7C1');
            document.documentElement.style.setProperty('--N', '#717177');
            document.documentElement.style.setProperty('--O', '#FFFFFF');
            document.documentElement.style.setProperty('--A', '#717177');
            document.documentElement.style.setProperty('--B', '#FFFFFF');
            document.documentElement.style.setProperty('--M', '#DADAE5');
            document.documentElement.style.setProperty('--D', '#B7B7C1');
        }
    }
    modeToKey() {
        return `${this.save['size']}-${this.save['blind']}-${this.save['practice']}-${this.save['blade']}`;
    }
    async clock() {
        this.time = new Timer();
        let isPaused = false;
        while (true) {
            await sleep(1);
            if (!isPaused&&this.time!=undefined) {
                this.time.unpause();
                let time = this.time.timeElapsed();
                this.html.renderHUD(time, this.moves, this.state);
            }
            isPaused = this.state<2;
            if (isPaused) if (this.time!=undefined) this.time.pause();
        }
    }
    loadBoard() {
        let oldRender = document.getElementById('board');
        let newRender = this.html.renderBoard(this.game, this.save['blind'], this.game.size*3, this.save['ruler'], this.save['keybindsXAxis'], this.save['keybindsYAxis'], this.axis, this.state);
        $(newRender).insertAfter(oldRender);
        oldRender.remove();
        let px = Math.min($('#panel').width(), $('#panel').height());
        $('#board').css({'width': px+'px', 'height': px+'px'});
    }
    loadAppIntoDom() {
        const app = this;
        const $main = $('#main');
        $($main).on('click', '.intersect', function() {app.handleToggleAxis()});
        $($main).on('click', '.dot', function(e) {app.handleDotClicked(e)});
        $($main).on('click', '#shuffle', function() {app.handleShuffleClicked()});
        $($main).on('click', '#menu', function() {app.handleMainMenuClicked()});
        $($main).on('click', '#help', function() {app.handleHelpMenuClicked()});
        $($main).on('click', '#stats', function() {app.handleStatsMenuClicked()});
        $($main).on('click', '#settings', function() {app.handleSettingsMenuClicked()});
        document.onkeydown = function(e) {
            app.handleKeyPressed(e)
            //e.preventDefault();
        };
        this.loadBoard();
        if (!this.hasSave) this.handleHelpMenuClicked();
    }
}
new App(window.localStorage);