import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';

export interface StorageValues {
  showFlipCameraButton?: boolean;
  showTorchButton?: boolean;
  torchOn?: boolean;
  fixedOrientation?: boolean;
  orientation?: string;
}

@Injectable()
export class StorageProvider {
  prefix: string; // prefix for store values purpose
  storageValues: StorageValues; // stored values from storage

  constructor(
    private storage: Storage,
  ) {
    this.prefix = 'ion_qrbc_scanner';

    // initial values is empty object
    this.storageValues = {
      orientation: 'portrait'
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

    // compose key with prefix
    const prefixKey = `${this.prefix}_${key}`;

    // set a key/value
    this.storage.set(prefixKey, value);

    // update saved storage values
    this.storageValues[key] = this.normalizeBoolean(value);
  }

  /**
   * get value from storage
   * @param keys key of value to get
   */
  getValues(...keys: string[]) {
    keys.forEach(key => {
      // compose key with prefix
      const prefixKey = `${this.prefix}_${key}`;

      // get a key/value pair
      this.storage.get(prefixKey).then((value) => {
        // update saved storage values
        if (value) {
          this.storageValues[key] = this.normalizeBoolean(value);
        }
      });
    });
  }

  /**
   * if value is convertable to string - convert it
   * @param value
   */
  normalizeBoolean(value: string): boolean | string {
    return value === 'true' || value === 'false'
      // set 'boolean' type if boolean is stored as string
      ? value === 'true'
        ? true
        : false
      : value;
  }
}
