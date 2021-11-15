/**
 * Possible log levels.
 */
export enum LogLevel {
    OFF,
    ERROR,
    WARN,
    DEBUG,
    TRACE
};

/**
 * Any logger method can also take a function as argument. The function is
 * invoked only if the record is actually generated.
 */
export type LogRecordGenerator = () => string;

/**
 * Main interface used to output messages.
 */
export interface Logger {
    log(level: LogLevel, record: string | LogRecordGenerator): void;
    isLevelEnabled(level: LogLevel): boolean;

    error(record: string | LogRecordGenerator): void;
    errorEnabled() : boolean;
    warn(record: string | LogRecordGenerator): void;
    warnEnabled() : boolean;
    debug(record: string | LogRecordGenerator): void;
    debugEnabled() : boolean;
    trace(record: string | LogRecordGenerator): void;
    traceEnabled() : boolean;
}

/**
 * This interface allows for pluggable print behaviour. The default implementation
 * writes to the global console object but by providing a custom one you can
 * override that.
 */
export interface OutputDevice {
    print(level: LogLevel, text: string): void;
}
