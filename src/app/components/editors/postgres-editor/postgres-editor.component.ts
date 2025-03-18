import { Component, OnInit } from '@angular/core';
import { DataSource } from 'src/app/models/datasource-config.model';
import { TableService } from 'src/app/services/table.service';

@Component({
  selector: 'app-postgres-editor',
  templateUrl: './postgres-editor.component.html',
  styleUrls: ['./postgres-editor.component.css'],
})
export class PostgresEditorComponent implements OnInit {
  tables: string[] = [];
  selectedTable: string | null = null;

  constructor(private tableService: TableService) {}

  ngOnInit(): void {
    this.loadTables();
  }

  loadTables(): void {
    this.tableService.getTables(DataSource.Postgres, 0).subscribe((res) => {
      this.tables = res.tables;
    });
  }

  handleTableSelect(tableName: string) {
    this.selectedTable = tableName;
    console.log(tableName);

    //this.tableService.getTableStructure(tableName).subscribe((structure) => {});
  }
}
