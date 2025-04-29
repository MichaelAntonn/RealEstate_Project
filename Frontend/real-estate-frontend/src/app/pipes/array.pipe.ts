import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'array',
  standalone: true,
})
export class ArrayPipe implements PipeTransform {
  transform(length: number, start: number = 0): number[] {
    return Array.from({ length }, (_, i) => i + start);
  }
}