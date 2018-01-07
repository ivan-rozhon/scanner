import { Pipe, PipeTransform } from '@angular/core';

const formatNames = {
  QR_CODE: 'QR Code',
  DATA_MATRIX: 'Data Matrix',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
  EAN_8: 'EAN-8',
  EAN_13: 'EAN-13',
  CODE_39: 'Code 39',
  CODE_93: 'Code 93',
  CODE_128: 'Code 128',
  CODABAR: 'Codabar',
  ITF: 'ITF',
  RSS14: 'RSS-14',
  PDF417: 'PDF417',
  RSS_EXPANDED: 'RSS Expanded',
  // Not supported by Android
  // MSI: 'MSI',
  // AZTEC: 'Aztec'
};

@Pipe({
  name: 'translate',
})
export class TranslatePipe implements PipeTransform {
  transform(value: string, ...args) {
    return formatNames[value]
      ? formatNames[value]
      : value;
  }
}
