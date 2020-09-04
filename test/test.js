const assert = require("assert");
const injest = require("../src");

describe("Defining", () => {
    it("Returns true if successful", () => {
        const { define } = injest();
        assert(define("one", [], () => 1) === true);
    });

    it("Allows you to skip dependencies", () => {
        const { define, provide } = injest();
        define("one", () => 1);
        provide(["one"], (one) => {
            assert(one === 1);
        });
    });

    it("Returns false if name in use", () => {
        const { define } = injest();
        define("one", () => 1);
        assert(define("one", () => 2) === false);
    });

    it("Returns allows override of name in use", () => {
        const { define } = injest();
        define("one", () => 1);
        assert(define("one", () => 2, { override: true }) === true);
    });
});

describe("Running", () => {
    it("Loads immediate children", () => {
        const { define, provide } = injest();

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
        const { define, provide } = injest();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        provide(["one-one"], (one_one) => assert(one_one === 5));
    });

    it("Loads sub-sub-dependencies", () => {
        const { define, provide } = injest();

        define("one", () => 1);
        define("one-one", ["one"], (one) => one + 4);
        define("one-two", ["one-one"], (one_one) => one_one + 5);
        provide(["one-two"], (one_two) => assert(one_two === 10));
    });

    it("Returns the callback value", () => {
        const { define, provide } = injest();

        define("one", () => 1);
        assert(provide(["one"], one => one) === 1);
    });
});
