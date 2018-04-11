/**
 * Created by hiepl on 7/5/2017.
 */
System.register(["@angular/core", "angular2-cookie/core", "jquery"], function (exports_1, context_1) {
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
    var core_1, core_2, jquery_1, PopupComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {/**
             * Created by hiepl on 7/5/2017.
             */
            PopupComponent = (function () {
                function PopupComponent(_cookieService) {
                    this._cookieService = _cookieService;
                    this.isShow = false;
                    this.error = null;
                    //this.options = new DatePickerOptions();
                    this.title = 'Popup';
                }
                ;
                PopupComponent.prototype.ngOnInit = function () { };
                ;
                PopupComponent.prototype.ngAfterViewInit = function () { };
                ;
                PopupComponent.prototype.contentBuilder = function (title, list) {
                    if (list) {
                        //build data for popup
                        if (title) {
                            this.title = title;
                        }
                        //this.popupBody.nativeElement.innerHTML = '<h1>bla bla bla</h1>';
                        if (list) {
                            this.deviceList = list;
                        }
                    }
                };
                ;
                PopupComponent.prototype.togglePopup = function (isHide) {
                    var isHidden = isHide ? isHide : false;
                    var username = jquery_1.default.trim(jquery_1.default('#app-navbar-collapse a.dropdown-toggle').text());
                    console.log(this._cookieService.get(username), 'this._cookieService.get(username)');
                    if (this._cookieService.get(username) === undefined && !isHidden) {
                        this.isShow = true;
                        this._cookieService.put(username, 'shown');
                    }
                    else if (isHidden) {
                        this.isShow = false;
                    }
                };
                PopupComponent.prototype.onToggleModal = function () {
                    var overlay = jquery_1.default('<div class="overlay open"></div>');
                    if (this.isShow) {
                        jquery_1.default('body').append(overlay);
                    }
                    else {
                        jquery_1.default('div.overlay').remove();
                    }
                };
                ;
                PopupComponent.prototype.onClick = function ($event) {
                    this.isShow = false;
                    this.onToggleModal();
                };
                ;
                __decorate([
                    core_1.ViewChild('popupbody'),
                    __metadata("design:type", core_1.ElementRef)
                ], PopupComponent.prototype, "popupContent", void 0);
                PopupComponent = __decorate([
                    core_1.Component({
                        selector: 'popup',
                        templateUrl: './app/map/components/widgets/popup-device/popup.component.html'
                    }),
                    __metadata("design:paramtypes", [core_2.CookieService])
                ], PopupComponent);
                return PopupComponent;
            }());
            exports_1("PopupComponent", PopupComponent);
        }
    };
});

//# sourceMappingURL=popup.component.js.map
