import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
const pkg = require('./package.json');
const { camelCase } = require('lodash');

const libraryName = 'subjective';
const input = `compiled/${libraryName}.js`;
const external = [
    'rxjs/BehaviorSubject',
    'rxjs/Observable',
    'rxjs/operators/distinctUntilChanged',
    'rxjs/operators/map',
];
const globals = {
    'rxjs/BehaviorSubject': 'Rx',
    'rxjs/Observable': 'Rx',
    'rxjs/operators/distinctUntilChanged': 'Rx',
    'rxjs/operators/map': 'Rx',
};

export default [
    // browser-friendly UMD build
    {
        input,
        external,
        output: {
            name: camelCase(libraryName),
            file: pkg.browser,
            format: 'umd',
            globals,
            sourcemap: true,
        },
        plugins: [
            resolve(), // so Rollup can find `ms`
            commonjs(), // so Rollup can convert `ms` to an ES module
        ],
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input,
        external,
        output: [
            {
                name: camelCase(libraryName),
                file: pkg.main,
                format: 'cjs',
                globals,
                sourcemap: true,
            },
            {
                name: camelCase(libraryName),
                file: pkg.module,
                format: 'es',
                globals,
                sourcemap: true,
            },
        ],
    },
];
