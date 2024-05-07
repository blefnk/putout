'use strict';

const test = require('supertape');
const montag = require('montag');
const tryCatch = require('try-catch');

const parse = require('./parse');
const generate = require('./generate');
const babel = require('./parsers/babel');
const print = require('./print');

test('putout: engina-parser: parse: await without async', (t) => {
    const source = `const hello = () => await world()`;
    const ast = parse(source);
    
    t.ok(ast);
    t.end();
});

test('putout: engina-parser: using', (t) => {
    const source = 'await using obj = g();\n';
    const ast = parse(source);
    const code = print(ast);
    
    t.equal(code, source);
    t.end();
});

test('putout: engina-parser: tuple', (t) => {
    const source = 'const a = #[1];\n';
    const ast = parse(source);
    const code = print(ast);
    
    t.equal(code, source);
    t.end();
});

test('putout: engina-parser: babel: decoratorAutoAccessors', (t) => {
    const source = montag`
        class SomeClass {
            @setMetadata
            foo = 123;
            
            @setMetadata
            accessor bar = "hello!";
            
            @setMetadata
            baz() { }
        }
    `;
    
    const [error] = tryCatch(parse, source);
    
    t.notOk(error);
    t.end();
});

test('putout: engina-parser: babel: sourcePhaseImports', (t) => {
    const source = montag`
        import source x from 'x';
    `;
    
    const [error] = tryCatch(parse, source);
    
    t.notOk(error);
    t.end();
});

test('putout: engina-parser: babel: deferredImportEvaluation', (t) => {
    const source = montag`
        import defer * as myMod from "./mod";
    `;
    
    const [error] = tryCatch(parse, source);
    
    t.notOk(error);
    t.end();
});

test('putout: engina-parser: babel: optionalChainingAssign', (t) => {
    const source = montag`
        maybeAnObj?.prop = theValue;
    `;
    
    const [error] = tryCatch(parse, source);
    
    t.notOk(error);
    t.end();
});

test('putout: engina-parser: parse + generate = sourcemap', (t) => {
    const source = `const hello = 'world';`;
    
    const ast = babel.parse(source, {
        sourceFilename: 'hello.js',
    });
    
    const {map} = generate(ast, {sourceMaps: true}, {
        'hello.js': source,
    });
    
    t.ok(map, 'returns map');
    t.end();
});

test('putout: engina-parser: parse: sourceFilename passed', (t) => {
    const source = `const hello = 'world';`;
    
    const ast = babel.parse(source, {
        sourceFilename: 'hello.js',
    });
    
    t.equal(ast.loc.filename, 'hello.js');
    t.end();
});

test('putout: engina-parser: recast: parse + print = sourcemap', (t) => {
    const source = `const hello = 'world';`;
    
    const ast = parse(source, {
        printer: 'recast',
        sourceFileName: 'hello.js',
    });
    
    const code = print(ast, {
        printer: 'recast',
        sourceMapName: 'hello.map',
    });
    
    const expected = `${source}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbGxvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIiwiZmlsZSI6ImhlbGxvLm1hcCIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGhlbGxvID0gJ3dvcmxkJzsiXX0=\n`;
    
    t.equal(code, expected);
    t.end();
});
