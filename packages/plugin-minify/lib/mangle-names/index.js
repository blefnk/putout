import {types} from 'putout';
import {computeName} from './compute-name.js';

const {isExportNamedDeclaration} = types;
const {entries} = Object;

export const report = () => `Mangle name`;

const hasScope = ({scope}) => scope.__putout_minify;

export const traverse = ({push, pathStore, store}) => ({
    BlockStatement(path) {
        pathStore(path);
    },
    'Identifier'(path) {
        const {name} = path.node;
        
        if (!path.scope.bindings[name])
            return;
        
        pathStore(path);
        store(name, {});
    },
    'ReferencedIdentifier'(path) {
        const {name} = path.node;
        
        pathStore(path);
        store(name, {});
    },
    Program: {
        exit(path) {
            const referenced = Object.fromEntries(store.entries());
            
            push({
                path,
                referenced,
            });
            
            for (const path of pathStore()) {
                if (hasScope(path))
                    continue;
                
                push({
                    path,
                    referenced,
                });
            }
        },
    },
});

export const fix = ({path, referenced}, options) => {
    const {scope} = path;
    const {mangleClassNames} = options;
    const names = entries(scope.bindings);
    const programPath = scope.getProgramParent().path;
    const allStore = programPath.__putout_minify_mangle = programPath.__putout_minify_mangle || {};
    
    for (const [index, [name, binding]] of names.entries()) {
        if (!mangleClassNames && binding.path.isClassDeclaration())
            continue;
        
        if (isInsideExport(binding))
            continue;
        
        const all = {
            ...allStore,
            ...scope.getAllBindings(),
            ...referenced,
        };
        
        if (name.length === 1)
            continue;
        
        const newName = generateUid({
            index,
            all,
            scope,
        });
        
        scope.rename(name, newName);
        allStore[newName] = true;
    }
    
    scope.__putout_minify = true;
};

function generateUid({index, all, scope}) {
    const uid = scope.generateUid();
    
    const short = computeName({
        index,
        all,
        uid,
    });
    
    return short;
}

function isInsideExport({path}) {
    return isExportNamedDeclaration(path.parentPath.parentPath);
}
