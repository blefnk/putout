'use strict';

const tryCatch = require('try-catch');
const fullstore = require('fullstore');

const bigFirst = (a) => a[0].toUpperCase() + a.slice(1);
const {stringify, parse} = JSON;
const store = fullstore('');

module.exports.files = [
    '*.yml',
    '*.yaml',
];

module.exports.preProcess = () => {
    const jsonProcessor = require('@putout/processor-json');
    
    const rawSource = store();
    
    if (!rawSource)
        return [];
    
    store('');
    
    const list = [];
    const [{source}] = jsonProcessor.preProcess(rawSource, null, 2);
    
    list.push({
        source,
        extension: 'json',
    });
    
    return list;
};

module.exports.process = (rawSource) => {
    const yaml = require('js-yaml');
    
    const [error, value] = tryCatch(yaml.load, rawSource);
    const noPlaces = [];
    
    if (!error) {
        const stringified = stringify(value, null, 2);
        store(stringified);
        
        return ['', noPlaces];
    }
    
    const places = parsePlaces(error);
    return ['', places];
};

module.exports.postProcess = (rawSource, list) => {
    const yaml = require('js-yaml');
    const jsonProcessor = require('@putout/processor-json');
    
    const source = jsonProcessor.postProcess(rawSource, list);
    const result = yaml.dump(parse(source));
    
    return result;
};

function parsePlaces(error) {
    const {mark, reason} = error;
    const {line} = mark;
    const position = {
        line: line + 1,
        column: 1,
    };
    
    const [message] = error.message.split('\n');
    const place = {
        message: bigFirst(message),
        position,
        rule: `${reason.replace(/\s/g, '-')} (yaml)`,
    };
    
    return [place];
}
