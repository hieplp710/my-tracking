import {Component, OnInit} from '@angular/core';
import {Location} from "../models/location";
import { Marker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";

@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: ['./app/map/components/map.css'],
})
export class MapComponent implements OnInit {
    title: string = 'My first AGM project';
    lat: number = 51.678418;
    lng: number = 7.809007;
    mapDraggable: boolean;
    constructor(private trackingService: TrackingService) { };
    onClick($event) {
        let latd = $event.coords.lat;
        let long = $event.coords.lng;
    };
    allMarkers: Marker[];
    ngOnInit(): void {
        this.trackingService.getLocations('/tracking/get-locations').then(this.loadMarkers).catch(this.error);
    }
    loadMarkers(markers: Marker[]) {
        this.allMarkers = markers;
    }
    error(resp) {}
}