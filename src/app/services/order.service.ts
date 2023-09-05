import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Order } from '../models/order';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, map, switchMap, tap } from 'rxjs/operators';
import { SortColumn, SortDirection } from '../directives/sortable.directive';
import { WoocommerceService } from './woocommerce.service';


interface SearchResult {
	orders: Order[];
	total: number;
}

interface State {
	page: number;
	pageSize: number;
	searchTerm: string;
	sortColumn: SortColumn;
	sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function matches(order: Order, term: string, pipe: PipeTransform) {
	return (
		order.name.toLowerCase().includes(term.toLowerCase()) ||
		pipe.transform(order.total).includes(term) ||
		pipe.transform(order.date).includes(term) ||
		pipe.transform(order.store).includes(term)
	);
}

@Injectable({ providedIn: 'root' })
export class OrderService {

	private _loading$ = new BehaviorSubject<boolean>(true);
	private _search$ = new Subject<void>();
	private _orders$ = new BehaviorSubject<Order[]>([]);
	private _total$ = new BehaviorSubject<number>(0);

	private _state: State = {
		page: 1,
		pageSize: 20,
		searchTerm: '',
		sortColumn: 'date',
		sortDirection: '',
	};

	constructor(private pipe: DecimalPipe, private woocommerceService: WoocommerceService) {
		this._search$
			.pipe(
				tap(() => this._loading$.next(true)),
				debounceTime(200),
				switchMap(() => this._search()),
				delay(200),
				tap(() => this._loading$.next(false)),
			)
			.subscribe((result) => {
				this._orders$.next(result.orders);
				this._total$.next(result.total);
			});
		this._search$.next();
	}

	get orders$() {
		return this._orders$.asObservable();
	}
	get total$() {
		return this._total$.asObservable();
	}
	get loading$() {
		return this._loading$.asObservable();
	}
	get page() {
		return this._state.page;
	}
	get pageSize() {
		return this._state.pageSize;
	}
	get searchTerm() {
		return this._state.searchTerm;
	}
	set page(page: number) {
		this._set({ page });
	}
	set pageSize(pageSize: number) {
		this._set({ pageSize });
	}
	set searchTerm(searchTerm: string) {
		this._set({ searchTerm });
	}
	set sortColumn(sortColumn: SortColumn) {
		this._set({ sortColumn });
	}
	set sortDirection(sortDirection: SortDirection) {
		this._set({ sortDirection });
	}

	private _set(patch: Partial<State>) {
		Object.assign(this._state, patch);
		this._search$.next();
	}

	private _search(): Observable<SearchResult> {
		const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;
		return this.woocommerceService.getOrders().pipe(
			map((data: any) => {
				let orders = data.map((item: any) => new Order(item));
				
				orders = orders.filter((order: Order) =>
					matches(order, searchTerm, this.pipe)
				);
				const total = orders.length;
				
				orders = orders.slice(
					(page - 1) * pageSize,
					(page - 1) * pageSize + pageSize
				);

				return { orders, total };
			}));
	}
}