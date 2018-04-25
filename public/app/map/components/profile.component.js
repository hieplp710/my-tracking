/**
 * Created by hiepl on 7/5/2017.
 */
System.register(["@angular/core", "../../services/TrackingService", "jquery"], function (exports_1, context_1) {
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
    var core_1, TrackingService_1, jquery_1, ProfileComponent, Profile;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {/**
             * Created by hiepl on 7/5/2017.
             */
            ProfileComponent = (function () {
                function ProfileComponent(trackingService) {
                    this.trackingService = trackingService;
                    this.isShow = false;
                    this.profileData = new Profile();
                    this.error = null;
                    //this.options = new DatePickerOptions();
                }
                ;
                ProfileComponent.prototype.ngOnInit = function () {
                    var _this = this;
                    jquery_1.default('#btnProfile').on('click', function (e) {
                        e.preventDefault();
                        _this.trackingService.getUserProfile().then(function (resp) {
                            if (resp) {
                                _this.profile = resp;
                                _this.isShow = true;
                                _this.profileData.phone = _this.profile.phone;
                                _this.profileData.name = _this.profile.name;
                                _this.profileData.email = _this.profile.email;
                                _this.onToggleModal();
                            }
                        });
                    });
                };
                ;
                ProfileComponent.prototype.onToggleModal = function () {
                    var overlay = jquery_1.default('<div class="overlay open"></div>');
                    if (this.isShow) {
                        jquery_1.default('body').append(overlay);
                    }
                    else {
                        jquery_1.default('div.overlay').remove();
                    }
                };
                ;
                ProfileComponent.prototype.onClick = function ($event) {
                    this.isShow = false;
                    this.onToggleModal();
                };
                ;
                ProfileComponent.prototype.onSaveProfile = function ($event) {
                    //validate and post data
                    var _this = this;
                    this.error = this.profileData.validate();
                    this.trackingService.saveUserProfile({ "data": this.profileData }).then(function () {
                        //success
                        _this.isShow = false;
                        window.location.reload();
                    }, function (err) {
                        //error
                    });
                };
                ;
                ProfileComponent = __decorate([
                    core_1.Component({
                        selector: 'profile',
                        templateUrl: './app/map/components/profile.component.html'
                    }),
                    __metadata("design:paramtypes", [TrackingService_1.TrackingService])
                ], ProfileComponent);
                return ProfileComponent;
            }());
            exports_1("ProfileComponent", ProfileComponent);
            Profile = (function () {
                function Profile() {
                }
                Profile.prototype.validate = function () {
                    var errs = {};
                    var isValid = true;
                    var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
                    if (jquery_1.default.trim(this.name) === '') {
                        errs['name'] = "Tên không được để trống!";
                        isValid = false;
                    }
                    if (jquery_1.default.trim(this.phone) === '' || jquery_1.default.trim(this.phone).length < 10 || !jquery_1.default.isNumeric(this.phone)) {
                        errs['phone'] = "Số điện thoại phải từ 10 số!";
                        isValid = false;
                    }
                    if (this.email && !pattern.test(this.email)) {
                        errs['email'] = "Sai định dạng email!";
                        isValid = false;
                    }
                    if (jquery_1.default.trim(this.password) !== '' && jquery_1.default.trim(this.password).length < 6) {
                        errs['password'] = "Mật khẩu phải trên 6 ký tự";
                        isValid = false;
                    }
                    if (jquery_1.default.trim(this.password) !== jquery_1.default.trim(this.confirmPassword)) {
                        errs['confirmPassword'] = "Mật khẩu và xác nhận không khớp!";
                        isValid = false;
                    }
                    if (!isValid) {
                        return errs;
                    }
                    return null;
                };
                return Profile;
            }());
        }
    };
});

//# sourceMappingURL=profile.component.js.map
