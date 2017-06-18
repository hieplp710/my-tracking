System.register(["@angular/core"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, MapComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {
            MapComponent = (function () {
                function MapComponent() {
                    this.title = 'My first AGM project';
                    this.lat = 51.678418;
                    this.lng = 7.809007;
                    this.allMarkers = [
                        { lat: 51.678418, lng: 7.809007, name: "Exist marker" }
                    ];
                }
                MapComponent.prototype.onClick = function ($event) {
                    console.log($event);
                    var latd = $event.coords.lat;
                    var long = $event.coords.lng;
                    var newMarker = {
                        lat: latd,
                        lng: long,
                        name: "New Marker"
                    };
                    this.allMarkers.push(newMarker);
                };
                ;
                return MapComponent;
            }());
            MapComponent = __decorate([
                core_1.Component({
                    selector: 'map',
                    templateUrl: './app/map/components/map.component.html',
                    styleUrls: ['./app/map/components/map.css'],
                })
            ], MapComponent);
            exports_1("MapComponent", MapComponent);
        }
    };
});

//# sourceMappingURL=map.component.js.map
