'use strict';

const {types} = require('@putout/babel');

const {getBinding, getBindingPath} = require('./get-binding');
const {isSimple} = require('./is-simple');
const {extract} = require('./extract');
const {compute} = require('./compute');
const {remove} = require('./remove');
const {getExportDefault} = require('./get-export-default');
const {rename} = require('./rename');
const {renameProperty} = require('./rename-property');
const {setLiteralValue} = require('./set-literal-value');
const {getPathAfterRequires} = require('./get-path-after-requires');

const {
    getProperty,
    getProperties,
    traverseProperties,
} = require('./properties');

const {
    ExpressionStatement,
    toStatement,
    matchesPattern,
    isBlockStatement,
    isImportDeclaration,
    isExportDeclaration,
    isExpression,
    isStatement,
    BlockStatement,
} = types;

const {assign} = Object;

module.exports.getBinding = getBinding;
module.exports.getBindingPath = getBindingPath;
module.exports.extract = extract;
module.exports.compute = compute;
module.exports.replaceWith = replaceWith;
module.exports.getExportDefault = getExportDefault;
module.exports.toExpression = toExpression;
module.exports.isSimple = isSimple;
module.exports.rename = rename;
module.exports.renameProperty = renameProperty;
module.exports.setLiteralValue = setLiteralValue;

module.exports.getProperty = getProperty;
module.exports.getProperties = getProperties;
module.exports.traverseProperties = traverseProperties;

function toExpression(el) {
    const {type} = el;
    
    const ignore = [
        'ObjectProperty',
    ];
    
    if (ignore.includes(type))
        return el;
    
    if (isExpression(el))
        return ExpressionStatement(el);
    
    return toStatement(el);
}

function replaceWith(path, node) {
    if (path?.parentPath?.isExpressionStatement() && !path.parentPath.isProgram())
        path = path.parentPath;
    
    const {comments, loc} = path.node;
    
    const {currentPath} = maybeBody(path, node);
    
    currentPath.replaceWith(node);
    
    assign(currentPath.node, {
        comments,
        loc,
    });
    
    return currentPath;
}

module.exports.replaceWithMultiple = (path, nodes) => {
    const parentComments = path.parentPath.node.comments;
    const {comments} = path.node;
    
    const newNodes = nodes
        .filter(Boolean)
        .map(toExpression);
    
    const {currentPath} = maybeBody(path);
    const newPath = currentPath.replaceWithMultiple(newNodes);
    
    if (!newPath.length)
        return newPath;
    
    newPath[0].node.comments = comments || parentComments;
    
    return newPath;
};

module.exports.insertBefore = (path, node) => {
    path.insertBefore(node);
};

module.exports.insertAfter = (path, node) => {
    const {comments} = path.node;
    
    if (path.node.trailingComments?.length && path.getNextSibling()?.node?.leadingComments)
        delete path.node.trailingComments;
    
    if (node.trailingComments)
        delete node.trailingComments;
    
    if (isStatement(path) && !isStatement(node))
        path.insertAfter(ExpressionStatement(node));
    else
        path.insertAfter(node);
    
    path.node.comments = comments;
};

module.exports.isModuleExports = (path) => {
    return matchesPattern(path.node || path, 'module.exports');
};

const isBinding = (name) => (path) => path.scope.bindings[name];

module.exports.findBinding = (path, name) => {
    const referencePath = path.findParent(isBinding(name));
    
    if (!referencePath)
        return null;
    
    return referencePath.scope.bindings[name];
};

module.exports.remove = remove;

module.exports.getPathAfterRequires = getPathAfterRequires;
module.exports.getPathAfterImports = (body) => {
    const n = body.length;
    let i = 0;
    
    while (i < n - 1 && isImportDeclaration(body[i]))
        ++i;
    
    return body[i];
};

module.exports.isESM = (path) => {
    const scope = path.scope.getProgramParent();
    const programPath = scope.path;
    
    for (const node of programPath.node.body) {
        if (isImportDeclaration(node))
            return true;
        
        if (isExportDeclaration(node))
            return true;
    }
    
    return false;
};

function maybeBody(path, node) {
    const {parentPath} = path;
    
    if (node && !isStatement(node) || isBlockStatement(node) || !parentPath?.isArrowFunctionExpression?.())
        return {
            currentPath: path,
        };
    
    parentPath.node.body = BlockStatement([
        ExpressionStatement(path.node),
    ]);
    
    return {
        currentPath: parentPath.get('body.body.0'),
    };
}
