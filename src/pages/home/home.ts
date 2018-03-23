import { Component } from '@angular/core';
import { AlertController, ModalController, PopoverController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ResultPage } from '../result/result';
import { SettingsPage } from '../settings/settings';
import { StorageProvider } from './../../providers/storage/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage{

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    public barcodeScanner: BarcodeScanner,
    public storageProvider: StorageProvider
  ) {
    // DEBUG
    // this.modalCtrl.create(ResultPage, {
    //   // text: `MECARD:N:Owen,Sean;NOTE:note lol;BDAY:20140504;ADR:76 9th Avenue, 4th Floor, New York, NY 10011;NICKNAME:Pif;URL:http://www.evenx.com;TEL:12125551212;EMAIL:srowen@example.com;;`,
    //   // text: 'BIZCARD:N:Sean;X:Owen;T:Software Engineer;C:Google;A:76 9th Avenue, New York, NY 10011;B:+12125551212;E:srowen@google.com;;',
    //   // text: 'WIFI:T:WPA;S:mynetwork;P:mypass;;',
    //   // text: 'mailto:email@example.com?subject=email subject&body=Email text',
    //   // text: 'mailto:email@example.com',
    //   // text: 'MATMSG:TO: email@example.com;SUB:email subject;BODY:Email text;;',
    //   // text: 'SMTP:ivan.rozhon@gmail.com:email :::subject:Em::ail text',
    //   // text: 'google.com',
    //   // text: `
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   //   loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com veeryyyy loooong.com
    //   // `,
    //   text: 'BEGIN:VCARD\nVERSION:3.0\n' +
    //     'N:Gump;Forrest;;Mr.;\nFN:Forrest Gump\nORG:Bubba Gump Shrimp Co.\nTITLE:Shrimp Man\n' +
    //     'PHOTO;VALUE=URI;TYPE=GIF:http://www.example.com/dir_photos/my_photo.gif\n' +
    //     'TEL;TYPE=WORK,VOICE:(111) 555-1212\nTEL;TYPE=HOME,VOICE:(404) 555-1212\n' +
    //     'ADR;TYPE=WORK,PREF:;;100 Waters Edge;Baytown;LA;30314;United States of America\n' +
    //     'LABEL;TYPE=WORK,PREF:100 Waters Edge Baytown, LA 30314;United States of America\n' +
    //     'ADR;TYPE=HOME:;;42 Plantation St.;Baytown;LA;30314;United States of America\n' +
    //     'LABEL;TYPE=HOME:42 Plantation St.Baytown, LA 30314;United States of America\n' +
    //     'EMAIL:forrestgump@example.com\nREV:2008-04-24T19:52:43Z\n' +
    //     'URL:http://www.johndoe.com\n' +
    //     'END:VCARD',
    //   // text: 'BEGIN:VCALENDAR\nVERSION:2.0',
    //   // text: 'END:VTIMEZONE',
    //   format: 'QR_CODE'
    // }).present();
  }

  /** activate camera to scan barcode and handle result */
  scan(): void {
    this.barcodeScanner
      .scan({
        // settings
        showFlipCameraButton: this.storageProvider.storageValues.showFlipCameraButton,
        showTorchButton: this.storageProvider.storageValues.showTorchButton,
        prompt: '',
        orientation: this.storageProvider.storageValues.fixedOrientation
          // fix orientation if fixed orientation is enabled
          ? this.storageProvider.storageValues.orientation
          : 'none',
        torchOn: this.storageProvider.storageValues.torchOn,
        resultDisplayDuration: 0
      })
      .then((barcodeData) => {
        // do nothing if scanning is canceled
        if (barcodeData.cancelled) { return; }

        // Success! Barcode data is here... show result modal
        const resultModal = this.modalCtrl.create(ResultPage, {
          text: barcodeData.text,
          format: barcodeData.format
        });

        resultModal.present();
      }, (err) => {
        // An error occurred - show alert
        this.alertCtrl.create({
          title: 'Error',
          message: err,
          buttons: ['OK']
        }).present();
      });
  }

  /** open setting popover */
  openSettings(): void {
    // instance of popover
    const popover = this.popoverCtrl.create(SettingsPage);

    // present popover
    popover.present();
  }
}
