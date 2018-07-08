/**
 * Created by hiepl on 7/5/2017.
 */

import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { MyMarker } from '../models/marker';
import $ from 'jquery';


@Component({
    selector: 'device-control',
    templateUrl: './app/map/components/device.component.html',
    styleUrls: ['./app/map/components/device.css'],
})

export class DeviceComponent implements OnInit {
    @Input() listDevice : MyMarker[];
    @Input() is_radio? : boolean;
    @Output() onSelectedDevice = new EventEmitter();
    ngOnInit() {
        console.log("control is init");
    }
    onClick(marker : MyMarker, ev) {
        ev.stopPropagation();
        //check if checkbox is checked
        // var isChecked = $(ev.target).is(':checked');
        // marker.visible = isChecked;
        //pan to marker
        this.onSelectedDevice.emit(marker);
    };
    onEditDeviceName(item, $event) {
        $event.preventDefault();
        $event.stopPropagation();
        item.isEdit = true;
    };
    onSave(item, $event) {
        let keyCode = $event.which || $event.keyCode;
        if (keyCode === 13) {
            $.ajax({
                "url" :'/tracking/update-device-number',
                "method" : 'POST',
                "data" : {"device_id": item.deviceId, "name" : item.deviceNumber, "deviceNewId": item.deviceNewId},
                "success": function(resp) {
                    if (resp.status) {
                        if (resp.reload) {
                            window.location.reload();
                        }
                        item.isEdit = false;
                    } else {
                        alert(resp.error);
                        item.deviceNewId = item.deviceId;
                    }
                }
            });
        } else if (keyCode === 27) {
            item.isEdit = false;
        }
    }
    onSaveClick(item, $event) {
        $.ajax({
            "url" :'/tracking/update-device-number',
            "method" : 'POST',
            "data" : {"device_id": item.deviceId, "name" : item.deviceNumber, "deviceNewId": item.deviceNewId},
            "success": function(resp) {
                if (resp.status) {
                    if (resp.reload) {
                        window.location.reload();
                    }
                    item.isEdit = false;
                } else {
                    alert(resp.error);
                    item.deviceNewId = item.deviceId;
                }
            }
        });
    }
    onCancel(item, $event) {
        item.isEdit = false;
    }
}