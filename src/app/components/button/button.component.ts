import { NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss'],
	standalone: true, // Asegúrate de que esté aquí
	imports: [NgClass],
})
export class ButtonComponent {
	@Input() isSmall = false;
	@Output() onClick = new EventEmitter<void>();
}
