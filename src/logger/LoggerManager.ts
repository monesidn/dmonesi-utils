import { LogLevelByName } from '.';
import { LogLevel } from './apis';
import { assertConsoleNotHijacked, ConsoleHijacker } from './ConsoleHijacker';
import { LoggerImpl } from './LoggerImpl';
import { ConsoleOutputDevice } from './OutputDevice';

/**
 * Library entry point. This is a singleton object that is default exported by
 * the library.
 */
class LoggerManagerClass {
    private consoleHijacker?: ConsoleHijacker;

    private output = new ConsoleOutputDevice();
    private levels = new Map<string, LogLevel>();
    private loggers = new Map<string, LoggerImpl>();
    public defaultLevel = LogLevel.DEBUG;

    constructor() {
        assertConsoleNotHijacked();
    }

    private createLogger(category: string, level: LogLevel) {
        const log = new LoggerImpl(level, category, this.output);
        this.loggers.set(category, log);
        return log;
    }

    private pickLevelFor(category: string) {
        if (category === '')
            return this.defaultLevel;

        const categoryTokens = category.split(/\./g);
        let bestLevel = this.defaultLevel;
        for (let i = 1; i <= categoryTokens.length; i++) {
            const level = this.levels.get(categoryTokens.slice(0, i).join('.'));
            if (level !== undefined)
                bestLevel = level;
        }
        return bestLevel;
    }

    public getLogger(category: string) {
        const logger = this.loggers.get(category);
        if (logger)
            return logger;

        return this.createLogger(category, this.pickLevelFor(category));
    }

    public configureLevel(category: string, level: LogLevel) {
        this.levels.set(category, level);
    }

    public setDefaultLevel(level: LogLevel) {
        this.defaultLevel = level;
    }

    /**
     * Call this method after configuring logging level to update already
     * defined loggers.
     */
    public updateLoggers() {
        const i = this.loggers.values();
        while (true) {
            const { done, value } = i.next();
            if (done)
                break;

            value.level = this.pickLevelFor(value.category);
        }
    }

    /**
     * Parse and apply a string containing log levels. This method is useful when
     * using the API in a context that works with environment variables.
     * The string must be in the following format:
     * `CATEGORY1:LEVEL1;CATEGORY2:LEVEL2;...`
     * The category "default" will be the default logger manager level.
     * EXAMPLE:
     * `default:INFO;app.service.subservice:DEBUG;app.anotherservice.subservice:DEBUG`
     * @param levels -
     */
    public parseLevelFromString(levels: string) {
        if (!levels)
            return;

        const categs = levels.split(';');
        let updated = 0;
        for (const cat of categs) {
            const [category, level] = cat.split(':');
            if (!category || !level) {
                console.error(`Ignoring category specification ${cat}`);
                continue;
            }
            this.configureLevel(category, LogLevelByName[level.toUpperCase()]);
            updated++;
        }
        if (updated > 0) {
            this.updateLoggers();
        }
    }

    public hijackConsole() {
        const cat = 'app.console';
        console.log(`Console is being hijacked. If you can't find ` +
                    `messages probabily the log category "${cat}" is disabled`);

        this.consoleHijacker = new ConsoleHijacker(this.getLogger(cat));
    }

    public restoreConsole() {
        if (this.consoleHijacker) {
            this.consoleHijacker.releaseConsole();
            this.consoleHijacker = undefined;

            console.log(`Console restored.`);
        }
    }
}

export const LoggerManager = new LoggerManagerClass();
