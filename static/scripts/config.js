require.config({
    baseUrl: "/static/scripts/lib",
    paths: {
        app: '/static/scripts/app'
    },
    shim: {
        underscore: {
            exports: '_'
        }
    }
});
