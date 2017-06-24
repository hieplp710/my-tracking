System.register(["@angular/core", "../../services/TrackingService"], function (exports_1, context_1) {
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
    var core_1, TrackingService_1, MapComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            }
        ],
        execute: function () {
            MapComponent = (function () {
                function MapComponent(trackingService) {
                    this.trackingService = trackingService;
                    this.title = 'My first AGM project';
                    this.lat = 51.678418;
                    this.lng = 7.809007;
                }
                ;
                MapComponent.prototype.onClick = function ($event) {
                    var latd = $event.coords.lat;
                    var long = $event.coords.lng;
                };
                ;
                MapComponent.prototype.ngOnInit = function () {
                    this.trackingService.getLocations('/tracking/get-locations').then(this.loadMarkers).catch(this.error);
                };
                MapComponent.prototype.loadMarkers = function (markers) {
                    this.allMarkers = markers;
                };
                MapComponent.prototype.error = function (resp) { };
                return MapComponent;
            }());
            MapComponent = __decorate([
                core_1.Component({
                    selector: 'map',
                    templateUrl: './app/map/components/map.component.html',
                    styleUrls: ['./app/map/components/map.css'],
                }),
                __metadata("design:paramtypes", [TrackingService_1.TrackingService])
            ], MapComponent);
            exports_1("MapComponent", MapComponent);
        }
    };
});

//# sourceMappingURL=map.component.js.map
