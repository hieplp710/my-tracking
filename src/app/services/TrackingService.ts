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
    urlLocation: string = "/tracking/get-locations";
    getLocations(url : string, lastPoint : Location): Promise<any> {
        //send to server in order to know which location that we returned
        return this.http.post(url, {"lastPoint":lastPoint}).toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    private extractData(value: Response) {
        let body = value.json();
        let locationObject : LocationObj;
        if ( body.status ) {
            let markers = {};
            for (let i = 0; i < body.data.length; i++) {
                let temp = body.data[i];
                let marker : MyMarker = {
                    deviceId : temp.device_id,
                    deviceNumber : temp.device_number,
                    currentLocation : null,
                    locations : []
                };
                let locs : Location[] = [];
                for (let j = 0; j < temp.locations.length; j++) {
                    let loc = temp.locations[j];
                    let newLoc : Location = {
                        lat : parseFloat(loc.lat),
                        lng : parseFloat(loc.lng),
                        state : 'N/A',
                        status : (loc.status > 0 ? 'On' : 'Off'),
                        time : loc.created_at,
                        velocity: loc.velocity,
                    };
                    locs.push(newLoc);
                    if ( i === 0 ) {
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
            console.log(locationObject, 'locationObject');
            return locationObject;
        }
        return [];
    };
    handleError() : void {};
}