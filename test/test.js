import assert from "assert";
import providejs from "../dist/index.js";

describe("Defining", () => {
    it("Returns true if successful", () => {
        const { define } = providejs();
        assert(define("one", [], () => 1) === true);
    });

    it("Allows you to skip dependencies", () => {
        const { define, provide } = providejs();
        define("one", () => 1);
        provide(["one"], (one) => {
            assert(one === 1);
        });
    });

    it("Returns false if name in use", () => {
        const { define } = providejs();
        define("one", () => 1);
        assert(define("one", () => 2) === false);
    });

    it("Returns allows override of name in use", () => {
        const { define } = providejs();
        define("one", () => 1);
        assert(define("one", () => 2, { override: true }) === true);
    });

    it("Dependencies are lazy evaluated", () => {
        const { define, provide } = providejs();
        let value = 1;
        define("thing", () => value);
        value = 2;
        assert(provide(["thing"], (thing) => thing) === value);
    });

    // it("Doesn't allow circular dependencies", () => {
    //     const { define, provide } = providejs();
    //     define("one", ["two"], (two) => 1 + two);
    //     define("two", ["one"], (one) => one + 2);
    //     provide(["one"], (one) => one); // exception?
    // });
});

describe("Forging", () => {
    it("Loads immediate children", () => {
        const { define, provide } = providejs();

        define("one", () => 1);
        define("two", () => 2);
        define("three", () => 3);

        provide(["one", "two", "three"], (one, two, three) => {
            assert(one === 1);
            assert(two === 2);
            assert(three === 3);
        });
    });

    it("Loads sub-dependencies", () => {
        const { define, provide } = providejs();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        provide(["one-one"], (one_one) => assert(one_one === 5));
    });

    it("Injects non-function dependencies", () => {
        const { define, provide } = providejs();

        define("one", 1);
        assert(provide(["one"], (one) => one) === 1);

        define("config", { "one": 1, "two": 2 });
        assert(provide(["config"], (config) => {
            assert(config.one === 1);
            assert(config.two === 2);

            return config.one + config.two;
        }) === 3);
    });

    it("Loads sub-sub-dependencies", () => {
        const { define, provide } = providejs();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        define("one-two", ["one-one"], (one_one) => one_one + 5);
        provide(["one-two"], (one_two) => assert(one_two === 10));
    });

    it("Returns the defined value", () => {
        const { define, provide } = providejs();

        define("one", () => 1);
        const result = provide(["one"], one => one);
        assert(result === 1);
    });

    it("Provided callback's return value is returned", () => {
        const { define, provide } = providejs();
        define("callable", () => () => 1);

        const callable = provide(["callable"], (callable) => callable);
        assert(callable() === 1);
    });
});

describe("Subcontainers", () => {
    it("Clones itself", () => {
        const containerA = providejs();
        containerA.define(["one"], () => 1);
        const containerB = containerA.clone();

        assert(typeof (containerB) === "object");
        assert(typeof (containerB.define) === "function");
        assert(typeof (containerB.provide) === "function");
        assert(typeof (containerB.clone) === "function");
    });

    it("Has working clones", () => {
        const containerA = providejs();
        containerA.define("one", () => 1);
        const containerB = containerA.clone();

        const resultA = containerA.provide(["one"], (one) => one);
        const resultB = containerB.provide(["one"], (one) => one);

        assert(resultA === resultB);
    });

    it("Clones have unique keys", () => {
        const containerA = providejs();
        const containerB = containerA.clone();
        containerA.define("one", () => 1);
        containerB.define("two", () => 2);

        assert(containerA.provide(["one"], (one) => one) === 1);
        assert(containerB.provide(["one"], (one) => one) === undefined);

        assert(containerA.provide(["two"], (two) => two) === undefined);
        assert(containerB.provide(["two"], (two) => two) === 2);
    });

    it("Clones have unique entries per key", () => {
        const containerA = providejs();
        const containerB = containerA.clone();
        assert(containerA.define("two", () => 2) === true);
        assert(containerB.define("two", () => "two") === true);

        const resA = containerA.provide(["two"], (two) => two);
        const resB = containerB.provide(["two"], (two) => two);
        assert(resA !== resB);
    });
});
