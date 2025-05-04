import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameNameDialogComponent } from './game-name-dialog.component';

describe('GameNameDialogComponent', () => {
  let component: GameNameDialogComponent;
  let fixture: ComponentFixture<GameNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameNameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
