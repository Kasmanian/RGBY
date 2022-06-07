import Game from './engine/game.js';
import HTML from './engine/html.js';
import Hist from './engine/hist.js';
import Timer from './engine/timer.js';
import { deci, sleep, redef } from './engine/funcs.js';

class App {
    constructor(data) {
        let hasSave = data['save'] != undefined;
        this.save = hasSave? JSON.parse(data['save']) : {
            'visited': true,
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
        // 'averageMoves': 0,
        // 'averageTime': 0,
        // 'averageMPS': 0,
        // 'totalSolves': 0,
        this.html = new HTML();
        this.resetGame();
        this.loadAppIntoDom();
    }
    resetGame() {
        this.state = 0;
        this.moves = 0;
        this.axis = 1;
        this.time = undefined;
        this.game = new Game(this.save['size']);
        this.html.renderHUD(0, 0, this.state);
    }
    handleShuffleClicked() {
        this.resetGame();
        this.game.shuffle();
        this.state = 1;
        this.loadBoard();
        this.returnState = 1;
    }
    handleKeyPressed(event) {
        if (event.key==' ') {
            if (this.state<1) return;
            this.state = this.state<2? 1 : 2;
            this.handleToggleAxis();
        } else {
            if (this.state<1) return;
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
        if (hasMoved>0) {
            this.moves += hasMoved;
            if (this.time==undefined) this.clock();
            let isSolved = this.game.isSolved();
            sleep(.1);
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
    handleMenuItemClicked(event) {
        let oldRender = '';
        let gameType = new Set(['blind', 'practice', 'blade']);
        let menuItem = event.currentTarget;
        switch (menuItem.id) {
            case 'x':
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
                    url: 'https://github.com/Kasmanian'
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
        document.getElementById('misc-overlay').remove();
        if (this.hist.hasChanged(this.save)) {
            window.localStorage['save'] = JSON.stringify(this.save);
            this.resetGame();
        }
        else this.state = this.returnState;
        this.loadBoard();
    }
    handleToggleAxis() {
        this.axis *= -1;
        this.loadBoard();
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
        let newRender = this.html.renderBoard(this.game, this.game.size*3, this.save['keybindsXAxis'], this.save['keybindsYAxis'], this.axis, this.state);
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
        document.onkeydown = function(e) {
            app.handleKeyPressed(e)
            //e.preventDefault();
        };
        this.loadBoard();
    }
}
new App(window.localStorage);