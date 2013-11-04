(function() {
    "use strict";
    console.log('zr: loaded.');

    var contexts = {};
    var remoteFunctions = {
        $: function(context, selector) {
            var result = window.jQuery(selector);
            
            console.log("zr: $(", selector, "): ", $.makeArray(result));
            context.$elements = result;
            return { length: result.length };
        },
        
        click: function(context) {
            console.log("zr: $", $.makeArray(context.$elements), '.click()');
            _triggerEventOnAll(context.$elements, 'click');
        },
        
        text: function(context, value) {
            return _getOrSet(context.$elements, 'text', value);
        },
        
        val: function(context, value) {
            return _getOrSet(context.$elements, 'val', value);
        }
    };
    
    function _getOrSet($elements, jQueryFunctionName, value) {
        if (value !== undefined && value !== null) {
            console.log("zr: $", $.makeArray($elements), "." + jQueryFunctionName + "(", value, ")");
            $elements[jQueryFunctionName](value);
            return;
        }
            
        var result = $elements[jQueryFunctionName]();
        console.log("zr: $", $.makeArray($elements), "." + jQueryFunctionName + "(): ", result);
        return result;
    }
    
    function _triggerEventOnAll($elements, name) {
        $elements.each(function() {
            _triggerEvent(this, name);
        });
    }
    
    function _triggerEvent(element, name) {
        var event = document.createEvent('Events');
        event.initEvent(name, true, true);
        element.dispatchEvent(event);
    }

    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        console.log('zr: rpc ', JSON.stringify(message));
        var func = remoteFunctions[message['function']];
        var args = message.arguments;
        var contextId = message.contextId;
        
        contexts[contextId] = contexts[contextId] || {};
        args.unshift(contexts[contextId]);

        var response;
        try {
            response = { result: func.apply(null, args) };
        }
        catch(e) {
            var exceptionMessage = e.message || e;
            response = { exception: exceptionMessage };
        }

        sendResponse(response);
    });
})();