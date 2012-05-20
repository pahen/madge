doh.register(
    "one/defineAmd",
    [
        function defineAmd(t){
            t.is('object', typeof define.amd);
        }
    ]
);
doh.run();
