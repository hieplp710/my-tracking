System.register(["@angular/core", "../../services/TrackingService", "@agm/core", "jquery"], function (exports_1, context_1) {
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
    var core_1, TrackingService_1, core_2, jquery_1, MapComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            },
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {
            MapComponent = (function () {
                function MapComponent(trackingService, _mapsAPILoader) {
                    this.trackingService = trackingService;
                    this._mapsAPILoader = _mapsAPILoader;
                    this.title = 'My first AGM project';
                    this.lat = 10.820751;
                    this.lng = 106.630894;
                    this.internalInterval = null;
                }
                ;
                MapComponent.prototype.onClick = function ($event) {
                    var latd = $event.coords.lat;
                    var long = $event.coords.lng;
                };
                ;
                MapComponent.prototype.ngAfterViewInit = function () {
                    var _this = this;
                    this._mapsAPILoader.load().then(function () {
                        // _this.mapBounds = new google.maps.LatLngBounds();
                        // _this.mapBounds.extend(new google.maps.LatLng({"lat" : _this.lat, "lng" : _this.lng}));
                    });
                };
                MapComponent.prototype.ngOnInit = function () {
                    this.requestLocation();
                };
                ;
                MapComponent.prototype.requestLocation = function () {
                    var _this = this;
                    this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
                        then(function (locationObj) {
                        // console.log(markers.length, 'location markers');
                        if (_this.allMarkers === undefined) {
                            _this.allMarkers = locationObj.markers;
                        }
                        else {
                            var keys = Object.keys(locationObj.markers);
                            for (var i = 0; i < keys.length; i++) {
                                if (_this.allMarkers[keys[i]] !== undefined) {
                                    _this.allMarkers[keys[i]].locations = _this.allMarkers[keys[i]].locations
                                        .concat(locationObj.markers[keys[i]].locations);
                                }
                            }
                        }
                        _this.lastPoint = locationObj.lastPoint;
                        if (_this.internalInterval == null) {
                            _this.fetchMarkers(_this);
                        }
                    }, function (error) { });
                };
                MapComponent.prototype.fetchMarkers = function (context) {
                    //handler to markers
                    var _this = context;
                    _this.internalInterval = setInterval(function () {
                        var keys = Object.keys(_this.allMarkers);
                        for (var i = 0; i < keys.length; i++) {
                            var marker = _this.allMarkers[keys[i]];
                            _this.handleLocation(marker, _this);
                        }
                    }, 2000);
                };
                ;
                MapComponent.prototype.handleLocation = function (marker, context) {
                    /** handle for location */
                    if (context.mapBounds === undefined) {
                        context.mapBounds = new google.maps.LatLngBounds();
                    }
                    if (marker.locations.length > 1) {
                        var lt = marker.locations.shift();
                        marker.currentLocation = lt;
                        var coord = new google.maps.LatLng({ "lat": lt.lat, "lng": lt.lng });
                        if (context.mapBounds !== undefined) {
                            context.mapBounds.extend(coord);
                            console.log(context.mapBounds, 'context.mapBounds');
                        }
                    }
                    else {
                        context.requestLocation();
                    }
                };
                ;
                MapComponent.prototype.log = function (value) {
                    console.log(value);
                };
                MapComponent.prototype.toArray = function () {
                    if (this.allMarkers != null && this.allMarkers !== undefined) {
                        var keys = Object.keys(this.allMarkers);
                        console.log(this.allMarkers, 'to aray');
                        var arrs = [];
                        for (var i = 0; i < keys.length; i++) {
                            var temp = this.allMarkers[keys[i]];
                            arrs.push(temp);
                        }
                        return arrs;
                    }
                    else {
                        return [];
                    }
                };
                MapComponent.prototype.onMapReady = function ($event) {
                    console.log($event, 'map event');
                    if (this.mapBounds !== undefined) {
                        //google.map.fitBounds(this.mapBounds);
                    }
                    var height = jquery_1.default(window).height() - 120;
                    jquery_1.default('agm-map').css({ "height": height + "px" });
                };
                return MapComponent;
            }());
            MapComponent = __decorate([
                core_1.Component({
                    selector: 'map',
                    templateUrl: './app/map/components/map.component.html',
                    styleUrls: ['./app/map/components/map.css'],
                }),
                __metadata("design:paramtypes", [TrackingService_1.TrackingService, core_2.MapsAPILoader])
            ], MapComponent);
            exports_1("MapComponent", MapComponent);
            // create new class to handle all change of marker called cluster
            // each changing literal, market will be change current location so that their position on map will be changed 
        }
    };
});

//# sourceMappingURL=map.component.js.map
