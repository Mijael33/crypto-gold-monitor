import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  OnChanges,
  SimpleChanges,
  NgZone
} from '@angular/core';

@Directive({
  selector: '[appHighlightChange]',
  standalone: true
})
export class HighlightChangeDirective implements OnChanges {
  @Input() appHighlightChange!: number;
  @Input() highlightColor: string = '#D4AF37';
  @Input() lowlightColor: string = '#996515';
  
  private previousValue: number | undefined;
  private timeoutId: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // SOLO ejecutar cuando CAMBIA el valor, no en cada ciclo
    if (changes['appHighlightChange']) {
      const newValue = changes['appHighlightChange'].currentValue;
      
      // Solo animar si el valor realmente cambió
      if (this.previousValue !== undefined && 
          this.previousValue !== newValue && 
          Math.abs(newValue - this.previousValue) > 0.01) { // Ignorar cambios mínimos
        const isIncrease = newValue > this.previousValue;
        this.animate(isIncrease);
      }
      
      this.previousValue = newValue;
    }
  }

  private animate(isIncrease: boolean): void {
    this.ngZone.runOutsideAngular(() => {
      // Limpiar timeout anterior
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      
      const color = isIncrease ? this.highlightColor : this.lowlightColor;
      
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s ease, box-shadow 0.3s ease');
      this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
      this.renderer.setStyle(this.el.nativeElement, 'box-shadow', `0 0 15px ${color}`);
      
      this.timeoutId = setTimeout(() => {
        this.renderer.setStyle(this.el.nativeElement, 'background-color', '');
        this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '');
        this.renderer.setStyle(this.el.nativeElement, 'transition', '');
        this.timeoutId = null;
      }, 300);
    });
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}