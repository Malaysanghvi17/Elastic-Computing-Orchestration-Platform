// pod-shell.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PodShellComponent } from './pod-shell.component';

@NgModule({
  declarations: [
    PodShellComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    PodShellComponent
  ]
})
export class PodShellModule { }