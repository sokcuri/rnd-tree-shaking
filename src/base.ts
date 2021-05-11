export interface PluginStructure {
    setup: (...args: any[]) => void;
}

export function definePlugin(args: PluginStructure) {
    return args;
}
