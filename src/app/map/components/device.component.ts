/**
 * Created by hiepl on 7/5/2017.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLngBounds, MapsAPILoader, LatLng} from '@agm/core';
import $ from 'jquery';


@Component({
    selector: 'device-control',
    templateUrl: './app/map/components/device.component.html',
    styleUrls: ['./app/map/components/device.css'],
})

export class DeviceComponent implements OnInit {
    @Input() listDevice : MyMarker[];
    ngOnInit() {
        console.log("control is init");
    }
    onClick(marker : MyMarker, ev) {
        ev.stopPropagation();
        console.log(ev, 'ev');
        //check if checkbox is checked
        var isChecked = $(ev.target).is(':checked');
        marker.visible = isChecked;
    }
}