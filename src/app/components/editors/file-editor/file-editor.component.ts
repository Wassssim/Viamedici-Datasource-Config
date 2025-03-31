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

  errorMessage = '';
  isSaving = false;

  parsedData: { originalKey: string; key: string; value: string }[] = [];
  constructor(private fileParserService: FileParserService) {}

  async ngOnInit() {
    this.fileParserService.getPropertiesFileData(this.sourceId).subscribe(
      (response) => {
        const result = Object.keys(response.data).map((key) => ({
          originalKey: key,
          key,
          value: response.data[key],
        }));

        this.parsedData = result;
      },
      () => (this.errorMessage = 'Failed to load file')
    );
  }

  updateFile(data) {
    this.isSaving = true;
    this.fileParserService
      .updatePropertiesFileData(this.sourceId, data)
      .subscribe(
        () => {
          this.isSaving = false;
        },
        () => {
          this.errorMessage = 'Failed to save file';
          this.isSaving = false;
        }
      );
  }

  goBack() {
    this.exit.emit();
  }
}
