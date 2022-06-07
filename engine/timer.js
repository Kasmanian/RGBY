export default class Timer {
    constructor() {
        this.startTime = window.performance.now();
        this.pauseTime = 0;
        this.pauseToll = 0;
        this.isPaused = false;
    }
    timeElapsed() {
        let time = window.performance.now();
        return this.isPaused? Math.ceil((time-this.startTime)-(time-this.pauseTime))
                            : Math.ceil((time-this.startTime)-this.pauseToll);
    }
    pause() {
        let time = window.performance.now();
        this.pauseTime = this.isPaused? this.pauseTime : time;
        this.isPaused = true;
    }
    unpause() {
        let time = window.performance.now();
        this.pauseToll += this.isPaused? time-this.pauseTime : 0;
        this.isPaused = false;
    }
}