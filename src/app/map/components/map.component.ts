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
    lat: number = 10.820751;
    lng: number = 106.630894;
    mapDraggable: boolean;
    private internalInterval = null;
    date_from : Date;
    date_to: Date;
    isRoadmap : boolean = false;
    constructor(private trackingService: TrackingService, private _mapsAPILoader: MapsAPILoader) {
        //this.options = new DatePickerOptions();
    };
    allMarkers : any;
    lastPoint : Location;
    isInit = false;
    roadmapMarkers : any;
    roadmapSelectedMarker : MyMarker;
    icon_roadmap = window['APP_URL'] + "/assets/images/$hd$-pin.png";
    icon_roadmap_start = window['APP_URL'] + "/assets/images/start_pin.png";
    icon_roadmap_end = window['APP_URL'] + "/assets/images/end_pin.png";
    icon_roadmap_stop = window['APP_URL'] + "/assets/images/stop.png";
    icon_roadmap_pause = window['APP_URL'] + "/assets/images/pause.png";
    geoCoder: any;
    isRunningRoadmap = false;
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
        this.date_from = new Date();
        this.date_to = new Date();
    };
    mapBounds : LatLngBounds;
    mapRoadmapBounds : LatLngBounds;
    isSending: boolean = false;
    requestLocation() {
        let _this = this;
        this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint).
        then(function(locationObj) {
            // console.log(markers.length, 'location markers');
            var keys = [];
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
                        if (_this.roadmapSelectedMarker === undefined) {
                            //init the marker that choiceonDeviceSelected($event) on roadmap mode
                            _this.roadmapSelectedMarker = marker;
                        }
                    }
                    _this.isInit = true;
                }
                if (_this.internalInterval == null) {
                    _this.fetchMarkers(_this);
                }
                _this.isSending = false;
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
        let locationsLenght = 0;
        let keys = Object.keys(context.allMarkers);
        for (let i = 0; i < keys.length; i++) {
            let marker = context.allMarkers[keys[i]];
            locationsLenght = marker.locations.length;
        }
        if (marker.locations.length >= 1) {
            let lt : Location = marker.locations.shift();
            marker.currentLocation = lt;
            let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
            if (context.mapBounds !== undefined ) {
                    context.mapBounds.extend(coord);
            }
        } else if (locationsLenght === 0 && !context.isSending) {
            context.isSending = true;
            context.requestLocation();
        }
    };
    log(value) {
        console.log(value);
    }
    toArray(data? : any) {
        let data_markers = data !== undefined ? data : this.allMarkers;
        let _this = this;
        if (data_markers != null && data_markers !== undefined) {
            var keys = Object.keys(data_markers);
            var arrs = [];
            for (let i = 0; i < keys.length; i++) {
                let temp = data_markers[keys[i]];
                if (_this.roadmapSelectedMarker == null) {
                    _this.roadmapSelectedMarker = temp;
                }
                arrs.push(temp);
            }
            return arrs;
        } else {
            return [];
        }
    }
    onMapReady($event) {
        if (this.mapRoadmapBounds === undefined) {
            this.mapRoadmapBounds = new google.maps.LatLngBounds();
        }
        let height = $(window).height() - 120;
        $('agm-map').css({"height":height + "px"});
        $('#control-section div.row.tab-pane').css({"height":(height - 44) + "px"});
        $('#control-section div.device-list').css({"height":(height - 44 - 123) + "px"});
        //init geocoder
        this.geoCoder = new google.maps.Geocoder();
    }
    onSelected($event) {
        console.log($event, 'event marker emitted');
    }
    onChangeTab($event) {
        console.log($event);
        let $target = $($event.target).attr('data-target');
        $('li.tab.active').removeClass('active');
        $($event.target).addClass('active');
        $('div.row.tab-pane').addClass('hide');
        $($target).removeClass('hide');
        if ($target === '#real-time') {
            this.isRoadmap = false;
            this.requestLocation();
        } else {
            clearInterval(this.internalInterval);
            this.internalInterval = null;
            this.isRoadmap = true;
        }
    }
    onViewRoadmap($event) {
        let _this = this;
        let options = {
            "isRoadmap":true,
            "dateFrom": this.formatDateTime(this.date_from),
            "dateTo": this.formatDateTime(this.date_to),
            "deviceId": this.roadmapSelectedMarker.deviceId
        };
        _this.isRunningRoadmap = false;
        _this.roadmapMarkers = [];
        _this.mapRoadmapBounds = null;
        _this.fetchRoadMap(_this.trackingService.urlLocation, options, _this);
    }
    fetchRoadMap(url, options, context) {
        context.trackingService.getLocations(url, null, options).
        then(function(locationObj) {
            //last time where not thing to load
            if (!locationObj.hasMore && context.roadmapMarkers.length !== 0
                && locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined) {
                console.log('no more on last request');
                context.mapRoadmapBounds = new google.maps.LatLngBounds();
                for (let i = 0; i < context.roadmapMarkers.length; i++) {
                    let lt = context.roadmapMarkers[i];
                    let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
                    if (context.mapRoadmapBounds !== undefined ) {
                        context.mapRoadmapBounds.extend(coord);
                    }
                }
            }
            if (locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined
                && context.roadmapMarkers.length === 0 && !context.isRunningRoadmap) {
                alert("Không có thông tin lộ trình!");
                context.isRunningRoadmap = false;
                return false;
            };
            if (locationObj.markers[context.roadmapSelectedMarker.deviceId] !== undefined) {
                context.roadmapMarkers = context.roadmapMarkers.concat(
                locationObj.markers[context.roadmapSelectedMarker.deviceId].locations);
                if (context.mapRoadmapBounds == null) {
                    //load when first load marker in order to know where markers should be
                    context.mapRoadmapBounds = new google.maps.LatLngBounds();
                    for (let i = 0; i < context.roadmapMarkers.length; i++) {
                        let lt = context.roadmapMarkers[i];
                        let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
                        if (context.mapRoadmapBounds !== undefined ) {
                            context.mapRoadmapBounds.extend(coord);
                        }
                    }
                }
                //last time but still points returned
                if (!locationObj.hasMore && context.roadmapMarkers.length !== 0) {
                    console.log('has more on last request');
                    context.mapRoadmapBounds = new google.maps.LatLngBounds();
                    for (let i = 0; i < context.roadmapMarkers.length; i++) {
                        let lt = context.roadmapMarkers[i];
                        let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
                        if (context.mapRoadmapBounds !== undefined ) {
                            context.mapRoadmapBounds.extend(coord);
                        }
                    }
                }
            }
            //has more
            if (locationObj.hasMore) {
                let newoptions = options;
                newoptions['nextLoc'] = locationObj.lastPoint.last_point;
                context.isRunningRoadmap = true;
                setTimeout(function() {
                    context.fetchRoadMap(url, newoptions, context);
                }, 1000);
            }
        }, function(error) {});
    }
    onDeviceSelected($event) {
        this.roadmapSelectedMarker = $event;
    }
    private formatDateTime(date : Date) {
        var datetimeStr = "";
        var year = date.getFullYear();
        var month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1));
        var dateStr = (date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate());
        var hour = (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours());
        var minutes = (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
        var second = (date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds());
        return year + '-' + month + '-' + dateStr + " " + hour + ":" + minutes + ":" + second;
    }
    onMarkerClick($event, location) {
        let latlng = {
            "lat": location.lat,
            "lng": location.lng
        };
        this.geoCoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    location.address = results[0].formatted_address;
                } else {
                    location.address = 'N/A';
                }
            } else {
                location.address = 'N/A';
            }
        });
    }
    getRoadmapPin(index, marker : Location) {
        let pin = this.icon_roadmap;
        let img = '';
        if (index === 0) {
            img = this.icon_roadmap_start;
        } else if (index === (this.roadmapMarkers.length - 1)) {
            img = this.icon_roadmap_end;
        } else {
            if (marker.status === 'Đỗ') {
                img = this.icon_roadmap_stop;
            } else if (marker.status === 'Dừng') {
                img = this.icon_roadmap_pause;
            } else {
                img = this.icon_roadmap;
                img = img.replace('$hd$', marker.headingClass);
            }

        }
        return img;
    }
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed