import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'properCase',
  standalone: false
})
export class ProperCasePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/\b\w/g, (first) => first.toUpperCase());
  }
}