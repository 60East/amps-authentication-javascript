"use strict";
////////////////////////////////////////////////////////////////////////////
//
// Copyright (c) 2012-2019 60East Technologies Inc., All Rights Reserved.
//
// This computer software is owned by 60East Technologies Inc. and is
// protected by U.S. copyright laws and other laws and by international
// treaties.  This computer software is furnished by 60East Technologies
// Inc. pursuant to a written license agreement and may be used, copied,
// transmitted, and stored only in accordance with the terms of such
// license agreement and with the inclusion of the above copyright notice.
// This computer software or any other copies thereof may not be provided
// or otherwise made available to any other person.
//
// U.S. Government Restricted Rights.  This computer software: (a) was
// developed at private expense and is in all respects the proprietary
// information of 60East Technologies Inc.; (b) was not developed with
// government funds; (c) is a trade secret of 60East Technologies Inc.
// for all purposes of the Freedom of Information Act; and (d) is a
// commercial item and thus, pursuant to Section 12.212 of the Federal
// Acquisition Regulations (FAR) and DFAR Supplement Section 227.7202,
// Government's use, duplication or disclosure of the computer software
// is subject to the restrictions set forth by 60East Technologies Inc..
//
////////////////////////////////////////////////////////////////////////////
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var kerberos_1 = require("kerberos");
var IS_WIN = process.platform === 'win32';
var AMPSKerberosAuthenticator = /** @class */ (function () {
    function AMPSKerberosAuthenticator(spn) {
        var _this = this;
        this.context = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.client) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, kerberos_1.initializeClient(this.spn)];
                    case 1:
                        _a.client = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.client];
                }
            });
        }); };
        // validate the SPN first
        validateSPN(spn);
        if (!IS_WIN) {
            this.spn = spn.replace(/\//g, '@');
        }
        this.client = null;
    }
    AMPSKerberosAuthenticator.prototype.authenticate = function (login, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context()];
                    case 1: return [2 /*return*/, (_a.sent()).step('')];
                }
            });
        });
    };
    AMPSKerberosAuthenticator.prototype.retry = function (login, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authenticate(login, password)];
            });
        });
    };
    AMPSKerberosAuthenticator.prototype.completed = function (login, password, reason) {
        this.client = null;
    };
    return AMPSKerberosAuthenticator;
}());
exports.AMPSKerberosAuthenticator = AMPSKerberosAuthenticator;
function validateSPN(spn) {
    // validation patterns
    var hostPattern = '(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])';
    var spnPattern = "^(\\w+/)(" + hostPattern + ")(:\\d+)?";
    var spnFormat;
    if (IS_WIN) {
        var realmPattern = '@[\\w\\d]+([\\.\\w\\d]*)?';
        spnPattern = spnPattern + "(" + realmPattern + ")?$";
        spnFormat = '<service>/<host>[:<port>][@REALM]';
    }
    else {
        spnFormat = '<service>/<host>[:<port>]';
        spnPattern = spnPattern + "$";
    }
    if (!spn.match(new RegExp(spnPattern))) {
        throw new Error("The specified SPN " + spn + " does not match the format " + spnFormat);
    }
}
exports.validateSPN = validateSPN;
