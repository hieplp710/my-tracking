System.register(["@angular/core", "@angular/http", "rxjs/add/operator/toPromise", "rxjs/add/operator/catch", "rxjs/add/operator/map"], function (exports_1, context_1) {
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
    var core_1, http_1, TrackingService;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
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
                    this.urlLocation = "/tracking/get-locations";
                }
                TrackingService.prototype.getLocations = function (url, lastPoint) {
                    //send to server in order to know which location that we returned
                    return this.http.post(url, { "lastPoint": lastPoint }).toPromise()
                        .then(this.extractData)
                        .catch(this.handleError);
                };
                ;
                TrackingService.prototype.extractData = function (value) {
                    var body = value.json();
                    var locationObject;
                    if (body.status) {
                        var markers = {};
                        for (var i = 0; i < body.data.length; i++) {
                            var temp = body.data[i];
                            var marker = {
                                deviceId: temp.device_id,
                                deviceNumber: temp.device_number,
                                currentLocation: null,
                                visible: true,
                                locations: []
                            };
                            var locs = [];
                            for (var j = 0; j < temp.locations.length; j++) {
                                var loc = temp.locations[j];
                                var newLoc = {
                                    lat: parseFloat(loc.lat),
                                    lng: parseFloat(loc.lng),
                                    state: 'N/A',
                                    status: (loc.status > 0 ? 'On' : 'Off'),
                                    time: loc.created_at,
                                    velocity: loc.velocity,
                                };
                                locs.push(newLoc);
                                if (i === 0) {
                                    marker.currentLocation = loc;
                                }
                            }
                            ;
                            marker.locations = locs;
                            markers[temp.device_id] = marker;
                        }
                        locationObject = {
                            markers: markers,
                            lastPoint: body.last_points
                        };
                        console.log(locationObject, 'locationObject');
                        return locationObject;
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
