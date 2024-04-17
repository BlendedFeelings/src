import { IStore } from './index'
import * as mssql from 'mssql';
import { ILogger, ILoggerProvider } from '../logger'

declare global {
    var initialized:{ [key: string]: boolean; };
    var pools:{ [key: string]: any; };
}

if (!global.initialized)
    global.initialized = {};
if (!global.pools)
    global.pools = {};

export class SqlServerStore<T> implements IStore<T> {
    name:string;

    server:string|null;
    database:string|null;
    user:string|null;
    password:string|null;

    sqlConfig:any;
    sqlPool:any;

    tableName:string;
    keyColumnName:string;
    valueColumnName:string;

    logger:ILogger;

    constructor(options:{loggerProvider:ILoggerProvider, name:string, server?:string, database?:string, user?:string, password?:string, tableName?:string, keyColumnName?:string, valueColumnName?:string}) {
        this.name = options.name;

        this.server = options?.server || process.env.B_SQLSERVER_SERVER || null;
        if (!this.server)
            throw new Error('SqlServerStore: server is not defined');

        this.database = options?.database || process.env.B_SQLSERVER_DATABASE || null;
        this.user = options?.user || process.env.B_SQLSERVER_USER || null;
        this.password = options?.password || process.env.B_SQLSERVER_PASSWORD || null;

        this.tableName = options.tableName || options.name;
        this.keyColumnName = options?.keyColumnName || 'Key';
        this.valueColumnName = options?.valueColumnName || 'Value';
    
        this.logger = options.loggerProvider.getLogger(`SqlServerStore.${options.name}`);

        try {
            if (`${this.server}_${this.database}_${this.user}` in global.pools)
                this.sqlPool = global.pools[`${this.server}_${this.database}_${this.user}`];
            else {
                this.sqlConfig = {
                    user: this.user,
                    password: this.password,
                    database: this.database,
                    server: this.server,
                    pool: {
                      max: 10,
                      min: 0,
                      idleTimeoutMillis: 30000
                    },
                    options: {
                      encrypt: true, // for azure
                      trustServerCertificate: true // change to true for local dev / self-signed certs
                    }
                  }
                  this.sqlPool = mssql.ConnectionPool ?
                    new mssql.ConnectionPool(this.sqlConfig) :
                    new mssql.default.ConnectionPool(this.sqlConfig);
                  
                
                global.pools[`${this.server}_${this.database}_${this.user}`] = this.sqlPool;
            }
          //this.sqlPool = new mssql.ConnectionPool(this.sqlConfig);
          if (!global.initialized[this.name])
            this.init().then(x => {}).catch(x => {});
        } catch (err) {
            this.logger.error(err);
        }
    }

    async set(key:string, value:T): Promise<void> {
        this.logger.debug(`set:${key}`, value);
        await this.sqlPool.connect();

        let transaction;
        try {
            transaction = mssql.Transaction ?
                    new mssql.Transaction(this.sqlPool) :
                    new mssql.default.Transaction(this.sqlPool);
            await transaction.begin();

            const request = mssql.Request ?
                    new mssql.Request(transaction) :
                    new mssql.default.Request(transaction);
            request.input('key', key);
            request.input('value', JSON.stringify(value));
            let sqlQuery = `MERGE INTO [${this.tableName}] t
            USING (VALUES (@key, @value)) AS v ([${this.keyColumnName}], [${this.valueColumnName}])
            ON t.[${this.keyColumnName}] = v.[${this.keyColumnName}]
            -- Replace when the key exists
            WHEN MATCHED THEN
                UPDATE SET
                t.[${this.valueColumnName}] = v.[${this.valueColumnName}]
            -- Insert new keys
            WHEN NOT MATCHED THEN
                INSERT ([${this.keyColumnName}], [${this.valueColumnName}])
                VALUES (@key, @value);
            `;
            await request.query(sqlQuery)
            await transaction.commit();
        } catch (err) {
            this.logger.error(err);
            await transaction.rollback();
            throw err;
        }
    }

    async get(key:string): Promise<T|null> {
        this.logger.debug(`get:${key}`);
        await this.sqlPool.connect();
        let request = this.sqlPool.request()
        request.input('key', key);
        let sql = `SELECT [${this.keyColumnName}], [${this.valueColumnName}] FROM [${this.tableName}]
        WHERE [${this.keyColumnName}] = @key`
        let result = await request.query(sql);
        if (result.recordset.length > 0) {
            let value = result.recordset[0][this.valueColumnName];
            return JSON.parse(value) as T;
        }
        return null;
    }

    async getMany(keys:string[]):Promise<{[key: string]:T}> {
        this.logger.debug(`getMany:${keys}`);
        if (keys.length === 0 ) return {}
        await this.sqlPool.connect();
        let request = this.sqlPool.request()
        let items:{[id: string]:T} = {};
        let params = []
        for(let i = 0; i < keys.length; i++) {
            params.push('@key' + i)
            request.input('key' + i, keys[i]);
        }
        
        let sql = `SELECT [${this.keyColumnName}], [${this.valueColumnName}] FROM [${this.tableName}]
        WHERE [${this.keyColumnName}] IN (${params.join(',')})`
        let result = await request.query(sql);
        result.recordset.forEach(x => {
            let key = x[this.keyColumnName];
            let value = x[this.valueColumnName];
            items[key] = JSON.parse(value) as T;
        });
        return items;
    }

