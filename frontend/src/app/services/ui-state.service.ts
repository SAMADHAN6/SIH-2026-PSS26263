import { Injectable, signal } from '@angular/core';

export interface UiMessage {
  type: 'error' | 'info' | 'success';
  text: string;
  id: number;
}

/**
 * Global UI state: connection banners and toast notifications.
 * Services push messages here; the app shell renders them.
 */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly banner = signal<UiMessage | null>(null);
  readonly toast = signal<UiMessage | null>(null);

  private counter = 0;
  private toastTimer: any = null;

  showError(text: string) {
    this.banner.set({ type: 'error', text, id: ++this.counter });
  }

  clearError() {
    this.banner.set(null);
  }

  showToast(text: string, type: UiMessage['type'] = 'success') {
    this.toast.set({ type, text, id: ++this.counter });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4200);
  }
}
