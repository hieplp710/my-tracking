import {Component, OnInit, Input} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLngBounds, MapsAPILoader, LatLng} from '@agm/core';
import moment from 'moment';
import $ from 'jquery';
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';

declare var google: any;
declare var MarkerClusterer: any;
@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: ['./app/map/components/map.css']
})

export class MapComponent implements OnInit {
    lat: number = 10.820751;
    lng: number = 106.630894;
    bufferMarker = [];
    mapDraggable: boolean;
    private internalInterval = null;
    date_from : Date;
    date_to: Date;
    isRoadmap : boolean = false;
    map = null;
    zoom = 8;
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
    current_infowindow = null;
    current_roadmap_infowindow = null;
    deviceLatestLocation = {};
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
        this.date_from.setHours(0);
        this.date_from.setMinutes(0);
        this.date_from.setSeconds(0);

        this.date_to = new Date();
        this.date_to.setHours(23);
        this.date_to.setMinutes(59);
        this.date_to.setSeconds(59);
        $('#control-device').on('click', function(e) {
            e.preventDefault();
            //$('#control-section').animate();
            if ($('#control-section').attr('class').indexOf('slide-left') !== -1) {
                //remove class slide left and add class slide right
                $('#control-section').removeClass('slide-left').addClass('slide-right');
            } else {
                $('#control-section').removeClass('slide-right').addClass('slide-left');
            }
        });
    };
    mapBounds : LatLngBounds;
    mapRoadmapBounds : LatLngBounds;
    isSending: boolean = false;
    markerClusterer = null;
    stopMarkers = [];
    parkMarkers = [];
    startRoadmapMarker = null;
    endRoadmapMarker = null;
    roadmapPolyline = null;
    requestLocation() {
        let _this = this;
        this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint,
            {"isRoadmap":false, "lastLocation":this.deviceLatestLocation}).
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
            let coodrs = {"lat" : lt.lat, "lng" : lt.lng, "time": marker.currentLocation.time_original};
            let coord = new google.maps.LatLng(coodrs);
            context.deviceLatestLocation[marker.deviceId] = coodrs;
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
    onMapReady($event, map) {
        if (this.mapRoadmapBounds === undefined) {
            this.mapRoadmapBounds = new google.maps.LatLngBounds();
        }
        this.map = $event;
        let width = $(window).width();
        if (width < 800) {
            let height = $(window).height() - 55;
            $('agm-map').css({"height":height + "px"});
            $('#control-section div.row.tab-pane').css({"height":(height - 38 + "px")});
            $('#control-section #real-time div.device-list').css({"height":(height - 40) + "px"});
            $('#control-section #roadmap div.device-list').css({"height":(height - 240) + "px"});
        } else {
            let height = $(window).height() - 55;
            $('agm-map').css({"height":height + "px"});
            $('#control-section div.row.tab-pane').css({"height":(height - 42) + "px"});
            $('#control-section #real-time div.device-list').css({"height":(height - 42) + "px"});
            $('#control-section #roadmap div.device-list').css({"height":(height - 50 - 123) + "px"});
        };
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
            this.clearCluster();
            this.requestLocation();
        } else {
            if (this.current_infowindow != null) {
                this.current_infowindow.close();
                this.current_infowindow = null;
            };
            clearInterval(this.internalInterval);
            this.internalInterval = null;
            this.isRoadmap = true;
        }
    }
    onViewRoadmap($event) {
        let _this = this;
        _this.clearCluster();
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
        if ($('#control-section').attr('class').indexOf('slide-left') !== -1) {
            //remove class slide left and add class slide right
            $('#control-section').removeClass('slide-left').addClass('slide-right');
        }
    }
    fetchRoadMap(url, options, context) {
        context.trackingService.getLocations(url, null, options).
        then(function(locationObj) {
            //last time where not thing to load
            if (!locationObj.hasMore && context.roadmapMarkers.length !== 0
                && locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined) {
                console.log('no more on last request');
                context.displayRoapmap(context);
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
                    context.displayRoapmap(context);
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
    displayRoapmap(context) {
        context.mapRoadmapBounds = new google.maps.LatLngBounds();
        var markers = [];
        var coords = [];
        var stopMarkers = [];
        var parkMarkers = [];
        let firstLoc = context.roadmapMarkers[0];
        let firstPoint = new google.maps.LatLng({"lat" : firstLoc.lat, "lng" : firstLoc.lng});
        context.startRoadmapMarker = new google.maps.Marker({
            position: firstPoint,
            map: context.map,
            icon: {
                url: context.icon_roadmap_start,
                anchor: new google.maps.Point(10, 10),
                scaledSize: new google.maps.Size(20, 20)
            }
        });
        coords.push(firstPoint);
        for (let i = 1; i < (context.roadmapMarkers.length - 1); i++) {
            let lt = context.roadmapMarkers[i];
            let coord = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
            if (context.mapRoadmapBounds !== undefined ) {
                context.mapRoadmapBounds.extend(coord);
            }
            let mk = new google.maps.Marker({
                position: coord,
                map: context.map,
                icon: {
                    url: context.getRoadmapPin(i, lt),
                    anchor: new google.maps.Point(10, 10),
                    scaledSize: new google.maps.Size(20, 20)
                }
            });
            //compose infowindow content
            let state = (lt.state !== '') ?
                            '<span class="col-xs-4 label">Thời gian:</span><span class="col-xs-8 content">' + lt.state + '</span>' : '';
            let contentWindow = '<div class="marker-info row" id="' + lt.lat + '_' + lt.lng + '">'
                + '<span class="col-xs-12"><strong>' + lt.time + '</strong></span>'
                + '<span class="col-xs-4 label">Trạng thái:</span><span class="col-xs-8 content">' + lt.status + '</span>'
                + state
                + '<span class="col-xs-4 label">Vận tốc:</span><span class="col-xs-8 content">' + lt.velocity + ' km/h</span>'
                + '<span class="col-xs-4 label">Tọa độ:</span><span class="col-xs-8 content">' + lt.lat + ', ' + lt.lng + '</span>'
                + '<span  class="col-xs-4 label">Địa chỉ:</span><span class="col-xs-8 content address"></span></div>';
            //insert infor window
            let infowindow = new google.maps.InfoWindow({
                content: contentWindow
            });
            mk.addListener('click', function(evt) {
                if ( context.current_roadmap_infowindow != null ) {
                    context.current_roadmap_infowindow.close();
                };
                context.current_roadmap_infowindow = infowindow;
                infowindow.open(context.map, mk);
                let position = mk.getPosition().lat() + '_' + mk.getPosition().lng();
                let latlng = {
                    "lat": mk.getPosition().lat(),
                    "lng": mk.getPosition().lng()
                };
                context.geoCoder.geocode({'location': latlng}, function(results, status) {
                    let address = '';
                    if (status === 'OK') {
                        if (results[0]) {
                            address = results[0].formatted_address;
                        } else {
                            address = 'N/A';
                        }
                    } else {
                        address = 'N/A';
                    }
                    $('.marker-info  span.content.address').text(address);
                });

            });
            coords.push(coord);
            if (lt.status === 'Dừng') {
                context.stopMarkers.push(mk);
            } else if (lt.status === 'Đỗ') {
                context.parkMarkers.push(mk);
            }else {
                markers.push(mk);
            };
        }

        let lastLoc = context.roadmapMarkers[(context.roadmapMarkers.length - 1)];
        let lastPoint = new google.maps.LatLng({"lat" : lastLoc.lat, "lng" : lastLoc.lng});
        coords.push(lastPoint);
        context.endRoadmapMarker = new google.maps.Marker({
            position: lastPoint,
            map: context.map,
            icon: {
                url: context.icon_roadmap_end,
                anchor: new google.maps.Point(5, 20),
                scaledSize: new google.maps.Size(20, 20)
            }
        });
        context.markerClusterer = new MarkerClusterer(context.map, markers,
            {
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: 16,
            });
        //override image style for marker cluster
        // context.stopMarkerClusterer = new MarkerClusterer(context.map, stopMarkers,
        //     {
        //         imagePath: context.icon_roadmap_pause,
        //         styles : [{
        //             url: context.icon_roadmap_pause,
        //             height: 20,
        //             width: 20,
        //             "background-size": "100%"
        //         }]
        //     });
        context.roadmapPolyline = new google.maps.Polyline({
            path: coords,
            geodesic: true,
            strokeColor: '#00B3FD',
            strokeOpacity: 0.8,
            strokeWeight: 2
        });

        context.roadmapPolyline.setMap(context.map);
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
    onMarkerClick($event, location, infowindow) {
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
        console.log(infowindow, 'infowindow');
        if ( this.current_infowindow != null ) {
            this.current_infowindow.close();
        }
        infowindow.open();
        this.current_infowindow = infowindow;
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
    };
    clearCluster() {
        if (this.markerClusterer != null) {
            this.markerClusterer.clearMarkers();
            this.markerClusterer = null;
        }
        //remove stop and park marker
        for (var i = 0; i < this.parkMarkers.length; i++) {
            this.parkMarkers[i].setMap(null);
        }
        for (var i = 0; i < this.stopMarkers.length; i++) {
            this.stopMarkers[i].setMap(null);
        }
        this.parkMarkers = [];
        this.stopMarkers = [];
        //remove start, end marker
        if (this.startRoadmapMarker != null) {
            this.startRoadmapMarker.setMap(null);
            this.startRoadmapMarker = null;
        }
        if (this.endRoadmapMarker != null) {
            this.endRoadmapMarker.setMap(null);
            this.endRoadmapMarker = null;
        }
        if (this.roadmapPolyline != null) {
            this.roadmapPolyline.setMap(null);
            this.roadmapPolyline = null;
        }
    };
    panToMarker($event) {
        //if mobile mode, slide the device bar
        if ($('#control-section').attr('class').indexOf('slide-left') !== -1) {
            //remove class slide left and add class slide right
            $('#control-device').trigger('click');
        };
        this.lat = $event.currentLocation.lat;
        this.lng = $event.currentLocation.lng;
        this.map.setZoom(16);
    }
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed