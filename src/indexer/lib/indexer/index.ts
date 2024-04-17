export * from './indexer'
import { EnvironmentConfig } from '../config';
import { IServices } from '../services';

export type Event = {
  path: string;
  parent?: Event|null;
  steps?: { [name: string]: StepConfig };
  traceId: string, 
  parentId: string
}

export interface IStep {
  process(event:Event, context:StepContext):Promise<void>;
  getDefaultStepConfig?():StepConfig
}

export type StepContext = {
  stepConfig?:StepConfig;
  environmentConfig?:EnvironmentConfig;
  state:State;
  services:IServices
}

export type StepConfig = {
  run?:boolean, 
  force?:boolean, 
  options?:any
}

export type State = {
  [name:string]:any
}


