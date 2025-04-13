import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PodShellComponent } from './pod-shell.component';

describe('PodShellComponent', () => {
  let component: PodShellComponent;
  let fixture: ComponentFixture<PodShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PodShellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PodShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
