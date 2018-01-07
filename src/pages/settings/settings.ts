import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public viewCtrl: ViewController
  ) { }

  // close popup
  close() {
    this.viewCtrl.dismiss();
  }
}
