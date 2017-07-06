/**
 * Created by hiepl on 7/5/2017.
 */
System.register(["@angular/core", "jquery"], function (exports_1, context_1) {
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
    var core_1, jquery_1, DeviceComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {/**
             * Created by hiepl on 7/5/2017.
             */
            DeviceComponent = (function () {
                function DeviceComponent() {
                }
                DeviceComponent.prototype.ngOnInit = function () {
                    console.log("control is init");
                };
                DeviceComponent.prototype.onClick = function (marker, ev) {
                    ev.stopPropagation();
                    console.log(ev, 'ev');
                    //check if checkbox is checked
                    var isChecked = jquery_1.default(ev.target).is(':checked');
                    marker.visible = isChecked;
                };
                return DeviceComponent;
            }());
            __decorate([
                core_1.Input(),
                __metadata("design:type", Array)
            ], DeviceComponent.prototype, "listDevice", void 0);
            DeviceComponent = __decorate([
                core_1.Component({
                    selector: 'device-control',
                    templateUrl: './app/map/components/device.component.html',
                    styleUrls: ['./app/map/components/device.css'],
                })
            ], DeviceComponent);
            exports_1("DeviceComponent", DeviceComponent);
        }
    };
});

//# sourceMappingURL=device.component.js.map
