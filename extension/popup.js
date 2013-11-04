$(start);

function start() {
    var $path = $('#path');
    $path.autoGrowInput();

    loadSjsScript('js/jasmine.js', function() {
        loadSjsScript('js/jasmine-html.js');
    });
    loadSjsScript('js/zirconium.chrome.sjs');

    chrome.storage.local.get('testPaths', function(result) {
        if (!result.testPaths)
            return;

        $path.val(result.testPaths[0]).trigger('update');
    });

    $('#loadTests').click(loadTests);
    $('#runTests').click(runTests);
}

function loadTests() {
    var path = $('#path').val();
    chrome.storage.local.set({ testPaths: [path] });

    loadSjsScript('file://' + path, function() {
        $('#loadTests').prop('disabled', true);
        $('#runTests').prop('disabled', false);
    });
}

function loadSjsScript(url, callback) {
    $.get(url, function(code) {
        var compiled = __oni_rt.c1.compile(code, { filename: "'" + url.replace(/\\/g, '\\\\') + "'", mode: 'normal' });
        compiled += "\n//@ sourceURL=" + url;

        window.eval.call(window, compiled);
        if (callback) callback();
    });
}

function runTests() {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    jasmineEnv.execute();
}