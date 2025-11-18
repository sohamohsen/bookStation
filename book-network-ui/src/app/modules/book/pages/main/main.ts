import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MenuComponent
  ],
  templateUrl: './main.html',
  styleUrls: ['./main.scss'],
})
export class Main {}
