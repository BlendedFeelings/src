
import { EnvironmentConfig } from "../config";
import { ConsoleLoggerProvider } from "./console";
import { InMemoryLoggerProvider } from "./inMemory";

export * from './console'
export * from './inMemory'

export type ILoggerProvider =  {
    getLogger(name:string, args?:any|null|undefined):ILogger;
    createSpan(name:string, traceId?:string, parentId?:string):ILoggerProvider;
    setSpanName(name:string);
    getSpanName(): string|undefined;
    getSpanId():string;
    getTraceId():string;
    getParentId():string|undefined;
    setStatus(status:'SKIPPED'|'OK'|'ERROR'|'WARNING'|string, message?:string):void;
    getStatus:()=>{status?:string, message?:string};
    setAttribute(key:string, value:string):void;
}

export interface ILogger {
    trace(message:any, args?:any);
    debug(message:any, args?:any);
    info(message:any, args?:any);
    warn(message:any, args?:any);
    error(message:any, args?:any);
}

export type Log = {spanName?:string, spanId:string, parentId?:string, traceId:string,logger:string, logLevel:any, timestamp:any, message:any, args:any};
export type Span = {spanName:string, spanId:string, parentId?:string, traceId:string, statusCode?:string, statusMessage?:string, attributes?:{[key: string]: string}, logs:Log[], children?:Span[]};

export function getLoggerProviderForConfig(config:EnvironmentConfig):ILoggerProvider {
    let type = config.loggerProvider?.type || 'console';
    switch(type) {
        case 'console':
            return new ConsoleLoggerProvider();
        case 'inMemory':
            return new InMemoryLoggerProvider({loggerOptions: config.loggerProvider.options});
        default:
            throw new Error(`Logger provider type "${type}" is not supported. Fix the entry in the config`);
    }
}



