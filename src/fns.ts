import { Logger } from './subjective';

export function logByType<F, S, DATA>(
    logger: Logger | boolean,
    updateFn: (fns: F) => (state: S, payload: DATA) => S,
    payload: any,
) {
    const fnName = _parseUpdateFunctionName(updateFn);
    if (typeof logger === 'function') {
        // custom logger
        logger(fnName, payload);
    } else if (typeof logger === 'boolean') {
        // use default console logger
        _consoleLogger(fnName, payload);
    } else {
        throw 'Logger can be type either function or boolean';
    }
}

/**
 * Parse fn => updateFn
 *
 * EXAMPLE:
 * - FROM: function (f) { return f.filter.updateFilterA; }
 * - TO: "filter.updateFilterA"
 */
function _parseUpdateFunctionName<F, S, DATA>(
    updateFn: (fns: F) => (state: S, payload: DATA) => S,
) {
    try {
        // stringify
        const ff = updateFn.toString();
        // split by first "." character until line break, ";", "}" or space...
        // ...because it's always like "f.updateA" or "f.filter.updateA"
        return ff.split(/\.(.[^(\;|\s|\})]+)/)[1];
    } catch {
        return 'UnknownFnName';
    }
}

/**
 * Default Console logger
 */
function _consoleLogger(fnName: string, payload: any) {
    try {
        const data = JSON.stringify(payload);
        // logging to console
        console.log(fnName + ':' + data.substring(0, 100));
    } catch {
        console.warn(
            `Subjective:Logger: We could not stringify ${fnName}:`,
            payload,
        );
    }
}
