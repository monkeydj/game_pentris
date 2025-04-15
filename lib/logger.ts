export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface GameEvent {
    timestamp: number;
    type: string;
    data: any;
    level: LogLevel;
}

export class GameLogger {
    private logs: GameEvent[] = [];
    private isEnabled: boolean = true;

    constructor(private maxLogs: number = 1000) { }

    log(type: string, data: any, level: LogLevel = 'info') {
        if (!this.isEnabled) return;

        const event: GameEvent = {
            timestamp: Date.now(),
            type,
            data,
            level,
        };

        this.logs.push(event);

        // Keep logs under maxLogs limit
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Output to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${level.toUpperCase()}] ${type}:`, data);
        }
    }

    getLogs() {
        return this.logs;
    }

    clear() {
        this.logs = [];
    }

    disable() {
        this.isEnabled = false;
    }

    enable() {
        this.isEnabled = true;
    }

    // Export logs as JSON
    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}