'use strict';

const {
    operator,
    parse,
    transform,
    print,
} = require('putout');

const getImportsPlugin = require('./get-imports');

const {
    __filesystem,
    readFileContent,
    renameFile,
    findFile,
    writeFileContent,
} = operator;

module.exports.report = ({from, to}) => `Rename '${from}' to '${to}'`;

module.exports.fix = ({from, to, path, ast, content}) => {
    transform(ast, content, {
        rules: {
            'get-imports': ['on', {
                from,
                to,
            }],
        },
        plugins: [
            ['get-imports', getImportsPlugin],
        ],
    });
    
    const code = print(ast);
    writeFileContent(path, code);
};

module.exports.traverse = ({push}) => ({
    [__filesystem]: (path) => {
        const from = 'hello.js';
        const to = 'world.js';
        const [mainFile] = findFile(path, from);
        
        if (!mainFile)
            return;
        
        renameFile(mainFile, to);
        
        for (const file of findFile(path, '*.js')) {
            if (file === mainFile)
                continue;
            
            const content = readFileContent(file);
            const ast = parse(content);
            
            push({
                from,
                to,
                path: file,
                ast,
                content,
            });
        }
    },
});