import { Component, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss'],
	standalone: true,
})
export class ButtonComponent {
	@Output() onClick = new EventEmitter<void>();
}
