import {createTest} from '@putout/test';
import * as npmignore from '../lib/npmignore.js';

const test = createTest(import.meta.url, {
    plugins: [
        ['npmignore', npmignore],
    ],
});

test('plugin-npmignore: report', (t) => {
    t.report('npmignore', `Add dot files should be added to '.npmignore'`);
    t.end();
});

test('plugin-npmignore: transform', (t) => {
    t.transform('npmignore');
    t.end();
});

test('plugin-npmignore: transform: config', (t) => {
    t.transform('config');
    t.end();
});

test('plugin-npmignore: transform: options', (t) => {
    t.transformWithOptions('options', {
        dismiss: ['coverage'],
    });
    t.end();
});
