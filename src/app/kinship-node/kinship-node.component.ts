import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';

import { ResizedEvent } from 'angular-resize-event';
import Swal from 'sweetalert2';
import { People } from '../mode/Person';
import { Tips } from '../mode/appType';
import { KinshipNode } from '../mode/kinship';
import { MessageService } from '../services/message.service';
import { SqlService } from '../services/sql.service';

@Component({
  selector: 'app-kinship-node',
  templateUrl: './kinship-node.component.html',
  styleUrls: ['./kinship-node.component.scss']
})
export class KinshipNodeComponent {

  @ViewChild('root', { static: false }) rootDiv!: ElementRef;
  @ViewChild('sibHumanImg', { static: false }) sibHumanImg!: ElementRef;
  @ViewChild('spouseImg', { static: false }) spouseImg!: ElementRef;

  level: number;

  //宽高
  w: number = 0;
  h: number = 0;

  private _x: number = 0;
  public get x(): number {
    return this._x;
  }
  public set x(value: number) {
    this._x = value;
    this.cdr.markForCheck();
  }
  private _y: number = 0;
  public get y(): number {
    return this._y;
  }
  public set y(value: number) {
    this._y = value;
    this.cdr.markForCheck();
  }

  private _data: KinshipNode;

  private sibHuman: People;

  sibHumanPhoto: string;
  spousePhoto: string;
  set data(value: KinshipNode) {
    // console.log("kinNode view set data:",value)
    this._data = value;
    this.level = value.level;
    this.sibHuman = this.data.sibHuman;
    if (this.data?.sibHuman?.thumbUrl) {
      this.sibHumanPhoto = People.serverImg + this.data?.sibHuman?.thumbUrl;
    }

    if (this.data?.spouse?.thumbUrl) {
      this.spousePhoto = People.serverImg + this.data?.spouse?.thumbUrl;
    }
    // this.sql.
  }

  get data(): KinshipNode {
    return this._data;
  }

  /**子节点 */
  children: Array<KinshipNodeComponent> = [];

  parent: KinshipNodeComponent;

  constructor(
    private cdr: ChangeDetectorRef,
    private message: MessageService,
    private sql: SqlService
  ) { }

  ngAfterViewInit() {
    this.h = this.rootDiv.nativeElement.clientHeight;
    this.w = this.rootDiv.nativeElement.clientWidth;
    this.cdr.markForCheck();
    // console.log(this.x,this.y)
  }

  onResized(event: ResizedEvent) {
    // console.log('resize',event.newRect);
    this.h = this.rootDiv.nativeElement.clientHeight;
    this.w = this.rootDiv.nativeElement.clientWidth;
    this.message.reLayoutChart();
  }

  onImgError(e: Event) {
    // console.log(e.target);
    (e.target as any).src = 'assets/noPhoto.png'
  }

  onClick(p: People) {
    console.log(p)

    Swal.fire({
      title: `确定要改变基准人员为${p.name}吗？`,
      showCancelButton: true,
      confirmButtonText: Tips.ok,
      cancelButtonText: Tips.cancel,
    }).then(result => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.message.closeChart()
        this.message.setBasePeople(p)
      } else if (result.isDismissed) {
        console.log('cancel')
      }
    })
  }
}
