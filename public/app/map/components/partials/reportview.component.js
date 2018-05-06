System.register(["@angular/core", "../../../services/Helper"], function (exports_1, context_1) {
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
    var core_1, Helper_1, GeneralReportComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (Helper_1_1) {
                Helper_1 = Helper_1_1;
            }
        ],
        execute: function () {
            GeneralReportComponent = (function () {
                function GeneralReportComponent(helper) {
                    this.helper = helper;
                    this.onSelectedDevice = new core_1.EventEmitter();
                    //this.options = new DatePickerOptions();
                }
                ;
                GeneralReportComponent.prototype.ngOnInit = function () {
                    console.log("report view init");
                    //for report
                };
                __decorate([
                    core_1.Input(),
                    __metadata("design:type", Object)
                ], GeneralReportComponent.prototype, "reportData", void 0);
                __decorate([
                    core_1.Output(),
                    __metadata("design:type", Object)
                ], GeneralReportComponent.prototype, "onSelectedDevice", void 0);
                GeneralReportComponent = __decorate([
                    core_1.Component({
                        selector: 'report-view',
                        templateUrl: './app/map/components/partials/generalreport.component.html',
                    }),
                    __metadata("design:paramtypes", [Helper_1.HelperService])
                ], GeneralReportComponent);
                return GeneralReportComponent;
            }());
            exports_1("GeneralReportComponent", GeneralReportComponent);
        }
    };
});

//# sourceMappingURL=reportview.component.js.map
