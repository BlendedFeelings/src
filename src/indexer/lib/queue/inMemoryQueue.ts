import * as fastq from "fastq";
import type { queueAsPromised , done } from "fastq";
import { IQueue } from "./index";
import { ILogger, ILoggerProvider } from '../logger'

declare global {
    var queues:any;
}
  
// other.ts
if (!global.queues)
    global.queues = {};

export class InMemoryQueue<T> implements IQueue<T> {
    queue:{queue: queueAsPromised <T>, that:any, worker: (item: T) => Promise<void>};
    logger: ILogger;

    constructor(options:{loggerProvider: ILoggerProvider, name?:string, global?:boolean}){
        this.logger = options.loggerProvider.getLogger('InMemoryQueue', {name:options.name});
        let isGlobal = options.global !== undefined ? options.global : true;
        if (isGlobal && options?.name) {
            if (!global.queues[options.name]) {
                this.logger.debug(`create queue ${options.name}`);
                global.queues[options.name] = {queue: fastq.promise(this, this.workerWrapper, 1), that: null, worker: null }
            } else {
                this.logger.debug(`use existing queue ${options.name}`);
            }
            this.queue = global.queues[options.name]
        }
        else {
            this.logger.debug(`use temp queue`);
            this.queue = { queue: fastq.promise(this, this.workerWrapper, 1), that: null, worker: null }
        }
    }

    async workerWrapper(item: T): Promise<void> {
        this.logger.debug('workerWrapper', item);
        await this.queue.worker.call(this.queue.that, item);
    }

    async push(item:T) {
        this.logger.debug('push', item);
        this.queue.queue.push(item);;
    }

    async getQueue(): Promise<T[]> {
        return this.queue.queue.getQueue();
    }

    registerWorker(that:any, worker: (item: T) => Promise<void>) {
        this.logger.debug('registerWorker', this.queue.worker);
        this.queue.that = that;
        this.queue.worker = worker;
    }

    async timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async wait() {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        if (this.queue.queue.idle() == false) {
            await delay(0);
            await this.wait();
        }
    }
}

  

