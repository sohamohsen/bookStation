import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnBooks } from './return-books';

describe('ReturnBooks', () => {
  let component: ReturnBooks;
  let fixture: ComponentFixture<ReturnBooks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnBooks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnBooks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
