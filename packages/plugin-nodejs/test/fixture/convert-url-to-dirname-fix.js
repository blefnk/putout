import {join} from 'node:path';

const {readFile} = require('node:fs/promises');

new URL('../../package.json', import.meta.url).pathname;
