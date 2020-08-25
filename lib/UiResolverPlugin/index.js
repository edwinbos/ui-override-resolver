const fs = require('fs');
const path = require('path');

class UiResolverPlugin {
    constructor(options) {
        this.name = options.name || 'UiResolverPlugin';
        this.basePath = options.basePath || path.resolve(__dirname, '..', '..', '..', '..', '..');
        this.includePath = options.UiModulePath;
        this.projectPath = options.projectPath;
    }

    apply(resolver) {
        const target = resolver.ensureHook('resolved');
        resolver.getHook('existingFile').tapAsync(this.name, (request, resolveContext, callback) => {
            const from = request.context.issuer;
            const old = request.path;

            if (old && old.startsWith(this.includePath)) {
                const newFile = old.replace(this.includePath, this.projectPath);
                fs.stat(newFile, (err, stat) => {
                    if (!err && stat && stat.isFile()) {
                        console.log('\nUiResolverPlugin path: in %s\n  %s => %s\n',
                            from.replace(this.basePath,''),
                            old.replace(this.basePath,''),
                            newFile.replace(this.basePath,'')
                        );
                        const obj = {
                            ...request,
                            path: newFile,
                            request: undefined
                        };
                        return resolver.doResolve(
                            target,
                            obj,
                            `resolved by ${this.name} to ${newFile}`,
                            resolveContext,
                            callback
                        );
                    }
                    return callback();
                });
            } else {
                return callback();
            }
        });
    }
}

module.exports = UiResolverPlugin;
