import path from 'path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import Handlebars from 'handlebars';
import SveltePlugin from 'esbuild-svelte';
import SveltePreprocess from 'svelte-preprocess';
import { build, Plugin } from 'esbuild';
import { typescript } from 'svelte-preprocess-esbuild';

const globFiles = (glob: string) =>
fg.sync(glob, { objectMode: true })
  .map(x => path.basename(x.name, path.extname(x.name)));

type PrebuildPluginArgs = () => Plugin;
const PrebuildPlugin: PrebuildPluginArgs = () => {
  let start = Date.now();

  return {
    name: 'prebuild-plugin',
    setup(build) {
      build.onStart(() => { start = Date.now() })
      build.onEnd(() => { console.log(`Timestamp: ${(Date.now() - start) % 1000}`) })

      build.onResolve({ filter: /entry\.ts$/ }, args => {
        if (args.kind === 'entry-point') {
          return { path: path.join(args.resolveDir, args.path) + ':entry-point:' }
        } else {
          return { path: path.join(args.resolveDir, args.path) }
        }
      })

      build.onLoad({ filter: /:entry-point:$/ }, args => {
        return new Promise(async (resolve) => {
          const entryData = await fs.readFile(args.path.replace(/:entry-point:$/, ''));

          const currentPlugins = globFiles('src/plugins/[a-zA-Z0-9_]+.ts');
          const currentComponents = globFiles('src/components/[a-zA-Z0-9_]+.svelte');

          console.log(currentPlugins, currentComponents);

          const template = Handlebars.compile(`
            {{#each currentPlugins}}
            import __plugin_{{.}} from './plugins/{{.}}';
            export const plugin_{{.}} = __plugin_{{.}};
            {{/each}}

            {{#each currentComponents}}
            import __component_{{.}} from './components/{{.}}.svelte';
            export const component_{{.}} = __component_{{.}};
            {{/each}}
          `);
          const preload = template({ currentPlugins, currentComponents });

          const entry = entryData.toString();
          resolve({ contents: preload + entry });
        })
      })
    },
  }
}

type BundlingPluginArgs = (options: { plugins: string[], components: string[] }) => Plugin;
const BundlingPlugin: BundlingPluginArgs = ({ plugins, components }) => {
  let start = Date.now();

  return {
    name: 'bundling-plugin',
    setup(build) {
      build.onStart(() => {
        start = Date.now();
      })

      build.onEnd(() => {
        console.log(`Timestamp: ${(Date.now() - start) % 1000}`)
      })

      build.onResolve({ filter: /entry\.ts$/ }, args => {
        if (args.kind === 'entry-point') {
          return { path: path.join(args.resolveDir, args.path) + ':entry-point:' }
        } else {
          return { path: path.join(args.resolveDir, args.path) }
        }
      })

      build.onLoad({ filter: /:entry-point:$/ }, args => {
        return new Promise(async (resolve) => {

          const currentPlugins = plugins.filter(x => globFiles('src/plugins/*.ts').includes(x));
          const currentComponents = components.filter(x => globFiles('src/components/*.svelte').includes(x));

          const template = Handlebars.compile(`
            import {
              {{#each currentPlugins}}
              plugin_{{.}},
              {{/each}}
              {{#each currentComponents}}
              component_{{.}},
              {{/each}}
            } from '../out/entry.middle.js';

            export const plugins = {
              {{#each currentPlugins}}
              {{.}}: plugin_{{.}},
              {{/each}}
            }

            {{#each currentPlugins}}
            if ('setup' in plugins.{{.}} && typeof plugins.{{.}}.setup === 'function') {
              plugins.{{.}}.setup();
            }
            {{/each}}

            export const components = {
              {{#each currentComponents}}
              {{.}}: component_{{.}},
              {{/each}}
            }
          `);
          const contents = template({ currentPlugins, currentComponents });

          resolve({ contents });
        })
      })
    },
  }
}

async function prebuild() {
  return build({
    entryPoints: ['src/entry.ts'],
    bundle: true,
    target: 'es2020',
    format: 'esm',
    tsconfig: 'tsconfig.compile.json',
    minify: true,
    treeShaking: true,
    outfile: 'out/entry.middle.js',
    platform: 'node',
    plugins: [
      SveltePlugin({
        compileOptions: {
          generate: 'dom',
          format: 'esm',
          hydratable: true,
          css: true,
          cssHash: ({ hash, css }) => `s-${hash(css)}`
        },
        preprocess: [
          typescript({}),
          SveltePreprocess({ typescript: false })
        ]
      }),
      PrebuildPlugin()
    ],
  })
}


async function bundling() {
  return build({
    entryPoints: ['src/entry.ts'],
    bundle: true,
    target: 'es2020',
    format: 'iife',
    globalName: 'wja',
    tsconfig: 'tsconfig.compile.json',
    minify: true,
    treeShaking: true,
    outfile: 'out/entry.js',
    platform: 'node',
    plugins: [
      BundlingPlugin({
        plugins: ['FirstPlugin', 'SecondPlugin', 'c'],
        components: ['zxcv']
      })
    ],
  })
}

async function zxcv() {
  await prebuild();
  await bundling();


}

zxcv();
