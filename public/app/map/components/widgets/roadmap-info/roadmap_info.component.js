/**
 * Created by hiepl on 08/04/2018.
 */
System.register(["@angular/core"], function (exports_1, context_1) {
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
    var core_1, RoadmapInfoComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            }
        ],
        execute: function () {/**
             * Created by hiepl on 08/04/2018.
             */
            RoadmapInfoComponent = (function () {
                function RoadmapInfoComponent() {
                    this.isShow = false;
                    this.error = null;
                    //this.options = new DatePickerOptions();
                }
                ;
                RoadmapInfoComponent.prototype.ngOnInit = function () { };
                ;
                RoadmapInfoComponent.prototype.showInfo = function (data) {
                    console.log(data, 'data');
                    this.isShow = true;
                    this.info = data;
                };
                RoadmapInfoComponent.prototype.hideInfo = function () {
                    this.isShow = false;
                };
                __decorate([
                    core_1.Input(),
                    __metadata("design:type", Boolean)
                ], RoadmapInfoComponent.prototype, "isShow", void 0);
                RoadmapInfoComponent = __decorate([
                    core_1.Component({
                        selector: 'roadmap-info',
                        templateUrl: './app/map/components/widgets/roadmap-info/roadmap_info.component.html'
                    }),
                    __metadata("design:paramtypes", [])
                ], RoadmapInfoComponent);
                return RoadmapInfoComponent;
            }());
            exports_1("RoadmapInfoComponent", RoadmapInfoComponent);
        }
    };
});

//# sourceMappingURL=roadmap_info.component.js.map
