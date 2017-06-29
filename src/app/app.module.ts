import {NgModule, ApplicationRef}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AppComponent} from "./app.component";
import { AgmCoreModule } from "@agm/core";
import {MapComponent} from "./map/components/map.component";
import {Http, HttpModule} from "@angular/http";
import {TrackingService} from "./services/TrackingService";


@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        CommonModule,
        FormsModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyC6wjnpjfBcfyyQYpnuXDKEzKombAnFdjc',
            libraries: ['places']
        })
    ],
    declarations: [
        AppComponent,
        MapComponent
    ],
    providers: [
        HttpModule,
        TrackingService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}