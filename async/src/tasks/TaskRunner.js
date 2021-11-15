const EventEmitter = require('events');

const defaultOpts = {
    maxConcurrentTask : 10,
    debug: false
}

class Worker {
    constructor(parent, id){
        this.parent = parent;
        this.id = id;
    }

    async run() {
        this.parent.opts.debug && console.log(`Worker ${this.id} starting`);
        while (true){
            const nextTask = this.parent._taskQueue.shift();
            if (!nextTask)
                break;
            
            try {
                await nextTask.run();
                this.parent.opts.debug && console.log(`Task ${nextTask.getName()} completed successfully`);
                this.parent.emit('task-complete');
            } catch(err) {
                console.error(`Error while executing task ${nextTask.getName()}`, err);
                this.parent.emit('task-error', err);
            }
        }
        this.parent.opts.debug && console.log(`Worker ${this.id} stopping`);
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
exports.TaskRunner = class TaskRunner extends EventEmitter{

    _taskQueue = [];
    _activeTasks = 0;
    _lastWorkerId = 0;

    opts = {};

    /**
     * Constructs a new Task runner.
     * @param {*} opts The following options can be provided:
     * `maxConcurrentTask`: Max number of task executed concurrently. Extra tasks will be queued and
     * executed when there will be room available.
     * `debug`: Enable debug messages.
     */
    constructor(opts){
        super();
        this.opts = Object.assign({}, defaultOpts, opts);
    }

    async _spawnWorker(){
        if (this._activeTasks >= this.opts.maxConcurrentTask)
            return;
        
        this.opts.debug && console.log("Spawning new worker.");
        this._activeTasks++;
        const worker = new Worker(this, ++this._lastWorkerId);
        await worker.run();
        this._activeTasks--;

        if (this._activeTasks === 0){
            this.opts.debug && console.log("Last Worker completed the job. The TaskRunner is now idle.");
            this.emit('all-tasks-completed');
        }
    }

    /**
     * Convenience method to wait for the next `all-tasks-completed` event
     */
    async waitForAllTasks() {
        if (this.isIdle())
            return;
        
        return new Promise(resolve => this.once('all-tasks-completed', () => resolve()));
    }

    /**
     * Returns `true` if no task is running and nothing is available in the queue.
     */
    isIdle(){
        return this._activeTasks === 0 && this._taskQueue.length === 0;
    }

    submitTask(task){
        this._taskQueue.push(task);
        this._spawnWorker();
    }
}