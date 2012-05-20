define(function (require, exports) {
    var four = require('four'),
        five = require('five');

    exports.name = 'three';
    exports.fourName = four;
    exports.fiveName = five();
});
