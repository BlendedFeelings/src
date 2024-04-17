import { QueueProvider } from '../queue'
import { ILogger, ILoggerProvider } from '../logger'
import { CrawlStep } from './crawlStep'
import { CrawlRandomStep } from './crawlRandomStep'
import { IndexStep } from './indexStep'
import { WebIndexStep } from './webIndexStep'
import { WebSearchStep } from './webSearchStep'
import { IncludesStep } from './includesStep'
import { IStep, StepConfig, Event, StepContext } from '.'
import { EnvironmentConfig } from '..'
import { Services } from '../services';

export class Indexer {
    logger:ILogger;
    loggerProvider: ILoggerProvider;
    environmentConfig: EnvironmentConfig;

    constructor(options:{
      loggerProvider:ILoggerProvider,
      environmentConfig: EnvironmentConfig
    }) {
      this.loggerProvider = options.loggerProvider;
      this.logger = options.loggerProvider.getLogger('Indexer');
      this.environmentConfig = options.environmentConfig;
    }
  
    async queue(options:{path:string, steps?: { [name: string]: StepConfig }}):Promise<void> {
      this.logger.debug(`queue:${options.path}`, options)
      new QueueProvider({loggerProvider: this.loggerProvider, config: this.environmentConfig})
        .getContentQueue()
        .push({
          path: options.path,
          steps: options.steps,
          traceId: this.loggerProvider.getTraceId(), 
          parentId: this.loggerProvider.getSpanId()
        });
    }
  
    startIndexing() {
      new QueueProvider({loggerProvider: this.loggerProvider, config: this.environmentConfig})
        .getContentQueue()
        .registerWorker(this, this.index);
    }
  
    async index(event:Event) {
      let indexLoggerProvider = this.loggerProvider.createSpan(event.path, event.traceId);//, event.parentId);
      indexLoggerProvider.setAttribute('type', 'index');
      let indexLogger = indexLoggerProvider.getLogger('Indexer');
      let errors = [];
      try {
        indexLogger.debug(`index: ${JSON.stringify(event)}`)
        let steps = this.createSteps();
        let state = {};
        for(let step of steps) {
          let stepName = step.constructor.name;
          let stepLoggerProvider = indexLoggerProvider.createSpan(stepName);
          let stepLogger = stepLoggerProvider.getLogger(stepName);
          try {
            stepLogger.debug(`Step start: ${stepName}` )
            let stepConfig = this.getStepConfig(event, step);
            if (stepConfig?.run === false) {
              stepLogger.debug(`Skip step, run=false` )
              stepLoggerProvider.setStatus('SKIPPED', 'Skip step, run=false');
              continue;
            }
            let context: StepContext = {
              stepConfig,
              environmentConfig: this.environmentConfig,
              state: state,
              services: new Services({
                environmentConfig: this.environmentConfig, 
                loggerProvider: stepLoggerProvider, 
              })
            };
            await step.process(event, context);
            stepLogger.debug(`Step end: ${stepName}` )
            if (!stepLoggerProvider.getStatus().status)
              stepLoggerProvider.setStatus('OK');
          } catch(err) {
            stepLogger.error(err);
            stepLoggerProvider.setStatus('ERROR', err.toString());
            errors.push(err.toString());
          }
        }
      } catch(err) {
        indexLogger.error(err);
        indexLoggerProvider.setStatus('ERROR', err.toString());
      }
      if (!indexLoggerProvider.getStatus().status) {
        if (errors.length > 0)
          indexLoggerProvider.setStatus('ERROR', errors.join('\n'));
        else
          indexLoggerProvider.setStatus('OK');
      }
    }

    getStepConfig(event:Event, step:IStep):StepConfig {
      let e:Event = event;
      let stepsEventConfig:{ [name: string]: StepConfig } = event.steps || {};
      while(e.parent) {
        stepsEventConfig = {...e.parent.steps, ...stepsEventConfig}
        e = e.parent
      }
      
      let stepDefaultConfig = step.getDefaultStepConfig ? step.getDefaultStepConfig() : {};
      let stepEventConfig = stepsEventConfig[step.constructor.name] || {};
      let stepConfig = {...stepDefaultConfig, ...stepEventConfig};
      return stepConfig;
    }

    createSteps():IStep[] {
      return [
        new CrawlStep(),
        //new CrawlRandomStep(),
        new IndexStep(),
        new IncludesStep(),
        new WebIndexStep(),
        new WebSearchStep(),
      ]
    }

    getDefaultStepsConfig():{ [name: string]: StepConfig } {
      let steps = {};
      this.createSteps()
        .forEach(step => {
          steps[step.constructor.name] = step.getDefaultStepConfig();
          if (steps[step.constructor.name].run === undefined)
            steps[step.constructor.name].run = true;
        });
      return steps;
    }
  }

  