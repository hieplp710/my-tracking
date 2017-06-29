import {Component, OnInit} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLng, LatLngBounds, MapsAPILoader} from '@agm/core';
import {unescape} from "querystring";
import {isUndefined} from "util";
declare var google: any;
@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: ['./app/map/components/map.css'],
})

export class MapComponent implements OnInit {
    title: string = 'My first AGM project';
    lat: number = 10.828264;
    lng: number = 106.643006;
    mapDraggable: boolean;
    private internalInterval = null;
    constructor(private trackingService: TrackingService, private _mapsAPILoader: MapsAPILoader) { };
    onClick($event) {
        let latd = $event.coords.lat;
        let long = $event.coords.lng;
    };
    allMarkers: MyMarker[];
    lastPoint : Location;
    ngAfterViewInit() {
        let _this = this;
        this._mapsAPILoader.load().then(() => {
            _this.mapBounds = google.maps.LatLngBounds();
        });
    }
    ngOnInit(): void {
        this.requestLocation();

    };
    mapBounds : LatLngBounds;
    requestLocation() {
        console.log(this, 'this');
        let _this = this;
        this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
        then(function(locationObj) {
            // console.log(markers.length, 'location markers');
            console.log(locationObj, 'locationObj');
            _this.allMarkers = locationObj.markers;
            _this.lastPoint = locationObj.lastPoint;
            if (_this.internalInterval == null) {
                _this.fetchMarkers(_this);
            }
        }, function(error) {});
    }
    fetchMarkers(context) {
        //handler to markers
        let _this = context;
        _this.internalInterval = setInterval(function(){
            for (let i = 0; i < _this.allMarkers.length; i++) {
                let marker = _this.allMarkers[i];
                console.log(marker, 'marker in loop');
                _this.handleLocation(marker, _this);
            }

        }, 2000);
    };
    handleLocation(marker : MyMarker, context) : void {
        /** handle for location */
        console.log(google, 'shit google');
        if (marker.locations.length > 1) {
            let lt : Location = marker.locations.shift();
            marker.currentLocation = lt;
            console.log(context.allMarkers, 'marker.currentLocation');
            let latLng : LatLng = new google.maps.LatLng(lt.lat, lt.lng);
            if (context.mapBounds !== undefined ) {
                context.mapBounds.extend(latLng);
            }
        } else {
            context.requestLocation();
        }
    };
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed