import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    public barcodeScanner: BarcodeScanner
  ) { }

  scan(): void {
    this.barcodeScanner.scan().then((barcodeData) => {
      // Success! Barcode data is here
      console.log(barcodeData.text);
      console.log(barcodeData.format);
    }, (err) => {
      // An error occurred
      console.log(err);
    });
  }

}
