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
                TrackingService.prototype.getLocations = function (url, lastPoint, options) {
                    //send to server in order to know which location that we returned
                    this.lastPoint = (lastPoint !== undefined && lastPoint != null) ? this.createTimeByString(lastPoint.last_point) : false;
                    var _this = this;
                    var opts = options ? options : { "isRoadmap": false };
                    var is_roadmap = opts.isRoadmap;
                    console.log(options, 'options');
                    var data = { "options": {
                            "lastPoint": lastPoint,
                            "isRoadmap": false
                        } };
                    if (is_roadmap) {
                        data["options"]['isRoadmap'] = true;
                        data["options"]['dateFrom'] = opts.dateFrom;
                        data["options"]['dateTo'] = opts.dateTo;
                        data["options"]['deviceId'] = opts.deviceId;
                        data["options"]['nextLoc'] = opts.nextLoc ? opts.nextLoc : null;
                    }
                    else {
                        data["options"]['lastLocation'] = options.lastLocation !== undefined ? options.lastLocation : {};
                    }
                    return this.http.post(url, data).toPromise()
                        .then(function (value) {
                        return _this.extractData(value);
                    })
                        .catch(this.handleError);
                };
                ;
                TrackingService.prototype.extractData = function (value) {
                    var body = value.json();
                    var locationObject;
                    // console.log(this.lastPoint, 'this.lastPoint');
                    if (body.status) {
                        var markers = {};
                        for (var i = 0; i < body.data.length; i++) {
                            var temp = body.data[i];
                            var marker = {
                                deviceId: temp.device_id,
                                deviceNumber: temp.device_number,
                                currentLocation: null,
                                visible: true,
                                isEdit: false,
                                locations: []
                            };
                            var locs = [];
                            for (var j = 0; j < temp.locations.length; j++) {
                                var loc = temp.locations[j];
                                var locTime = this.createTimeByString(loc.last_point);
                                if (!this.lastPoint || locTime >= this.lastPoint) {
                                    var newLoc = {
                                        lat: parseFloat(loc.lat),
                                        lng: parseFloat(loc.lng),
                                        state: loc.current_state !== undefined ? loc.current_state : '',
                                        status: loc.status,
                                        time: loc.created_at,
                                        time_original: loc.created_at_org,
                                        velocity: loc.velocity,
                                        headingClass: loc.heading,
                                        lastTime: loc.last_point
                                    };
                                    locs.push(newLoc);
                                }
                                if (i === 0 && (!this.lastPoint || locTime >= this.lastPoint)) {
                                    marker.currentLocation = loc;
                                }
                            }
                            ;
                            marker.locations = locs;
                            markers[temp.device_id] = marker;
                        }
                        locationObject = {
                            markers: markers,
                            lastPoint: body.last_points,
                            hasMore: body.hasMore
                        };
                        return locationObject;
                    }
                    return [];
                };
                ;
                TrackingService.prototype.handleError = function () { };
                ;
                TrackingService.prototype.createTimeByString = function (date) {
                    var lastTime = date.split('-');
                    var datetime = new Date();
                    if (lastTime.length > 0) {
                        var time_date = lastTime[2].split(' ');
                        var time_parts = time_date[1].split(':');
                        datetime.setFullYear(parseInt(lastTime[0], 10));
                        datetime.setMonth(parseInt(lastTime[1], 10) - 1);
                        datetime.setDate(parseInt(time_date[0], 10));
                        datetime.setHours(parseInt(time_parts[0], 10));
                        datetime.setMinutes(parseInt(time_parts[1], 10));
                        datetime.setSeconds(parseInt(time_parts[2], 10));
                    }
                    return datetime;
                };
                ;
                TrackingService.prototype.getUserProfile = function () {
                    var _this = this;
                    return this.http.get('/user/profile').toPromise().then(function (value) {
                        return _this.responseProfile(value);
                    }).catch(this.handleError);
                };
                ;
                TrackingService.prototype.responseProfile = function (value) {
                    var body = value.json();
                    if (body.status) {
                        return body.data;
                    }
                    return false;
                };
                TrackingService.prototype.saveUserProfile = function (data) {
                    var _this = this;
                    return this.http.post('/user/save-profile', data).toPromise().then(function (value) {
                        return _this.responseProfile(value);
                    }).catch(this.handleError);
                };
                TrackingService = __decorate([
                    core_1.Injectable(),
                    __metadata("design:paramtypes", [http_1.Http])
                ], TrackingService);
                return TrackingService;
            }());
            exports_1("TrackingService", TrackingService);
        }
    };
});

//# sourceMappingURL=TrackingService.js.map
