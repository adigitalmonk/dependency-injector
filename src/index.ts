export interface DefinerOptions {
    override?: boolean
}

export type Definer = (
    name: string,
    deps: string[],
    resolvable: unknown,
    opts: DefinerOptions
) => boolean;

export type Provider = (
    deps: string[],
    callback: (...args: any[]) => any
) => any

export type Cloner = () => ContainerTools

export interface ContainerTools {
    define: Definer,
    provide: Provider,
    clone: Cloner
}

interface ContainerResolvable {
    deps: string[],
    resolveable: any
}

interface Container {
    [key: string]: ContainerResolvable
}

type DefinerFactory = (container: Container) => Definer;

const definer: DefinerFactory = container => (name, deps, resolveable, opts = ({} as DefinerOptions)) => {
    if (!Array.isArray(deps)) {
        opts = (typeof resolveable === "object" ? resolveable : {}) as DefinerOptions;
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

type Load = (container: Container, name: string) => any;
const load: Load = (container, name) => {
    if (!container[name]) {
        return;
    }

    const { deps, resolveable } = container[name];
    if (typeof (resolveable) !== "function") {
        return resolveable;
    }

    return resolveable(...deps.map(dep_name => load(container, dep_name)));
};

type ProviderFactory = (container: Container) => Provider

const provider: ProviderFactory = container =>
    (deps, callback) =>
        callback(...deps.map(dep_name => load(container, dep_name)));


type ClonerFactory = (container: Container) => Cloner

const cloner: ClonerFactory = container => () => {
    return create({ ...container });
};

const create: (container: Container) => ContainerTools = (container) => {
    return {
        define: definer(container),
        provide: provider(container),
        clone: cloner(container)
    };
};

export default (): ContainerTools => create({});
