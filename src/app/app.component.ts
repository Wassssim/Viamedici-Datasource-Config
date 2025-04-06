import { Component, OnInit } from '@angular/core';
import { DataSourceConfig } from './models/datasource-config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  config: DataSourceConfig | null = null;
  selectedSource: { sourceType: string; id: number };

  constructor() {}

  ngOnInit() {}

  onSourceSelected(source) {
    this.selectedSource = source;
  }

  unselectSource() {
    this.selectedSource = null;
  }
}
