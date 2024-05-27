'use strict';

const {types} = require('putout');
const {
    isBlockStatement,
    isIfStatement,
} = types;

module.exports.report = () => `Use consistent blocks`;

const notBlock = ({__b}) => !isBlockStatement(__b);

module.exports.match = () => ({
    'if (__a) {__b} else {__c}': () => true,
    'if (__a) __b; else __body': notBlock,
    'if (__a) __body; else __b': ({__b}) => !isIfStatement(__b),
    'if (__a) {__b}': (vars, path) => {
        const {parentPath} = path;
        const __bPath = path.get('consequent.body.0');
        const {
            leadingComments,
            trailingComments,
        } = __bPath.node;
        
        if (leadingComments || trailingComments)
            return false;
        
        if (!parentPath.isIfStatement())
            return true;
        
        return path !== parentPath.get('alternate');
    },
});

module.exports.replace = () => ({
    'if (__a) {if (__b) {__c}}': 'if (__a) if (__b) __c',
    'if (__a) {__b}': 'if (__a) __b',
    'if (__a) {__b} else {__c}': 'if (__a) __b; else __c',
    'if (__a) __b; else __body': 'if (__a) {__b} else __body',
    'if (__a) __body; else __b': ({__b}, path) => {
        if (isBlockStatement(__b))
            return path;
        
        return 'if (__a) __body; else {__b}';
    },
});
