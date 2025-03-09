import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForeignKeySelectComponent } from './foreign-key-select.component';

describe('ForeignKeySelectComponent', () => {
  let component: ForeignKeySelectComponent;
  let fixture: ComponentFixture<ForeignKeySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForeignKeySelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForeignKeySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
