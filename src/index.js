

const definer = container => (name, deps, resolveable, opts = {}) => {
    if (typeof(deps) === "function") {
        opts = resolveable || {};
        resolveable = deps;
        deps = [];
    }

    if (container[name] && !opts.override) {
        return false;
    }

    container[name] = { deps, resolveable };
    return true;
};

const load = (container, name) => {
    if (!container[name]) {
        return;
    }

    const { deps, resolveable } = container[name];
    return resolveable(...deps.map(dep_name => load(container, dep_name)));;
};

const provider = 
    container => 
        (deps, callback) => 
            callback(...deps.map(dep_name => load(container, dep_name)));
            

module.exports = () => {
    const container = {};

    return {
        define: definer(container),
        provide: provider(container)
    };
};