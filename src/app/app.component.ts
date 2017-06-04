import {Component, OnInit} from "@angular/core";
import {HeroComponent} from "./hero/components/hero.component";

@Component({
    selector: "app",
    templateUrl: "./app/app.html"
})
export class AppComponent implements OnInit {
    ngOnInit() {
        console.log("Application component initialized ...");
    }
}