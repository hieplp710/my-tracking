import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {Location} from "../models/location";
import { MyMarker } from '../models/marker';
import { TrackingService } from "../../services/TrackingService";
import {AgmCoreModule, LatLngBounds, MapsAPILoader, LatLng} from '@agm/core';
import moment from 'moment';
import $ from 'jquery';
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';
import {mapChildrenIntoArray} from "@angular/router/src/url_tree";
import { NouisliderModule } from 'ng2-nouislider';
import {PopupComponent} from "./widgets/popup-device/popup.component";
import {CookieService} from 'angular2-cookie/core';
import {RoadmapInfoComponent} from "./widgets/roadmap-info/roadmap_info.component";
import {RoadmapInfo} from "../models/roadmap_info";
import {isUndefined} from "util";

declare var google: any;
declare var MarkerClusterer: any;
@Component({
    selector: 'map',
    templateUrl: './app/map/components/map.component.html',
    styleUrls: [
        './app/map/components/map.css',
        './app/map/components/nouislider.css',
    ]
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
    rangeVel = 5;
    constructor(private trackingService: TrackingService, private _mapsAPILoader: MapsAPILoader, private _cookie: CookieService) {
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
    icon_status_park = window['APP_URL'] + "/assets/images/park.png";
    icon_status_play = window['APP_URL'] + "/assets/images/play.png";
    icon_status_stop = window['APP_URL'] + "/assets/images/stops.png";
    icon_status_lost_gsm = window['APP_URL'] + "/assets/images/lost_gsm.png";
    geoCoder: any;
    isRunningRoadmap = false;
    current_infowindow = null;
    current_roadmap_infowindow = null;
    deviceLatestLocation = {};
    interPlayRoadmap = null;
    canPlayRoadmap = false;
    playRoadmapIndex = 0;
    playRoadmapMarker = null;
    reportData : any;
    isReportView = false;
    @ViewChild(PopupComponent) devicePopup: PopupComponent;
    @ViewChild('roadmapInfo') roadmapInfo : RoadmapInfoComponent;
    ngAfterViewInit() {
        let _this = this;
        this._mapsAPILoader.load().then(() => {
            // _this.mapBounds = new google.maps.LatLngBounds();
            // _this.mapBounds.extend(new google.maps.LatLng({"lat" : _this.lat, "lng" : _this.lng}));
        });
    }
    ngOnInit(): void {
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
        var _this = this;
        setTimeout( function (){
            _this.requestLocation();
            document.addEventListener('visibilitychange', function(){
                document.title = document.hidden ? "hidden" : "active"; // change tab text for demo
                if (document.hidden || _this.isRoadmap || _this.isReportView) {
                    console.log('lock the request');
                    clearInterval(_this.internalInterval);
                    _this.internalInterval = null;
                    clearInterval(_this.interPlayRoadmap);
                    _this.canPlayRoadmap = false;
                    _this.playRoadmapIndex = 0;
                    if (_this.playRoadmapMarker != null) {
                        _this.playRoadmapMarker.setMap(null);
                        _this.playRoadmapMarker = null;
                    };
                    _this.isRunningRoadmap = false;
                    if ($('#play-roadmap-mobile > i')[0] !== undefined
                        && $('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                        $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                    }
                    //hide the roadmap info
                    _this.roadmapInfo.hideInfo();
                    // _this.isRoadmap = false;
                    // _this.isReportView = false;
                    _this.totalKmRoadmap = 0;
                } else {
                    console.log('unlock the request');
                    _this.isRoadmap = false;
                    _this.clearCluster();
                    _this.requestLocation();
                    clearInterval(_this.interPlayRoadmap);
                    _this.canPlayRoadmap = false;
                    _this.playRoadmapIndex = 0;
                    if (_this.playRoadmapMarker != null) {
                        _this.playRoadmapMarker.setMap(null);
                        _this.playRoadmapMarker = null;
                    };
                    _this.isRunningRoadmap = false;
                    if ($('#play-roadmap-mobile > i')[0] !== undefined
                        && $('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                        $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                    }
                    //hide the roadmap info
                    _this.roadmapInfo.hideInfo();
                    _this.isReportView = false;
                    _this.totalKmRoadmap = 0;
                }
            });
        }, 1000);
        $('#btnLogout').on('click', function (e) {
            e.preventDefault();
            let username = $.trim($('#app-navbar-collapse a.dropdown-toggle').text());
            _this._cookie.remove(username);
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
    isPlayingRoadmap = false;
    deviceWarning = [];
    startPointRoadmap: any;
    totalKmRoadmap: number = 0;
    allMarkerRoadmap = [];
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
                        if (marker.isExpired) {
                            _this.deviceWarning.push(marker);
                        }
                    }
                    let username = $.trim($('#app-navbar-collapse a.dropdown-toggle').text());
                    if (_this.deviceWarning.length > 0 && _this._cookie.get(username) === undefined && !_this.isInit) {
                        // if exist warning device, show the popup
                        _this.devicePopup.contentBuilder('Thiết bị sắp hết hạn', _this.deviceWarning);
                        _this.devicePopup.togglePopup();
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
        _this.internalInterval = setInterval(function() {
            let keys = Object.keys(_this.allMarkers);
            for (let i = 0; i < keys.length; i++) {
                let marker = _this.allMarkers[keys[i]];
                _this.handleLocation(marker, _this);
            };
        }, 10000);
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
            let coodrs = {
                "lat" : lt.lat, "lng" : lt.lng,
                "time": marker.currentLocation.time_original,
                "status" : marker.currentLocation.status
            };
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
                if (temp.expiredType !== 2) {
                    arrs.push(temp);
                }

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
        if (width < 810) {
            let height = $(window).height() - 55;
            $('agm-map').css({"height":height + "px"});
            $('#control-section div.row.tab-pane').css({"height":(height - 38 + "px")});
            $('#control-section #real-time div.device-list').css({"height":(height - 60) + "px"});
            $('#control-section #roadmap div.device-list').css({"height":(height - 260) + "px"});
        } else if (width < 900) {
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
            $('#control-section #roadmap div.device-list').css({"height":(height - 50 - 153) + "px"});
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
            clearInterval(this.interPlayRoadmap);
            this.canPlayRoadmap = false;
            this.playRoadmapIndex = 0;
            if (this.playRoadmapMarker != null) {
                this.playRoadmapMarker.setMap(null);
                this.playRoadmapMarker = null;
            };
            this.isRunningRoadmap = false;
            if ($('#play-roadmap-mobile > i')[0] !== undefined && $('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
            }
            //hide the roadmap info
            this.roadmapInfo.hideInfo();
            this.isReportView = false;
            this.totalKmRoadmap = 0;
        } else if ($target === '#roadmap') {
            if (this.current_infowindow != null) {
                this.current_infowindow.close();
                this.current_infowindow = null;
            };
            clearInterval(this.internalInterval);
            this.internalInterval = null;
            this.isRoadmap = true;
            this.isReportView = false;
        } else if ($target === '#report') {
            clearInterval(this.internalInterval);
            this.internalInterval = null;
            clearInterval(this.interPlayRoadmap);
            this.canPlayRoadmap = false;
            this.playRoadmapIndex = 0;
            if (this.playRoadmapMarker != null) {
                this.playRoadmapMarker.setMap(null);
                this.playRoadmapMarker = null;
            };
            this.isRunningRoadmap = false;
            if ($('#play-roadmap-mobile > i')[0] !== undefined && $('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
            }
            //hide the roadmap info
            this.roadmapInfo.hideInfo();
            this.isRoadmap = false;
            this.isReportView = true;
            this.totalKmRoadmap = 0;
        }else {
            clearInterval(this.interPlayRoadmap);
            this.isReportView = false;
            this.canPlayRoadmap = false;
            this.playRoadmapIndex = 0;
            if (this.playRoadmapMarker != null) {
                this.playRoadmapMarker.setMap(null);
                this.playRoadmapMarker = null;
            };
            this.isRunningRoadmap = false;
            if ($('#play-roadmap-mobile > i')[0] !== undefined && $('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
            }
            //hide the roadmap info
            this.roadmapInfo.hideInfo();
            this.isRoadmap = false;
            this.totalKmRoadmap = 0;
        }
    }
    onViewRoadmap($event) {
        let _this = this;
        _this.clearCluster();
        this.canPlayRoadmap = false;
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
                context.displayRoapmap(context);
            }
            if (locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined
                && context.roadmapMarkers.length === 0 && !context.isRunningRoadmap) {
                alert("Không có thông tin lộ trình!");
                context.canPlayRoadmap = false;
                return false;
            };
            if (locationObj.markers[context.roadmapSelectedMarker.deviceId] !== undefined) {
                context.canPlayRoadmap = true;
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
                //context.isRunningRoadmap = true;
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
        var beginMarker = null;
        var tempRoadmapMarkers = [];
        context.allMarkerRoadmap = [firstLoc];
        for (let i = 1; i < (context.roadmapMarkers.length - 1); i++) {
            let lt = context.roadmapMarkers[i];
            context.allMarkerRoadmap.push(lt); //store the markers for calculate total roadmap kms
            if (beginMarker == null) {
                beginMarker = lt;
            }
            if (i !== (context.roadmapMarkers.length - 2) && (lt.status === 'Dừng' || lt.status === 'Đỗ')) {
                //get next location
                let distance = 0;
                if (beginMarker !== lt) {
                    var beginCood = new google.maps.LatLng({"lat" : beginMarker.lat, "lng" : beginMarker.lng});
                    var currentCood = new google.maps.LatLng({"lat" : lt.lat, "lng" : lt.lng});
                    if (google.maps.geometry !== undefined) {
                        distance = google.maps.geometry.spherical.computeDistanceBetween(beginCood, currentCood);
                    }
                }
                let nextLoc = context.roadmapMarkers[i + 1] !== undefined ? context.roadmapMarkers[i + 1] : null;
                if (nextLoc && nextLoc.status === lt.status && distance < 50) {
                    continue; //only show the last park/stop marker
                }
            }
            tempRoadmapMarkers.push(lt); // for buffer to play roadmap
            beginMarker = lt;
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
        context.playRoadmapMarkers = coords;
        context.roadmapPolyline.setMap(context.map);
        context.roadmapMarkers = tempRoadmapMarkers; // assign removed park/stop markers array to roadmapMarker
    }
    private getTotalRoadmapKm(roadmapMarkers) {
        let km = 0;
        if (roadmapMarkers.length <= 1) {
            return 0;
        };
        let startPoint = roadmapMarkers[0];
        for (let i = 1; i < roadmapMarkers.length; i++) {
            let tempMarker = roadmapMarkers[i];
            let coord = new google.maps.LatLng({"lat" : tempMarker.lat, "lng" : tempMarker.lng});
            let locA = new google.maps.LatLng({"lat" : startPoint.lat, "lng" : startPoint.lng});
            if (google.maps.geometry !== undefined) {
                km += google.maps.geometry.spherical.computeDistanceBetween(locA, coord);
                startPoint = tempMarker;
            }
        }
        return (km / 1000);
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
    };
    onPlayRoadmap($event) {
        this.totalKmRoadmap = 0;
        this.doPlayRoadmap();
    };
    onStopRoadmap($event) {
        if (this.interPlayRoadmap != null) {
            clearInterval(this.interPlayRoadmap);
        }
        this.playRoadmapIndex = 0;
        if (this.playRoadmapMarker != null) {
            this.playRoadmapMarker.setMap(null);
            this.playRoadmapMarker = null;
        };
        this.isRunningRoadmap = false;
        $('#play-roadmap').text('Xem lại lộ trình');
        if ($('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
            $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
        }
        this.startPointRoadmap = null;
        //this.totalKmRoadmap = 0;
    };
    onChangeReviewSpeed($event) {
        console.log($event);
        if (this.isRunningRoadmap) {
            this.isRunningRoadmap = false;
            clearInterval(this.interPlayRoadmap);
            this.doPlayRoadmap();
        };
    };
    doPlayRoadmap() {
        if (this.roadmapMarkers !== null) {
            let _this = this;
            if (_this.isRunningRoadmap) {
                _this.isRunningRoadmap = false;
                clearInterval(_this.interPlayRoadmap);
                $('#play-roadmap').text('Xem lại lộ trình');
                $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
            } else {
                _this.isRunningRoadmap = true;
                $('#play-roadmap').text('Tạm dừng');
                $('#play-roadmap-mobile > i').addClass('fa-pause').removeClass('fa-play');
                this.interPlayRoadmap = setInterval(function () {
                    if (_this.playRoadmapMarker !== null) {
                        _this.playRoadmapMarker.setMap(null);
                    }
                    if (_this.roadmapMarkers != null && _this.roadmapMarkers[_this.playRoadmapIndex] !== undefined
                        && _this.playRoadmapIndex < _this.roadmapMarkers.length) {
                        var tempMarker = _this.roadmapMarkers[_this.playRoadmapIndex];
                        let coord = new google.maps.LatLng({"lat" : tempMarker.lat, "lng" : tempMarker.lng});
                        _this.playRoadmapMarker = new google.maps.Marker({
                            position: coord,
                            map: _this.map,
                            icon: {
                                url: _this.getRoadmapPin(_this.playRoadmapIndex, tempMarker),
                                anchor: new google.maps.Point(15, 15),
                                scaledSize: new google.maps.Size(30, 30)
                            }
                        });
                        if (!_this.map.getBounds().contains(_this.playRoadmapMarker.getPosition())) {
                            _this.map.panTo(_this.playRoadmapMarker.getPosition());
                        }
                        _this.playRoadmapIndex++;
                        //set data for roadmap info
                        let km = 0;
                        let strKm = '';
                        if (_this.startPointRoadmap) {
                            let locA = new google.maps.LatLng({"lat" : _this.startPointRoadmap.lat, "lng" : _this.startPointRoadmap.lng});
                            km = google.maps.geometry.spherical.computeDistanceBetween(locA, coord);
                            strKm = (km / 1000).toFixed(1);
                        }
                        _this.startPointRoadmap = tempMarker;
                        //_this.totalKmRoadmap += (km / 1000);
                        if (_this.totalKmRoadmap === 0) {
                            _this.totalKmRoadmap = _this.getTotalRoadmapKm(_this.allMarkerRoadmap);
                        }
                        let info : RoadmapInfo = {
                            km: strKm,
                            kmph: tempMarker.velocity,
                            time: tempMarker.time,
                            totalKm: _this.totalKmRoadmap.toFixed(1)
                        };
                        _this.roadmapInfo.showInfo(info);
                    } else {
                        clearInterval(_this.interPlayRoadmap);
                        _this.playRoadmapIndex = 0;
                        _this.playRoadmapMarker.setMap(null);
                        _this.playRoadmapMarker = null;
                        $('#play-roadmap').text('Xem lại lộ trình');
                        $('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                        _this.isRunningRoadmap = false;
                        _this.startPointRoadmap = null;
                        //_this.totalKmRoadmap = 0;
                        return false;
                    }
                }, 400 - (_this.rangeVel * 30));
            }
        }
    };
    getStatusIcon(location : Location) {
        if (location === undefined || location == null) {
            return this.icon_status_stop;
        }
        if (location.status === 'Đỗ') {
            return this.icon_status_stop;
        } else if (location.status === 'Dừng') {
            return this.icon_status_park;
        } else if (location.status === 'Đang chạy') {
            return this.icon_status_play;
        }else {
            return this.icon_status_lost_gsm;
        }
    }
    onViewGeneralReport(data) {
        //request for data
        let startDate = data.startDate;
        let endDate = data.endDate ;
        let deviceId = data.deviceId;
        let url = '/report/general-report?startDate=' + startDate + "&endDate=" + endDate + "&deviceId=" + deviceId + "&tojson=1";
        let _this = this;
        this.trackingService.getRequest(url).then(function(data){
            //handle here
            _this.reportData = data;
        }, function(error){});
    }
}

// create new class to handle all change of marker called cluster
// each changing literal, market will be change current location so that their position on map will be changed