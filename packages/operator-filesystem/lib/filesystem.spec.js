'use strict';

const montag = require('montag');
const {stub} = require('supertape');

const {
    parse,
    print,
    operator,
} = require('putout');

const {
    renameFile,
    removeFile,
    moveFile,
    findFile,
    getFilename,
    createDirectory,
    getParentDirectory,
    init,
    deinit,
} = require('./filesystem');

const {
    test,
    printFilesystem,
    parseFilesystem,
    formatFilesystem,
} = require('./extend.spec');

const {traverseProperties} = operator;

const FS = '__putout_processor_filesystem';
const PRINTER = ['putout', {
    format: {
        quote: '"',
        endOfFile: '',
    },
    semantics: {
        trailingComma: false,
    },
}];

test('putout: operator: filesystem: renameFile', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/lib/lint/json.js",
            "files": []
        });
    `);
    
    const [filenamePath] = traverseProperties(ast, 'filename');
    const filePath = filenamePath.parentPath;
    
    renameFile(filePath, 'hello.js');
    
    const result = print(ast, {
        printer: PRINTER,
    });
    
    const expected = montag`
        ${FS}({
            "type": "directory",
            "filename": "/lib/lint/hello.js",
            "files": []
        });
    `;
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: findFile', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello",
            "files": []
        });
    `);
    
    const [filePath] = findFile(ast, '/hello');
    renameFile(filePath, 'world');
    
    const result = print(ast, {
        printer: PRINTER,
    });
    
    const expected = montag`
        ${FS}({
            "type": "directory",
            "filename": "/world",
            "files": []
        });
    `;
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: findFile: glob', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello.swp",
            "files": []
        });
    `);
    
    const [filePath] = findFile(ast, '*.swp');
    removeFile(filePath);
    
    const result = print(ast, {
        printer: PRINTER,
    });
    
    const expected = montag`
        ${FS}();
    `;
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: findFile: /', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello/world/abc",
            "files": []
        });
    `);
    
    const [filePath] = findFile(ast, 'abc');
    renameFile(filePath, 'hello');
    
    const result = print(ast, {
        printer: PRINTER,
    });
    
    const expected = montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello/world/hello",
            "files": []
        });
    `;
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: rename: maybeFS', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello/world/abc",
            "files": []
        });
    `);
    
    const maybeFS = {
        renameFile: stub(),
    };
    
    init(maybeFS);
    
    const [filePath] = findFile(ast, 'abc');
    renameFile(filePath, 'hello');
    
    deinit();
    
    const expected = [
        '/hello/world/abc',
        '/hello/world/hello',
    ];
    
    t.calledWith(maybeFS.renameFile, expected);
    t.end();
});

test('putout: operator: filesystem: removeFile', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/lib/lint/json.js",
            "files": []
        });
    `);
    
    const [filePath] = findFile(ast, 'json.js');
    removeFile(filePath);
    
    const result = print(ast, {
        printer: PRINTER,
    });
    
    const expected = montag`
        ${FS}();
    `;
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: getFilename', (t) => {
    const ast = parse(montag`
        ${FS}({
            "type": "directory",
            "filename": "/hello/world/abc",
            "files": []
        });
    `);
    
    const [filePath] = findFile(ast, 'abc');
    const name = getFilename(filePath);
    
    const expected = '/hello/world/abc';
    
    t.equal(name, expected);
    t.end();
});

test('putout: operator: filesystem: moveFile', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world/abc',
        files: [{
            type: 'directory',
            filename: '/hello/world/abc/xyz',
            files: [{
                type: 'file',
                filename: '/hello/world/abc/xyz/README.md',
            }],
        }],
    });
    
    const [filePath] = findFile(ast, 'README.md');
    const [dirPath] = findFile(ast, 'abc');
    
    moveFile(filePath, dirPath);
    
    const result = printFilesystem(ast);
    const expected = formatFilesystem({
        type: 'directory',
        filename: '/hello/world/abc',
        files: [{
            type: 'directory',
            filename: '/hello/world/abc/xyz',
            files: [],
        }, {
            type: 'file',
            filename: '/hello/world/abc/README.md',
        }],
    });
    
    t.equal(result, expected);
    t.end();
});

test('putout: operator: filesystem: moveFile: update filename', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world/abc',
        files: [{
            type: 'directory',
            filename: '/hello/world/abc/xyz',
            files: [{
                type: 'file',
                filename: '/hello/world/abc/xyz/README.md',
            }],
        }],
    });
    
    const [filePath] = findFile(ast, 'README.md');
    const [dirPath] = findFile(ast, 'abc');
    
    moveFile(filePath, dirPath);
    
    const expected = {
        type: 'directory',
        filename: '/hello/world/abc',
        files: [{
            type: 'directory',
            filename: '/hello/world/abc/xyz',
            files: [],
        }, {
            type: 'file',
            filename: '/hello/world/abc/README.md',
        }],
    };
    
    t.equalFilesystems(ast, expected);
    t.end();
});

test('putout: operator: filesystem: createDirectory', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world',
        files: [],
    });
    
    const [dirPath] = findFile(ast, 'world');
    createDirectory(dirPath, 'xyz');
    
    const expected = {
        type: 'directory',
        filename: '/hello/world',
        files: [{
            type: 'directory',
            filename: '/hello/world/xyz',
            files: [],
        }],
    };
    
    t.equalFilesystems(ast, expected);
    t.end();
});

test('putout: operator: filesystem: createDirectory: returns', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world',
        files: [],
    });
    
    const [dirPath] = findFile(ast, 'world');
    const newdirPath = createDirectory(dirPath, 'xyz');
    const filename = getFilename(newdirPath);
    
    t.equal(filename, '/hello/world/xyz');
    t.end();
});

test('putout: operator: filesystem: createDirectory: maybeFileSystem', (t) => {
    const maybeFS = {
        createDirectory: stub(),
    };
    
    init(maybeFS);
    
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world',
        files: [],
    });
    
    const [dirPath] = findFile(ast, 'world');
    
    createDirectory(dirPath, 'xyz');
    deinit();
    
    t.calledWith(maybeFS.createDirectory, ['/hello/world/xyz']);
    t.end();
});

test('putout: operator: filesystem: getParentDirectory: no parent', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world',
        files: [],
    });
    
    const [dirPath] = findFile(ast, 'world');
    const result = getParentDirectory(dirPath, 'xyz');
    
    t.notOk(result);
    t.end();
});

test('putout: operator: filesystem: getParentDirectory', (t) => {
    const ast = parseFilesystem({
        type: 'directory',
        filename: '/hello/world',
        files: [{
            type: 'file',
            filename: '/hello/world/README.md',
        }],
    });
    
    const [dirPath] = findFile(ast, 'README.md');
    const parentdirPath = getParentDirectory(dirPath, 'xyz');
    const filename = getFilename(parentdirPath);
    
    t.equal(filename, '/hello/world');
    t.end();
});