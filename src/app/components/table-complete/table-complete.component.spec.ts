import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbdTableComplete } from './table-complete.component';

describe('TableCompleteComponent', () => {
  let component: NgbdTableComplete;
  let fixture: ComponentFixture<NgbdTableComplete>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgbdTableComplete]
    });
    fixture = TestBed.createComponent(NgbdTableComplete);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
