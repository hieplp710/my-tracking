/**
 * Created by hiepl on 4/15/2018.
 */
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import {Http, Response} from "@angular/http";


@Injectable()
export class HelperService {
    constructor (private http: Http) {}
    formatDateTime(date : Date) {
        var datetimeStr = "";
        var year = date.getFullYear();
        var month = ((date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1));
        var dateStr = (date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate());
        var hour = (date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours());
        var minutes = (date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes());
        var second = (date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds());
        return year + '-' + month + '-' + dateStr + " " + hour + ":" + minutes + ":" + second;
    }
    getDataFromPost(url : string, options? : any): Promise<any> {
        //make ajax call in general use
        let _this = this;
        return this.http.post(url, options).toPromise()
            .then(function(value){
                return _this.extractData(value);
            })
            .catch(this.handleError);
    };
    getData(url : string): Promise<any> {
        //make ajax call in general usei
        let _this = this;
        return this.http.get(url).toPromise()
            .then(function(value){
                return _this.extractData(value);
            })
            .catch(this.handleError);
    };
    extractData(value: Response) {
        let body = value.json();
        if ( body.status ) {
            return body.data;
        }
        return [];
    };
    handleError() : void {};
}