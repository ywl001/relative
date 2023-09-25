import { ChangeDetectorRef, Component, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChartComponent } from './chart/chart.component';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isShowChart:boolean;
  constructor(private message: MessageService, public dialog: MatDialog,    private cdr: ChangeDetectorRef,) { }

  @ViewChild('chartDiv', { static: true,read:ViewContainerRef }) chartDiv: ViewContainerRef;
  // private dialogRef:MatDialogRef<ChartComponent>;
  ngOnInit() {
    this.message.getNodesSuccess$.subscribe(res => {
      console.log(res);
      if (res.length > 0) {
        // this.dialogRef = this.dialog.open(ChartComponent, {
        //   width: window.innerWidth + 'px',
        //   height: window.innerHeight + 'px',
        // });
        // this.dialogRef.componentInstance.data = res;
        // this.isShowChart = true;

        let chart = this.chartDiv.createComponent(ChartComponent);
        chart.instance.data = res;


        // this.cdr.markForCheck();
      }
    })

    // this.message.closeChart$.subscribe(res=>this.dialogRef.close())
    this.message.closeChart$.subscribe(res=>{
      this.chartDiv.clear()
    })
  }
}
