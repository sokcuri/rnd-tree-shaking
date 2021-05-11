export interface PluginStructure {
  name: string;
  setup: (...args: any[]) => void;
}

export function definePlugin(args: PluginStructure) {
  return args;
}
