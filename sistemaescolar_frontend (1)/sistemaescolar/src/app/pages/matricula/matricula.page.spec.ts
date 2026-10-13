import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatriculaPage } from './matricula.page';

describe('MatriculaPage', () => {
  let component: MatriculaPage;
  let fixture: ComponentFixture<MatriculaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MatriculaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
