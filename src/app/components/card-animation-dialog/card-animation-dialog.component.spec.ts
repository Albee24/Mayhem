import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAnimationDialogComponent } from './card-animation-dialog.component';

describe('CardAnimationDialogComponent', () => {
  let component: CardAnimationDialogComponent;
  let fixture: ComponentFixture<CardAnimationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardAnimationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardAnimationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
