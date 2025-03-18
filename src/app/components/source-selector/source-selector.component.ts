import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DataSource } from 'src/app/models/datasource-config.model';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-source-selector',
  templateUrl: './source-selector.component.html',
  styleUrls: ['./source-selector.component.css'],
})
export class SourceSelectorComponent implements OnInit {
  errorMessage = '';
  sourceTypes = [];
  sources = [];
  selectedSourceType: DataSource;
  selectedSource: {
    sourceType: DataSource;
    id: number;
  };
  selectedSourceLabel = '';

  @Output() sourceSelected = new EventEmitter<{
    sourceType: DataSource;
    id: number;
  }>();

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.configService.getSourceTypes().subscribe(
      (res) => (this.sourceTypes = res.sources),
      (_) => (this.errorMessage = 'Error fetching data source types')
    );
  }

  selectSourceType(type) {
    this.selectedSourceType = type;
    this.configService.getSources(type).subscribe(
      (res) => (this.sources = res.data),
      (_) => (this.errorMessage = 'Error fetching data sources')
    );
  }

  selectSource(id, label) {
    this.selectedSource = {
      sourceType: this.selectedSourceType,
      id,
    };
    this.selectedSourceLabel = label;

    this.sourceSelected.emit({ ...this.selectedSource });
  }
}
