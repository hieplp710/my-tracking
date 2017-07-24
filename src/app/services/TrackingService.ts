/**
 * Created by hiepl on 6/24/2017.
 */
import { Injectable } from '@angular/core';
import {MyMarker, LocationObj} from "../map/models/marker";
import {Http, Response} from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Location} from "../map/models/Location";


@Injectable()
export class TrackingService {
    constructor (private http: Http) {}
    lastPoint : any;
    urlLocation: string = "/tracking/get-locations";
    getLocations(url : string, lastPoint? : any, options? : any): Promise<any> {
        //send to server in order to know which location that we returned
        this.lastPoint = (lastPoint !== undefined && lastPoint != null) ? this.createTimeByString(lastPoint.last_point) : false;
        let _this = this;
        let opts = options ? options : {"isRoadmap":false};
        let is_roadmap = opts.isRoadmap;
        let data = {"options":{
            "lastPoint":lastPoint,
            "isRoadmap":false
        }};
        if (is_roadmap) {
            data["options"]['isRoadmap'] = true;
            data["options"]['dateFrom'] = opts.dateFrom;
            data["options"]['dateTo'] = opts.dateTo;
            data["options"]['deviceId'] = opts.deviceId;
        }
        return this.http.post(url, data).toPromise()
            .then(function(value){
                return _this.extractData(value);
            })
            .catch(this.handleError);
    };
    extractData(value: Response) {
        let body = value.json();
        let locationObject : LocationObj;
        // console.log(this.lastPoint, 'this.lastPoint');
        if ( body.status ) {
            let markers = {};
            for (let i = 0; i < body.data.length; i++) {
                let temp = body.data[i];
                let marker : MyMarker = {
                    deviceId : temp.device_id,
                    deviceNumber : temp.device_number,
                    currentLocation : null,
                    visible : true,
                    locations : []
                };
                let locs : Location[] = [];
                for (let j = 0; j < temp.locations.length; j++) {
                    let loc = temp.locations[j];
                    let locTime = this.createTimeByString(loc.last_point);
                    if (!this.lastPoint || locTime >= this.lastPoint) {
                        let newLoc: Location = {
                            lat: parseFloat(loc.lat),
                            lng: parseFloat(loc.lng),
                            state: loc.current_state !== undefined ? loc.current_state : '',
                            status: loc.status,
                            time: loc.created_at,
                            velocity: loc.velocity,
                            lastTime: loc.last_point
                        };
                        locs.push(newLoc);
                    }
                    if ( i === 0 && (!this.lastPoint || locTime >= this.lastPoint)) {
                        marker.currentLocation = loc;
                    }
                };
                marker.locations = locs;
                markers[temp.device_id] = marker;
            }
            locationObject = {
                markers : markers,
                lastPoint : body.last_points
            };
            return locationObject;
        }
        return [];
    };
    handleError() : void {};
    createTimeByString(date : String) {
        let lastTime = date.split('-');
        let datetime = new Date();
        if (lastTime.length > 0) {
            var time_date = lastTime[2].split(' ');
            var time_parts = time_date[1].split(':');
            datetime.setFullYear(parseInt(lastTime[0], 10));
            datetime.setMonth(parseInt(lastTime[1], 10) - 1);
            datetime.setDate(parseInt(time_date[0], 10));

            datetime.setHours(parseInt(time_parts[0], 10));
            datetime.setMinutes(parseInt(time_parts[1], 10));
            datetime.setSeconds(parseInt(time_parts[2], 10));
        }
        return datetime;
    }
}