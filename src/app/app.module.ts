import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from "./app.component";
import { AgmCoreModule } from "@agm/core";
import {MapComponent} from "./map/components/map.component";

@NgModule({
    imports: [
        BrowserModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyA0M4JqFrQj7j9WLtmyvYgn6f4O_zQX54c'
        })
    ],
    declarations: [
        AppComponent,
        MapComponent
    ],
    providers: [
        //appRoutingProviders
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}