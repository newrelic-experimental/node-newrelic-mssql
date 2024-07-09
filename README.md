[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

New Relic's experimental nodejs mssql instrumentation for use with the
[Node agent](https://github.com/newrelic/node-newrelic). This module is a
dependency of the agent and is installed with it by running:

```
npm install @newrelic-labs/mssql
```

Then require it in your code immediately after the require('newrelic') line

```js
// index.js
require('@newrelic-labs/mssql')
```

### Supported modules

- [`node-mssql`](https://www.npmjs.com/package/mssql)
