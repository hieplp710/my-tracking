System.register(["@angular/core", "@angular/platform-browser", "@angular/common", "@angular/forms", "./app.component", "@agm/core", "./map/components/map.component", "@angular/http", "./services/TrackingService", "./map/components/device.component", "./map/components/profile.component", "@ngui/datetime-picker", "ng2-nouislider/src/nouislider", "./map/components/widgets/popup-device/popup.component", "angular2-cookie/services/cookies.service", "./map/components/widgets/roadmap-info/roadmap_info.component", "./services/Helper", "./map/components/partials/generalreport.component"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, platform_browser_1, common_1, forms_1, app_component_1, core_2, map_component_1, http_1, TrackingService_1, device_component_1, profile_component_1, datetime_picker_1, nouislider_1, popup_component_1, cookies_service_1, roadmap_info_component_1, Helper_1, generalreport_component_1, AppModule;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (common_1_1) {
                common_1 = common_1_1;
            },
            function (forms_1_1) {
                forms_1 = forms_1_1;
            },
            function (app_component_1_1) {
                app_component_1 = app_component_1_1;
            },
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (map_component_1_1) {
                map_component_1 = map_component_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            },
            function (device_component_1_1) {
                device_component_1 = device_component_1_1;
            },
            function (profile_component_1_1) {
                profile_component_1 = profile_component_1_1;
            },
            function (datetime_picker_1_1) {
                datetime_picker_1 = datetime_picker_1_1;
            },
            function (nouislider_1_1) {
                nouislider_1 = nouislider_1_1;
            },
            function (popup_component_1_1) {
                popup_component_1 = popup_component_1_1;
            },
            function (cookies_service_1_1) {
                cookies_service_1 = cookies_service_1_1;
            },
            function (roadmap_info_component_1_1) {
                roadmap_info_component_1 = roadmap_info_component_1_1;
            },
            function (Helper_1_1) {
                Helper_1 = Helper_1_1;
            },
            function (generalreport_component_1_1) {
                generalreport_component_1 = generalreport_component_1_1;
            }
        ],
        execute: function () {
            AppModule = (function () {
                function AppModule() {
                }
                AppModule = __decorate([
                    core_1.NgModule({
                        imports: [
                            platform_browser_1.BrowserModule,
                            http_1.HttpModule,
                            common_1.CommonModule,
                            forms_1.FormsModule,
                            datetime_picker_1.NguiDatetimePickerModule,
                            core_2.AgmCoreModule.forRoot({
                                apiKey: 'AIzaSyC6wjnpjfBcfyyQYpnuXDKEzKombAnFdjc',
                                libraries: ['places']
                            }),
                            nouislider_1.NouisliderModule
                        ],
                        declarations: [
                            app_component_1.AppComponent,
                            map_component_1.MapComponent,
                            device_component_1.DeviceComponent,
                            profile_component_1.ProfileComponent,
                            popup_component_1.PopupComponent,
                            roadmap_info_component_1.RoadmapInfoComponent,
                            generalreport_component_1.GeneralReportComponent
                        ],
                        providers: [
                            http_1.HttpModule,
                            TrackingService_1.TrackingService,
                            cookies_service_1.CookieService,
                            Helper_1.HelperService
                        ],
                        bootstrap: [app_component_1.AppComponent]
                    })
                ], AppModule);
                return AppModule;
            }());
            exports_1("AppModule", AppModule);
        }
    };
});

//# sourceMappingURL=app.module.js.map