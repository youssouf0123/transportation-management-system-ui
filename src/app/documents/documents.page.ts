import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { DocumentRecord } from '../models/document-record.model';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: false,
})
export class DocumentsPage implements OnInit, OnDestroy {
  @ViewChild('cameraVideo') cameraVideo?: ElementRef<HTMLVideoElement>;

  documents: DocumentRecord[] = [];
  filters = {
    documentType: '',
    entityType: '',
    status: '',
    expiryBefore: '',
  };
  draft: DocumentRecord = {
    title: '',
    documentType: 'LICENSE',
    entityType: 'DRIVER',
    entityId: null,
    status: 'ACTIVE',
    fileUrl: '',
    notes: '',
    expiryDate: '',
  };
  editingId: number | null = null;
  selectedFile: File | null = null;
  selectedFileName = '';
  error = '';
  cameraOpen = false;
  cameraError = '';
  private cameraStream: MediaStream | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService,
    public readonly i18n: I18nService,
    private readonly zone: NgZone,
  ) {}

  get canManageDocuments(): boolean {
    return this.auth.hasRole('OWNER', 'MANAGER', 'DISPATCHER', 'FINANCE');
  }

  get canDeleteDocuments(): boolean {
    return this.auth.hasRole('OWNER', 'MANAGER');
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.api.getDocuments(this.filters).subscribe({
      next: documents => this.documents = documents.map(document => this.api.normalizeDocument(document)),
      error: () => this.error = this.i18n.t('load_documents_error'),
    });
  }

  save(): void {
    if (!this.canManageDocuments) {
      return;
    }

    if (!this.editingId && !this.selectedFile) {
      this.error = this.i18n.t('file_required_upload');
      return;
    }

    const request = this.editingId
      ? this.api.updateDocument(this.editingId, this.draft, this.selectedFile)
      : this.api.createDocument(this.draft, this.selectedFile);

    request.subscribe({
      next: () => {
        this.resetDraft();
        this.load();
      },
      error: () => this.error = this.i18n.t('save_document_error'),
    });
  }

  startEdit(document: DocumentRecord): void {
    if (!this.canManageDocuments) {
      return;
    }

    this.editingId = document.id ?? null;
    this.draft = this.api.normalizeDocument({ ...document });
    this.selectedFile = null;
    this.selectedFileName = document.fileName || '';
  }

  deleteDocument(id?: number): void {
    if (!this.canDeleteDocuments) {
      return;
    }

    if (!id) {
      return;
    }
    this.api.deleteDocument(id).subscribe(() => this.load());
  }

  openDocument(document: DocumentRecord): void {
    if (!document.id) {
      this.error = this.i18n.t('document_file_unavailable');
      return;
    }

    this.api.getDocumentFile(document.id).subscribe({
      next: blob => {
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      },
      error: () => {
        this.error = this.i18n.t('open_document_error');
      },
    });
  }

  resetDraft(): void {
    if (!this.canManageDocuments) {
      return;
    }

    this.editingId = null;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.draft = {
      title: '',
      documentType: 'LICENSE',
      entityType: 'DRIVER',
      entityId: null,
      status: 'ACTIVE',
      fileUrl: '',
      notes: '',
      expiryDate: '',
    };
  }

  triggerPicker(input: HTMLInputElement): void {
    if (!this.canManageDocuments) {
      return;
    }

    input.click();
  }

  onFileSelected(event: Event): void {
    if (!this.canManageDocuments) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFile = file;
    this.selectedFileName = file?.name || this.selectedFileName;
    input.value = '';
  }

  async openCamera(): Promise<void> {
    if (!this.canManageDocuments) {
      return;
    }

    this.cameraError = '';

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError = this.i18n.t('camera_not_supported');
      return;
    }

    try {
      this.stopCamera();
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });
      this.cameraOpen = true;

      requestAnimationFrame(() => {
        const video = this.cameraVideo?.nativeElement;
        if (!video || !this.cameraStream) {
          return;
        }
        video.srcObject = this.cameraStream;
        void video.play();
      });
    } catch {
      this.cameraOpen = false;
      this.cameraError = this.i18n.t('camera_access_error');
    }
  }

  closeCamera(): void {
    if (!this.canManageDocuments) {
      return;
    }

    this.cameraOpen = false;
    this.stopCamera();
  }

  capturePhoto(): void {
    if (!this.canManageDocuments) {
      return;
    }

    const video = this.cameraVideo?.nativeElement;
    if (!video || !this.cameraStream) {
      this.cameraError = this.i18n.t('camera_capture_error');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    if (!context) {
      this.cameraError = this.i18n.t('camera_capture_error');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.cameraOpen = false;
    this.stopCamera();
    canvas.toBlob(blob => {
      if (!blob) {
        this.zone.run(() => {
          this.cameraError = this.i18n.t('camera_capture_error');
        });
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.zone.run(() => {
        this.selectedFile = new File([blob], `document-${timestamp}.jpg`, { type: 'image/jpeg' });
        this.selectedFileName = this.selectedFile.name;
      });
    }, 'image/jpeg', 0.92);
  }

  private stopCamera(): void {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = null;

    const video = this.cameraVideo?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }
}
