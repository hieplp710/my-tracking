/**
 * Created by hiepl on 7/5/2017.
 */

import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CookieService} from 'angular2-cookie/core';

import $ from 'jquery';


@Component({
    selector: 'popup',
    templateUrl: './app/map/components/widgets/popup.component.html'
})


export class PopupComponent implements OnInit, AfterViewInit {
    @ViewChild('popupbody') private popupContent: ElementRef;
    title: string;
    isShow: boolean = false;
    error? : any = null;
    dataPopup: any;
    constructor(private _cookieService:CookieService) {
        //this.options = new DatePickerOptions();
        this.title = 'Popup';
    };
    ngOnInit() {};
    ngAfterViewInit() {};
    contentBuilder(data: any) {
        if (data) {
            //build data for popup
            if (data.title) {
                this.title = data.title;
            }
            //this.popupBody.nativeElement.innerHTML = '<h1>bla bla bla</h1>';
            if (data.devices) {
                this.dataPopup = data.devices;
            }
        }
    };
    togglePopup(isHide?: boolean) {
        let isHidden = isHide ? isHide : false;
        this.isShow = !isHidden;
        let username = $.trim($('#app-navbar-collapse a.dropdown-toggle').text());
        console.log(this._cookieService.get(username), 'this._cookieService.get(username)');
        if (this.isShow && this.popupContent !== undefined && this._cookieService.get(username) === undefined) {
            var dom = '';
            for (var i = 0; i < this.dataPopup.length; i++) {
                var marker = this.dataPopup[i];
                dom += '<li class="warning-text">Thiết bị ' + marker.deviceNumber + ' sẽ hết hạn vào ngày ' + marker.expiredDate + '</li>';
            }
            this.popupContent.nativeElement.innerHTML = '<ul>' + dom + '</ul>';
            this._cookieService.put(username, 'shown');
        }
    }
    onToggleModal() {
        let overlay = $('<div class="overlay open"></div>');
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
}
