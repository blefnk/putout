'use strict';

const {dirname} = require('node:path');
const putout = require('putout');

module.exports.category = 'evaluate';
module.exports.report = () => 'Evaluate expression';
module.exports.include = () => [
    'ImportDeclaration',
];

module.exports.filter = ({node}) => {
    const {value} = node.source;
    return value.startsWith('__putout_evaluate:');
};

module.exports.fix = ({text, node, filename}) => {
    const {value} = node.source;
    
    const result = evaluate({
        value,
        filename,
    });
    
    return text.replace(value, result);
};

function evaluate({value, filename}) {
    value = value.replace(/__putout_evaluate:\s?/, 'return ');
    const {code} = putout(value, {
        fix: true,
        rules: {
            'nodejs/convert-top-level-return': 'off',
            'nodejs/convert-commonjs-to-esm': 'off',
            'nodejs/convert-esm-to-commonjs': 'on',
        },
        plugins: [
            'nodejs',
            'declare',
        ],
    });
    
    const fn = Function('__filename', '__dirname', 'require', code);
    
    return fn(filename, dirname(filename), require);
}
