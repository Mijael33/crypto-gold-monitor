import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoAsset } from '../../shared/models/crypto.models';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crypto-card.component.html',
  styleUrls: ['./crypto-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoCardComponent {
  @Input({ required: true }) asset!: CryptoAsset;
  @Input() alertThreshold?: number;
  @Input() isAlertActive: boolean = false;
  @Output() setAlert = new EventEmitter<{ id: string; threshold: number }>();
  @Output() removeAlert = new EventEmitter<string>();

  thresholdValue: number = 0;
  showAlertInput = false;
  protected Math = Math;

  get priceChangeClass(): string {
    return this.asset.changePercent >= 0 ? 'positive' : 'negative';
  }

  get alertActive(): boolean {
    return this.isAlertActive;
  }

  toggleAlertInput(): void {
    this.showAlertInput = !this.showAlertInput;
    if (this.showAlertInput && this.alertThreshold) {
      this.thresholdValue = this.alertThreshold;
    } else if (this.showAlertInput && !this.alertThreshold) {
      // ✅ Valor sugerido: precio actual + 10%
      this.thresholdValue = Math.round(this.asset.price * 1.1 * 100) / 100;
    }
  }

  onSetAlert(): void {
    if (this.thresholdValue > 0) {
      this.setAlert.emit({
        id: this.asset.id,
        threshold: this.thresholdValue
      });
      this.showAlertInput = false;
    }
  }

  onRemoveAlert(): void {
    this.removeAlert.emit(this.asset.id);
    this.showAlertInput = false;
  }
}