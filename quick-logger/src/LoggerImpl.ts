import { Logger, LogLevel, LogRecordGenerator, OutputDevice } from './apis';


export class LoggerImpl implements Logger {
    constructor(
        public level: LogLevel,
        public category: string,
        public output: OutputDevice
    ) {
    }

    log(level: LogLevel, record: string | LogRecordGenerator): void {
        if (level <= this.level) {
            const ts = new Date().getTime();
            const prefix = `${ts} - ${this.category} - `;
            if (typeof record === 'string') {
                this.output.print(level, prefix + record);
            } else {
                this.output.print(level, prefix + record());
            }
        }
    }

    isLevelEnabled(level: LogLevel) {
        return level <= this.level;
    }

    error(record: string | LogRecordGenerator): void {
        this.log(LogLevel.ERROR, record);
    }
    errorEnabled() {
        return this.isLevelEnabled(LogLevel.ERROR);
    }

    warn(record: string | LogRecordGenerator): void {
        this.log(LogLevel.WARN, record);
    }
    warnEnabled() {
        return this.isLevelEnabled(LogLevel.WARN);
    }

    debug(record: string | LogRecordGenerator): void {
        this.log(LogLevel.DEBUG, record);
    }
    debugEnabled() {
        return this.isLevelEnabled(LogLevel.DEBUG);
    }

    trace(record: string | LogRecordGenerator): void {
        this.log(LogLevel.TRACE, record);
    }
    traceEnabled() {
        return this.isLevelEnabled(LogLevel.TRACE);
    }

    // Debug method
    currentLevel() {
        return this.level;
    }
}


