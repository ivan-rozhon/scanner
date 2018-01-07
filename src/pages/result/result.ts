import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-result',
  templateUrl: 'result.html',
})
export class ResultPage {
  text: string;
  format: string;

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams
  ) {
    // assign params
    this.text = this.params.get('text');
    this.format = this.params.get('format');
  }

  /** open URL link in browser */
  openLink(): void {
    // window.open('https://github.com/ionic-team/ionic-preview-app/tree/master/src/pages/popovers/basic', '_system');
  }

  /** dismiss (close) modal window */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }
}
