export default [
    {
        files: ["**/*.js", "**/*.mjs"],
        languageOptions: {
            sourceType: "module",
            ecmaVersion: 2022,
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                navigator: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                requestAnimationFrame: "readonly",
                URL: "readonly",
                Blob: "readonly",
                Worker: "readonly",
                importScripts: "readonly",
                self: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly",
                THREE: "readonly",
                JSZip: "readonly",
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
                test: "readonly",
                performance: "readonly",
                global: "readonly",
                HTMLInputElement: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "error",
            "no-redeclare": "error",
            "no-const-assign": "error",
            "no-dupe-keys": "error",
            "no-func-assign": "error"
        }
    }
];
