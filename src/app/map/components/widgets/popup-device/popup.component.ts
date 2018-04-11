/**
 * Created by hiepl on 7/5/2017.
 */

import {Component, ElementRef, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CookieService} from 'angular2-cookie/core';

import $ from 'jquery';
import {MyMarker} from "../../../models/marker";


@Component({
    selector: 'popup',
    templateUrl: './app/map/components/widgets/popup-device/popup.component.html'
})


export class PopupComponent implements OnInit, AfterViewInit {
    @ViewChild('popupbody') private popupContent: ElementRef;
    title: string;
    isShow: boolean = false;
    error? : any = null;
    dataPopup: any;
    deviceList: MyMarker[];
    constructor(private _cookieService:CookieService) {
        //this.options = new DatePickerOptions();
        this.title = 'Popup';
    };
    ngOnInit() {};
    ngAfterViewInit() {};
    contentBuilder(title: string, list: MyMarker[]) {
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
    togglePopup(isHide?: boolean) {
        let isHidden = isHide ? isHide : false;
        let username = $.trim($('#app-navbar-collapse a.dropdown-toggle').text());
        console.log(this._cookieService.get(username), 'this._cookieService.get(username)');
        if (this._cookieService.get(username) === undefined && !isHidden) {
            this.isShow = true;
            this._cookieService.put(username, 'shown');
        } else if (isHidden) {
            this.isShow = false;
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
