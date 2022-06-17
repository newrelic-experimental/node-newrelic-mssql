'use strict'

exports.initialize = function initialize(shim, mssql) {
    shim.setDatastore("MSSQL")
    shim.__wrappedPoolConnection = false

    var connPoolProto = mssql.ConnectionPool.prototype
    shim.recordOperation(connPoolProto, ['connect', 'close'], {callback: shim.LAST})
    
    var requestProto = mssql.Request.prototype
    shim.recordQuery(requestProto, ['query'], describeQuery)
    shim.recordBatchQuery(requestProto, ['batch', 'bulk'], {
        query: findBatchQueryArg,
        callback: shim.LAST
    })

    var preparedStatementProto = mssql.PreparedStatement.prototype
    shim.recordOperation(preparedStatementProto, ['prepare', 'unprepare'], {callback: shim.LAST})
    shim.recordQuery(preparedStatementProto, ['execute'], describeQueryForPreparedStmt)
    
}

function describeQuery(shim, func, name, args) {
    shim.logger.trace('Recording query')
    
    // check if stream/pipe is set to true
    var stream = false
    var isStreamingRequest = this.stream
    if (isStreamingRequest) {
        stream = true
    }

    var query = ''
    if (shim.isString(args[0])) {
        query = args[0]
    }

    var parameters = {host: null, port_path_or_id: null, database_name: null}
    var conf = this.parent.config
    if (conf) {
        parameters.database_name = conf.database
        parameters.host = conf.server
        parameters.port_path_or_id = conf.port
    } else {
        shim.logger.trace('No query config detected, not collecting db instance data')
    }

    var promise = false
    var callback = shim.LAST
    var callbackFn = args[args.length]
    if (callbackFn && typeof(callbackFn) == "function") {
        promise = false
    } else {
        promise = true
    }
    return {
        stream: stream,
        query: query,
        callback: callback,
        promise: promise,
        parameters: parameters,
        record: true
    }
}

function describeQueryForPreparedStmt(shim, func, name, args) {
    shim.logger.trace('Recording query for prepared statement')

    var stream = false

    var query = ''
    var statement = this.statement;
    if (statement) {
        if (shim.isString(statement)) {
            query = statement;
        }
    }   

    var parameters = {host: null, port_path_or_id: null, database_name: null}
    var conf = this._acquiredConfig
    if (conf) {
        parameters.database_name = conf.database
        parameters.host = conf.server
        parameters.port_path_or_id = conf.port
        if (conf.stream) {
            stream = true
        }
    } else {
        shim.logger.trace('No query config detected, not collecting db instance data')
    }

    var promise = false
    var callback = shim.LAST
    var callbackFn = args[args.length]
    if (callbackFn && typeof(callbackFn) == "function") {
        promise = false
    } else {
        promise = true
    }
    return {
        stream: stream,
        query: query,
        callback: callback,
        promise: promise,
        parameters: parameters,
        record: true
    }
}

function findBatchQueryArg(shim, batch, fnName, args) {
    var sql = (args[0] && args[0][0]) || ''
    return sql.query || sql
}

