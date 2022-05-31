class Timer {
    constructor() {
        this.startTime = new Date().getTime();
    }
    timeElapsed() {
        return new Date().getTime()-this.startTime;
    }
    timeLeft(duration) {
        return this.startTime+duration-new Date().getTime();
    }
}