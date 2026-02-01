"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_ssr_lib_supabase_ts";
exports.ids = ["_ssr_lib_supabase_ts"];
exports.modules = {

/***/ "(ssr)/./lib/supabase.ts":
/*!*************************!*\
  !*** ./lib/supabase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(ssr)/./node_modules/@supabase/supabase-js/dist/index.mjs\");\n\nconst supabaseUrl = \"https://fuyalwhqewztcbgqboqv.supabase.co\";\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eWFsd2hqZXd6dGNiZ3Fib3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4ODk2MTYsImV4cCI6MjA4NTQ2NTYxNn0.srvlWyAES_AU8NnoBONFMXhY9dpEcN_itFOv3fDZuCI\";\n// Debug logging\nif (true) {\n    console.log(\"✓ SUPABASE_URL loaded:\", supabaseUrl ? \"✅\" : \"❌\");\n    console.log(\"✓ SUPABASE_KEY loaded:\", supabaseAnonKey ? \"✅\" : \"❌\");\n}\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error(\"Supabase env missing - check .env.local\");\n}\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9saWIvc3VwYWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBb0Q7QUFFcEQsTUFBTUMsY0FBY0MsMENBQW9DO0FBQ3hELE1BQU1HLGtCQUFrQkgsa05BQXlDO0FBRWpFLGdCQUFnQjtBQUNoQixJQUFJLElBQWtCLEVBQWE7SUFDakNLLFFBQVFDLEdBQUcsQ0FBQywwQkFBMEJQLGNBQWMsTUFBTTtJQUMxRE0sUUFBUUMsR0FBRyxDQUFDLDBCQUEwQkgsa0JBQWtCLE1BQU07QUFDaEU7QUFFQSxJQUFJLENBQUNKLGVBQWUsQ0FBQ0ksaUJBQWlCO0lBQ3BDLE1BQU0sSUFBSUksTUFBTTtBQUNsQjtBQUVPLE1BQU1DLFdBQVdWLG1FQUFZQSxDQUFDQyxhQUFhSSxpQkFBZ0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vdXJhdXRvLy4vbGliL3N1cGFiYXNlLnRzP2M5OWYiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiXG5cbmNvbnN0IHN1cGFiYXNlVXJsID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIVxuY29uc3Qgc3VwYWJhc2VBbm9uS2V5ID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkhXG5cbi8vIERlYnVnIGxvZ2dpbmdcbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICBjb25zb2xlLmxvZygn4pyTIFNVUEFCQVNFX1VSTCBsb2FkZWQ6Jywgc3VwYWJhc2VVcmwgPyAn4pyFJyA6ICfinYwnKVxuICBjb25zb2xlLmxvZygn4pyTIFNVUEFCQVNFX0tFWSBsb2FkZWQ6Jywgc3VwYWJhc2VBbm9uS2V5ID8gJ+KchScgOiAn4p2MJylcbn1cblxuaWYgKCFzdXBhYmFzZVVybCB8fCAhc3VwYWJhc2VBbm9uS2V5KSB7XG4gIHRocm93IG5ldyBFcnJvcignU3VwYWJhc2UgZW52IG1pc3NpbmcgLSBjaGVjayAuZW52LmxvY2FsJylcbn1cblxuZXhwb3J0IGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzdXBhYmFzZUFub25LZXkpXG4iXSwibmFtZXMiOlsiY3JlYXRlQ2xpZW50Iiwic3VwYWJhc2VVcmwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwic3VwYWJhc2VBbm9uS2V5IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfQU5PTl9LRVkiLCJjb25zb2xlIiwibG9nIiwiRXJyb3IiLCJzdXBhYmFzZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./lib/supabase.ts\n");

/***/ })

};
;