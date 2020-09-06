const definer = container => (name, deps, resolveable, opts = {}) => {
    if (!Array.isArray(deps)) {
        opts = resolveable || {};
        resolveable = deps;
        deps = [];
    }
    
    // TODO: Circular dependencies?

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
    if (typeof(resolveable) !== "function") {
        return resolveable;
    }

    return resolveable(...deps.map(dep_name => load(container, dep_name)));
};

const forger = 
    container => 
        (deps, callback) => 
            callback(...deps.map(dep_name => load(container, dep_name)));

const cloner =
    container => 
        () => create(
            Object.entries(container).reduce((acc, [key, value]) => { 
                acc[key] = value;
                return acc;
            }, {})
        );

const create = (container) => {
    return {
        define: definer(container),
        forge: forger(container),
        clone: cloner(container)
    };
};

module.exports = () => create({});
