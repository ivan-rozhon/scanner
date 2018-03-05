import { Component } from '@angular/core';
import { ViewController, NavParams, ToastController } from 'ionic-angular';

// native
import { Clipboard } from '@ionic-native/clipboard';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

import { isWebUri } from 'valid-url';

import { StorageProvider } from '../../providers/storage/storage';
import { ParseProvider, Contact } from './../../providers/parse/parse';

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
    private launchNavigator: LaunchNavigator,
    private parseProvider: ParseProvider
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
      // return only filled items
      return [...this.parseProvider.parseMail(result)].filter(o => o.length).join(' | ');
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

    else if (this.isWifi(result)) {
      // return only filled items
      return [...this.parseProvider.parseWifi(result)].filter(o => o.length).join(' | ');
    }

    else if (this.isContact(result)) {
      // contact object
      const contact: Contact = this.parseProvider.parseContact(result);

      // get arr of contact property
      const contactArr = Object.keys(contact).map(property => contact[property]);

      // return only filled items
      return [...contactArr].filter(o => o.length).join(' | ');
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
    const parsed = this.parseProvider.parseMail(result);

    // send e-mail via email composer
    this.emailComposer.open({
      to: parsed[0],
      subject: parsed[1],
      body: parsed[2]
    });
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
    window.open(`https://www.google.cz/search?q=${encodeURI(result)}`, '_system');
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
    // check valid identificators 'sms:' and 'smsto:'
    return this.qrCheck(text, 'sms:', 'smsto:');
  }

  /**
   * check if result is in QR TEL format
   * @param text result text to check
   */
  isTel(text: string): boolean {
    // check valid identificator 'tel:'
    return this.qrCheck(text, 'tel:');
  }

  /**
   * check if result is in QR GEO format
   * @param text result text to check
   */
  isGeo(text: string): boolean {
    // check valid identificator 'geo:'
    return this.qrCheck(text, 'geo:');
  }

  /**
   * check if result is in QR MAIL format
   * @param text result text to check
   */
  isMail(text: string): boolean {
    // check valid identificators 'mailto:', 'MATMSG:' and 'SMTP:'
    return this.qrCheck(text, 'mailto:', 'MATMSG:', 'SMTP:');
  }

  /**
   * check if result is in QR wifi format
   * @param text result text to check
   */
  isWifi(text: string): boolean {
    // check valid identificator 'WIFI:'
    return this.qrCheck(text, 'WIFI:');
  }

  /**
   * check if result is in QR contact (vcard, bizcard, mecard) format
   * @param text result text to check
   */
  isContact(text: string): boolean {
    // lower and trim string to compare
    const lowerAndTrimmed = text.trim().toLowerCase();

    // check valid identificators 'BIZCARD:', 'BEGIN:VCARD' and 'MECARD:'
    return this.qrCheck(text, 'BIZCARD:', 'MECARD:') ||
      // specific case is vcard - it must begin and ends with...
      (lowerAndTrimmed.startsWith('begin:vcard') && lowerAndTrimmed.endsWith('end:vcard'));
  }

  /**
   * check if result is in specific QR format
   * @param text result text to check
   * @param types all types to check
   */
  qrCheck(text: string, ...types: string[]): boolean {
    // convert result string to lower case
    const lowerText = text.toLowerCase().trim();
    // declare initial state of result (false)
    let isType = false;

    // check all input types (one must be true)
    [...types,].map(type => {
      // compare lower cases of formats (results must begin with 'type')
      if (lowerText.startsWith(type.toLowerCase())) {
        isType = true;
      }
    })

    // result must be also QR code
    return this.format === 'QR_CODE' && isType;
  }

  /**
   * check if result is not in any known format
   * @param text result text to check
   */
  isSearch(text: string): boolean {
    return !this.isUri(text) && !this.isTel(text) && !this.isSms(text) && !this.isMail(text) && !this.isGeo(text) && !this.isWifi(text) && !this.isContact(text);
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
