import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PropertyFilters } from '../models/property';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filtersSubject = new BehaviorSubject<PropertyFilters>({
    keyword: '',
    type: '',
    city: '',
    listing_type: undefined,
    page: 1,
    sort_by: undefined, // أضفنا sort_by لأنه optional في الـ interface
    is_new_building: false,
    min_price: 0, // قيمة افتراضية
    max_price: 10000000, // قيمة افتراضية
    min_area: 0, // قيمة افتراضية
    max_area: 1000, // قيمة افتراضية
    bedrooms: undefined,
    bathrooms: undefined,
  });

  filters$: Observable<PropertyFilters> = this.filtersSubject.asObservable();

  private citiesSubject = new BehaviorSubject<
    { value: string; label: string }[]
  >([{ value: '', label: 'All Cities' }]);

  cities$: Observable<{ value: string; label: string }[]> =
    this.citiesSubject.asObservable();

  constructor() {}

  updateFilters(partialFilters: Partial<PropertyFilters>): void {
    const currentFilters = this.filtersSubject.getValue();
    this.filtersSubject.next({
      ...currentFilters,
      ...partialFilters,
      page: partialFilters.page ?? 1,
    });
  }

  getFilters(): PropertyFilters {
    return this.filtersSubject.getValue();
  }

  setCities(cities: string[]): void {
    this.citiesSubject.next([
      { value: '', label: 'All Cities' },
      ...cities.map((city) => ({ value: city, label: city })),
    ]);
  }

  search(keyword: string): void {
    this.updateFilters({ keyword, page: 1 });
  }

  applyFilters(type: string, city: string, is_new_building?: boolean): void {
    this.updateFilters({ type, city, is_new_building, page: 1 });
  }

  toggleListingType(type: 'for_sale' | 'for_rent'): void {
    this.updateFilters({ listing_type: type, page: 1 });
  }
}
