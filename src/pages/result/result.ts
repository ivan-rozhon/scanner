import { Component } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { SMS } from '@ionic-native/sms';
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
    private clipboard: Clipboard,
    private sms: SMS
  ) {
    // assign result params
    this.text = this.params.get('text');
    this.format = this.params.get('format');
  }

  /**
   * convert result string to readable string according to QR type
   * @param result
   */
  printResult(result: string): string {
    // split result by ':' to arr
    const splitted = result.split(':');

    if (this.isSms(result)) {
      const smsText = [...splitted].slice(2).join(':');

      // return number and text of SMS separated by space
      return `${splitted[1]} ${smsText}`;
    }

    else if (this.isTel(result)) {
      // return just all after identifier
      return [...splitted].slice(1).join(':');;
    }

    return result;
  }

  /**
   * open URL link in browser
   * @param uri URI to open
   */
  openLink(uri: string): void {
    // (if uri does not starts with 'http' protocol, add it)
    window.open(uri.startsWith('http') ? uri : `http://${uri}`, '_system');
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
   * send sms (open native sms app with number & text)
   * @param result
   */
  sendSms(result: string): void {
    // split result blocks - identificator, number, text
    const blocks = result.split(':');

    // blocks must contains: identificator, number, text
    if (blocks.length >= 3) {
        // phone number is after identificator
        const number = blocks[1];
        // join all strings after number
        const text = [...blocks].slice(2).join(':');

        // open native sms app with params
        this.sms.send(number, text, { android: { intent: 'INTENT' }});
    }
  }

  /**
   * call (open native phone app with number)
   * @param result
   */
  call(result: string): void {
    // open native call app
    window.open(result, '_system');
  }

  /**
   * check if result is valid URI
   * @param text result text to check
   */
  isUri(text: string): boolean {
    return (text.startsWith('http')
      // if uri does not starts with 'http' protocol, add it
      ? isWebUri(text)
      : isWebUri(`http://${text}`)) &&
      // check other available formats
      !this.isSms(text) && !this.isTel(text);
  }

  /**
   * check if result is in QR SMS format
   * @param text result text to check
   */
  isSms(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    // valid identificators are 'sms:' and 'smsto:'
    return lowerText.startsWith('sms:') || lowerText.startsWith('smsto:');
  }

  /**
   * check if result is in QR TEL format
   * @param text result text to check
   */
  isTel(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    // valid identificator is 'tel:'
    return lowerText.startsWith('tel:');
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
