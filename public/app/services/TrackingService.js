System.register(["@angular/core", "../map/models/marker", "@angular/http", "rxjs/add/operator/toPromise", "rxjs/add/operator/catch", "rxjs/add/operator/map"], function (exports_1, context_1) {
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
    var core_1, marker_1, http_1, TrackingService;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (marker_1_1) {
                marker_1 = marker_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {
            },
            function (_2) {
            },
            function (_3) {
            }
        ],
        execute: function () {
            TrackingService = (function () {
                function TrackingService(http) {
                    this.http = http;
                }
                TrackingService.prototype.getLocations = function (url) {
                    return this.http.post(url, {}).toPromise()
                        .then(this.extractData)
                        .catch(this.handleError);
                };
                ;
                TrackingService.prototype.extractData = function (value) {
                    var body = value.json();
                    if (body.length > 0) {
                        var markers = [];
                        for (var i = 0; i < body.length; i++) {
                            var temp = body[i];
                            var marker = new marker_1.Marker();
                            marker.deviceId = temp.device_id;
                            marker.deviceNumber = temp.device_number;
                            var locs = [];
                            for (var j = 0; j < temp.locations.length; j++) {
                                var loc = temp.locations[j];
                                var newLoc = {
                                    lat: loc.lat,
                                    lng: loc.lng,
                                    state: 'N/A',
                                    status: (loc.status > 0 ? 'On' : 'Off'),
                                    time: loc.created_at,
                                    velocity: loc.velocity,
                                };
                                locs.push(newLoc);
                            }
                            ;
                            marker.locations = locs;
                            markers.push(marker);
                        }
                        return markers;
                    }
                    return [];
                };
                ;
                TrackingService.prototype.handleError = function () { };
                ;
                return TrackingService;
            }());
            TrackingService = __decorate([
                core_1.Injectable(),
                __metadata("design:paramtypes", [http_1.Http])
            ], TrackingService);
            exports_1("TrackingService", TrackingService);
        }
    };
});

//# sourceMappingURL=TrackingService.js.map
