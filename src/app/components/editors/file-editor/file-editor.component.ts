import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileParserService } from 'src/app/services/file.service';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css'],
})
export class FileEditorComponent implements OnInit {
  @Input('id') sourceId;
  @Output() exit = new EventEmitter<any>();

  parsedData: { key: string; value: string }[] = [];
  constructor(private fileParserService: FileParserService) {}

  async ngOnInit() {
    this.fileParserService
      .getPropertiesFileData(this.sourceId)
      .subscribe((response) => {
        const result = Object.keys(response.data).map((key) => ({
          key,
          value: response.data[key],
        }));

        this.parsedData = result;
      });
  }

  updateFile(data) {
    this.fileParserService
      .updatePropertiesFileData(this.sourceId, data)
      .subscribe((resp) => {});
  }

  goBack() {
    this.exit.emit();
  }
}
