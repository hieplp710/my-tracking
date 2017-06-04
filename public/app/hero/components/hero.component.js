System.register(["@angular/core", "../models/hero"], function (exports_1, context_1) {
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
    var core_1, hero_1, HeroComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (hero_1_1) {
                hero_1 = hero_1_1;
            }
        ],
        execute: function () {
            HeroComponent = (function () {
                function HeroComponent() {
                    this.hero = {
                        id: 1,
                        name: 'Windstorm',
                        superPower: "Fly in the space"
                    };
                }
                return HeroComponent;
            }());
            __decorate([
                core_1.Input(),
                __metadata("design:type", hero_1.Hero)
            ], HeroComponent.prototype, "hero", void 0);
            HeroComponent = __decorate([
                core_1.Component({
                    selector: 'hero',
                    templateUrl: './app/hero/components/hero.html'
                })
            ], HeroComponent);
            exports_1("HeroComponent", HeroComponent);
        }
    };
});

//# sourceMappingURL=hero.component.js.map
