import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSelectionDialogComponent } from './player-selection-dialog.component';

describe('PlayerSelectionDialogComponent', () => {
  let component: PlayerSelectionDialogComponent;
  let fixture: ComponentFixture<PlayerSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
