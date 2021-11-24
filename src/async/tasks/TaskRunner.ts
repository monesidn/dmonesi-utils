import EventEmitter from 'events';
import { LoggerManager } from '../../logger';
import { Task, TaskRunnerOptions } from './api';

const log = LoggerManager.getLogger('it.dmonesi.util.async.TaskRunner');

const defaultOpts: TaskRunnerOptions = {
    maxConcurrentTask: 10
};

class TaskRunnerWorker {
    constructor(
        public parent: TaskRunner,
        public id: number) {
    }

    async run() {
        log.debugEnabled() && log.debug(`Worker ${this.id} starting`);
        while (true) {
            const nextTask = this.parent.taskQueue.shift();
            if (!nextTask)
                break;

            try {
                await nextTask.run();
                log.debugEnabled() && log.debug(`Task ${nextTask.getName()} completed successfully`);
                this.parent.emit('task-complete');
            } catch (err) {
                log.error(`Error while executing task ${nextTask.getName()} - ${err}`);
                this.parent.emit('task-error', err);
            }
        }
        log.debugEnabled() && log.debug(`Worker ${this.id} stopping`);
    }
}

/**
 * Run tasks one after the other with the configured concurrency. Users
 * can listen for multiple events to monitor execution.
 * Events emitted:
 * `task-complete`:  When a task is complete this event is emitted. Arguments:
 *      `task`: the task instance that was completed.
 *
 * `task-error`:  When a task throws an error this event is emitted. Arguments:
 *      `task`: the task instance that emitted the event.
 *      `error`: the error.
 *
 * `all-tasks-completed`:  When the task queue is empty and the last event is complete
 *      (or throwed an error) this event is emitted.
 */
export class TaskRunner extends EventEmitter {
    private _activeTasks = 0;
    private _lastWorkerId = 0;

    taskQueue: Task[] = [];
    opts: Required<TaskRunnerOptions>;

    /**
     * Constructs a new Task runner.
     * @param opts - The following options can be provided:
     * `maxConcurrentTask`: Max number of task executed concurrently. Extra tasks will be queued and
     * executed when there will be room available.
     */
    constructor(opts: TaskRunnerOptions) {
        super();
        this.opts = Object.assign({}, defaultOpts, opts) as Required<TaskRunnerOptions>;
    }

    private async _spawnWorker() {
        if (this._activeTasks >= this.opts.maxConcurrentTask)
            return;

        log.debugEnabled() && log.debug('Spawning new worker.');
        this._activeTasks++;
        const worker = new TaskRunnerWorker(this, ++this._lastWorkerId);
        await worker.run();
        this._activeTasks--;

        if (this._activeTasks === 0) {
            log.debugEnabled() && log.debug('Last Worker completed the job. The TaskRunner is now idle.');
            this.emit('all-tasks-completed');
        }
    }

    /**
     * Convenience method to wait for the next `all-tasks-completed` event
     */
    async waitForAllTasks() {
        if (this.isIdle())
            return;

        return new Promise<void>((resolve) => this.once('all-tasks-completed', () => resolve()));
    }

    /**
     * Returns `true` if no task is running and nothing is available in the queue.
     */
    isIdle() {
        return this._activeTasks === 0 && this.taskQueue.length === 0;
    }

    submitTask(task: Task) {
        this.taskQueue.push(task);
        this._spawnWorker();
    }
};
