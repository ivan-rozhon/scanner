import { Pipe, PipeTransform } from '@angular/core';

const formatNames = {
  QR_CODE: 'QR Code',
  DATA_MATRIX: 'Data Matrix',
  // TODO... add other formats
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
