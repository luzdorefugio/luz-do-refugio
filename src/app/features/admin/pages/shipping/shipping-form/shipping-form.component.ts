import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShippingService } from '../../../../../core/services/shipping.service';
import { ShippingMethod } from '../../../../../core/models/shipping.model';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
    selector: 'app-shipping-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './shipping-form.component.html'
})
export class ShippingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ShippingService);
  private noti = inject(NotificationService);

  @Input() set data(val: ShippingMethod | null) {
    if (val) {
        this.isEdit = true;
        this.id = val.id;
        this.form.patchValue(val);
    }
  }
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  isEdit = false;
  id: string | null = null;
  isLoading = false;

    constructor() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            displayOrder: [0, Validators.required],
            minWeightGrams: [0],           // Default 0
            maxWeightGrams: [999999],      // Default "infinito"
            freeShippingThreshold: [null],
            active: [true]
        });
    }

  ngOnInit() {}

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const req$ = this.isEdit
        ? this.service.update(this.id!, this.form.value)
        : this.service.create(this.form.value);

    req$.subscribe({
        next: () => {
            this.noti.success('Guardado com sucesso!');
            this.close.emit(true);
        },
        error: (err) => {
            this.noti.apiError(err);
            this.isLoading = false;
        }
    });
  }
}
