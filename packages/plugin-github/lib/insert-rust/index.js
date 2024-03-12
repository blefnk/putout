import {operator, template} from 'putout';

const {
    compare,
    traverseProperties,
    getTemplateValues,
    remove,
    __yaml,
} = operator;

const RUST = template.ast(`({
    "name": "Install Rust",
    "run": 'rustup update'
})`);

delete RUST.extra;

export const report = () => 'Install Rust';

export const fix = ({path, index, stepsPathValue}) => {
    stepsPathValue.node.elements.splice(index + 1, 0, RUST);
    remove(path);
};

export const traverse = ({push}) => ({
    [__yaml](path) {
        const {__object} = getTemplateValues(path, __yaml);
        const [stepsPath] = traverseProperties(__object, 'steps');
        
        if (!stepsPath)
            return;
        
        const stepsPathValue = stepsPath.get('value');
        const steps = stepsPathValue.get('elements');
        
        for (const step of steps) {
            if (compare(step, RUST))
                return;
        }
        
        for (const [index, step] of steps.entries()) {
            const prop = step.get('properties.0');
            const valueStr = prop
                .get('value')
                .toString();
            
            if (!valueStr.includes('actions-rs'))
                continue;
            
            push({
                index,
                stepsPathValue,
                path: step,
            });
            return;
        }
    },
});
