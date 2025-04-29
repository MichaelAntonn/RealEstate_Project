import { Pipe, PipeTransform } from '@angular/core';
import { normalizeTags } from '../utils/normalize-tags';

@Pipe({
  name: 'normalizeTags',
  standalone: true,
})
export class NormalizeTagsPipe implements PipeTransform {
  transform(tags: string | string[] | null | undefined): string {
    return normalizeTags(tags).join(', ');
  }
}