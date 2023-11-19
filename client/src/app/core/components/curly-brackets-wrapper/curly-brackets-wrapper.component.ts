import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'nml-curly-brackets-wrapper',
  templateUrl: './curly-brackets-wrapper.component.html',
  styleUrls: ['./curly-brackets-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurlyBracketsWrapperComponent {
  @Input()
  small = false;
}
