import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey(
  'CompanyName=Viamedici Software GmbH,LicensedApplication=WebGrid,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=1,LicensedProductionInstancesCount=1,AssetReference=AG-021911,ExpiryDate=4_November_2022_[v2]_MTY2NzUyMDAwMDAwMA==90ae8d851ddaf73fba854ea04048c0cf'
);

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KeyValueEditorComponent } from './components/editors/key-value-editor/key-value-editor.component';
import { FileEditorComponent } from './components/editors/file-editor/file-editor.component';
import { PostgresEditorComponent } from './components/editors/postgres-editor/postgres-editor.component';
import { TableListComponent } from './components/table-list/table-list.component';
import { TableEditorComponent } from './components/editors/table-editor/table-editor.component';
import { ElasticsearchEditorComponent } from './components/editors/elasticsearch-editor/elasticsearch-editor.component';
import { AddDocumentModalComponent } from './components/editors/elasticsearch-editor/add-document-modal/add-document-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { DropdownComponent } from './components/ui/dropdown/dropdown.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    '../webgrid-fe/assets/i18n/', // or whatever path you're using
    '.json'
  );
}

@NgModule({
  declarations: [
    AppComponent,
    KeyValueEditorComponent,
    FileEditorComponent,
    PostgresEditorComponent,
    TableListComponent,
    TableEditorComponent,
    ElasticsearchEditorComponent,
    AddDocumentModalComponent,
    DropdownComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AgGridModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    NgJsonEditorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
