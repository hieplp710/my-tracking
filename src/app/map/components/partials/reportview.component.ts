/**
 * Created by hiepl on 4/15/2018.
 */
import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import $ from 'jquery';
import {HelperService} from "../../../services/Helper";

@Component({
    selector: 'report-view',
    templateUrl: './app/map/components/partials/generalreport.component.html',
})

export class GeneralReportComponent implements OnInit {
    @Input() reportData : any;
    @Output() onSelectedDevice = new EventEmitter();
    constructor(private helper: HelperService) {
        //this.options = new DatePickerOptions();
    };
    ngOnInit() {
        console.log("report view init");
        //for report
    }
}