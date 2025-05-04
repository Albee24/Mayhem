import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckSelectionDialogComponent } from './deck-selection-dialog.component';

describe('DeckSelectionDialogComponent', () => {
  let component: DeckSelectionDialogComponent;
  let fixture: ComponentFixture<DeckSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeckSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
