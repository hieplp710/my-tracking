/**
 * Created by hiepl on 6/18/2017.
 */
import { Location } from './Location';

export interface MyMarker {
    deviceId: number;
    deviceNumber: string;
    currentLocation : Location;
    locations: Location[];
    visible? : boolean;
}

export interface LocationObj {
    markers : object;
    lastPoint : Location;
    hasMore?: boolean;
}