import {
  InjectionToken
} from "./chunk-YCA54VN2.js";

// node_modules/@angular/common/fesm2022/xhr-BdgfMvBr.mjs
function parseCookieValue(cookieStr, name) {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(";")) {
    const eqIndex = cookie.indexOf("=");
    const [cookieName, cookieValue] = eqIndex == -1 ? [cookie, ""] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
var PLATFORM_BROWSER_ID = "browser";
var PLATFORM_SERVER_ID = "server";
function isPlatformBrowser(platformId) {
  return platformId === PLATFORM_BROWSER_ID;
}
function isPlatformServer(platformId) {
  return platformId === PLATFORM_SERVER_ID;
}
var XhrFactory = class {
};

// node_modules/@angular/common/fesm2022/dom_tokens-CNpAxedO.mjs
var DOCUMENT = new InjectionToken(ngDevMode ? "DocumentToken" : "");

export {
  parseCookieValue,
  PLATFORM_BROWSER_ID,
  PLATFORM_SERVER_ID,
  isPlatformBrowser,
  isPlatformServer,
  XhrFactory,
  DOCUMENT
};
/*! Bundled license information:

@angular/common/fesm2022/xhr-BdgfMvBr.mjs:
  (**
   * @license Angular v19.2.5
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)

@angular/common/fesm2022/dom_tokens-CNpAxedO.mjs:
  (**
   * @license Angular v19.2.5
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
*/
//# sourceMappingURL=chunk-Q2XSVBTF.js.map
