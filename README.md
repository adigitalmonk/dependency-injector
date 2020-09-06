# Hephaestus.js - Dependency Injection

A simple DI container inspired by [require.js](https://requirejs.org/).

## Usage

There are two main touch points for the container, `define` and `forge`.

The library returns an function that will create the container and provide the two primary access functions.

```javascript
const { define, forge } = require('./src');
```

### Defining dependencies
The purpose of `define` is to register a new "thing" into the container.  You can register anything, for the most part.

```javascript
define("thing", () => "thing");
define("pi", 3.1415);
define("config", { "key": "alphanum"});
```

When defining a function, you can also provide a list of dependencies that will be injected into the function when it's called.

```javascript
define("one", () => 1);
define("useOne", ["one"], (one) => 1 + 2);
```

Whatever is returned by your defined callback is what is injected into the function that uses it.
The defined values are lazy-evaluated at the point of call instead of when registered.

There are four arguments for `defined`:
- Name of the thing we're defining
- Dependencies that the thing will ask for
- The thing we're registering / defining
- Optional settings for the registration process

If you are registering an object with no dependencies, you can omit the dependencies.
The registration process will adjust accordingly.

Be warned, there is currently no logic to prevent circular dependencies.

### Forging functions

The purpose of `forge` is the execute some logic and return the value immediately.

```javascript
define("version", { major: 1, minor: 3, patch: 4 });
define("formatVersion", ["version"], (version) => `${version.major}.${version.minor}.${version.patch}`);

forge(["formatVersion"], formatVersion => console.log(formatVersion)); // -> 1.3.4
```

While `define` is responsible for saving dependencies and what they resolve to, the `forge` function is designed to get the information back out.

The `forge` function only has two arguments and both are required.

- The dependencies to inject into a callback
- A callback to inject the dependencies into and then execute

The value returned by the callback is, in turn, returned by the `forge` function.

```javascript
const version = forge(["version"], version => version);
console.log(version); // -> { major: 1, minor: 3, patch: 4 }
```

## Examples

### Express Middleware

```javascript
// src/services/hephaestus.js
const { define, forge } = require('hephaestus');
define("logger", () => (params) => {
    console.log("Request Params:", params);
});
module.exports = forge;

// src/middleware/logger.js
module.exports = forge => 
    forge(["logger"], (logger) => (req, _res, next) => {
        logger(req.params);
        next();
    });

// src/index.js
const app = require('express')();
const forge = require('./services/hephaestus')
const loggerWare = require('./middleware/logger')(forge)

app.use(loggerWare)
// ...
```

### Express Controller

```javascript
// src/services/elasticSearch.js
const { Client } = require('@elastic/elasticsearch')
module.exports = new Client({ node: 'http://localhost:9200' });

// src/services/hephaestus.js
const { define, forge } = require('hephaestus');
define("elasticSearch", require('./elasticSearch'));
module.exports = forge;

// src/index.js
const app = require('express')();
const forge = require('./services/hephaestus')

app.get('/health', forge(['elasticSearch'], (elasticSearch) => (req, res) => {
    res.send(elasticSearch.cluster.health())
}))
```

# Roadmap
- Circular dependencies prevention
