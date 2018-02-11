import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { StorageProvider } from './../../providers/storage/storage';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public viewCtrl: ViewController,
    public storageProvider: StorageProvider
  ) { }

  /**
   * update changed value to storage
   * @param key key of value to update
   * @param value updated value
   */
  updateValue(key: string, event: any): void {
    this.storageProvider.setValue(key, event.checked);
  }

  // close popup
  close() {
    this.viewCtrl.dismiss();
  }
}
