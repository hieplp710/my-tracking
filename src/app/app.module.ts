import {NgModule, ApplicationRef}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AppComponent} from "./app.component";
import { AgmCoreModule } from "@agm/core";
import {MapComponent} from "./map/components/map.component";
import {Http, HttpModule} from "@angular/http";
import {TrackingService} from "./services/TrackingService";
import {DeviceComponent} from "./map/components/device.component";
import {ProfileComponent} from "./map/components/profile.component";
import $ from "jquery";
import { NguiDatetimePickerModule } from '@ngui/datetime-picker';
import { NouisliderModule } from 'ng2-nouislider/src/nouislider';
import {PopupComponent} from "./map/components/widgets/popup-device/popup.component";
import { CookieService } from 'angular2-cookie/services/cookies.service';
import {RoadmapInfoComponent} from "./map/components/widgets/roadmap-info/roadmap_info.component";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        CommonModule,
        FormsModule,
        NguiDatetimePickerModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyC6wjnpjfBcfyyQYpnuXDKEzKombAnFdjc',
            libraries: ['places']
        }),
        NouisliderModule
    ],
    declarations: [
        AppComponent,
        MapComponent,
        DeviceComponent,
        ProfileComponent,
        PopupComponent,
        RoadmapInfoComponent
    ],
    providers: [
        HttpModule,
        TrackingService,
        CookieService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}