    async* getAll() : AsyncGenerator<[string,T]> {
        this.logger.debug(`getAll`);
        await this.sqlPool.connect();
        let request = this.sqlPool.request()
        let result = await request.query(`SELECT [${this.keyColumnName}], [${this.valueColumnName}] FROM [${this.tableName}]`);
        for(let i = 0; i < result.recordset.length; i++) {
            let key = result.recordset[i][this.keyColumnName];
            let value = result.recordset[i][this.valueColumnName];
            let r:[string,T] = [key, JSON.parse(value) as T];
            yield new Promise<[string, T]>(resolve => resolve(r));
        }
    }

    async getKeys():Promise<string[]> {
        this.logger.debug(`getKeys`);
        await this.sqlPool.connect();
        let request = this.sqlPool.request()
        let result = await request.query(`SELECT [${this.keyColumnName}] FROM [${this.tableName}]`);
        let keys:string[] = [];
        for(let i = 0; i < result.recordset.length; i++) {
            keys.push(result.recordset[i][this.keyColumnName]);
        }
        return new Promise<string[]>(resolve => resolve(keys));
    }

    async exist(keys: string[]): Promise<{ [key: string]: boolean; }> {
        this.logger.debug(`exist:${keys}`);
        if (keys.length === 0 ) return {}
        await this.sqlPool.connect();
        let request = this.sqlPool.request()
        let params = []
        for(let i = 0; i < keys.length; i++) {
            params.push('@key' + i)
            request.input('key' + i, keys[i]);
        }
        
        let sql = `SELECT [${this.keyColumnName}] FROM [${this.tableName}]
        WHERE [${this.keyColumnName}] IN (${params.join(',')}) AND [${this.valueColumnName}] IS NOT NULL`
        let result = await request.query(sql);
        let resultItems:{[id: string]:any} = {};
        result.recordset.forEach(x => {
            let key = x[this.keyColumnName];
            resultItems[key] = null;
        });

        let keysExist:{[id: string]:boolean} = {};
        keys.forEach(key => {
            keysExist[key] = resultItems[key] ? true : false;
        });
        return keysExist;
    }

    async setTags(key: string, tags: { [key: string]: any; }): Promise<void> {
        this.logger.debug(`setTags:${key}`, tags);
        let tagsNames = Object.keys(tags);
        await this.sqlPool.connect();

        let transaction;
        try {
            transaction = mssql.Transaction ?
                    new mssql.Transaction(this.sqlPool) :
                    new mssql.default.Transaction(this.sqlPool);
            await transaction.begin();

            const request = mssql.Request ?
                    new mssql.Request(transaction) :
                    new mssql.default.Request(transaction);
            request.input('key', key);
            for(let tagName in tags) {
                request.input('t_' + tagName, tags[tagName]);
            }
            let sqlQuery = `MERGE INTO [${this.tableName}] t
            USING (VALUES (@key, ${tagsNames.map(x => '@t_' + x).join(',')}))
            AS v ([${this.keyColumnName}], ${tagsNames.map(x => 't_' + x).join(',')})
            ON t.[${this.keyColumnName}] = v.[${this.keyColumnName}]
            -- Replace when the key exists
            WHEN MATCHED THEN
                UPDATE SET 
                    ${tagsNames.map(x => 't.t_' + x + ' = ' + 'v.t_' + x).join(',')}
            -- Insert new keys
            WHEN NOT MATCHED THEN
                INSERT ([${this.keyColumnName}],${tagsNames.map(x => 't_' + x).join(',')})
                VALUES (@key, ${tagsNames.map(x => '@t_' + x).join(',')});
            `;
            await request.query(sqlQuery)
            await transaction.commit();
        } catch (err) {
            this.logger.error(err);
            await transaction.rollback();
            let invalidColumnName = this.getInvalidColumnNameFromError(err);
            if (invalidColumnName) {
                await this.ensureTableColumn(invalidColumnName);
                await this.setTags(key, tags);
            }
        }
    }

    async getTags(key: string, tagsNames:string[]): Promise<{ [tagName: string]: any; }> {
        this.logger.debug(`getTags:${key}`);
        try {
            await this.sqlPool.connect();
            let request = this.sqlPool.request()
            let items:{[id: string]:T} = {};
            request.input('key', key);
            
            let sql = `SELECT [${this.keyColumnName}], ${tagsNames.map(x => 't_' + x).join(',')} FROM [${this.tableName}]
            WHERE [${this.keyColumnName}] = @key`
            let result = await request.query(sql);
            if (result.recordset.length > 0) {
                var tags = {};
                for(let i = 0; i < tagsNames.length; i++) {
                    let tagValue = result.recordset[0]['t_' + tagsNames[i]];
                    tags[tagsNames[i]] = tagValue;
                }
                return tags;
            }
            return null;
        } catch (err) {
            this.logger.error(err);
            let invalidColumnName = this.getInvalidColumnNameFromError(err);
            if (invalidColumnName) {
                await this.ensureTableColumn(invalidColumnName);
                return await this.getTags(key, tagsNames);
            }
        }
    }

