System.register(["@angular/core", "rxjs/add/operator/toPromise", "@angular/http"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, http_1, HelperService;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (_1) {
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }
        ],
        execute: function () {
            HelperService = (function () {
                function HelperService(http) {
                    this.http = http;
                }
                HelperService.prototype.formatDateTime = function (date) {
                    var datetimeStr = "";
                    var year = date.getFullYear();
                    var month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1));
                    var dateStr = (date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate());
                    var hour = (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours());
                    var minutes = (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
                    var second = (date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds());
                    return year + '-' + month + '-' + dateStr + " " + hour + ":" + minutes + ":" + second;
                };
                HelperService.prototype.getDataFromPost = function (url, options) {
                    //make ajax call in general use
                    var _this = this;
                    return this.http.post(url, options).toPromise()
                        .then(function (value) {
                        return _this.extractData(value);
                    })
                        .catch(this.handleError);
                };
                ;
                HelperService.prototype.getData = function (url) {
                    //make ajax call in general usei
                    var _this = this;
                    return this.http.get(url).toPromise()
                        .then(function (value) {
                        return _this.extractData(value);
                    })
                        .catch(this.handleError);
                };
                ;
                HelperService.prototype.extractData = function (value) {
                    var body = value.json();
                    if (body.status) {
                        return body.data;
                    }
                    return [];
                };
                ;
                HelperService.prototype.handleError = function () { };
                ;
                HelperService = __decorate([
                    core_1.Injectable(),
                    __metadata("design:paramtypes", [http_1.Http])
                ], HelperService);
                return HelperService;
            }());
            exports_1("HelperService", HelperService);
        }
    };
});

//# sourceMappingURL=Helper.js.map
