'use strict';

const {resolve, dirname} = require('path');

const {
    readFile,
    writeFile,
} = require('fs').promises;

const tryCatch = require('try-catch');
const memo = require('nano-memoize');

const putout = require('../..');

const report = require('../report')();
const parseOptions = require('../parse-options');
const eslint = require('./eslint');
const parseError = require('./parse-error');
const buildPlugins = require('./build-plugins');

const {ignores} = putout;
const cwd = process.cwd();
const getFormatter = memo(_getFormatter);

const isParsingError = ({rule}) => rule === 'eslint/null';
const stub = () => () => {};

function getOptions({noOptions, name, transform, rulesdir}) {
    const transformPlugins = buildPlugins(transform);
    
    if (noOptions)
        return {
            formatter: 'dump',
            dir: dirname(name),
            plugins: transformPlugins,
        };
    
    const result = parseOptions({
        name,
        rulesdir,
    });
    
    const plugins = [
        ...result.plugins,
        ...transformPlugins,
    ];
    
    return {
        ...result,
        plugins,
    };
}

module.exports = ({write, fix, transform, fileCache, fixCount, rulesdir, format, isFlow, isJSX, ruler, logError, raw, exit, noOptions}) => async (name, index, {length}) => {
    const resolvedName = resolve(name)
        .replace(/^\./, cwd);
    
    const options = getOptions({
        name: resolvedName,
        rulesdir,
        noOptions,
        transform,
    });
    
    const {
        dir,
        formatter,
    } = options;
    
    const currentFormat = getFormatter(format || formatter, exit);
    
    if (ignores(dir, resolvedName, options)) {
        const line = report(currentFormat, {
            name: resolvedName,
            places: [],
            index,
            count: length,
            source: '',
        });
        
        write(line || '');
        return null;
    }
    
    const source = await readFile(name, 'utf8');
    const isTS = /\.tsx?$/.test(name);
    
    if (fileCache.canUseCache({fix, options, name: resolvedName})) {
        const places = fileCache.getPlaces(resolvedName);
        
        const line = report(currentFormat, {
            name: resolvedName,
            places,
            index,
            count: length,
            source,
        });
        
        write(line || '');
        return places;
    }
    
    const [e, result] = tryCatch(putout, source, {
        fix,
        fixCount,
        isTS,
        isFlow,
        isJSX,
        ...options,
    });
    
    const allPlaces = parseError(e);
    
    if (!e) {
        const {code, places} = result;
        allPlaces.push(...places);
        
        if (ruler.disable || ruler.enable || ruler.disableAll || ruler.enableAll)
            return places;
        
        const rawOrFixed = fix ? code : source;
        const [newCode, newPlaces] = await eslint({
            name,
            code: rawOrFixed,
            fix,
        });
        
        allPlaces.push(...newPlaces);
        
        const fixable = !newPlaces.filter(isParsingError).length;
        
        if (fixable)
            fileCache.setInfo(resolvedName, allPlaces, options);
        
        if (fix && source !== newCode) {
            fileCache.removeEntry(resolvedName);
            return await writeFile(name, newCode);
        }
    }
    
    const line = report(currentFormat, {
        name: resolvedName,
        places: allPlaces,
        index,
        count: length,
        source,
    });
    
    write(line || '');
    
    e && raw && logError(e);
    
    return allPlaces;
};

module.exports._getFormatter = getFormatter;
function _getFormatter(name, exit) {
    let e;
    let reporter;
    
    if (name === 'none') {
        return stub();
    }
    
    [e, reporter] = tryCatch(require, `@putout/formatter-${name}`);
    
    if (!e)
        return reporter;
    
    [e, reporter] = tryCatch(require, `putout-formatter-${name}`);
    
    if (e)
        exit(e);
    
    return reporter;
}

