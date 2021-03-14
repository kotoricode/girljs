/* eslint-disable */

module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module"
    },
    rules: {
        "array-callback-return": 2,
        "arrow-parens": [2, "always"],
        "block-spacing": 2,
        "brace-style": [2, "allman"],
        "class-methods-use-this": 2,
        "complexity": [1, 15],
        "default-case": 2,
        "default-case-last": 2,
        "default-param-last": [2],
        "eqeqeq": 2,
        "eol-last": 2,
        "func-call-spacing": [2, "never"],
        "guard-for-in": 2,
        "indent": [2, 4, {
            "SwitchCase": 1,
            "VariableDeclarator": "first",
            "ignoredNodes": ["ConditionalExpression"]
        }],
        "linebreak-style": [2, "windows"],
        "max-len": [1, {
            "code": 80,
            "ignoreComments": true
        }],
        "newline-before-return": 2,
        "no-alert": 2,
        "no-caller": 2,
        "no-confusing-arrow": 2,
        "no-constant-condition": [2, { "checkLoops": false }],
        "no-constructor-return": 2,
        "no-continue": 2,
        "no-empty-function": 2,
        "no-eval": 2,
        "no-extend-native": 2,
        "no-implicit-globals": 2,
        "no-implied-eval": 2,
        "no-invalid-this": 2,
        "no-iterator": 2,
        "no-loss-of-precision": 2,
        "no-mixed-spaces-and-tabs": 2,
        "no-multi-spaces": [2, {
            "exceptions": {
                "ImportDeclaration": true,
                "ArrayExpression": true
            }
        }],
        "no-new": 2,
        "no-new-func": 2,
        "no-new-wrappers": 2,
        "no-param-reassign": 2,
        "no-promise-executor-return": 2,
        "no-proto": 2,
        "no-restricted-globals": [2,
            "applicationCache",
            "caches",
            "closed",
            "controllers",
            "crossOriginIsolated",
            "crypto",
            "customElements",
            "defaultStatus",
            "devicePixelRatio",
            "dialogArguments",
            "directories",
            "document",
            "event",
            "frameElement",
            "frames",
            "fullScreen",
            "history",
            "indexedDB",
            "innerHeight",
            "innerWidth",
            "isSecureContext",
            "length",
            "localStorage",
            "location",
            "locationbar",
            "menubar",
            "mozAnimationStartTime",
            "mozInnerScreenX",
            "mozInnerScreenY",
            "mozPaintCount",
            "name",
            "navigator",
            "onabort",
            "onafterprint",
            "onanimationcancel",
            "onanimationend",
            "onanimationiteration",
            "onappinstalled",
            "onauxclick",
            "onbeforeinstallprompt",
            "onbeforeprint",
            "onbeforeunload",
            "onblur",
            "oncancel",
            "oncanplay",
            "oncanplaythrough",
            "onchange",
            "onclick",
            "onclose",
            "oncontextmenu",
            "oncuechange",
            "ondblclick",
            "ondevicelight",
            "ondevicemotion",
            "ondeviceorientation",
            "ondeviceorientationabsolute",
            "ondeviceproximity",
            "ondragdrop",
            "ondurationchange",
            "onended",
            "onerror",
            "onfocus",
            "onformdata",
            "ongamepadconnected",
            "ongamepaddisconnected",
            "ongotpointercapture",
            "onhashchange",
            "oninput",
            "oninvalid",
            "onkeydown",
            "onkeypress",
            "onkeyup",
            "onlanguagechange",
            "onload",
            "onloadeddata",
            "onloadedmetadata",
            "onloadend",
            "onloadstart",
            "onlostpointercapture",
            "onmessage",
            "onmessageerror",
            "onmousedown",
            "onmouseenter",
            "onmouseleave",
            "onmousemove",
            "onmouseout",
            "onmouseover",
            "onmouseup",
            "onmozbeforepaint",
            "onpaint",
            "onpause",
            "onplay",
            "onplaying",
            "onpointercancel",
            "onpointerdown",
            "onpointerenter",
            "onpointerleave",
            "onpointermove",
            "onpointerout",
            "onpointerover",
            "onpointerup",
            "onpopstate",
            "onrejectionhandled",
            "onreset",
            "onresize",
            "onscroll",
            "onselect",
            "onselectionchange",
            "onselectstart",
            "onstorage",
            "onsubmit",
            "ontouchcancel",
            "ontouchstart",
            "ontransitioncancel",
            "ontransitionend",
            "onunhandledrejection",
            "onunload",
            "onuserproximity",
            "onvrdisplayactivate",
            "onvrdisplayblur",
            "onvrdisplayconnect",
            "onvrdisplaydeactivate",
            "onvrdisplaydisconnect",
            "onvrdisplayfocus",
            "onvrdisplaypointerrestricted",
            "onvrdisplaypointerunrestricted",
            "onvrdisplaypresentchange",
            "onwheel",
            "opener",
            "origin",
            "outerHeight",
            "outerWidth",
            "pageXOffset",
            "pageYOffset",
            "parent",
            "performance",
            "personalbar",
            "pkcs11",
            "screen",
            "screenLeft",
            "screenTop",
            "screenX",
            "screenY",
            "scrollbars",
            "scrollMaxX",
            "scrollMaxY",
            "scrollX",
            "scrollY",
            "self",
            "sessionStorage",
            "sidebar",
            "speechSynthesis",
            "status",
            "statusbar",
            "toolbar",
            "top",
            "visualViewport",
            "alert",
            "atob",
            "back",
            "blur",
            "btoa",
            "cancelAnimationFrame",
            "cancelIdleCallback",
            "captureEvents",
            "clearImmediate",
            "clearInterval",
            "clearTimeout",
            "close",
            "confirm",
            "convertPointFromNodeToPage",
            "convertPointFromPageToNode",
            "createImageBitmap",
            "dump",
            "fetch",
            "find",
            "focus",
            "forward",
            "getComputedStyle",
            "getDefaultComputedStyle",
            "getSelection",
            "home",
            "matchMedia",
            "minimize",
            "moveBy",
            "moveTo",
            "open",
            "openDialog",
            "postMessage",
            "print",
            "prompt",
            "queueMicrotask",
            "releaseEvents",
            "requestAnimationFrame",
            "requestFileSystem",
            "requestIdleCallback",
            "resizeBy",
            "resizeTo",
            "routeEvent",
            "scroll",
            "scrollBy",
            "scrollByLines",
            "scrollByPages",
            "scrollTo",
            "setCursor",
            "setImmediate",
            "setInterval",
            "setTimeout",
            "showDirectoryPicker",
            "showModalDialog",
            "showOpenFilePicker",
            "showSaveFilePicker",
            "sizeToContent",
            "stop",
            "updateCommands",
            "afterprint",
            "animationcancel",
            "animationend",
            "animationiteration",
            "beforeprint",
            "beforeunload",
            "copy",
            "cut",
            "DOMContentLoaded",
            "error",
            "hashchange",
            "languagechange",
            "load",
            "message",
            "messageerror",
            "offline",
            "online",
            "orientationchange",
            "pagehide",
            "pageshow",
            "paste",
            "popstate",
            "rejectionhandled",
            "storage",
            "transitioncancel",
            "unhandledrejection",
            "unload",
            "vrdisplayconnect",
            "vrdisplaydisconnect",
            "vrdisplaypresentchange",
        ],
        "no-sequences": 2,
        "no-shadow": 2,
        "no-template-curly-in-string": 2,
        "no-throw-literal": 2,
        "no-trailing-spaces": 2,
        "no-unexpected-multiline": 2,
        "no-unmodified-loop-condition": 2,
        "no-unreachable-loop": 2,
        "no-unsafe-optional-chaining": 2,
        "no-unused-vars": 1,
        "no-useless-concat": 2,
        "no-useless-rename": 2,
        "no-var": 2,
        "no-whitespace-before-property": 2,
        "padded-blocks": [2, "never"],
        "prefer-arrow-callback": 2,
        "prefer-const": 2,
        "quote-props": [2, "as-needed"],
        "quotes": [2, "double"],
        "require-atomic-updates": 2,
        "require-await": 2,
        "require-unicode-regexp": 2,
        "semi": [2, "always"],
        "semi-spacing": 2,
        "semi-style": [2, "last"],
        "space-before-blocks": 2,
        "space-before-function-paren": [2, {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "never"
        }],
        "space-in-parens": [2, "never"],
        "space-unary-ops": 2
    }
};
