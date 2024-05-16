'use strict';

const {types} = require('putout');
const {
    isArrayExpression,
    isMemberExpression,
    isCallExpression,
} = types;

const isString = (a) => typeof a === 'string';
const isBool = (a) => typeof a === 'boolean';
const isNumber = (a) => typeof a === 'number';

module.exports.category = 'array';
module.exports.report = () => 'Add newlines between array elements';

const regexp = /['"\da-zA-Z]+, ['"\da-zA-Z]/;

const isSupportedNode = (a) => {
    if (!a)
        return false;
    
    if (a.type === 'Literal')
        return true;
    
    return a.type === 'Identifier';
};

module.exports.filter = ({text, node}) => {
    if (isMemberExpression(node.parent))
        return false;
    
    const supported = node.elements.every(isSupportedNode);
    
    if (!supported)
        return false;
    
    if (isCallExpression(node.parent))
        return false;
    
    if (node.parent.parent.type === 'Property')
        return false;
    
    if (node.parent.type === 'Property' && node.parent.key.value !== 'plugins')
        return false;
    
    if (isArrayExpression(node.parent))
        return false;
    
    if (differentTypes(node))
        return false;
    
    if (/Statement/.test(node.parent.type))
        return false;
    
    if (isLongValues(node.elements))
        return false;
    
    if (node.elements.length < 5 && isShortValues(node.elements))
        return false;
    
    return regexp.test(text);
};

module.exports.fix = ({text}) => {
    return text
        .replace(/\[/g, '[\n')
        .replace(/\]/g, '\n]')
        .replace(/,/g, ',\n');
};

module.exports.include = () => [
    'ArrayExpression',
];

function isShortValues(elements) {
    for (const {type, value} of elements) {
        if (!value)
            return true;
        
        if (type === 'Literal' && value.length > 1)
            return false;
    }
    
    return true;
}

function isLongValues(elements) {
    for (const {type, value} of elements) {
        if (type === 'Literal' && isString(value) && value.includes(','))
            return true;
    }
    
    return false;
}

function differentTypes({elements}) {
    let hasLiteral = false;
    let hasIdentifier = false;
    let hasBool = false;
    let hasStr = false;
    let hasNumber = false;
    
    for (const {type, value} of elements) {
        if (type === 'Literal') {
            hasLiteral = true;
            
            if (isString(value))
                hasStr = true;
            
            if (isBool(value))
                hasBool = true;
            
            if (isNumber(value))
                hasNumber = true;
            
            if (hasStr && hasBool)
                return true;
            
            if (hasStr && hasNumber)
                return true;
        }
        
        if (type === 'Identifier')
            hasIdentifier = true;
        
        if (hasLiteral && hasIdentifier)
            return true;
    }
    
    return false;
}
