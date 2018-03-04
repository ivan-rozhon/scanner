import { Injectable } from '@angular/core';

export interface Contact {
  name: string;
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
          this.getStringAfter(`mailto:${data}`, 'mailto:', '?'),
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
    const identifier = parts[0].toLowerCase();

    let contact = {} as Contact;

    switch (identifier) {
      case 'mecard':
        contact = Object.assign({}, contact, {
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
    }

    return contact;
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
