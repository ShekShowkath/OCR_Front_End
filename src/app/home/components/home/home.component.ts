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
  isPdf: boolean = false;
  isWord: boolean = false;

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
    this.isPdf = file.type === 'application/pdf';
    this.isWord =
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    console.log('File type:', file.type);

    if (this.isImage) {
      console.log('It is an image file.');
      reader.onload = () => {
        this.filePreview = this.sanitizer.bypassSecurityTrustResourceUrl(
          reader.result as string
        );
      };
      reader.readAsDataURL(file);
    } else if (this.isPdf) {
      console.log('It is a PDF file.');
      reader.onload = () => {
        const pdfBlob = new Blob([reader.result as ArrayBuffer], {
          type: 'application/pdf',
        });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.filePreview =
          this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      };
      reader.readAsArrayBuffer(file);
    } else if (this.isWord) {
      console.log('It is a Word file.');
      reader.onload = () => {
        const wordBlob = new Blob([reader.result as ArrayBuffer], {
          type: file.type,
        });
        const wordUrl = URL.createObjectURL(wordBlob);
        this.filePreview =
          this.sanitizer.bypassSecurityTrustResourceUrl(wordUrl);
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.log('Unsupported file format.');
      this.filePreview = null;
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
