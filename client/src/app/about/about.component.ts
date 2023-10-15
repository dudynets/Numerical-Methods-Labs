import { Component } from '@angular/core';
import { APP_CONFIG } from '@nml/app.config';

@Component({
  selector: 'nml-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  protected readonly APP_CONFIG = APP_CONFIG;
}
