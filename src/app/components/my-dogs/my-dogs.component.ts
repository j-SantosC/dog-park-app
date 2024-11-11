import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dog } from '../../models/dog-park';
import { ButtonComponent } from '../button/button.component';

@Component({
	selector: 'app-my-dogs',
	standalone: true,
	imports: [NgFor, ButtonComponent],
	templateUrl: './my-dogs.component.html',
	styleUrl: './my-dogs.component.scss',
})
export class MyDogsComponent {
	@Input() myDogs: Dog[] = [];
	@Input() btnText: string = '';

	@Output() btnClicked = new EventEmitter();
}
