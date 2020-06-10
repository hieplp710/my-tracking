/**
 * Created by hiepl on 6/24/2017.
 */
export interface Location {
    lat: number;
    lng: number;
    status: string;
    time: string;
    state: string;
    velocity: number;
    headingClass: string;
    address?: string;
    lastTime?: string;
    time_original? : string;
}