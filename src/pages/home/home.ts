import { Component } from '@angular/core';
import { AlertController, ModalController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { ResultPage } from '../result/result';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage{

  constructor(
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public barcodeScanner: BarcodeScanner
  ) { }

  /** activate camera to scan barcode and handle result */
  scan(): void {
    this.barcodeScanner
      .scan({
        resultDisplayDuration: 0,
        prompt: ''
      })
      .then((barcodeData) => {
        // do nothing if scanning is canceled
        if (barcodeData.cancelled) { return; }

        // Success! Barcode data is here... show result modal
        let resultModal = this.modalCtrl.create(ResultPage, {
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
}
