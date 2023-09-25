import { Directive, HostListener, Input, Output } from '@angular/core';
import { clamp } from 'lodash';
import { Subject } from 'rxjs';

@Directive({
  selector: '[appPinchZoom]'
})
export class PinchZoomDirective {

  @Input() scaleFactor: number = 0.08;
  @Input() zoomThreshold: number = 9;
  @Input() initialZoom: number = 5;
  @Input() debounceTime: number = 100; // in ms
  scale: number;
  @Output() onPinch$: Subject<number> = new Subject<number>();
  constructor() {
    
  }
  ngOnInit(): void {
    this.scale = this.initialZoom;
  }
  @HostListener('wheel', ['$event'])
  onWheel($event: WheelEvent) {
    if (!$event.ctrlKey) return;
    if ($event.cancelable) $event.preventDefault();
    let scale = this.scale - $event.deltaY * this.scaleFactor;
    scale = clamp(scale, 1, this.zoomThreshold);
    this.calculatePinch(scale);
  }
  calculatePinch(scale: number) {
    this.scale = scale;
    this.onPinch$.next(this.scale);
  }
}
