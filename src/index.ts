import { build, Plugin } from 'esbuild';
import path from 'path';
import fs from 'fs-extra';
import Handlebars from 'handlebars';
import SveltePlugin from 'esbuild-svelte';
import SveltePreprocess from 'svelte-preprocess';
const { typescript } = require('svelte-preprocess-esbuild');
import fg from 'fast-glob';

// const AllImportPlugin: (opt: any) => Plugin = (opt) => ({
//   name: 'all-import-plugin',
//   setup(build) {
//     build.onStart(() => {
//       build.initialOptions
//     })

//     build.onResolve({ filter: /entry\.ts$/ }, args => {
//       if (args.kind === 'entry-point') {
//         return { path: path.join(args.resolveDir, args.path) + ':entry-point:' }
//       } else {
//         return { path: path.join(args.resolveDir, args.path) }
//       }
//     })

//     build.onLoad({ filter: /:entry-point:$/ }, args => {
//       console.log(args);
//       return new Promise(async (resolve) => {
//         const components = fg.sync('src/components/*.svelte', { objectMode: true })
//           .map(x => path.basename(x.name, path.extname(x.name)));
//         const preloadData = await fs.readFile('src/preload.template');
//         const entryData = await fs.readFile(args.path.replace(/:entry-point:$/, ''));

//         const template = Handlebars.compile(preloadData.toString());
//         const preload = template({
//           components
//         });
//         const entry = entryData.toString();
//         resolve({ contents: preload + entry });
//       })
//     })
//   },
// })


const nativeNodeModulesPlugin: (opt: any) => Plugin = (opt) => {
  let start = Date.now();

  return {
    name: 'native-node-modules',
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
        console.log(args);
        return new Promise(async (resolve) => {
          const preloadData = await fs.readFile('src/preload.template');
          const entryData = await fs.readFile(args.path.replace(/:entry-point:$/, ''));
          const components = fg.sync('src/components/*.svelte', { objectMode: true })
          .map(x => path.basename(x.name, path.extname(x.name)));

          const template = Handlebars.compile(preloadData.toString());
          const preload = template({ components });
          console.log(preload);
          const entry = entryData.toString();
          resolve({ contents: preload + entry });
        })
      })
    },
  }
}


const nativeNodeModulesPluginBuild3: (opt: any) => Plugin = (opt) => {
  let start = Date.now();

  return {
    name: 'native-node-modules',
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
        console.log(args);
        return new Promise(async (resolve) => {
          resolve({ contents: 'export { component_zxcv } from "../out/entry.middle.js";' });
        })
      })
    },
  }
}

async function build2() {
  return await build({
    entryPoints: ['src/entry.ts'],
    bundle: true,
    target: 'es2020',
    format: 'esm',
    // globalName: 'wja',
    tsconfig: 'tsc.json',
    // minify: true,
    keepNames: true,
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
      // AllImportPlugin({})
      nativeNodeModulesPlugin({
        plugins: ['a', 'b', 'c'],
        components: ['test']
      })
    ],
  })
}


async function build3() {
  return await build({
    entryPoints: ['src/entry.ts'],
    bundle: true,
    target: 'es2020',
    format: 'iife',
    globalName: 'wja',
    tsconfig: 'tsc.json',
    // minify: true,
    outfile: 'out/entry.js',
    treeShaking: true,
    platform: 'node',
    plugins: [
      nativeNodeModulesPluginBuild3({
        plugins: ['a', 'b', 'c'],
        components: ['test']
      })
    ],
  })
}

async function zxcv() {
  // await build2();
  await build3();


}

zxcv();