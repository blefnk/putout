'use strict';

const {test} = require('supertape');
const {matchToFlatDir} = require('./match-to-flat-dir');
const noop = () => {};

test('eslint-flat: matchToFlatDir: no files', async (t) => {
    const result = await matchToFlatDir('./hello', [{
        languageOptions: {
            sourceType: 'module',
        },
    }]);
    
    const expected = [{
        files: ['**/hello'],
        languageOptions: {
            sourceType: 'module',
        },
    }];
    
    t.deepEqual(result, expected);
    t.end();
});

test('eslint-flat: matchToFlatDir: files: fn', async (t) => {
    const config = [{
        files: [noop],
        languageOptions: {
            sourceType: 'module',
        },
    }];
    
    const result = await matchToFlatDir('./hello', config);
    
    t.deepEqual(result, config);
    t.end();
});