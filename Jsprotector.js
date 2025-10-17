(function(window) {
    'use strict';

    const OBFUSCATION_SETTINGS = {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1.0,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.5,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: true,
        rotateStringArray: true,
        selfDefending: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayEncoding: ['base64', 'rc4'],
        stringArrayThreshold: 1.0,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
        identifierNamesGenerator: 'hexadecimal',
        ignoreRequireImports: true
    };

    // Track if obfuscator is loaded
    let obfuscatorLoaded = false;
    let obfuscatorLoading = false;
    const loadQueue = [];

    // Extract clean domain from any URL format
    function extractDomain(input) {
        if (!input || typeof input !== 'string') return '';
        
        let domain = input.trim().toLowerCase();
        
        // Remove protocol (http://, https://)
        domain = domain.replace(/^https?:\/\//, '');
        
        // Remove www. prefix
        domain = domain.replace(/^www\./, '');
        
        // Remove everything after first slash (paths, trailing slashes)
        domain = domain.split('/')[0];
        
        // Remove port if exists
        domain = domain.split(':')[0];
        
        // Remove query parameters if somehow still there
        domain = domain.split('?')[0];
        
        // Remove hash if somehow still there
        domain = domain.split('#')[0];
        
        return domain;
    }

    // Load JavaScriptObfuscator dynamically
    function loadObfuscator() {
        return new Promise(function(resolve, reject) {
            if (typeof window.JavaScriptObfuscator !== 'undefined') {
                obfuscatorLoaded = true;
                return resolve();
            }

            if (obfuscatorLoading) {
                loadQueue.push({ resolve: resolve, reject: reject });
                return;
            }

            obfuscatorLoading = true;

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/javascript-obfuscator@4.1.0/dist/index.browser.js';
            script.async = true;

            script.onload = function() {
                obfuscatorLoaded = true;
                obfuscatorLoading = false;
                
                setTimeout(function() {
                    if (typeof window.JavaScriptObfuscator !== 'undefined') {
                        console.log('✓ JavaScriptObfuscator loaded and ready');
                        resolve();
                        
                        loadQueue.forEach(function(item) {
                            item.resolve();
                        });
                        loadQueue.length = 0;
                    } else {
                        console.error('✗ JavaScriptObfuscator script loaded but not available in window');
                        const error = new Error('JavaScriptObfuscator loaded but not available');
                        reject(error);
                        loadQueue.forEach(function(item) {
                            item.reject(error);
                        });
                        loadQueue.length = 0;
                    }
                }, 200);
            };

            script.onerror = function() {
                obfuscatorLoading = false;
                const error = new Error('Failed to load JavaScriptObfuscator library from CDN');
                reject(error);
                
                loadQueue.forEach(function(item) {
                    item.reject(error);
                });
                loadQueue.length = 0;
            };

            (document.head || document.documentElement).appendChild(script);
        });
    }

    function b64encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            var bytes = new TextEncoder().encode(str);
            var binary = '';
            for (var i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        }
    }

    // Create domain lock wrapper if needed
    function createDomainLockWrapper(jsCode, options) {
        if (!options || !options.lockToDomain) {
            return jsCode;
        }

        var allowedDomains = Array.isArray(options.lockToDomain) ? options.lockToDomain : [options.lockToDomain];
        var encodedDomains = allowedDomains.map(function(d) {
            return b64encode(extractDomain(d));
        });

        var vars = {
            ext: '_' + Math.random().toString(36).substr(2, 8),
            dmc: '_' + Math.random().toString(36).substr(2, 8),
            dml: '_' + Math.random().toString(36).substr(2, 8),
            usr: '_' + Math.random().toString(36).substr(2, 8)
        };

        var wrapper = [];
        wrapper.push('(function(){');
        
        // Domain extraction function
        wrapper.push('function ' + vars.ext + '(d){if(!d)return "";d=d.trim().toLowerCase();d=d.replace(/^https?:\\/\\//,"");d=d.replace(/^www\\./,"");d=d.split("/")[0];d=d.split(":")[0];d=d.split("?")[0];d=d.split("#")[0];return d;}');
        
        // Domain lock check
        wrapper.push('var ' + vars.dml + '=' + JSON.stringify(encodedDomains) + ';');
        wrapper.push('function ' + vars.dmc + '(){try{var c=' + vars.ext + '(window.location.hostname),m=false,i;for(i=0;i<' + vars.dml + '.length;i++){try{var a=atob(' + vars.dml + '[i]);if(c===a||c.endsWith("."+a)){m=true;break;}}catch(e){}}if(!m){document.body.innerHTML="<div style=\\"display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a1a;color:#ff4444;font-family:Arial,sans-serif;font-size:24px;font-weight:bold;text-align:center;padding:20px;\\">⚠️ Domain Lock Active - Unauthorized Domain</div>";throw new Error("Domain verification failed");}}catch(e){document.body.innerHTML="<div style=\\"display:flex;align-items:center;justify-content:center;height:100vh;background:#1a1a1a;color:#ff4444;font-family:Arial,sans-serif;font-size:24px;font-weight:bold;text-align:center;padding:20px;\\">⚠️ Security Check Failed</div>";throw e;}}');
        
        // Check domain first
        wrapper.push(vars.dmc + '();');
        
        // User code wrapper
        wrapper.push('var ' + vars.usr + '=function(){');
        wrapper.push(jsCode);
        wrapper.push('};');
        
        // Execute user code
        wrapper.push('if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){' + vars.usr + '();});}else{' + vars.usr + '();}');
        
        wrapper.push('})();');
        
        return wrapper.join('');
    }

    const JSProtector = {};

    JSProtector.protect = function(jsCode, options) {
        return new Promise(function(resolve, reject) {
            if (!jsCode || typeof jsCode !== 'string') {
                return reject(new Error('Invalid input: JavaScript code must be a non-empty string'));
            }

            // Validate and normalize domains if provided
            if (options && options.lockToDomain) {
                var domains = Array.isArray(options.lockToDomain) ? options.lockToDomain : [options.lockToDomain];
                for (var i = 0; i < domains.length; i++) {
                    if (typeof domains[i] !== 'string' || domains[i].trim() === '') {
                        return reject(new Error('Invalid domain: All domains must be non-empty strings'));
                    }
                    var cleanDomain = extractDomain(domains[i]);
                    if (!cleanDomain) {
                        return reject(new Error('Invalid domain format: ' + domains[i]));
                    }
                }
            }

            if (typeof JavaScriptObfuscator !== 'undefined') {
                console.log('ℹ️ Using already loaded JavaScriptObfuscator');
                try {
                    var wrappedCode = createDomainLockWrapper(jsCode, options);
                    var obfuscationResult = JavaScriptObfuscator.obfuscate(wrappedCode, OBFUSCATION_SETTINGS);
                    resolve(obfuscationResult.getObfuscatedCode());
                } catch (error) {
                    reject(error);
                }
                return;
            }

            console.log('ℹ️ Loading JavaScriptObfuscator dynamically...');
            loadObfuscator()
                .then(function() {
                    try {
                        var wrappedCode = createDomainLockWrapper(jsCode, options);
                        var obfuscationResult = JavaScriptObfuscator.obfuscate(wrappedCode, OBFUSCATION_SETTINGS);
                        resolve(obfuscationResult.getObfuscatedCode());
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    };

    // Auto-load obfuscator on script load
    if (typeof window.JavaScriptObfuscator === 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                loadObfuscator().catch(function(err) {
                    console.warn('Failed to preload JavaScriptObfuscator:', err.message);
                });
            });
        } else {
            setTimeout(function() {
                loadObfuscator().catch(function(err) {
                    console.warn('Failed to preload JavaScriptObfuscator:', err.message);
                });
            }, 0);
        }
    }

    window.JSProtector = JSProtector;

})(window);