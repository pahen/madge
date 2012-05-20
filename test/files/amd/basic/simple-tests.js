go(['a', 'b'], function (a, b) {

    doh.register(
        "basic/simple",
        [
            function simple(t){
                t.is('a', a.name);
                t.is('b', b.name);
                t.is('c', b.cName);
            }
        ]
    );
    doh.run();

});
