export * from './inMemoryQueue'
export * from './queueProvider'

export interface IQueue<T> {
    push(item: T): Promise<void>;
    getQueue(): Promise<T[]>
    registerWorker(that:any, worker: (item: T) => Promise<void>)
}