System.register(["@angular/core", "jquery", "../../../services/TrackingService", "../../../services/Helper"], function (exports_1, context_1) {
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
    var core_1, jquery_1, TrackingService_1, Helper_1, GeneralReportComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            },
            function (Helper_1_1) {
                Helper_1 = Helper_1_1;
            }
        ],
        execute: function () {
            GeneralReportComponent = (function () {
                function GeneralReportComponent(trackingService, helper) {
                    this.trackingService = trackingService;
                    this.helper = helper;
                    this.onSelectedDevice = new core_1.EventEmitter();
                    //this.options = new DatePickerOptions();
                }
                ;
                GeneralReportComponent.prototype.ngOnInit = function () {
                    console.log("General report init");
                    //for report
                    this.date_from_report = new Date();
                    this.date_from_report.setHours(0);
                    this.date_from_report.setMinutes(0);
                    this.date_from_report.setSeconds(0);
                    this.date_to_report = new Date();
                    this.date_to_report.setHours(23);
                    this.date_to_report.setMinutes(59);
                    this.date_to_report.setSeconds(59);
                    if (this.selectedDevice == null) {
                        this.selectedDevice = this.listDevice[0];
                    }
                };
                GeneralReportComponent.prototype.onDeviceSelected = function ($event) {
                    this.selectedDevice = $event;
                };
                GeneralReportComponent.prototype.onViewReport = function ($event) {
                    if (this.selectedDevice == null) {
                        this.selectedDevice = this.listDevice[0];
                    }
                    var startDate = this.helper.formatDateTime(this.date_from_report);
                    var endDate = this.helper.formatDateTime(this.date_to_report);
                    var deviceId = this.selectedDevice.deviceId;
                    var url = '/report/general-report?startDate=' + startDate + "&endDate=" + endDate + "&deviceId=" + deviceId;
                    this.download_url = url;
                    jquery_1.default('#aDownload').attr('href', url);
                    setTimeout(function () {
                        jquery_1.default('#aDownload')[0].click();
                    }, 200);
                };
                __decorate([
                    core_1.Input(),
                    __metadata("design:type", Array)
                ], GeneralReportComponent.prototype, "listDevice", void 0);
                __decorate([
                    core_1.Output(),
                    __metadata("design:type", Object)
                ], GeneralReportComponent.prototype, "onSelectedDevice", void 0);
                GeneralReportComponent = __decorate([
                    core_1.Component({
                        selector: 'general-report',
                        templateUrl: './app/map/components/partials/generalreport.component.html',
                    }),
                    __metadata("design:paramtypes", [TrackingService_1.TrackingService, Helper_1.HelperService])
                ], GeneralReportComponent);
                return GeneralReportComponent;
            }());
            exports_1("GeneralReportComponent", GeneralReportComponent);
        }
    };
});

//# sourceMappingURL=generalreport.component.js.map