    async getAllTags(tagsNames:string[]): Promise<{ [key: string]: { [tagName: string]: any } }> {
        this.logger.debug(`getAllTags`);
        try {
            let results = {};
            await this.sqlPool.connect();
            let request = this.sqlPool.request()
            let sql = `SELECT [${this.keyColumnName}], ${tagsNames.map(x => 't_' + x).join(',')} FROM [${this.tableName}]`
            let result = await request.query(sql);
            result.recordset.map(x => {
                var tags = {};
                for(let i = 0; i < tagsNames.length; i++) {
                    let tagValue = x['t_' + tagsNames[i]];
                    tags[tagsNames[i]] = tagValue;
                }
                results[x[this.keyColumnName]] = tags;
            });
            return results;
        } catch (err) {
            this.logger.error(err);
            let invalidColumnName = this.getInvalidColumnNameFromError(err);
            if (invalidColumnName) {
                await this.ensureTableColumn(invalidColumnName);
                return await this.getAllTags(tagsNames);
            }
        }
    }

    async getByTag(tagName:string, tagValue:any):Promise<{[key: string]: T}> {
        this.logger.debug(`getByTag:${tagName}=${tagValue}`);
        try {
            await this.sqlPool.connect();
            let request = this.sqlPool.request()
            let items:{[id: string]:T} = {};
            request.input('tagValue', tagValue);
            
            let sql = `SELECT [${this.keyColumnName}], [${this.valueColumnName}] FROM [${this.tableName}]
            WHERE ${'t_' + tagName} = @tagValue`
            let result = await request.query(sql);
            result.recordset.map(x => {
                items[x[this.keyColumnName]] = JSON.parse(x[this.valueColumnName]) as T;
            });
            return items;
        } catch (err) {
            this.logger.error(err);
            let invalidColumnName = this.getInvalidColumnNameFromError(err);
            if (invalidColumnName) {
                await this.ensureTableColumn(invalidColumnName);
                return await this.getByTag(tagName, tagValue);
            }
        }
    }

    getInvalidColumnNameFromError(err:any):string|null {
        const invalidColumnRegex = /Invalid column name '([^']+)'/;
        const match = err.toString().match(invalidColumnRegex);
        const columnName = match ? match[1] : null;
        return columnName ?? null;
    }

    async init() {
        if (global.initialized[this.name]) return;
        await this.sqlPool.connect();
        let transaction;
        try {
            transaction = mssql.Transaction ?
                new mssql.Transaction(this.sqlPool) :
                new mssql.default.Transaction(this.sqlPool);
            await transaction.begin();

            const request = mssql.Request ?
                new mssql.Request(transaction) :
                new mssql.default.Request(transaction);
            let query = `
    IF NOT EXISTS (
        SELECT * FROM sys.tables t WHERE t.name = '${this.tableName}'
        ) 	
        CREATE TABLE [${this.tableName}] (
            [${this.keyColumnName}] nvarchar(900) NOT NULL PRIMARY KEY,
            [${this.valueColumnName}] nvarchar(max) NULL
        );

    IF NOT EXISTS (
        SELECT *
            FROM sys.columns c
            INNER JOIN sys.tables t
                on c.object_id = t.object_id
            WHERE t.name = '${this.tableName}' AND c.name  = '${this.valueColumnName}'
        )
        ALTER TABLE [${this.tableName}]
        ADD [${this.valueColumnName}] nvarchar(max) NULL;
        `;
            await request.query(query);
            await transaction.commit();
            global.initialized[this.name] = true;
        } catch (err) {
            this.logger.error(err);
            await transaction.rollback();
            throw err;
        }
    }

    async ensureTableColumn(columnName:string):Promise<void> {
        await this.sqlPool.connect();
        let transaction;
        try {
            transaction = mssql.Transaction ?
                new mssql.Transaction(this.sqlPool) :
                new mssql.default.Transaction(this.sqlPool);
            await transaction.begin();

            const request = mssql.Request ?
                new mssql.Request(transaction) :
                new mssql.default.Request(transaction);
            let query = `ALTER TABLE [${this.tableName}]
        ADD [${columnName}] nvarchar(900) NULL;

            IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = '${this.tableName}_${columnName}' AND object_id = OBJECT_ID('${this.tableName}'))
            BEGIN
                CREATE INDEX ${this.tableName}_${columnName}
                ON [${this.tableName}] (${columnName});
            END
        `;
            await request.query(query);
            await transaction.commit();
        } catch (err) {
            this.logger.error(err);
            await transaction.rollback();
            throw err;
        }
    }

}
