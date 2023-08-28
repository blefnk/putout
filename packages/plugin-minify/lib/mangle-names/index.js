import {computeName} from './compute-name.js';

const {entries} = Object;

export const report = () => `Mangle name`;

export const include = () => ['Statement'];

export const filter = (path) => !path.scope.__putout_minify;

export const fix = ({scope}, options) => {
    const {mangleClassNames} = options;
    const names = entries(scope.bindings);
    
    for (const [index, [name, binding]] of names.entries()) {
        if (!mangleClassNames && binding.path.isClassDeclaration())
            continue;
        
        const all = scope.getAllBindings();
        
        if (name.length === 1)
            continue;
        
        const newName = generateUid({
            index,
            all,
            scope,
        });
        
        scope.rename(name, newName);
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
