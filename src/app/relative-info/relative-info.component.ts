import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';
import * as toastr from 'toastr';
import { People } from '../mode/Person';
import { RelativeFlag, Tips } from '../mode/appType';
import { MessageService } from '../services/message.service';
import { SqlService } from '../services/sql.service';

@Component({
  selector: 'app-relative-info',
  templateUrl: './relative-info.component.html',
  styleUrls: ['./relative-info.component.scss']
})
export class RelativeInfoComponent {

  private _data: People;
  relatives: People[];

  @Input()
  set data(value: People) {
    if (value) {
      this._data = value;
      this._data.relativeFlag = RelativeFlag.base;
      this.getRelatives(value.peopleNumber)
    }
  }

  get data() {
    return this._data;
  }

  constructor(private sql: SqlService, private message: MessageService) { }

  ngOnInit() {
    this.message.refresh$.subscribe(() => {
      this.getRelatives(this._data.peopleNumber)
    })
  }

  private getRelatives(pid: string) {
    this.sql.getPeopleRelatives(pid).subscribe(
      res => {
        console.log(res);
        this.relatives = this.processData(res)
      })
  }

  private processData(peoples: any[]) {
    let arr = []
    for (let i = 0; i < peoples.length; i++) {
      let p = peoples[i];
      p.relativeFlag = this.data.getRelation2(p)
      arr.push(p);
    }
    return arr;
  }

  onChageBasePeople(p: People) {
    console.log(p)
    Swal.fire({
      title: `确定要改变基准人员为${p.name}吗？`,
      showCancelButton: true,
      confirmButtonText: Tips.ok,
      cancelButtonText: Tips.cancel,
    }).then(result => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.message.setBasePeople(p)
      } else if (result.isDismissed) {
        console.log('cancel')
      }
    }
    )
  }

  onBreakRelative(p: People) {
    Swal.fire({
      title: Tips.delRelation,
      showCancelButton: true,
      confirmButtonText: Tips.ok,
      cancelButtonText: Tips.cancel,
    }).then(result => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        console.log('ok', p)
        this.breakRelative(p)
      } else if (result.isDismissed) {
        console.log('cancel')
      }
    }
    )
  }

  private breakRelative(p: People) {
    console.log(p.relativeFlag)
    const tableName = 'people';
    let data: any;
    let id: number;
    if (p.relativeFlag == RelativeFlag.father) {
      data = { fatherId: null }
      id = this._data.id;
    } else if (p.relativeFlag == RelativeFlag.mother) {
      data = { motherId: null }
      id = this._data.id;
    } else if (p.relativeFlag == RelativeFlag.son || p.relativeFlag == RelativeFlag.daughter) {
      id = p.id;
      if (this._data.sex == People.male) {
        data = { fatherId: null }
      } else {
        data = { motherId: null }
      }
    }

    this.sql.update(tableName, data, id).subscribe(res => {
      if (res > 0) {
        this.message.refresh();
        toastr.success(Tips.success);
      } else {
        toastr.error(Tips.faile)
      }
    })
  }

}
