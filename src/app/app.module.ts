import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from "./app.component";
import { AgmCoreModule } from "@agm/core";
import {MapComponent} from "./map/components/map.component";
import {TrackingService} from "./services/TrackingService";
import { Http, HttpModule } from "@angular/http";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyA0M4JqFrQj7j9WLtmyvYgn6f4O_zQX54c'
        })
    ],
    declarations: [
        AppComponent,
        MapComponent
    ],
    providers: [
        TrackingService,
        HttpModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}