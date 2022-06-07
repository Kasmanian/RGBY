import { alph, redef } from './funcs.js';
export default class HTML {
    constructor() {
    }
    renderBoard(game, size, keybindsXAxis, keybindsYAxis, lastAxis, state) {
        let grid  = ``;
        let yAxis = ``;
        let xAxis = ``;
        keybindsXAxis = Object.keys(keybindsXAxis);
        keybindsYAxis = Object.keys(keybindsYAxis);
        for (let i=0; i<size; i++) {
            xAxis += `<span class="flex">${keybindsXAxis[i]}</span>`;
            yAxis += `<span class="flex">${keybindsYAxis[i]}</span>`;
            for (let j=0; j<size; j++) {
                let tile = game.grid[i][j]!=0? game.grid[i][j] : ``;
                let deco = game.grid[i][j]!=0? 
                    `style="background: url('./assets/${game.grid[i][j]}.ico');
                            background-size: cover;"` : 
                    `style="background: url('./assets/dot.svg');
                            margin: 25%;
                            background-size: 100%; 
                            background-repeat: no-repeat; 
                            background-position: center;
                            filter: invert(12%) sepia(2%) saturate(1530%) hue-rotate(202deg) brightness(140%) contrast(97%);"`
                let type = 0;
                if (j>=game.liveX&&j<game.liveX+size/3) type += lastAxis<0? 2 : 1;
                if (i>=game.liveY&&i<game.liveY+size/3) type += lastAxis>0? 2 : 1;
                let push = `push-`;
                if (lastAxis<0) {
                    push += state<3? `` : game.liveY-game.lastY<0? `up` : `down`;
                }
                else {
                    push += state<3? `` : game.liveX-game.lastX<0? `left` : `right`;
                }
                if (state<1) {
                    type = state>-2||game.grid[i][j]==0? `` : `pulse`;
                }
                else  {
                    type = type==2? `selected` : type==3? `intersect` : game.grid[i][j]==0? `dot` : `static ${push}`;
                }
                let grow = ``;
                if (j>=game.lastX&&j<game.lastX+size/3&&lastAxis>0&&game.grid[i][j]==0) grow = state<3? `` : `grow`;
                if (i>=game.lastY&&i<game.lastY+size/3&&lastAxis<0&&game.grid[i][j]==0) grow = state<3? `` : `grow`;
                grid += `<div id="${alph(j)}-${alph(i)}" class="${type} ${grow}" ${deco}>${tile}</div>`;
            }
        }
        return `<div id="board">
                    <div id="y-axis" style="grid-template-rows: repeat(${size}, 1fr);">${yAxis}</div>
                    <div id="grid" style="grid-template-columns: repeat(${size}, 1fr); grid-template-rows: repeat(${size}, 1fr);">${grid}</div>
                    <div id="x-axis" style="grid-template-columns: repeat(${size}, 1fr);">${xAxis}</div>
                </div>`;

    }
    renderHUD(time, moves, state) {
        let clock = document.getElementById('time');
        clock.textContent = this.renderTime(time);
        if (time!=0&&state<0) clock.classList.add(`blink`); else clock.classList.remove(`blink`);
        document.getElementById('count').textContent = time!=0? moves : 0;
        document.getElementById('mvsps').textContent = this.renderMPS(moves, time);
    }
    renderMainMenu(isBlind, isPractice, isBlade, size) {
        let miscOpen = window.mobileCheck()? 'misc-open-mobile' : 'misc-open-pc';
        return `<div id="misc-overlay" class="${miscOpen}">
                    <div id="misc" class="mutateSave">
                        <div id="label" class="table">
                            <span class="table-cell">MAIN MENU</span>
                        </div>
                        <div id="close" class="table">
                            <span class="table-cell"><img id="x" src="./assets/close-outline.svg" class="menu-item menu"></span>
                        </div>
                        ${this.renderGameTypeOption('blind', isBlind)}
                        ${this.renderGameTypeOption('practice', isPractice)}
                        ${this.renderGameTypeOption('blade', isBlade)}
                        <div id="mode" class="flex">
                            <div id="previous" class="menu-item">
                                <span><img src="./assets/chevron-back-outline.svg"></span>
                            </div>
                            ${this.renderSize(size)}
                            <div id="next" class="menu-item">
                                <span><img src="./assets/chevron-forward-outline.svg"></span>
                            </div>
                        </div>
                        <div id="share" class="flex menu-item">
                            <span><img src="./assets/icons8-share.svg"></span>
                            <span>SHARE</span>
                        </div>
                        <div id="donate" class="flex menu-item">
                            <span><img src="./assets/paypal-mark-color.svg"></span>
                            <span>DONATE</span>
                        </div>
                        <div id="contact" class="flex menu-item">
                            <span><img src="./assets/email.ico"></span>
                            <span>CONTACT ME</span>
                        </div>
                    </div>
                </div>`;
    }
    renderGameTypeOption(name, isActive) {
        let focus = isActive?  `focus` : ``;
        return `<div id="${name}" class="flex ${focus} menu-item">
                    <span>${name.toUpperCase()}</span>
                </div>`;
    }
    renderSize(size) {
        return `<div id="size" class="flex">
                    <span class="mono">${size}&nbsp</span><span class="table"><img class="table-cell" src="./assets/close-outline.svg"></span><span class="mono">&nbsp${size}</span>
                </div>`;
    }
    renderHelpMenu() {
        let miscOpen = window.mobileCheck()? 'misc-open-mobile' : 'misc-open-pc';
        return `<div id="misc-overlay" class="${miscOpen}">
                    <div id="misc">
                        <div id="label" class="table">
                            <span class="table-cell">HOW TO PLAY</span>
                        </div>
                        <div id="close" class="table">
                            <span class="table-cell"><img id="x" src="./assets/close-outline.svg" class="menu-item"></span>
                        </div>
                        <div id="dot-display" class="flex">
                            <span class="flex"><span></span></span>
                        </div>
                        <div id="dot-readme" class="flex">
                            Tap the dots or the keys shown along each axis to move.
                        </div>
                        <div id="select-display" class="flex">
                            <span class="flex"><span class="selected"></span></span>
                        </div>
                        <div id="select-readme" class="flex">
                            Glowing tiles will all move to the chosen place on the grid.
                        </div>
                        <div id="intersect-display" class="flex">
                            <span class="flex"><span class="intersect-display"></span></span>
                        </div>
                        <div id="intersect-readme" class="flex">
                            Tap the intersected tiles to switch which axis to move along.
                        </div>
                        <div id="solve-display" class="flex">
                            <span class="flex"><span class="cycle"></span></span>
                        </div>
                        <div id="solve-readme" class="flex">
                            Complete all faces to solve the puzzle.
                        </div>
                    </div>
                </div>`
    }
    renderStatsMenu(isBlind, isPractice, isBlade, size, save, key, animation) {
        let miscOpen = !animation? '' : window.mobileCheck()? 'misc-open-mobile' : 'misc-open-pc';
        let mode = save['stats'][key];
        return `<div id="misc-overlay" class="${miscOpen}">
                    <div id="misc">
                        <div id="label" class="table">
                            <span class="table-cell">STATISTICS</span>
                        </div>
                        <div id="close" class="table">
                            <span class="table-cell"><img id="x" src="./assets/close-outline.svg" class="menu-item menu"></span>
                        </div>
                        ${this.renderGameTypeOption('blind', isBlind)}
                        ${this.renderGameTypeOption('practice', isPractice)}
                        ${this.renderGameTypeOption('blade', isBlade)}
                        <div id="mode" class="flex">
                            <div id="previous" class="menu-item">
                                <span><img src="./assets/chevron-back-outline.svg"></span>
                            </div>
                            ${this.renderSize(size)}
                            <div id="next" class="menu-item">
                                <span><img src="./assets/chevron-forward-outline.svg"></span>
                            </div>
                        </div>
                        <div id="averageMoves" class="flex">
                            <span>Avg.<br>Moves</span>
                            <span id="avgMoves">${redef(mode, {'averageMoves': 0})['averageMoves']}</span>
                        </div>
                        <div id="averageTime" class="flex">
                            <span>Avg.<br>Time</span>
                            <span id="avgTime">${this.renderTime(redef(mode, {'averageTime': 0})['averageTime'])}</span>
                        </div>
                        <div id="averageMPS" class="flex">
                            <span>Avg.<br>MPS</span>
                            <span id="avgMPS">${redef(mode, {'averageMPS': '-.--'})['averageMPS']}</span>
                        </div>
                        <div id="totalSolves" class="flex">
                            <span>Total Solves</span>
                            <span id="total">${redef(mode, {'totalSolves': 0})['totalSolves']}</span>
                        </div>
                        <div id="clearMode" class="flex menu-item">
                            <span>CLEAR MODE</span>
                        </div>
                        <div id="clearAll" class="flex menu-item">
                            <span>CLEAR ALL</span>
                        </div>
                    </div>
                </div>`;
    }
    renderSettingsMenu() {
    }
    renderTime(time) {
        return time!=0? `${Math.trunc(time/60000)}:${String(`${Math.trunc(time/1000)%60}`).padStart(2, '0')}.${String(`${Math.trunc(time)%1000}`).padStart(3, '0')}` : `-:--.---`;
    }
    renderMPS(moves, time) {
        return time!=0? `${Math.trunc((moves/(time/1000))*100)/100}`.padEnd(4, '0') : `-.--`;
    }
}
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};