const assert = require("assert");
const hephaestus = require("../src");

describe("Defining", () => {
    it("Returns true if successful", () => {
        const { define } = hephaestus();
        assert(define("one", [], () => 1) === true);
    });

    it("Allows you to skip dependencies", () => {
        const { define, forge } = hephaestus();
        define("one", () => 1);
        forge(["one"], (one) => {
            assert(one === 1);
        });
    });

    it("Returns false if name in use", () => {
        const { define } = hephaestus();
        define("one", () => 1);
        assert(define("one", () => 2) === false);
    });

    it("Returns allows override of name in use", () => {
        const { define } = hephaestus();
        define("one", () => 1);
        assert(define("one", () => 2, { override: true }) === true);
    });

    it("Dependencies are lazy evaluated", () => {
        const { define, forge } = hephaestus();
        let value = 1;
        define("thing", () => value);
        value = 2;
        assert(forge(["thing"], (thing) => thing) === value);
    });

    // it("Doesn't allow circular dependencies", () => {
    //     const { define, forge } = hephaestus();
    //     define("one", ["two"], (two) => 1 + two);
    //     define("two", ["one"], (one) => one + 2);
    //     forge(["one"], (one) => one); // exception?
    // });
});

describe("Forging", () => {
    it("Loads immediate children", () => {
        const { define, forge } = hephaestus();

        define("one", () => 1);
        define("two", () => 2);
        define("three", () => 3);

        forge(["one", "two", "three"], (one, two, three) => {
            assert(one === 1);
            assert(two === 2);
            assert(three === 3);
        });
    });

    it("Loads sub-dependencies", () => {
        const { define, forge } = hephaestus();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        forge(["one-one"], (one_one) => assert(one_one === 5));
    });

    it("Injects non-function dependencies", () => {
        const { define, forge } = hephaestus();

        define("one", 1);
        assert(forge(["one"], (one) => one) === 1);

        define("config", { "one": 1, "two": 2 });
        assert(forge(["config"], (config) => {
            assert(config.one === 1);
            assert(config.two === 2);

            return config.one + config.two;
        }) === 3);
    });

    it("Loads sub-sub-dependencies", () => {
        const { define, forge } = hephaestus();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        define("one-two", ["one-one"], (one_one) => one_one + 5);
        forge(["one-two"], (one_two) => assert(one_two === 10));
    });

    it("Returns the forgeback value", () => {
        const { define, forge } = hephaestus();

        define("one", () => 1);
        assert(forge(["one"], one => one) === 1);
    });
});

describe("Subcontainers", () => {
    it("Clones itself", () => {
        const containerA = hephaestus();
        containerA.define(["one"], () => 1);
        const containerB = containerA.clone();

        assert(typeof(containerB) === "object");
        assert(typeof(containerB.define) === "function");
        assert(typeof(containerB.forge) === "function");
        assert(typeof(containerB.clone) === "function");
    });

    it("Has working clones", () => {
        const containerA = hephaestus();
        containerA.define("one", () => 1);
        const containerB = containerA.clone();

        const resultA = containerA.forge(["one"], (one) => one);
        const resultB = containerB.forge(["one"], (one) => one);
        
        assert(resultA === resultB);
    });

    it("Clones have unique keys", () => {
        const containerA = hephaestus();
        const containerB = containerA.clone();
        containerA.define("one", () => 1);
        containerB.define("two", () => 2);

        assert(containerA.forge(["one"], (one) => one) === 1);
        assert(containerB.forge(["one"], (one) => one) === undefined);

        assert(containerA.forge(["two"], (two) => two) === undefined);
        assert(containerB.forge(["two"], (two) => two) === 2);
    });

    it("Clones have unique entries per key", () => {
        const containerA = hephaestus();
        const containerB = containerA.clone();
        assert(containerA.define("two", () => 2) === true);
        assert(containerB.define("two", () => "two") === true);
        
        const resA = containerA.forge(["two"], (two) => two);
        const resB = containerB.forge(["two"], (two) => two);
        assert(resA !== resB);
    });
});
