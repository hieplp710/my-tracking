/**
 * Created by hiepl on 4/15/2018.
 */
import {Component, Input, OnInit, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import $ from 'jquery';
import {HelperService} from "../../../services/Helper";

@Component({
    selector: 'report-view',
    templateUrl: './app/map/components/partials/reportview.component.html',
})

export class ReportViewComponent implements OnInit {
    @Input() reportData : any;
    @Output() onSelectedDevice = new EventEmitter();
    @ViewChild('reportContent') reportContent : ElementRef;
    constructor(private helper: HelperService) {
        //this.options = new DatePickerOptions();
    };
    ngOnInit() {
        console.log(this.reportContent, "report view init");
        //for report
    }
    getResume() {
        if (!this.reportData.resume === undefined || this.reportData.data === undefined || this.reportData.data.length === 0) {
            return false;
        }
        //check colspan
        let index = 0;
        let resumeCol = Object.keys(this.reportData.resume);
        for (var i = 0; i < this.reportData.columns.length; i++) {
            if (this.reportData.columns[i] === resumeCol[0]) {
                //first check 1 resume
                index = i;
                break;
            }
        }
        return {"resumeIndex": index, "resumeValue" : this.reportData.resume[resumeCol[0]]};
    }
}