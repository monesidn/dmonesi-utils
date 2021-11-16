import { getGlobals } from '../types';
import { LogLevel, OutputDevice } from './apis';

/**
 * This interface allows for pluggable print behaviour. The default implementation
 * writes to the global console object but by providing a custom one you can
 * override that.
 */
export class ConsoleOutputDevice implements OutputDevice {
    constructor(public console = getGlobals().console) {
    }

    print(level: LogLevel, text: string): void {
        switch (level) {
        case LogLevel.OFF:
            return;
        case LogLevel.ERROR:
            return this.console.error(text);
        case LogLevel.WARN:
            return this.console.warn(text);
        case LogLevel.DEBUG:
            return this.console.log(text);
        case LogLevel.TRACE:
            return this.console.log(text);
        }
    }
}
