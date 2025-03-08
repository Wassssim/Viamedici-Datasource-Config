import { Component, OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';
import { DataSourceConfig, DataSource } from './models/datasource-config.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  config: DataSourceConfig | null = null;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.configService.getConfig().subscribe((data) => {
      this.config = data;
    });
  }

  get selectedSource() {
    return this.config?.selectedSource;
  }

  get sourceConfig() {
    return this.config?.sourcesConfig[this.selectedSource!];
  }
}
