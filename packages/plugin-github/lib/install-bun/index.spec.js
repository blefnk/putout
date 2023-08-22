'use strict';

const {createTest} = require('@putout/test');
const plugin = require('.');

const test = createTest(__dirname, {
    printer: 'putout',
    plugins: [
        ['install-bun', plugin],
    ],
});

test('packages: install-bun: report', (t) => {
    t.report('install-bun', `Install Bun`);
    t.end();
});

test('packages: install-bun: transform', (t) => {
    t.transform('install-bun');
    t.end();
});

test('packages: install-bun: no transform: no-checkout', (t) => {
    t.noTransform('no-checkout');
    t.end();
});

test('packages: install-bun: no report: exists', (t) => {
    t.noReport('exists');
    t.end();
});

test('packages: install-bun: no report: wrong-place', (t) => {
    t.noReport('wrong-place');
    t.end();
});