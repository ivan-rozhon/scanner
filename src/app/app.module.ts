import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { IonicStorageModule } from '@ionic/storage';
import { Clipboard } from '@ionic-native/clipboard';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ResultPage } from './../pages/result/result';

import { PipesModule } from '../pipes/pipes.module';
import { SettingsPage } from '../pages/settings/settings';
import { StorageProvider } from '../providers/storage/storage';
import { ParseProvider } from '../providers/parse/parse';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ResultPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    PipesModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ResultPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BarcodeScanner,
    StorageProvider,
    Clipboard,
    SMS,
    LaunchNavigator,
    EmailComposer,
    ParseProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
