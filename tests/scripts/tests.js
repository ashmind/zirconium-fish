describe('Our simple site', function() {
    beforeEach(function() {
        zr.start();
        zr.navigate('http://localhost/nt');
    });

    afterEach(function() {
        zr.end();
    });
    
    function assertIsSuccess() {
        expect(zr.$('#result').text()).toBe('Success!');
    }

    it ("returns Success for simple link click", function() {
        zr.$('#simple-link').click();
        assertIsSuccess();
    });
    
    it ("returns Success for click on link added through JavaScript", function() {
        zr.$('#js-added-link').wait(10000).click();
        assertIsSuccess();
    });
    
    it ("returns Success after form submit", function(done) {
        zr.$('[name=name]').val('Nym');
        zr.$('[name=code]').val('12345');
        zr.$("button[type=submit]").click();
        assertIsSuccess();
    });
    
    /*
    it ("returns Success for click on Flash button", function(done) {
        driver.findElement(By.id('flash-button')).then(function(button) {
          driver.executeScript("arguments[0].flashClick()", button);
        });
        assertIsSuccess(done);
    });*/
});