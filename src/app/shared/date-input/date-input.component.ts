import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  standalone: false,
})
export class DateInputComponent implements OnChanges {
  @Input() label = 'Date';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  calendarValue = '';

  constructor(public readonly i18n: I18nService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.calendarValue = this.toCalendarDate(this.value);
    }
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  confirm(): void {
    this.valueChange.emit(this.toDateOnly(this.calendarValue));
    this.isOpen = false;
  }

  onCalendarChange(event: CustomEvent): void {
    this.calendarValue = this.toDateOnly(String(event.detail.value ?? ''));
  }

  get locale(): string {
    return this.i18n.currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
  }

  private toCalendarDate(value: string): string {
    if (!value) {
      return '';
    }

    const dateOnly = this.toDateOnly(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return dateOnly;
    }

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return '';
    }

    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private toDateOnly(value: string): string {
    if (!value) {
      return '';
    }

    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : value;
  }

}
