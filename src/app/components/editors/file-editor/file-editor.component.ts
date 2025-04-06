import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FileParserService } from 'src/app/services/file.service';

@Component({
  selector: 'app-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.css'],
})
export class FileEditorComponent implements OnInit, OnChanges {
  @Input('id') sourceId;

  errorMessage = '';
  isParsing = false;
  isSaving = false;
  showEditor = false;

  parsedData: { originalKey: string; key: string; value: string }[] = [];
  constructor(private fileParserService: FileParserService) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sourceId'] && !changes['sourceId'].firstChange) {
      this.resetState();
      this.loadData();
    }
  }

  resetState() {
    this.errorMessage = '';
    this.isParsing = false;
    this.isSaving = false;
    this.showEditor = false;
    this.parsedData = [];
  }

  loadData() {
    this.isParsing = true;
    this.showEditor = false;
    this.fileParserService.getPropertiesFileData(this.sourceId).subscribe(
      (response) => {
        const result = Object.keys(response.data).map((key) => ({
          originalKey: key,
          key,
          value: response.data[key],
          isDeleted: false,
        }));

        this.parsedData = result;
        this.isParsing = false;
        this.showEditor = true;
      },
      () => {
        this.isParsing = false;
        this.errorMessage = 'Failed to load file';
      }
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
}
