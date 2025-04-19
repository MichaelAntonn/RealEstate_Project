import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jsonParse',
  standalone: true,
})
export class JsonParsePipe implements PipeTransform {
  transform(value: any): any {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
      }
    }
    return value;
  }
}
