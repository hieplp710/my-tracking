import { Component } from '@angular/core';
import {Marker} from "../models/marker";

@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: ['./app/map/components/map.css'],
})
export class MapComponent {
    title: string = 'My first AGM project';
    lat: number = 51.678418;
    lng: number = 7.809007;
    mapDraggable: boolean;
    onClick($event) {
        let latd = $event.coords.lat;
        let long = $event.coords.lng;
        var newMarker : Marker =  {
            lat: latd,
            lng: long,
            name: "New Marker"
        };
        this.allMarkers.push(newMarker);
    };
    allMarkers: Marker[] = [
        {lat: 51.678418, lng: 7.809007, name: "Exist marker"}
    ];
}