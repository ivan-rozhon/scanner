import { Injectable } from '@angular/core';

import * as vCard from 'vcf';

export interface Contact {
  name: string;
  formatedName?: string;
  tel: string;
  email: string;
  note?: string;
  bday?: string;
  address: string
  url?: string;
  nickname?: string;
  job?: string;
  company?: string;
  title?: string;
}

@Injectable()
export class ParseProvider {

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
          !this.getStringAfter(`mailto:${data}`, 'mailto:', '?').length && data.length
            ? data
            : this.getStringAfter(`mailto:${data}`, 'mailto:', '?'),
          this.getStringAfter(data, 'subject=', '&'),
          this.getStringAfter(data, 'body=')
        ];

        break;

      case 'matmsg':
        mail = [
          this.getStringAfter(data, 'TO:', ';'),
          this.getStringAfter(data, 'SUB:', ';'),
          this.getStringAfter(data, 'BODY:', ';')
        ];

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
   * parse wifi data from QR code
   * @param data type, ssid, password
   */
  parseWifi(data: string): string[] {
    // split result parts - type, ssid, password
    const parts = data.split(':');

    // remove identifier from data
    data = [...parts].slice(1).join(':');

    let wifi = [
      this.getStringAfter(data, 'T:', ';'),
      this.getStringAfter(data, 'S:', ';'),
      this.getStringAfter(data, 'P:', ';')
    ];

    return wifi;
  }

  /**
   * parse contact data from QR code
   * @param data - BIZCARD/VCARD/MECARD'
   */
  parseContact(data: string): Contact {
    // split result parts - e-mail, subject, text
    const parts = data.split(':');
    // get indentifier
    let identifier = parts[0].toLowerCase();

    // lower and trim string to compare
    const lowerAndTrimmed = data.trim().toLowerCase();

    // check if qr code is vcard and eventually set identifier to 'vcard'
    identifier = lowerAndTrimmed.startsWith('begin:vcard') && lowerAndTrimmed.endsWith('end:vcard')
      ? 'vcard'
      : identifier;

    let contact = {} as Contact;

    switch (identifier) {
      case 'mecard':
        contact = Object.assign({}, {
          name: this.getStringAfter(data, 'N:', ';')
            // split eventually name and last name separated by comma
            .split(',')
            // trim spaces
            .map(o => o.trim())
            // join to one string
            .join(' '),
          tel: this.getStringAfter(data, 'TEL:', ';'),
          email: this.getStringAfter(data, 'EMAIL:', ';'),
          note: this.getStringAfter(data, 'NOTE:', ';'),
          bday: this.parseBday(this.getStringAfter(data, 'BDAY:', ';')),
          address: this.getStringAfter(data, 'ADR:', ';'),
          url: this.getStringAfter(data, 'URL:', ';'),
          nickname: this.getStringAfter(data, 'NICKNAME:', ';')
        });

        break;

      case 'bizcard':
        // compose full name
        const fullName = `${this.getStringAfter(data, 'N:', ';')},${this.getStringAfter(data, 'X:', ';')}`

        contact = Object.assign({}, {
          name: fullName
            // split eventually name and last name separated by comma
            .split(',')
            // trim spaces
            .map(o => o.trim())
            // join to one string
            .join(' '),
          job: this.getStringAfter(data, 'T:', ';'),
          company: this.getStringAfter(data, 'C:', ';'),
          address: this.getStringAfter(data, 'A:', ';'),
          tel: this.getStringAfter(data, 'B:', ';'),
          email: this.getStringAfter(data, 'E:', ';'),
        });
        break;

      case 'vcard':
        // parse data string as vCard object
        const card = new vCard().parse(data);

        contact = Object.assign({}, {
          name: this.parseData(card, 'N'),
          formatedName: this.parseData(card, 'fn'),
          company: this.parseData(card, 'org'),
          title: this.parseData(card, 'title'),
          tel: this.parseData(card, 'tel'),
          address: this.parseData(card, 'adr'),
          email: this.parseData(card, 'email'),
          url: this.parseData(card, 'url')
        });

        break;
    }

    return contact;
  }

  /**
   * parse data by key from vCard data object
   * @param card vCard object with data
   * @param key key of value to parse (to get)
   * @param separator optionaly define custom separator of result string
   * @param joiner instead of separator it will be applied joiner (space)
   */
  parseData(card: vCard, key: string, separator: string = ';', joiner: string = ' '): string {
    // get data according to key
    const data = card.get(key);

    if (Array.isArray(data)) {
      // parsed result (value) is array
      const result = [];

      for (let i in data) {
        if (data[i] && data[i]._data) {
          // fill each value from data (if exists)
          result.push(separator
            // if separator defined, apply...
            ? data[i]._data.split(separator).join(joiner)
            : data[i]._data
          );
        }
      }

      // separate array values and join to one string
      return result.join(' | ');
    } else {
      return data
        ? separator
          // if separator defined, apply...
          ? data._data.split(separator).join(joiner)
          : data._data
        : '';
    }
  }

  /**
   * conver bday string in format 'YYYYMMDD' to 'MM/DD/YYYY'
   * @param text string contains date string
   */
  parseBday(text): string {
    if (text && text.length === 8) {
      return `${text.slice(4, 6)}/${text.slice(6, 8)}/${text.slice(0, 4)}`
    }

    return '';
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
}
