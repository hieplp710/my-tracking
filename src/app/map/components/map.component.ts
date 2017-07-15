import {Component, OnInit, Input} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLngBounds, MapsAPILoader, LatLng} from '@agm/core';
import moment from 'moment';
import $ from 'jquery';
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';

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
    date_from : Date;
    constructor(private trackingService: TrackingService, private _mapsAPILoader: MapsAPILoader) {
        //this.options = new DatePickerOptions();
    };
    allMarkers : any;
    lastPoint : Location;
    isInit = false;
    ngAfterViewInit() {
        let _this = this;
        this._mapsAPILoader.load().then(() => {
            // _this.mapBounds = new google.maps.LatLngBounds();
            // _this.mapBounds.extend(new google.maps.LatLng({"lat" : _this.lat, "lng" : _this.lng}));
        });
    }
    ngOnInit(): void {
        this.requestLocation();
        document.addEventListener('visibilitychange', function(){
            document.title = document.hidden ? "hidden" : "active"; // change tab text for demo
        });
        this.date_from = new Date(2017, 0, 28);
    };
    mapBounds : LatLngBounds;
    requestLocation() {
        let _this = this;
        this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
        then(function(locationObj) {
            // console.log(markers.length, 'location markers');
            var keys = [];
            console.log(locationObj, 'locationObj');
            if (locationObj !== undefined) {
                if (_this.allMarkers === undefined) {
                    _this.allMarkers = locationObj.markers;
                } else {
                    keys  = Object.keys(locationObj.markers);
                    for (var i = 0; i < keys.length; i++) {
                        if (_this.allMarkers[keys[i]] !== undefined) {
                            _this.allMarkers[keys[i]].locations = _this.allMarkers[keys[i]].locations
                                .concat(locationObj.markers[keys[i]].locations);
                        }
                    }
                }
                if (locationObj != null && locationObj.lastPoint !== undefined && locationObj.lastPoint != null) {
                    _this.lastPoint = locationObj.lastPoint;
                }
                if (!_this.isInit) {
                    keys = Object.keys(_this.allMarkers);
                    for (let i = 0; i < keys.length; i++) {
                        let marker = _this.allMarkers[keys[i]];
                        _this.handleLocation(marker, _this);
                    }
                    _this.isInit = true;
                }
                if (_this.internalInterval == null) {
                    _this.fetchMarkers(_this);
                }
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

        }, 5000);
    };
    handleLocation(marker : MyMarker, context) : void {
        /** handle for location */
        if (context.mapBounds === undefined) {
            context.mapBounds = new google.maps.LatLngBounds();
        }
        if (marker.locations.length >= 1) {
            let lt : Location = marker.locations.shift();
            marker.currentLocation = lt;
            let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
            if (context.mapBounds !== undefined ) {
                    context.mapBounds.extend(coord);
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
        if (this.mapBounds !== undefined) {
            //google.map.fitBounds(this.mapBounds);
        }
        let height = $(window).height() - 120;
        $('agm-map').css({"height":height + "px"});
    }
    onSelected($event) {
        console.log($event, 'event marker emitted');
    }
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed