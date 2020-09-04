# Dependency Injection

A simple DI container inspired by [require.js](https://requirejs.org/).

## Usage

There are two main touch points for the container, `define` and `call`.

The library returns an function that will create the container and provide the two primary access functions.

```javascript
const { define, call } = require('./src');
```

### define
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

### call

The purpose of `call` is the execute some logic and return the value immediately.

```javascript
define("one", () => 1);
const one = call(["one"], (one) => one);
console.log(one); // 1
```

While `define` is responsible for rigging logic up, the `call` function is designed to get the information back out.

The `call` function only access two arguments and both are required.

- The dependencies to inject into a callback
- A callback to inject the dependencies into and then execute

The value returned by the callback is, in turn, returned by the `call` function.

# Roadmap
- Circular dependencies preventing
- "Auto-Rig" functionality.
- Ability to clone containers
