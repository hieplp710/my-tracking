/**
 * Created by hiepl on 6/18/2017.
 */
import { Location } from './Location';

export interface MyMarker {
    deviceId: number;
    deviceNumber: string;
    currentLocation : Location;
    isExpired: boolean;
    expiredDate: string;
    locations: Location[];
    visible? : boolean;
    isEdit? : boolean;
    expiredType? : number;
}

export interface LocationObj {
    markers : object;
    lastPoint : Location;
    hasMore?: boolean;
}