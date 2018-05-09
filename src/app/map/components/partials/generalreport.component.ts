/**
 * Created by hiepl on 4/15/2018.
 */
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { MyMarker } from '../../models/marker';
import $ from 'jquery';
import {TrackingService} from "../../../services/TrackingService";
import {HelperService} from "../../../services/Helper";
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';

@Component({
    selector: 'general-report',
    templateUrl: './app/map/components/partials/generalreport.component.html',
})

export class GeneralReportComponent implements OnInit {
    @Input() listDevice : MyMarker[];
    @Output() onViewReportEvent = new EventEmitter();
    selectedDevice : MyMarker;
    date_from_report : Date;
    date_to_report: Date;
    download_url: string;
    constructor(private trackingService: TrackingService, private helper: HelperService) {
        //this.options = new DatePickerOptions();
    };
    ngOnInit() {
        console.log("General report init");
        //for report
        this.date_from_report = new Date();
        this.date_from_report.setHours(0);
        this.date_from_report.setMinutes(0);
        this.date_from_report.setSeconds(0);

        this.date_to_report = new Date();
        this.date_to_report.setHours(23);
        this.date_to_report.setMinutes(59);
        this.date_to_report.setSeconds(59);
        if (this.selectedDevice == null) {
            this.selectedDevice = this.listDevice[0];
        }
    }
    onDeviceSelected($event) {
        this.selectedDevice = $event;
    }
    onExportReport($event) {
        if (this.selectedDevice == null) {
            this.selectedDevice = this.listDevice[0];
        }
        let startDate = this.helper.formatDateTime(this.date_from_report);
        let endDate = this.helper.formatDateTime(this.date_to_report);
        let deviceId = this.selectedDevice.deviceId;

        let url = '/report/general-report?startDate=' + startDate + "&endDate=" + endDate + "&deviceId=" + deviceId;
        this.download_url = url;
        // $('#aDownload').attr('href', url);
        // setTimeout(function(){
        //     $('#aDownload')[0].click();
        // }, 200);
        window.location.href = url;
    }
    onViewReport($event) {
        if (this.selectedDevice == null) {
            this.selectedDevice = this.listDevice[0];
        }
        let startDate = this.helper.formatDateTime(this.date_from_report);
        let endDate = this.helper.formatDateTime(this.date_to_report);
        let deviceId = this.selectedDevice.deviceId;
        this.onViewReportEvent.emit({
            startDate: startDate,
            endDate: endDate,
            deviceId: deviceId
        });
    }
}