import { ChangeDetectorRef, Component } from '@angular/core';
import * as IDValidator from 'id-validator';
import * as toastr from 'toastr';
import { SqlService } from './services/sql.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'relative';

  private validator = new IDValidator()

  basePid: string = '410306197401270516';
  pname:string;
  motherId: string;
  motherName:string;
  fatherId: string;
  fatherName:string;

  private isBaseRight:boolean;

  constructor(private sql:SqlService,private cdr:ChangeDetectorRef){}


  onBasePeopleBlur() {
    console.log('ssss')
    if (this.idValidate(this.basePid)) {
      //服务器拉取数据
      this.sql.getPeople(this.basePid).subscribe(
        res=>{
          if(res.length > 0){
            const p = res[0];
            this.pname = res[0].name;
            if(p.fatherId?.length == 18){
              this.fatherId = p.fatherId;
              this.fatherName = '人员父亲身份证号已经设置'
            }

            if(p.motherId?.length == 18){
              this.motherId = p.motherId;
              this.motherName = '人员母亲身份证号已经设置'
            }
            this.cdr.markForCheck()
          }
        }
      )
    }
  }

  private idValidate(pid: string) {
    const res = this.validator.isValid(pid);
    if (!res) {
      toastr.error('身份证号输入有误')
    }
    return res;
  }

  private getPeopleInfo() {

  }

  onSubmit() {

  }
}
