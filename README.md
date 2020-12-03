# provide.js - Dependency Injection

![CircleCI](https://circleci.com/gh/adigitalmonk/dependency-injector.svg?style=shield)

A simple DI container inspired by [require.js](https://requirejs.org/).

## Installation

This package isn't in [npm](https://npmjs.com).
You can install it, instead, using git.

```
npm install git+https://github.com/adigitalmonk/dependency-injector.git#master
```

And then it's available as `provide.js`!

## Usage

There are two main touch points for the container, `define` and `provide`.

The library returns an function that will create the container and provide the two primary access functions.

```javascript
const { define, provide } = require("provide.js");
```

### Defining dependencies
The purpose of `define` is to register a new "thing" into the container.  You can register anything, for the most part.

```javascript
define("thing", () => "thing");
define("pi", 3.1415);
define("config", { "key": "alphanum" });
```

When defining a function, you can also provide a list of dependencies that will be injected into the function when it"s called.

```javascript
define("one", () => 1);
define("useOne", ["one"], one => one + 2);
```

Whatever is returned by your defined callback is what is injected into the function that uses it.
The defined values are lazy-evaluated at the point of call instead of when registered.

There are four arguments for `define`:
- Name of the thing we're defining
- Dependencies that the thing will ask for
- The thing we're registering / defining
- Optional settings for the registration process

If you are registering an object with no dependencies, you can omit the dependencies.
The registration process will adjust accordingly.

Be warned, there is currently no logic to prevent circular dependencies.

### Providing functions

The purpose of `provide` is the execute some logic and return the value immediately.

```javascript
define("version", { major: 1, minor: 3, patch: 4 });
define("formatVersion", ["version"], (version) => `${version.major}.${version.minor}.${version.patch}`);

provide(["formatVersion"], formatVersion => console.log(formatVersion)); // -> 1.3.4
```

While `define` is responsible for saving dependencies and what they resolve to, the `provide` function is designed to get the information back out.

The `provide` function only has two arguments and both are required.

- The dependencies to inject into a callback
- A callback to inject the dependencies into and then execute

The value returned by the callback is, in turn, returned by the `provide` function.

```javascript
const version = provide(["version"], version => version);
console.log(version); // -> { major: 1, minor: 3, patch: 4 }
```

### Cloned Containers

We also have an exposed function that allows you to clone a container.
This enables you to have different containers with some shared dependencies.

```javascript
const provide = require("provide.js");

const constantContainer = provide();
constantContainer.define("pi", 3.1415);

const formulaContainer = constantContainer.clone();
formulaContainer.define("surfaceAreaPizza", ["pi"], pi => radius => (pi * r) ** 2);

// constantContainer only has "pi"
// formulaContainer has both "pi" and "surfaceAreaPizza"
```

## Examples

### Express Middleware

```javascript
// src/services/provider.js
const { define, provide } = require("provide.js");
define("logger", () => (params) => {
    console.log("Request Params:", params);
});
module.exports = provide;

// src/middleware/logger.js
module.exports = logger => (req, _res, next) => {
    logger(req.params);
    next();
};

// src/index.js
const app = require("express")();
const provide = require("./services/provider");
const loggerWare = provide(["logger"], require("./middleware/logger"));

app.use(loggerWare);
```

### Express Controller

```javascript
// src/services/elasticSearch.js
const { Client } = require("@elastic/elasticsearch");
module.exports = elasticConfig => () => new Client({ node: "http://localhost:9200" });

// src/services/provider.js
const { define, provide } = require("provide.js");
define("elasticConfig", () => ({ node: "http://localhost:9200" }));
define("elasticSearch", ["elasticConfig"], require("./elasticSearch"));

module.exports = provide;

// src/controllers/health
module.exports = elasticSearch => (req, res) => {
    res.send(elasticSearch.cluster.health());
};

// src/index.js
const app = require("express")();
const provide = require("./services/provider");
const healthResource = require("./controllers/health");

app.get("/health", provide(["elasticSearch"], healthResource));
```

# Roadmap
- Circular dependencies prevention
- Better documentation, in-line or otherwise
