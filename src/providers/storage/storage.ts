import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

export interface StorageValues {
  showFlipCameraButton?: boolean;
  showTorchButton?: boolean;
  showResultType?: boolean;
}

@Injectable()
export class StorageProvider {
  // stored values from storage
  storageValues: StorageValues;

  constructor(
    private storage: Storage,
  ) {
    // initial values is empty object
    this.storageValues = {
      // default config
      showResultType: true
    };
  }

  /**
   * set value to storage
   * @param key key of value to set
   * @param value value to set
   */
  setValue(key: string, value: string): void {
    // if value is boolean type - convert to string
    value = typeof value === 'boolean'
      ? String(value)
      : value;

    // set a key/value
    this.storage.set(key, value);

    // update saved storage values
    this.storageValues[key] = value;
  }

  /**
   * get value from storage
   * @param keys key of value to get
   */
  getValues(...keys: string[]) {
    keys.forEach(key => {
      // get a key/value pair
      this.storage.get(key).then((value) => {
        // update saved storage values
        if (value) {
          this.storageValues[key] = value === 'true' || value === 'false'
            // set 'boolean' type if boolean is stored as string
            ? value === 'true'
              ? true
              : false
            : value;
        }
      });
    });
  }
}
