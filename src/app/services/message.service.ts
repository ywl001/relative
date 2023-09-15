import { Injectable, Type } from '@angular/core';
import Point from '@arcgis/core/geometry/Point';
import { Subject } from 'rxjs';




export enum MessageType {
  closeInfowindow = 'closeInfoWindow',
  startPickMapPoint = 'startMove',
  refreshMark = 'refreshMark',
  clickMap = 'clickMap',
  uploadFile = 'uploadFile',
  closePeoplePlanel = 'closePeoplePlanel',
  saveLocation = "saveLocation"
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor() {}

  private _showInfoWindow = new Subject<Type<unknown>>();
  showInfoWindow$ = this._showInfoWindow.asObservable();
  showInfoWindow<T>(p:Type<T>) {
    this._showInfoWindow.next(p);
  }

  private _message = new Subject<MessageType>();
  message$ = this._message.asObservable();
  sendMessage(m:MessageType) {
    this._message.next(m);
  }

  private _uploadImage = new Subject<any>();
  uploadImage$ = this._uploadImage.asObservable();
  uploadImage(uploadData:any) {
    this._uploadImage.next(uploadData);
  }

  private _reLayoutChart = new Subject();
  reLayoutChart$ = this._reLayoutChart.asObservable();
  reLayoutChart() {
    this._reLayoutChart.next(null);
  }

  private _getPoint = new Subject<Point>();
  pickMapPoint$ = this._getPoint.asObservable();
  pickMapPoint(p:Point) {
    this._getPoint.next(p);
  }

  private _isShowBusyIcon = new Subject<boolean>();
  isShowBusyIcon$ = this._isShowBusyIcon.asObservable();
  isShowBusyIcon(isShow:boolean) {
    this._isShowBusyIcon.next(isShow);
  }
}

