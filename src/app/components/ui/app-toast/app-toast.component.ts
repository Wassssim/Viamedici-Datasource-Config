import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-app-toast',
  templateUrl: './app-toast.component.html',
  styleUrls: ['./app-toast.component.css'],
})
export class AppToastComponent {
  @Input() message;
}
