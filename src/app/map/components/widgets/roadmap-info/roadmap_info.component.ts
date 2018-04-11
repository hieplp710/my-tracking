/**
 * Created by hiepl on 08/04/2018.
 */

import {Component, OnInit, Input} from '@angular/core';
import { RoadmapInfo } from '../../../models/roadmap_info';

import $ from 'jquery';



@Component({
    selector: 'roadmap-info',
    templateUrl: './app/map/components/widgets/roadmap-info/roadmap_info.component.html'
})


export class RoadmapInfoComponent implements OnInit {
    title: string;
    @Input() isShow: boolean = false;
    error? : any = null;
    info: RoadmapInfo;
    constructor() {
        //this.options = new DatePickerOptions();
    };
    ngOnInit() {};
    showInfo(data : RoadmapInfo) {
        console.log(data, 'data');
        this.isShow = true;
        this.info = data;
    }
    hideInfo() {
        this.isShow = false;
    }
}
