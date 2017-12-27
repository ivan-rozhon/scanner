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

  /** dismiss (close) modal window */
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
