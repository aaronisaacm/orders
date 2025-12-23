import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [],
    templateUrl: './modal.component.html',
    styleUrl: './modal.component.css'
})
export class ModalComponent {
    @Input() title: string = '';
    @Input() isOpen: boolean = false;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }

    onBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.close.emit();
        }
    }
}
