import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
	selector: 'app-upload-image',
	templateUrl: './upload-image.component.html',
	styleUrls: ['./upload-image.component.scss'],
	standalone: true,
	imports: [CommonModule, ButtonComponent],
})
export class UploadImageComponent {
	@Output() loading = new EventEmitter();
	@Output() formData = new EventEmitter();

	@Input() imgSrc = '';
	@Input() isSmall = false;

	onFileSelected(event: Event): void {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			this.uploadProfileImage(file);
		}
	}

	uploadProfileImage(file: File): void {
		this.loading.emit(true);
		const formData = new FormData();
		formData.append('image', file);
		this.formData.emit(formData);
	}
}
