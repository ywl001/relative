import { ChangeDetectorRef, Component } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import * as toastr from 'toastr';
import { People } from '../mode/Person';
import { RelativeFlag, Tips, bgColor } from '../mode/appType';
import { KinshipService2 } from '../services/kinship2.service';
import { LocalStorgeService } from '../services/local-storge.service';
import { MessageService } from '../services/message.service';
import { SqlService } from '../services/sql.service';

enum appState {
  basePeople,
  relative
}

declare var IDValidator;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  title = '设置基准人员';
  titleBg: string = bgColor.blue
  private validator = new IDValidator()

  basePeople: People;

  state: appState;

  isShowBtnReset: boolean;

  constructor(
    private sql: SqlService,
    private cdr: ChangeDetectorRef,
    private localService: LocalStorgeService,
    private route: ActivatedRoute,
    private kinshipService: KinshipService2,
    private messageService: MessageService) { }

  ngOnInit() {
    this.state = appState.basePeople;
    const id = this.route.snapshot.paramMap.get('id')!;
    console.log(id);
    console.log(this.validator.makeID().substring(0, 8))
    console.log(this.validator.isValid('410306197401270516'))
    this.messageService.setBasePeople$.subscribe(res => {
      console.log(res)
      this.basePeople = res;
    })

    this.messageService.reLoadChart$.subscribe(res=>{
      console.log('db click');
      const key = this.basePeople.name +'->' + this.basePeople.peopleNumber;
      this.localService.remove(key);
      this.onShowChart();
    })
  }

  onSelectPeople(p: People) {
    if (!this.basePeople) {
      this.basePeople = p;
      this.setState(appState.relative)
    } else {
      if (this.basePeople.isRandomPid() || p.isRandomPid()) {
        this.setRandomPidRelative(p)
      } else {
        Swal.fire({
          title: Tips.confirmRelation,
          confirmButtonText: Tips.ok,
          showCancelButton: true,
          cancelButtonText: Tips.cancel,
        }).then(result => {
          if (result.isConfirmed) {
            console.log('ok', p)
            this.setRelative(p);
          } else if (result.isDismissed) {
            console.log('cancel')
          }
        })
      }
    }
  }



  private setRandomPidRelative(p: People) {
    Swal.fire({
      title: `该人员是${this.basePeople.name}的？`,
      input: 'radio',
      showCancelButton: true,
      cancelButtonText: Tips.cancel,
      inputOptions: {
        [RelativeFlag.father]: '父亲',
        [RelativeFlag.mother]: '母亲',
        [RelativeFlag.son]: '儿子',
        [RelativeFlag.daughter]: '女儿'
      },
      inputValidator: (value) => {
        if (!value) {
          return '请选择关系!'
        }
        return null;
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.setRelative(p, res.value)
      }
    })
  }


  private setRelative(p: People, r: RelativeFlag = null) {
    if (!r) {
      r = this.basePeople.getRelation(p);
      if (!r) {
        toastr.error()
        return;
      }
    }

    const tableName = 'people'
    let data: any;
    let id: number;
    if (r == RelativeFlag.father) {
      data = { fatherId: p.peopleNumber };
      id = this.basePeople.id;
      this.basePeople.fatherId = p.peopleNumber;
    } else if (r == RelativeFlag.mother) {
      data = { motherId: p.peopleNumber };
      id = this.basePeople.id;
      this.basePeople.motherId = p.peopleNumber;
    } else if (r == RelativeFlag.son || r == RelativeFlag.daughter) {
      id = p.id;
      if (this.basePeople.sex == People.male) {
        data = { fatherId: this.basePeople.peopleNumber }
      } else {
        data = { motherId: this.basePeople.peopleNumber }
      }
    }
    console.log('set relative data', data)
    this.sql.update(tableName, data, id).subscribe(res => {
      if (res > 0) {
        this.messageService.refresh();
        toastr.success(Tips.success);
      } else {
        toastr.error(Tips.faile)
      }
    })
  }

  private setState(s: appState) {
    if (s == appState.basePeople) {
      this.title = Tips.title1;
      this.titleBg = bgColor.blue;
      this.basePeople = null;
      this.isShowBtnReset = false;
    } else if (s == appState.relative) {
      this.title = Tips.title2;
      this.titleBg = bgColor.orange
      this.isShowBtnReset = true
    }
  }

  onReset() {
    this.setState(appState.basePeople)
  }

  onShowChart() {
    // console.log(this.basePeople)
    // this.kinshipService.data=this.basePeople;
    const nodes = this.localService.getNode(this.basePeople.name + '->' + this.basePeople.peopleNumber);
    if (nodes) {
      console.log('本地取出亲戚关系')
      this.messageService.getNodesSuccess(nodes);
    } else {
      this.kinshipService.data=this.basePeople;
    }
  }
}
