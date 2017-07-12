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
import $ from "jquery";
import {A2Edatetimepicker} from "./ng2-datetimepicker/datetimepicker.module";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        CommonModule,
        FormsModule,
        A2Edatetimepicker,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyC6wjnpjfBcfyyQYpnuXDKEzKombAnFdjc',
            libraries: ['places']
        })
    ],
    declarations: [
        AppComponent,
        MapComponent,
        DeviceComponent,
    ],
    providers: [
        HttpModule,
        TrackingService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}