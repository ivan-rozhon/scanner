import { Component } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { ViewController, NavParams, ToastController } from 'ionic-angular';

import { isWebUri } from 'valid-url';

import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'page-result',
  templateUrl: 'result.html',
})
export class ResultPage {
  text: string;
  format: string;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public storageProvider: StorageProvider,
    public toastCtrl: ToastController,
    private clipboard: Clipboard
  ) {
    // assign params
    this.text = this.params.get('text');
    this.format = this.params.get('format');
  }

  /**
   * open URL link in browser
   * @param uri URI to open
   */
  openLink(uri: string): void {
    // (if uri starts with 'www' add 'http' protocol)
    window.open(uri.startsWith('www.') ? `http://${uri}`: uri, '_system');
  }

  /**
   * copy result text
   * @param text text to copy
   */
  copy(text: string): void {
    // copy (save) result to clipboard
    this.clipboard.copy(text);

    // notify user (show toast)
    const toast = this.toastCtrl.create({
      message: 'Copied to clipboard',
      duration: 1500,
      position: 'middle',
      dismissOnPageChange: true
    });

    toast.present();
  }

  /**
   * check if result is valid URI
   * @param uri URI to check
   */
  isValidWebUri(uri: string): boolean {
    return uri.startsWith('www.')
      // if uri starts with 'www' add 'http' protocol
      ? isWebUri(`http://${uri}`)
      : isWebUri(uri);
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
