import { Component } from '@angular/core';
import { AtomAnimation } from './atom-animation/atom-animation.component';

@Component({
  selector: 'app-header',
  imports: [AtomAnimation],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
