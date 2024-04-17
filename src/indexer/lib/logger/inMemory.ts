import * as crypto from 'crypto';
import { ILogger, ILoggerProvider } from ".";
import { Span, Log } from ".";

declare global {
    var spans:Span[];
}

if (global.spans === undefined) {
    global.spans = [];
}

export class InMemoryLoggerProvider implements ILoggerProvider {
    name?: string;
    spanId:string;
    traceId:string;
    parentId?:string;
    span:Span;
    loggerOptions?:any;
    parentSpan?:Span;
    
    constructor(options?:{name?:string, traceId?:string, parentId?:string, spanId?:string, loggerOptions?:any}) {
        this.name = options?.name;
        this.loggerOptions = options?.loggerOptions;
        this.traceId = options?.traceId || crypto.randomBytes(16).toString("hex");
        this.parentId = options?.parentId;
        this.spanId = options?.spanId || crypto.randomBytes(16).toString("hex");
        this.span = {spanName: this.name, spanId: this.spanId, traceId: this.traceId, parentId: this.parentId, logs: []};        
        this.parentSpan = global.spans.find(s => s.traceId === this.traceId);
        this.parentSpan = this.findChild(this.parentSpan, this.parentId) || this.parentSpan;
       
        if (this.parentSpan)
            if (this.parentSpan.children)
                this.parentSpan.children.push(this.span);
            else
                this.parentSpan.children = [this.span];
            
        if (!this.parentSpan) {
            global.spans.push(this.span);
            if (global.spans.length > 100)
                global.spans.shift(); // Removes the first element
        }
    }

    getLogger(name:string, args:any|null|undefined):ILogger {
        return new InMemoryLogger(name, args, this);
    }
    createSpan(name:string, traceId?:string, parentId?:string):ILoggerProvider {
        return new InMemoryLoggerProvider({
            name, 
            traceId: traceId || this.traceId, 
            parentId: parentId || this.spanId,
            loggerOptions: this.loggerOptions});
    }
    setSpanName(spanName:string){
        this.span.spanName = spanName;
    }
    getSpanName(): string|undefined {
        return this.span.spanName;
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
        this.span.statusCode = status;
        this.span.statusMessage = message;
    }
    getStatus():{status?:string, message?:string} {
        return {status: this.span.statusCode, message: this.span.statusMessage};
    }
    setAttribute(key:string, value:string):void {
        if (!this.span.attributes)
            this.span.attributes = {};
        this.span.attributes[key] = value;
    }

    findChild(span:Span|null, spanId:string): Span|null {
        if (!span)
            return null;
        if (span.spanId === spanId)
            return span;
        if (span.children) {
            for(let child of span.children) {
                let found = this.findChild(child, spanId);
                if (found)
                    return found;
            }
        }
        return null;
    }
}

export class InMemoryLogger implements ILogger {
    name: string;
    args: any;
    formatedName: string;
    loggerProvider: InMemoryLoggerProvider;

    constructor(name:string, args:any, loggerProvider:InMemoryLoggerProvider) {
        this.name = name;
        this.args = args;
        this.loggerProvider = loggerProvider;
        this.formatedName = `${this.name}(${this.args})`
    }

    write(logLevel:string, message:any, args?:any) {
        this.loggerProvider.span.logs.push({
            spanName:this.loggerProvider.getSpanName(),
            traceId: this.loggerProvider.getTraceId(),
            parentId: this.loggerProvider.getParentId(),
            spanId: this.loggerProvider.getSpanId(),
            logger: this.name, 
            logLevel, 
            timestamp: new Date(), 
            message: message.toString(), 
            args
        });
    }
    trace(message:any, args?:any) {
        console.trace(message);
        this.write('trace', message, args);
    }
    debug(message:any, args?:any) {
        console.debug(message);
        this.write('debug', message, args);
    }
    info(message:any, args?:any) {
        console.info(message);
        this.write('info', message, args);
        
    }
    warn(message:any, args?:any) {
        console.warn(message);
        this.write('warn', message, args);
        
    }
    error(message:any, args?:any) {
        console.error(message);
        console.trace();
        this.write('error', message, args);
    }
}

export function getSpans():Span[] {
    return global.spans;
}