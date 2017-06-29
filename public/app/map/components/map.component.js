System.register(["@angular/core", "../../services/TrackingService", "@agm/core"], function (exports_1, context_1) {
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
    var core_1, TrackingService_1, core_2, MapComponent;
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
            }
        ],
        execute: function () {
            MapComponent = (function () {
                function MapComponent(trackingService, _mapsAPILoader) {
                    this.trackingService = trackingService;
                    this._mapsAPILoader = _mapsAPILoader;
                    this.title = 'My first AGM project';
                    this.lat = 10.828264;
                    this.lng = 106.643006;
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
                        _this.mapBounds = google.maps.LatLngBounds();
                    });
                };
                MapComponent.prototype.ngOnInit = function () {
                    this.requestLocation();
                };
                ;
                MapComponent.prototype.requestLocation = function () {
                    console.log(this, 'this');
                    var _this = this;
                    this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
                        then(function (locationObj) {
                        // console.log(markers.length, 'location markers');
                        console.log(locationObj, 'locationObj');
                        _this.allMarkers = locationObj.markers;
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
                        for (var i = 0; i < _this.allMarkers.length; i++) {
                            var marker = _this.allMarkers[i];
                            console.log(marker, 'marker in loop');
                            _this.handleLocation(marker, _this);
                        }
                    }, 2000);
                };
                ;
                MapComponent.prototype.handleLocation = function (marker, context) {
                    /** handle for location */
                    console.log(google, 'shit google');
                    if (marker.locations.length > 1) {
                        var lt = marker.locations.shift();
                        marker.currentLocation = lt;
                        console.log(context.allMarkers, 'marker.currentLocation');
                        var latLng = new google.maps.LatLng(lt.lat, lt.lng);
                        if (context.mapBounds !== undefined) {
                            context.mapBounds.extend(latLng);
                        }
                    }
                    else {
                        context.requestLocation();
                    }
                };
                ;
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
