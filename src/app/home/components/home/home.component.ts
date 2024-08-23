import { NgIf } from '@angular/common';

import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { HttpClient } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { HomeService } from '../../service/home.service';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedFile: File | null = null;
  filePreview: SafeResourceUrl | null = null;
  isImage: boolean = false;

  image_result: string;

  date_message: string;

  showProgressSpinner: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private homeService: HomeService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.processFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  processFile(file: File): void {
    this.image_result = '';
    this.selectedFile = file;
    const reader = new FileReader();
    this.isImage = file.type.startsWith('image/');

    reader.onload = () => {
      if (this.isImage) {
        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(
          reader.result as string
        );
      } else if (file.type === 'application/pdf') {
        const pdfBlob = new Blob([reader.result as ArrayBuffer], {
          type: 'application/pdf',
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.filePreview =
          this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      } else {
        this.filePreview = null;
      }
    };

    if (this.isImage) {
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      reader.readAsArrayBuffer(file);
    }
  }

  onSubmit() {
    if (this.selectedFile) {
      this.showProgressSpinner = true;
      const formData = new FormData();
      formData.append('image', this.selectedFile, this.selectedFile.name);

      this.homeService.detectErrorInFiles(formData).subscribe({
        next: (response: any) => {
          if (response.body) {
            this.showProgressSpinner = false;
            this.date_message = response.body.date_message;
            console.log('Date message:', response.body.date_message);
            this.image_result = response.body.image_result;
            // console.log('Image result:', response.body.image_result);
          } else {
            console.log('Response body:', response);
          }
        },
        error: (error) => {
          this.showProgressSpinner = false;
          console.error('There was an error!', error);
          // Handle the error
        },
      });
    } else {
      console.error('No file selected.');
    }
  }
}
