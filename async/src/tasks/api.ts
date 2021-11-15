

/**
 * Represents a Task. Each Task is an asyncronous process not
 * started yet.
 */
export interface Task {
    getName(): void;
    run(): Promise<void>;
}

export interface TaskRunnerOptions {
    maxConcurrentTask?: number;
}
