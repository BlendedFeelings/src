import * as crypto from 'crypto';
import type { ILogger, ILoggerProvider } from ".";

export class ConsoleLoggerProvider implements ILoggerProvider {
    name?: string;
    spanId:string;
    traceId:string;
    parentId?:string;
    constructor(options?:{name?:string, traceId?:string, parentId?:string, spanId?:string}) {
        this.name = options?.name;
        this.traceId = options?.traceId || crypto.randomBytes(16).toString("hex");
        this.parentId = options?.parentId;
        this.spanId = options?.spanId || crypto.randomBytes(16).toString("hex");
    }
    getLogger(name:string, args:any|null|undefined):ILogger {
        return new ConsoleLogger(name, args);
    }
    createSpan(name:string, traceId?:string, parentId?:string):ILoggerProvider {
        return new ConsoleLoggerProvider({name, traceId: traceId || this.traceId, parentId: parentId || this.parentId});
    }
    setSpanName(name:string){
        this.name = name;
    }
    getSpanName(): string|undefined {
        return this.name;
    }
    getSpanId():string {
        return this.spanId;
    }
    getTraceId():string {
        return this.traceId;
    }
    getParentId():string|undefined {
        return this.parentId;
    }
    setStatus(status:string, message?:string):void {
        console.log(`status: ${status} ${message}`);
    }
    getStatus():{status?:string, message?:string} {
        return {};
    }
    setAttribute(key:string, value:string):void {
        console.log(`attribute: ${key} ${value}`);
    }
}

export class ConsoleLogger implements ILogger {
    name?: string;
    args: any;
    formatedName: string;

    constructor(name?:string, args?:any) {
        this.name = name;
        this.args = args;
        this.formatedName = `${this.name}(${this.args})`
    }

    trace(message:any, args?:any) {
        console.trace('trace ' + this.name + ": " + message);// + ' ' + JSON.stringify(args));
    }
    debug(message:any, args?:any) {
        console.debug('debug ' + this.name + ": " + message);// + ' ' + JSON.stringify(args));
    }
    info(message:any, args?:any) {
        console.info('info ' + this.name + ": " + message);// + ' ' + JSON.stringify(args));
    }
    warn(message:any, args?:any) {
        console.warn('warn ' + this.name + ": " + message);// + ' ' + JSON.stringify(args));
    }
    error(message:any, args?:any) {
        console.error('error ' + this.name + ": " + message);// + ' ' + JSON.stringify(args));
        console.error(message);
        console.trace();
    }
}