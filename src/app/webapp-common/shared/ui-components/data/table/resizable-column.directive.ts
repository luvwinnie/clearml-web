import {AfterViewInit, Directive, OnDestroy} from '@angular/core';
import {ResizableColumn} from 'primeng/table';
import {fromEvent, Subscription} from 'rxjs';

@Directive({
  selector: '[smResizableColumn]',
})
export class ResizableColumnDirective extends ResizableColumn implements AfterViewInit, OnDestroy {
  private sub: Subscription;

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    // Double-click to auto-resize feature disabled due to PrimeNG v20 breaking changes
    // The dt property is now an InputSignal and the resize methods are no longer directly accessible
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.sub?.unsubscribe();
  }
}
