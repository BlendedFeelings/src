let config = {
    contentSource: [{
            basePath:'software', 
            type: 'FileSystem', 
            options: { 
                path: 'C:\\Projects\\bs', 
                baseUrl: 'https://github.com/BlendedFeelings/software/blob/main'
            }
        }
    ],
    contentQueue: {
        type: 'inMemory',
        options: {}
    },
    indexStore: {
        type: 'sqlServer',
        options: {
            tableName: 'Index'
        }
    },
    includesStore: {
        type: 'sqlServer',
        options: {
            tableName: 'Includes'
        }
    },
    webIndexStore: {
        type: 'sqlServer',
        options: {
            tableName: 'WebIndex'
        }
    },
    settingsStore: {
        type: 'sqlServer',
        options: {
            tableName: 'Settings'
        }
    },
    webSearch: {
        type: 'meilisearch',
        options: {}
    },
    loggerProvider: {
        type: 'inMemory'
    },
}
export default config;