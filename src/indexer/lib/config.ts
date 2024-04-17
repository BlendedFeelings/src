export type EnvironmentConfig = {
    contentSource?: EnvironmentConfigSource[],
    contentQueue?: {
        type: string,
        options?: any
    },
    webSearch?: {
        type: string,
        options?: any
    },
    indexStore?: {
        type: string,
        options?: any
    },
    webIndexStore?: {
        type: string,
        options?: any
    },
    includesStore?: {
        type: string,
        options?: any
    },
    loggerProvider?: {
        type: string,
        options?: any
    }
}

export enum EnvironmentConfigNames {
    contentSource = 'contentSource',
    contentQueue = 'contentQueue',
    indexStore = 'indexStore',
    includesStore = 'includesStore',
    webIndexStore = 'webIndexStore',
    webSearch = 'webSearch',
}

export type EnvironmentConfigSource = {
    basePath:string,
    type:string,
    options:any
}
