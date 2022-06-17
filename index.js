'use strict'

/**
 * Allows users to `require('@newrelic/mssql')` directly in their app.
 */
const newrelic = require('newrelic')
const instrumentation = require('./lib/instrumentation')

newrelic.instrumentDatastore({
    moduleName: 'mssql',
    onRequire: instrumentation.initialize,
    onError: function myErrorHandler(err) {
        console.error(err.message, err.stack)
        //process.exit(-1)
    }
})