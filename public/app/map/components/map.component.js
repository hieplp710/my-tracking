System.register(["@angular/core", "../../services/TrackingService", "@agm/core", "jquery"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __moduleName = context_1 && context_1.id;
    var core_1, TrackingService_1, core_2, jquery_1, MapComponent;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (TrackingService_1_1) {
                TrackingService_1 = TrackingService_1_1;
            },
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {
            MapComponent = (function () {
                function MapComponent(trackingService, _mapsAPILoader) {
                    this.trackingService = trackingService;
                    this._mapsAPILoader = _mapsAPILoader;
                    this.lat = 10.820751;
                    this.lng = 106.630894;
                    this.bufferMarker = [];
                    this.internalInterval = null;
                    this.isRoadmap = false;
                    this.map = null;
                    this.zoom = 8;
                    this.rangeVel = 5;
                    this.isInit = false;
                    this.icon_roadmap = window['APP_URL'] + "/assets/images/$hd$-pin.png";
                    this.icon_roadmap_start = window['APP_URL'] + "/assets/images/start_pin.png";
                    this.icon_roadmap_end = window['APP_URL'] + "/assets/images/end_pin.png";
                    this.icon_roadmap_stop = window['APP_URL'] + "/assets/images/stop.png";
                    this.icon_roadmap_pause = window['APP_URL'] + "/assets/images/pause.png";
                    this.icon_status_park = window['APP_URL'] + "/assets/images/park.png";
                    this.icon_status_play = window['APP_URL'] + "/assets/images/play.png";
                    this.icon_status_stop = window['APP_URL'] + "/assets/images/stops.png";
                    this.icon_status_lost_gsm = window['APP_URL'] + "/assets/images/lost_gsm.png";
                    this.isRunningRoadmap = false;
                    this.current_infowindow = null;
                    this.current_roadmap_infowindow = null;
                    this.deviceLatestLocation = {};
                    this.interPlayRoadmap = null;
                    this.canPlayRoadmap = false;
                    this.playRoadmapIndex = 0;
                    this.playRoadmapMarker = null;
                    this.isSending = false;
                    this.markerClusterer = null;
                    this.stopMarkers = [];
                    this.parkMarkers = [];
                    this.startRoadmapMarker = null;
                    this.endRoadmapMarker = null;
                    this.roadmapPolyline = null;
                    this.isPlayingRoadmap = false;
                    //this.options = new DatePickerOptions();
                }
                ;
                MapComponent.prototype.ngAfterViewInit = function () {
                    var _this = this;
                    this._mapsAPILoader.load().then(function () {
                        // _this.mapBounds = new google.maps.LatLngBounds();
                        // _this.mapBounds.extend(new google.maps.LatLng({"lat" : _this.lat, "lng" : _this.lng}));
                    });
                };
                MapComponent.prototype.ngOnInit = function () {
                    document.addEventListener('visibilitychange', function () {
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
                    jquery_1.default('#control-device').on('click', function (e) {
                        e.preventDefault();
                        //$('#control-section').animate();
                        if (jquery_1.default('#control-section').attr('class').indexOf('slide-left') !== -1) {
                            //remove class slide left and add class slide right
                            jquery_1.default('#control-section').removeClass('slide-left').addClass('slide-right');
                        }
                        else {
                            jquery_1.default('#control-section').removeClass('slide-right').addClass('slide-left');
                        }
                    });
                    var _this = this;
                    setTimeout(function () {
                        _this.requestLocation();
                    }, 1000);
                };
                ;
                MapComponent.prototype.requestLocation = function () {
                    var _this = this;
                    this.trackingService.getLocations(this.trackingService.urlLocation, this.lastPoint, { "isRoadmap": false, "lastLocation": this.deviceLatestLocation }).
                        then(function (locationObj) {
                        // console.log(markers.length, 'location markers');
                        var keys = [];
                        if (locationObj !== undefined) {
                            if (_this.allMarkers === undefined) {
                                _this.allMarkers = locationObj.markers;
                            }
                            else {
                                keys = Object.keys(locationObj.markers);
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
                                for (var i_1 = 0; i_1 < keys.length; i_1++) {
                                    var marker = _this.allMarkers[keys[i_1]];
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
                    }, function (error) { });
                };
                MapComponent.prototype.fetchMarkers = function (context) {
                    //handler to markers
                    var _this = context;
                    _this.internalInterval = setInterval(function () {
                        var keys = Object.keys(_this.allMarkers);
                        for (var i = 0; i < keys.length; i++) {
                            var marker = _this.allMarkers[keys[i]];
                            _this.handleLocation(marker, _this);
                        }
                    }, 5000);
                };
                ;
                MapComponent.prototype.handleLocation = function (marker, context) {
                    /** handle for location */
                    if (context.mapBounds === undefined) {
                        context.mapBounds = new google.maps.LatLngBounds();
                    }
                    var locationsLenght = 0;
                    var keys = Object.keys(context.allMarkers);
                    for (var i = 0; i < keys.length; i++) {
                        var marker_1 = context.allMarkers[keys[i]];
                        locationsLenght = marker_1.locations.length;
                    }
                    if (marker.locations.length >= 1) {
                        var lt = marker.locations.shift();
                        marker.currentLocation = lt;
                        var coodrs = {
                            "lat": lt.lat, "lng": lt.lng,
                            "time": marker.currentLocation.time_original,
                            "status": marker.currentLocation.status
                        };
                        var coord = new google.maps.LatLng(coodrs);
                        context.deviceLatestLocation[marker.deviceId] = coodrs;
                        if (context.mapBounds !== undefined) {
                            context.mapBounds.extend(coord);
                        }
                    }
                    else if (locationsLenght === 0 && !context.isSending) {
                        context.isSending = true;
                        context.requestLocation();
                    }
                };
                ;
                MapComponent.prototype.log = function (value) {
                    console.log(value);
                };
                MapComponent.prototype.toArray = function (data) {
                    var data_markers = data !== undefined ? data : this.allMarkers;
                    var _this = this;
                    if (data_markers != null && data_markers !== undefined) {
                        var keys = Object.keys(data_markers);
                        var arrs = [];
                        for (var i = 0; i < keys.length; i++) {
                            var temp = data_markers[keys[i]];
                            if (_this.roadmapSelectedMarker == null) {
                                _this.roadmapSelectedMarker = temp;
                            }
                            arrs.push(temp);
                        }
                        return arrs;
                    }
                    else {
                        return [];
                    }
                };
                MapComponent.prototype.onMapReady = function ($event, map) {
                    if (this.mapRoadmapBounds === undefined) {
                        this.mapRoadmapBounds = new google.maps.LatLngBounds();
                    }
                    this.map = $event;
                    var width = jquery_1.default(window).width();
                    if (width < 810) {
                        var height = jquery_1.default(window).height() - 55;
                        jquery_1.default('agm-map').css({ "height": height + "px" });
                        jquery_1.default('#control-section div.row.tab-pane').css({ "height": (height - 38 + "px") });
                        jquery_1.default('#control-section #real-time div.device-list').css({ "height": (height - 60) + "px" });
                        jquery_1.default('#control-section #roadmap div.device-list').css({ "height": (height - 260) + "px" });
                    }
                    else if (width < 900) {
                        var height = jquery_1.default(window).height() - 55;
                        jquery_1.default('agm-map').css({ "height": height + "px" });
                        jquery_1.default('#control-section div.row.tab-pane').css({ "height": (height - 38 + "px") });
                        jquery_1.default('#control-section #real-time div.device-list').css({ "height": (height - 40) + "px" });
                        jquery_1.default('#control-section #roadmap div.device-list').css({ "height": (height - 240) + "px" });
                    }
                    else {
                        var height = jquery_1.default(window).height() - 55;
                        jquery_1.default('agm-map').css({ "height": height + "px" });
                        jquery_1.default('#control-section div.row.tab-pane').css({ "height": (height - 42) + "px" });
                        jquery_1.default('#control-section #real-time div.device-list').css({ "height": (height - 42) + "px" });
                        jquery_1.default('#control-section #roadmap div.device-list').css({ "height": (height - 50 - 153) + "px" });
                    }
                    ;
                    //init geocoder
                    this.geoCoder = new google.maps.Geocoder();
                };
                MapComponent.prototype.onSelected = function ($event) {
                    console.log($event, 'event marker emitted');
                };
                MapComponent.prototype.onChangeTab = function ($event) {
                    console.log($event);
                    var $target = jquery_1.default($event.target).attr('data-target');
                    jquery_1.default('li.tab.active').removeClass('active');
                    jquery_1.default($event.target).addClass('active');
                    jquery_1.default('div.row.tab-pane').addClass('hide');
                    jquery_1.default($target).removeClass('hide');
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
                        }
                        ;
                        this.isRunningRoadmap = false;
                        if (jquery_1.default('#play-roadmap-mobile > i')[0] !== undefined && jquery_1.default('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                            jquery_1.default('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                        }
                    }
                    else {
                        if (this.current_infowindow != null) {
                            this.current_infowindow.close();
                            this.current_infowindow = null;
                        }
                        ;
                        clearInterval(this.internalInterval);
                        this.internalInterval = null;
                        this.isRoadmap = true;
                    }
                };
                MapComponent.prototype.onViewRoadmap = function ($event) {
                    var _this = this;
                    _this.clearCluster();
                    this.canPlayRoadmap = false;
                    var options = {
                        "isRoadmap": true,
                        "dateFrom": this.formatDateTime(this.date_from),
                        "dateTo": this.formatDateTime(this.date_to),
                        "deviceId": this.roadmapSelectedMarker.deviceId
                    };
                    _this.isRunningRoadmap = false;
                    _this.roadmapMarkers = [];
                    _this.mapRoadmapBounds = null;
                    _this.fetchRoadMap(_this.trackingService.urlLocation, options, _this);
                    if (jquery_1.default('#control-section').attr('class').indexOf('slide-left') !== -1) {
                        //remove class slide left and add class slide right
                        jquery_1.default('#control-section').removeClass('slide-left').addClass('slide-right');
                    }
                };
                MapComponent.prototype.fetchRoadMap = function (url, options, context) {
                    context.trackingService.getLocations(url, null, options).
                        then(function (locationObj) {
                        //last time where not thing to load
                        if (!locationObj.hasMore && context.roadmapMarkers.length !== 0
                            && locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined) {
                            console.log('no more on last request');
                            context.displayRoapmap(context);
                        }
                        if (locationObj.markers[context.roadmapSelectedMarker.deviceId] === undefined
                            && context.roadmapMarkers.length === 0 && !context.isRunningRoadmap) {
                            alert("Không có thông tin lộ trình!");
                            context.canPlayRoadmap = false;
                            return false;
                        }
                        ;
                        if (locationObj.markers[context.roadmapSelectedMarker.deviceId] !== undefined) {
                            context.canPlayRoadmap = true;
                            context.roadmapMarkers = context.roadmapMarkers.concat(locationObj.markers[context.roadmapSelectedMarker.deviceId].locations);
                            if (context.mapRoadmapBounds == null) {
                                //load when first load marker in order to know where markers should be
                                context.mapRoadmapBounds = new google.maps.LatLngBounds();
                                for (var i = 0; i < context.roadmapMarkers.length; i++) {
                                    var lt = context.roadmapMarkers[i];
                                    var coord = new google.maps.LatLng({ "lat": lt.lat, "lng": lt.lng });
                                    if (context.mapRoadmapBounds !== undefined) {
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
                            var newoptions_1 = options;
                            newoptions_1['nextLoc'] = locationObj.lastPoint.last_point;
                            //context.isRunningRoadmap = true;
                            setTimeout(function () {
                                context.fetchRoadMap(url, newoptions_1, context);
                            }, 1000);
                        }
                    }, function (error) { });
                };
                MapComponent.prototype.onDeviceSelected = function ($event) {
                    this.roadmapSelectedMarker = $event;
                };
                MapComponent.prototype.displayRoapmap = function (context) {
                    context.mapRoadmapBounds = new google.maps.LatLngBounds();
                    var markers = [];
                    var coords = [];
                    var stopMarkers = [];
                    var parkMarkers = [];
                    var firstLoc = context.roadmapMarkers[0];
                    var firstPoint = new google.maps.LatLng({ "lat": firstLoc.lat, "lng": firstLoc.lng });
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
                    var _loop_1 = function (i) {
                        var lt = context.roadmapMarkers[i];
                        var coord = new google.maps.LatLng({ "lat": lt.lat, "lng": lt.lng });
                        if (context.mapRoadmapBounds !== undefined) {
                            context.mapRoadmapBounds.extend(coord);
                        }
                        var mk = new google.maps.Marker({
                            position: coord,
                            map: context.map,
                            icon: {
                                url: context.getRoadmapPin(i, lt),
                                anchor: new google.maps.Point(10, 10),
                                scaledSize: new google.maps.Size(20, 20)
                            }
                        });
                        //compose infowindow content
                        var state = (lt.state !== '') ?
                            '<span class="col-xs-4 label">Thời gian:</span><span class="col-xs-8 content">' + lt.state + '</span>' : '';
                        var contentWindow = '<div class="marker-info row" id="' + lt.lat + '_' + lt.lng + '">'
                            + '<span class="col-xs-12"><strong>' + lt.time + '</strong></span>'
                            + '<span class="col-xs-4 label">Trạng thái:</span><span class="col-xs-8 content">' + lt.status + '</span>'
                            + state
                            + '<span class="col-xs-4 label">Vận tốc:</span><span class="col-xs-8 content">' + lt.velocity + ' km/h</span>'
                            + '<span class="col-xs-4 label">Tọa độ:</span><span class="col-xs-8 content">' + lt.lat + ', ' + lt.lng + '</span>'
                            + '<span  class="col-xs-4 label">Địa chỉ:</span><span class="col-xs-8 content address"></span></div>';
                        //insert infor window
                        var infowindow = new google.maps.InfoWindow({
                            content: contentWindow
                        });
                        mk.addListener('click', function (evt) {
                            if (context.current_roadmap_infowindow != null) {
                                context.current_roadmap_infowindow.close();
                            }
                            ;
                            context.current_roadmap_infowindow = infowindow;
                            infowindow.open(context.map, mk);
                            var position = mk.getPosition().lat() + '_' + mk.getPosition().lng();
                            var latlng = {
                                "lat": mk.getPosition().lat(),
                                "lng": mk.getPosition().lng()
                            };
                            context.geoCoder.geocode({ 'location': latlng }, function (results, status) {
                                var address = '';
                                if (status === 'OK') {
                                    if (results[0]) {
                                        address = results[0].formatted_address;
                                    }
                                    else {
                                        address = 'N/A';
                                    }
                                }
                                else {
                                    address = 'N/A';
                                }
                                jquery_1.default('.marker-info  span.content.address').text(address);
                            });
                        });
                        coords.push(coord);
                        if (lt.status === 'Dừng') {
                            context.stopMarkers.push(mk);
                        }
                        else if (lt.status === 'Đỗ') {
                            context.parkMarkers.push(mk);
                        }
                        else {
                            markers.push(mk);
                        }
                        ;
                    };
                    for (var i = 1; i < (context.roadmapMarkers.length - 1); i++) {
                        _loop_1(i);
                    }
                    var lastLoc = context.roadmapMarkers[(context.roadmapMarkers.length - 1)];
                    var lastPoint = new google.maps.LatLng({ "lat": lastLoc.lat, "lng": lastLoc.lng });
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
                    context.markerClusterer = new MarkerClusterer(context.map, markers, {
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
                };
                MapComponent.prototype.formatDateTime = function (date) {
                    var datetimeStr = "";
                    var year = date.getFullYear();
                    var month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1));
                    var dateStr = (date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate());
                    var hour = (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours());
                    var minutes = (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
                    var second = (date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds());
                    return year + '-' + month + '-' + dateStr + " " + hour + ":" + minutes + ":" + second;
                };
                MapComponent.prototype.onMarkerClick = function ($event, location, infowindow) {
                    var latlng = {
                        "lat": location.lat,
                        "lng": location.lng
                    };
                    this.geoCoder.geocode({ 'location': latlng }, function (results, status) {
                        if (status === 'OK') {
                            if (results[0]) {
                                location.address = results[0].formatted_address;
                            }
                            else {
                                location.address = 'N/A';
                            }
                        }
                        else {
                            location.address = 'N/A';
                        }
                    });
                    console.log(infowindow, 'infowindow');
                    if (this.current_infowindow != null) {
                        this.current_infowindow.close();
                    }
                    infowindow.open();
                    this.current_infowindow = infowindow;
                };
                MapComponent.prototype.getRoadmapPin = function (index, marker) {
                    var pin = this.icon_roadmap;
                    var img = '';
                    if (index === 0) {
                        img = this.icon_roadmap_start;
                    }
                    else if (index === (this.roadmapMarkers.length - 1)) {
                        img = this.icon_roadmap_end;
                    }
                    else {
                        if (marker.status === 'Đỗ') {
                            img = this.icon_roadmap_stop;
                        }
                        else if (marker.status === 'Dừng') {
                            img = this.icon_roadmap_pause;
                        }
                        else {
                            img = this.icon_roadmap;
                            img = img.replace('$hd$', marker.headingClass);
                        }
                    }
                    return img;
                };
                ;
                MapComponent.prototype.clearCluster = function () {
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
                ;
                MapComponent.prototype.panToMarker = function ($event) {
                    //if mobile mode, slide the device bar
                    if (jquery_1.default('#control-section').attr('class').indexOf('slide-left') !== -1) {
                        //remove class slide left and add class slide right
                        jquery_1.default('#control-device').trigger('click');
                    }
                    ;
                    this.lat = $event.currentLocation.lat;
                    this.lng = $event.currentLocation.lng;
                    this.map.setZoom(16);
                };
                ;
                MapComponent.prototype.onPlayRoadmap = function ($event) {
                    this.doPlayRoadmap();
                };
                ;
                MapComponent.prototype.onStopRoadmap = function ($event) {
                    if (this.interPlayRoadmap != null) {
                        clearInterval(this.interPlayRoadmap);
                    }
                    this.playRoadmapIndex = 0;
                    if (this.playRoadmapMarker != null) {
                        this.playRoadmapMarker.setMap(null);
                        this.playRoadmapMarker = null;
                    }
                    ;
                    this.isRunningRoadmap = false;
                    jquery_1.default('#play-roadmap').text('Xem lại lộ trình');
                    if (jquery_1.default('#play-roadmap-mobile > i').attr('class').indexOf('fa-pause') !== -1) {
                        jquery_1.default('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                    }
                };
                ;
                MapComponent.prototype.onChangeReviewSpeed = function ($event) {
                    console.log($event);
                    if (this.isRunningRoadmap) {
                        this.isRunningRoadmap = false;
                        clearInterval(this.interPlayRoadmap);
                        this.doPlayRoadmap();
                    }
                    ;
                };
                ;
                MapComponent.prototype.doPlayRoadmap = function () {
                    if (this.roadmapMarkers !== null) {
                        var _this_1 = this;
                        if (_this_1.isRunningRoadmap) {
                            _this_1.isRunningRoadmap = false;
                            clearInterval(_this_1.interPlayRoadmap);
                            jquery_1.default('#play-roadmap').text('Xem lại lộ trình');
                            jquery_1.default('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                        }
                        else {
                            _this_1.isRunningRoadmap = true;
                            jquery_1.default('#play-roadmap').text('Tạm dừng');
                            jquery_1.default('#play-roadmap-mobile > i').addClass('fa-pause').removeClass('fa-play');
                            this.interPlayRoadmap = setInterval(function () {
                                if (_this_1.playRoadmapMarker !== null) {
                                    _this_1.playRoadmapMarker.setMap(null);
                                }
                                if (_this_1.roadmapMarkers != null && _this_1.roadmapMarkers[_this_1.playRoadmapIndex] !== undefined
                                    && _this_1.playRoadmapIndex < _this_1.roadmapMarkers.length) {
                                    var tempMarker = _this_1.roadmapMarkers[_this_1.playRoadmapIndex];
                                    var coord = new google.maps.LatLng({ "lat": tempMarker.lat, "lng": tempMarker.lng });
                                    _this_1.playRoadmapMarker = new google.maps.Marker({
                                        position: coord,
                                        map: _this_1.map,
                                        icon: {
                                            url: _this_1.getRoadmapPin(_this_1.playRoadmapIndex, tempMarker),
                                            anchor: new google.maps.Point(15, 15),
                                            scaledSize: new google.maps.Size(30, 30)
                                        }
                                    });
                                    if (!_this_1.map.getBounds().contains(_this_1.playRoadmapMarker.getPosition())) {
                                        _this_1.map.panTo(_this_1.playRoadmapMarker.getPosition());
                                    }
                                    _this_1.playRoadmapIndex++;
                                }
                                else {
                                    clearInterval(_this_1.interPlayRoadmap);
                                    _this_1.playRoadmapIndex = 0;
                                    _this_1.playRoadmapMarker.setMap(null);
                                    _this_1.playRoadmapMarker = null;
                                    jquery_1.default('#play-roadmap').text('Xem lại lộ trình');
                                    jquery_1.default('#play-roadmap-mobile > i').removeClass('fa-pause').addClass('fa-play');
                                    _this_1.isRunningRoadmap = false;
                                    return false;
                                }
                            }, 400 - (_this_1.rangeVel * 30));
                        }
                    }
                };
                ;
                MapComponent.prototype.getStatusIcon = function (location) {
                    if (location === undefined || location == null) {
                        return this.icon_status_stop;
                    }
                    if (location.status === 'Đỗ') {
                        return this.icon_status_stop;
                    }
                    else if (location.status === 'Dừng') {
                        return this.icon_status_park;
                    }
                    else if (location.status === 'Đang chạy') {
                        return this.icon_status_play;
                    }
                    else {
                        return this.icon_status_lost_gsm;
                    }
                };
                MapComponent = __decorate([
                    core_1.Component({
                        selector: 'map',
                        templateUrl: './app/map/components/map.component.html',
                        styleUrls: [
                            './app/map/components/map.css',
                            './app/map/components/nouislider.css',
                        ]
                    }),
                    __metadata("design:paramtypes", [TrackingService_1.TrackingService, core_2.MapsAPILoader])
                ], MapComponent);
                return MapComponent;
            }());
            exports_1("MapComponent", MapComponent);
            // create new class to handle all change of marker called cluster
            // each changing literal, market will be change current location so that their position on map will be changed 
        }
    };
});

//# sourceMappingURL=map.component.js.map
