import {Component, OnInit} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLngBounds, MapsAPILoader, LatLng} from '@agm/core';
import $ from 'jquery';

declare var google: any;
@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: ['./app/map/components/map.css'],
})

export class MapComponent implements OnInit {
    title: string = 'My first AGM project';
    lat: number = 10.820751;
    lng: number = 106.630894;
    mapDraggable: boolean;
    private internalInterval = null;
    constructor(private trackingService: TrackingService, private _mapsAPILoader: MapsAPILoader) { };
    onClick($event) {
        let latd = $event.coords.lat;
        let long = $event.coords.lng;
    };
    allMarkers : any;
    lastPoint : Location;
    ngAfterViewInit() {
        let _this = this;
        this._mapsAPILoader.load().then(() => {
            // _this.mapBounds = new google.maps.LatLngBounds();
            // _this.mapBounds.extend(new google.maps.LatLng({"lat" : _this.lat, "lng" : _this.lng}));
        });
    }
    ngOnInit(): void {
        this.requestLocation();

    };
    mapBounds : LatLngBounds;
    requestLocation() {
        let _this = this;
        this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
        then(function(locationObj) {
            // console.log(markers.length, 'location markers');
            if (_this.allMarkers === undefined) {
                _this.allMarkers = locationObj.markers;
            } else {
                var keys = Object.keys(locationObj.markers);
                for (var i = 0; i < keys.length; i++) {
                    if (_this.allMarkers[keys[i]] !== undefined) {
                        _this.allMarkers[keys[i]].locations = _this.allMarkers[keys[i]].locations
                            .concat(locationObj.markers[keys[i]].locations);
                    }
                }
            }
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
            let keys = Object.keys(_this.allMarkers);
            for (let i = 0; i < keys.length; i++) {
                let marker = _this.allMarkers[keys[i]];
                _this.handleLocation(marker, _this);
            }

        }, 2000);
    };
    handleLocation(marker : MyMarker, context) : void {
        /** handle for location */
        if (context.mapBounds === undefined) {
            context.mapBounds = new google.maps.LatLngBounds();
        }
        if (marker.locations.length > 1) {
            let lt : Location = marker.locations.shift();
            marker.currentLocation = lt;
            let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
            if (context.mapBounds !== undefined ) {
                    context.mapBounds.extend(coord);
                    console.log(context.mapBounds, 'context.mapBounds');
            }
        } else {
            context.requestLocation();
        }
    };
    log(value) {
        console.log(value);
    }
    toArray() {
        if (this.allMarkers != null && this.allMarkers !== undefined) {
            var keys = Object.keys(this.allMarkers);
            console.log(this.allMarkers, 'to aray');
            var arrs = [];
            for (let i = 0; i < keys.length; i++) {
                let temp = this.allMarkers[keys[i]];
                arrs.push(temp);
            }
            return arrs;
        } else {
            return [];
        }
    }
    onMapReady($event) {
        console.log($event, 'map event');
        if (this.mapBounds !== undefined) {
            //google.map.fitBounds(this.mapBounds);
        }
        let height = $(window).height() - 120;
        $('agm-map').css({"height":height + "px"});

    }
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed