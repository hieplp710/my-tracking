/**
 * Created by hiepl on 6/24/2017.
 */
import { Injectable } from '@angular/core';
import {Marker} from "../map/models/marker";
import {Http, Response} from "@angular/http";
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {Location} from "../map/models/Location";

@Injectable()
export class TrackingService {
    constructor (private http: Http) {}

    getLocations(url : string): Promise<Marker[]> {
        return this.http.post(url, {}).toPromise()
            .then(this.extractData)
            .catch(this.handleError);
    };
    private extractData(value: Response) {
        let body = value.json();
        if ( body.length > 0 ) {
            let markers : Marker[] = [];
            for (let i = 0; i < body.length; i++) {
                let temp = body[i];
                let marker = new Marker();
                marker.deviceId = temp.device_id;
                marker.deviceNumber = temp.device_number;
                let locs : Location[] = [];
                for (let j = 0; j < temp.locations.length; j++) {
                    let loc = temp.locations[j];
                    let newLoc : Location = {
                        lat : loc.lat,
                        lng : loc.lng,
                        state : 'N/A',
                        status : (loc.status > 0 ? 'On' : 'Off'),
                        time : loc.created_at,
                        velocity: loc.velocity,
                    };
                    locs.push(newLoc);
                };
                marker.locations = locs;
                markers.push(marker);
            }
            return markers;
        }
        return [];
    };
    handleError() : void {};
}