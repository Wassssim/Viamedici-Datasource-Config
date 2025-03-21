import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message-card',
  templateUrl: './error-message-card.component.html',
  styleUrls: ['./error-message-card.component.css'],
})
export class ErrorMessageCardComponent {
  @Input() errorMessage = '';
}
