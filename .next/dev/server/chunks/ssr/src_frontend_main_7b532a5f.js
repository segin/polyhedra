module.exports = [
"[project]/src/frontend/main.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_frontend_3ab8dc44._.js",
  "server/chunks/ssr/node_modules_three_build_three_module_a41fbe8d.js",
  "server/chunks/ssr/node_modules_three_examples_jsm_4b20a913._.js",
  "server/chunks/ssr/node_modules_cannon-es_dist_cannon-es_7722660f.js",
  "server/chunks/ssr/node_modules_@codemirror_state_dist_index_96896ad9.js",
  "server/chunks/ssr/node_modules_@codemirror_view_dist_index_6e0802d5.js",
  "server/chunks/ssr/node_modules_1acf2aea._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/frontend/main.js [app-ssr] (ecmascript)");
    });
});
}),
];