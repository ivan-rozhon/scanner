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
      return [...splitted].slice(1).join(':');
    }

    else if (this.isGeo(result)) {
      // get coordinations
      const geoArr = [...splitted].slice(1).join(':').split(',');

      let geoText = '';

      // add each coordinate separated by coma and space
      for (const i in geoArr) {
        geoText = geoText.length
          ? `${geoText}, ${geoArr[i]}`
          : geoArr[i];
      }

      return geoText;
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
   * @param result text to copy
   */
  copy(result: string): void {
    // copy (save) result to clipboard
    this.clipboard.copy(result);

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
   * @param result number and text
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
      this.sms.send(number, text, { android: { intent: 'INTENT' } });
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
   * open map app with coordinations
   * @param result coordinations
   */
  locateOrNavigate(result: string, navigate?: boolean): void {
    // split result blocks - identificator, coordinations
    const blocks = result.split(':');
    // get only coordinations
    const coordinations = [...blocks].slice(1).join(':');

    // TODO... open navigation (between two locations)
    // window.open(
    //   navigate
    //     ? `geo:?daddr=${coordinations}`
    //     : `geo:?q=${coordinations}`,
    //   '_system'
    // );

    // open maps app with coordinations
    window.open(`geo:?q=${coordinations}`, '_system');
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
      // check also via regex
      this.isUriRegex(text) &&
      // check other available formats
      !this.isSms(text) && !this.isTel(text) &&
      // true URI only if it is QR code
      this.format === 'QR_CODE';
  }

  /**
   * helper URI test regex
   * @param text string to test
   */
  isUriRegex(text): boolean {
    // https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
    const regex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/gi;

    return regex.test(text);
  }

  /**
   * check if result is in QR SMS format
   * @param text result text to check
   */
  isSms(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    // valid identificators are 'sms:' and 'smsto:'
    return lowerText.startsWith('sms:') || lowerText.startsWith('smsto:') &&
      // true only if it is QR code
      this.format === 'QR_CODE';
  }

  /**
   * check if result is in QR TEL format
   * @param text result text to check
   */
  isTel(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    // valid identificator is 'tel:'
    return lowerText.startsWith('tel:') &&
      // true only if it is QR code
      this.format === 'QR_CODE';
  }

  /**
   * check if result is in QR GEO format
   * @param text result text to check
   */
  isGeo(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    return lowerText.startsWith('geo:') &&
      // true only if it is QR code
      this.format === 'QR_CODE';
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
