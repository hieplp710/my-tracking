/**
 * Created by hiepl on 7/5/2017.
 */

import {Component, OnInit} from '@angular/core';
import { TrackingService } from "../../services/TrackingService";
import $ from 'jquery';


@Component({
    selector: 'profile',
    templateUrl: './app/map/components/profile.component.html'
})

export class ProfileComponent implements OnInit {
    profile: any;
    isShow: boolean = false;
    profileData: Profile = new Profile();
    error? : any = null;
    constructor(private trackingService: TrackingService) {
        //this.options = new DatePickerOptions();
    };
    ngOnInit() {
        let _this = this;
        $('#btnProfile').on('click', function(e){
           e.preventDefault();
           _this.trackingService.getUserProfile().then(function(resp){
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
    onToggleModal() {
        let overlay = $('<div class="overlay"></div>');
        if (this.isShow) {
            $('body').append(overlay);
        } else {
            $('div.overlay').remove();
        }
    };
    onClick($event) {
        this.isShow = false;
        this.onToggleModal();
    };
    onSaveProfile($event) {
        //validate and post data
        let _this = this;
        this.error = this.profileData.validate();
        this.trackingService.saveUserProfile({"data":this.profileData}).then(function(){
            //success
            _this.isShow = false;
            window.location.reload();
        }, function (err) {
            //error
        });
    };
}

class Profile {
    username : string;
    name: string;
    phone : string;
    email?: string;
    password? : string;
    confirmPassword?: string;
    public validate() {
        let errs = {};
        let isValid = true;
        let pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        if ($.trim(this.name) === '') {
            errs['name'] = "Tên không được để trống!";
            isValid = false;
        }
        if ($.trim(this.phone) === '' || $.trim(this.phone).length < 10 || !$.isNumeric(this.phone)) {
            errs['phone'] = "Số điện thoại phải từ 10 số!";
            isValid = false;
        }
        if (this.email && !pattern.test(this.email)) {
            errs['email'] = "Sai định dạng email!";
            isValid = false;
        }
        if ($.trim(this.password) !== '' && $.trim(this.password).length < 6 ) {
            errs['password'] = "Mật khẩu phải trên 6 ký tự";
            isValid = false;
        }
        if ($.trim(this.password) !== $.trim(this.confirmPassword) ) {
            errs['confirmPassword'] = "Mật khẩu và xác nhận không khớp!";
            isValid = false;
        }
        if (!isValid) {
            return errs;
        }
        return null;
    }
}