'use strict';

module.exports.report = () => `Avoid useless type declaration`;

module.exports.fix = ({name, path, nodes}) => {
    for (const node of nodes) {
        node.name = name;
    }
    
    path.remove();
};

module.exports.traverse = ({push, store}) => {
    return {
        TSTypeAliasDeclaration(path) {
            const typePath = path.get('typeAnnotation');
            const isGeneric = typePath.get('typeParameters').node;
            
            if (isGeneric)
                return;
            
            if (path.parentPath.isExportNamedDeclaration())
                return;
            
            if (typePath.isTSTypeReference()) {
                const newName = path.node.id.name;
                const {name} = typePath.node.typeName;
                
                store(newName, {
                    name,
                    path,
                    nodes: [],
                });
            }
        },
        TSTypeAnnotation(path) {
            const typePath = path.get('typeAnnotation');
            
            if (!typePath.isTSTypeReference())
                return;
            
            const {typeName} = typePath.node;
            const {name} = typeName;
            
            const current = store(name);
            
            if (!current)
                return;
            
            current.nodes.push(typeName);
        },
        TSTypeParameterInstantiation(path) {
            const {params} = path.node;
            
            for (const {typeName} of params) {
                const {name} = typeName;
                
                const current = store(name);
                
                if (!current)
                    return;
                
                current.nodes.push(typeName);
            }
        },
        Program: {
            exit() {
                for (const [newName, {name, path, nodes}] of store.entries()) {
                    push({
                        name,
                        newName,
                        path,
                        nodes,
                    });
                }
            },
        },
    };
};
