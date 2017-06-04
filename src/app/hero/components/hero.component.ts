/**
 * Created by Hiep Quach on 6/3/2017.
 */
import {Component, Input} from "@angular/core";
import {Hero} from "../models/hero";

@Component({
    selector: 'hero',
    templateUrl: './app/hero/components/hero.html'
})
export class HeroComponent {
    @Input() hero: Hero = {
        id: 1,
        name: 'Windstorm',
        superPower: "Fly in the space"
    };
}