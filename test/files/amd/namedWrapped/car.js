define('car', function (require) {
    return {
        name: 'car',
        wheels: require('wheels'),
        engine: require('engine')
    };
});
