import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOverDialogComponent } from './game-over-dialog.component';

describe('GameOverDialogComponent', () => {
  let component: GameOverDialogComponent;
  let fixture: ComponentFixture<GameOverDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameOverDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameOverDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
