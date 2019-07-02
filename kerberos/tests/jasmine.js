var Jasmine = require('jasmine');
// var reporters = require('jasmine-reporters');


// create the new jasmine instance and set it up
var jasmine = new Jasmine();
jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.configureDefaultReporter({showColors: true});


// add the junit format reporter
// var junitReporter = new reporters.JUnitXmlReporter({
//     // savePath: '..',
//     consolidateAll: true,
//     filePrefix: 'junit_tests_output'
// });
// jasmine.addReporter(junitReporter);


jasmine.execute();
