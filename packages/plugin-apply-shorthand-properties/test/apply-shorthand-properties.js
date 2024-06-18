import {createTest} from '@putout/test';
import * as removeUnusedVariables from '@putout/plugin-remove-unused-variables';
import * as applyShorthandProperties from '../lib/apply-shorthand-properties.js';

const test = createTest(import.meta.url, {
    printer: 'putout',
    plugins: [
        ['apply-shorthand-properties', applyShorthandProperties],
    ],
});

test('plugin-apply-shorthand-properties: report', (t) => {
    t.report('object', 'Use shorthand properties');
    t.end();
});

test('plugin-apply-shorthand-properties: no report: shorthand', (t) => {
    t.noReport('shorthand');
    t.end();
});

test('plugin-apply-shorthand-properties: transform', (t) => {
    t.transform('object');
    t.end();
});

test('plugin-apply-shorthand-properties: transform: options', (t) => {
    t.noTransformWithOptions('options', {
        ignore: ['plugin'],
    });
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: references', (t) => {
    t.noTransform('references');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: not-valid', (t) => {
    t.noTransform('not-valid');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: destructuring', (t) => {
    t.noTransform('destr');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: import', (t) => {
    t.noTransform('import');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: name exists', (t) => {
    t.noTransform('name-exists');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: names overlap', (t) => {
    t.noTransform('overlap');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: constant', (t) => {
    t.noTransform('constant');
    t.end();
});

test('plugin-apply-shorthand-properties: no transform: import declaration', (t) => {
    t.noTransform('import-declaration');
    t.end();
});

test('plugin-apply-shorthand-properties: transform: assign', (t) => {
    t.transform('assign', {
        'rm-unused-vars': removeUnusedVariables,
    });
    t.end();
});
