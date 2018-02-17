import { Component } from '@angular/core';
import { Clipboard } from '@ionic-native/clipboard';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
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
    private sms: SMS,
    private emailComposer: EmailComposer,
    private launchNavigator: LaunchNavigator
  ) {
    // assign result params
    this.text = this.params.get('text');
    this.format = this.params.get('format');

    // DEBUG
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

      // return number and text of SMS separated by pipe
      return `${splitted[1]} | ${smsText}`;
    }

    else if (this.isTel(result)) {
      // return just all after identifier
      return [...splitted].slice(1).join(':');
    }

    else if (this.isMail(result)) {
      return [...this.parseMail(result)].join(' | ');
    }

    else if (this.isGeo(result)) {
      // get coordinations
      const geoArr = [...splitted].slice(1).join(':').split(',');

      let geoText = '';

      // add each coordinate separated by pipe and space
      for (const i in geoArr) {
        geoText = geoText.length
          ? `${geoText} | ${geoArr[i]}`
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
   * @param result phone number
   */
  call(result: string): void {
    // open native call app
    window.open(result, '_system');
  }

  /**
   * send mail (open mail app)
   * @param result e-mail, subject, text
   */
  sendMail(result: string): void {
    // get parsed arr of data
    const parsed = this.parseMail(result);

    // send e-mail via email composer
    this.emailComposer.open({
      to: parsed[0],
      subject: parsed[1],
      body: parsed[2]
    });
  }

  /**
   * parse email data from QR code
   * @param data e-mail, subject, text
   */
  parseMail(data: string): string[] {
    // split result parts - e-mail, subject, text
    const parts = data.split(':');
    // get indentifier
    const identifier = parts[0].toLowerCase();

    // remove identifier from data
    data = [...parts].slice(1).join(':');

    let mail = [];

    switch (identifier) {
      case 'mailto':
        mail = [
          this.getStringAfter(`mailto:${data}`, 'mailto:', '?'),
          this.getStringAfter(data, 'subject=', '&'),
          this.getStringAfter(data, 'body=')
        ]

        break;

      case 'matmsg':
        mail = [
          this.getStringAfter(data, 'TO:', ';'),
          this.getStringAfter(data, 'SUB:', ';'),
          this.getStringAfter(data, 'BODY:', ';')
        ]

        break;

      case 'smtp':
        // split by ':'
        const smtp = data.split(':');

        // ':' is separator of parts (like in sms)
        mail[0] = smtp[0].trim();
        mail[1] = smtp[1].trim();
        mail[2] = [...smtp].slice(2).join(':').trim();

        break;
    }

    return mail;
  }

  /**
   * get string between splitter string ('TO:') and specified char
   * @param data data to extract
   * @param splitter splitter string
   * @param endChar char which will be end of extract
   */
  getStringAfter(data: string, splitter: string, endChar?: string): string {
    if (!data.includes(splitter) || !data.includes(endChar ? endChar : '')) { return ''; }

    // get second part of splitted data (after splitter)
    data = [...data.split(splitter)][1];

    // extract part of string
    return endChar
      ? data.substr(0, data.indexOf(endChar)).trim()
      : data;
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

    if (navigate) {
      // open navigation (between two locations)
      this.launchNavigator.navigate(coordinations);
    } else {
      // open maps app with coordinations
      window.open(`geo:?q=${coordinations}`, '_system');
    }
  }

  /**
   * search result in browser
   * @param result string to search
   */
  search(result: string): void {
    window.open(`https://www.google.cz/search?q=${result}`, '_system');
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

  /**
   * check if result is in QR MAIL format
   * @param text result text to check
   */
  isMail(text: string): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase();

    // check valid identificators are 'mailto:', 'MATMSG:' and 'SMTP:'
    return lowerText.startsWith('mailto:') || lowerText.startsWith('matmsg:') || lowerText.startsWith('smtp:') &&
      // true only if it is QR code
      this.format === 'QR_CODE';
  }

  /**
   * check if result is not in any known format
   * @param text result text to check
   */
  isSearch(text: string): boolean {
    return !this.isUri(text) && !this.isTel(text) && !this.isSms(text) && !this.isMail(text) && !this.isGeo(text);
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
