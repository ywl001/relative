import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { People } from '../mode/Person';
import { KinshipNode } from '../mode/kinship';


export enum MessageType {
  refresh = 'refresh',
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor() {}

  private _refresh = new Subject<null>();
  refresh$ = this._refresh.asObservable();
  refresh() {
    this._refresh.next(null);
  }

  private _setBasePeople=new Subject<People>();
  setBasePeople$ = this._setBasePeople.asObservable();
  setBasePeople(p:People){
    this._setBasePeople.next(p)
  }

  private _reLayoutChart = new Subject();
  reLayoutChart$ = this._reLayoutChart.asObservable();
  reLayoutChart() {
    this._reLayoutChart.next(null);
  }

  private _getNodesSuccess = new Subject<KinshipNode[]>();
  getNodesSuccess$ = this._getNodesSuccess.asObservable();
  getNodesSuccess(data:KinshipNode[]) {
    this._getNodesSuccess.next(data);
  }

  private _closeChart = new Subject();
  closeChart$ = this._closeChart.asObservable();
  closeChart() {
    this._closeChart.next(null);
  }

  private _reLoadChart = new Subject();
  reLoadChart$ = this._reLoadChart.asObservable();
  reLoadChart() {
    this._reLoadChart.next(null);
  }



}

