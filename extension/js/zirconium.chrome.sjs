var zr = (function() {
    var exports = {};
    var session = {};

    waitfor(var chromeWindowBefore) {
        chrome.windows.getCurrent({}, resume);
    }
    var incognito = chromeWindowBefore.incognito;
    
    var started = false;
    exports.start = function() {
        /*waitfor(var chromeWindow) {
            chrome.windows.create({ incognito: incognito }, resume);
        }*/

        if (started)
            throw 'zr.end() must be called before zr.start() can be called again.';

        started = true;
        session.rpcAllowed = false;
        session.window = chromeWindowBefore;
        waitfor(var tab) {
            chrome.tabs.create({ windowId: session.window.id }, resume);
        }

        session.tab = tab; //chromeWindow.tabs[0];
        session.tabListener = function(tabId, info) {
            if (tabId !== session.tab.id)
                return;

            console.log('tab update detected, status == ', info.status);
            if (info.status !== "complete") {
                console.log('session.rpcAllowed = false');
                session.rpcAllowed = false;
                return;
            }

            _injectScripts();
            session.rpcAllowed = true;
            console.log('session.rpcAllowed = true');
            if (session.rpcAllowedCallback)
                session.rpcAllowedCallback();
        };
        chrome.tabs.onUpdated.addListener(session.tabListener);
    };

    function _injectScripts() {
        waitfor() {    
            chrome.tabs.executeScript(session.tab.id, { file: "js/jquery-2.0.3.js" }, resume)            
        }
        console.log('injected js/jquery-2.0.3.js');

        waitfor() {
            chrome.tabs.executeScript(session.tab.id, { file: "js/content-scripts/zirconium.chrome.content.js" }, resume)
        }
        console.log('injected js/content-scripts/zirconium.chrome.content.js');
    }

    exports.navigate = function(url) {
        console.log('navigating to ' + url);
        chrome.tabs.update(session.tab.id, { url: url });        
    };

    exports.end = function() {
        started = false;
        chrome.tabs.onUpdated.removeListener(session.tabListener);
    };

    exports.$ = function(elementOrSelector) {
        if (elementOrSelector instanceof RemoteJQueryObject)
            return elementOrSelector;

        if (typeof elementOrSelector !== 'string')
            throw "For zr.$, parameter should be either a string (selector), or a result of another call to zr.$."
        
        return new RemoteJQueryObject(elementOrSelector);
    };

    var nextRpcId = 0;
    function RemoteJQueryObject(selector) {
        this.selector = selector;
        this._contextId = nextRpcId;
        nextRpcId += 1;   

        this._requestLength(selector);                 
    }

    RemoteJQueryObject.prototype = {
        wait: function(timeout) {
            var start = new Date();
            while (this._millisecondsSince(start) < timeout && this.length === 0) {
                this._requestLength();
                hold(timeout / 10);
            }
            this._ensureLength();
            return this;
        },

        _millisecondsSince : function(date) {
            var dayLengthInMs = 24 * 60 * 60 * 1000;
            return Math.round(((new Date()).getTime() - date.getTime()) / dayLengthInMs);
        },

        click: function() {     
            this._ensureLength();
            this._jQueryRpc('click');
            hold(1000);
            return this;
        },

        text: function(value) {
            this._ensureLength();            
            return this._jQueryRpc('text', [value]) || this;
        },

        val: function(value) {
            this._ensureLength();
            return this._jQueryRpc('val', [value]) || this;
        },

        _requestLength: function() {
            var info = this._jQueryRpc('$', [this.selector]);
            this.length = info.length;    
        },

        _ensureLength: function() {
            if (this.length === 0)
                throw "Element not found: '" + this.selector + "'.";
        },

        _jQueryRpc: function(functionName, functionArguments) {
            functionArguments = functionArguments || [];
            console.log('jQueryRPC<' + this._contextId + '>: ' + functionName + '(' + functionArguments.map(JSON.stringify).join(', ') + ')');
            if (!session.rpcAllowed) {
                console.log('session.rpcAllowed == false, waiting...');
                waitfor() {
                    session.rpcAllowedCallback = resume;
                }
                delete session.rpcAllowedCallback;
            }

            waitfor(var response) {
                chrome.tabs.sendMessage(session.tab.id, {
                    'contextId': this._contextId,
                    'function':  functionName,
                    'arguments': functionArguments
                }, resume);
            }

            if (response.exception)
                throw response.exception;

            console.log('jQueryRPC<' + this._contextId + '>: ' + functionName + ' returned ' + JSON.stringify(response.result));
            return response.result;
        }
    };

    return exports;
})();