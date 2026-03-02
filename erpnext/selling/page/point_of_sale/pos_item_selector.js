// 









// import onScan from "onscan.js";

// erpnext.PointOfSale.ItemSelector = class {
// 	constructor({ frm, wrapper, events, pos_profile, settings }) {
// 		this.wrapper = wrapper;
// 		this.events = events;
// 		this.pos_profile = pos_profile;
// 		this.hide_images = settings.hide_images;
// 		this.auto_add_item = settings.auto_add_item_to_cart;

// 		this.inti_component();
// 	}

// 	inti_component() {
// 		this.prepare_dom();
// 		this.make_search_bar();
// 		this.load_items_data();
// 		this.bind_events();
// 		this.attach_shortcuts();
// 	}

// 	prepare_dom() {
// 		this.wrapper.append(
// 			`<section class="items-selector">
// 				<div class="filter-section">
// 					<div class="label">${__("All Items")}</div>
// 					<div class="search-field"></div>
// 					<div class="item-group-field"></div>
// 				</div>
// 				<div class="items-container"></div>
// 			</section>`
// 		);

// 		this.$component = this.wrapper.find(".items-selector");
// 		this.$items_container = this.$component.find(".items-container");

// 		// Inject Grid styling
// 		const style = `
// 			<style>
// 				.items-container {
// 					display: grid;
// 					grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
// 					gap: 12px;
// 					overflow-y: auto;
// 					padding: 10px;
// 					align-content: flex-start;
// 				}
// 				.item-wrapper {
// 					background: #fff;
// 					border: 1px solid #d1d8dd;
// 					border-radius: 8px;
// 					transition: all 0.2s;
// 					cursor: pointer;
// 					height: 180px;
// 					display: flex;
// 					flex-direction: column;
// 					position: relative;
// 				}
// 				.item-wrapper:hover {
// 					border-color: var(--primary);
// 					box-shadow: 0 4px 8px rgba(0,0,0,0.1);
// 				}
// 				.item-display {
// 					height: 100px;
// 					background: #f8f9fa;
// 					border-radius: 8px 8px 0 0;
// 					display: flex;
// 					align-items: center;
// 					justify-content: center;
// 				}
// 				.item-name {
// 					font-size: 12px;
// 					font-weight: 600;
// 					text-align: center;
// 					padding: 5px;
// 					line-height: 1.2;
// 				}
// 				.item-rate {
// 					font-size: 11px;
// 					font-weight: bold;
// 					color: var(--primary);
// 					text-align: center;
// 					margin-bottom: 8px;
// 				}
// 				.item-qty-pill {
// 					position: absolute;
// 					top: 5px;
// 					right: 5px;
// 					z-index: 2;
// 				}
// 			</style>
// 		`;
// 		if (!$('style:contains(".item-wrapper")').length) $('head').append(style);
// 	}

// 	async load_items_data() {
// 		if (!this.item_group) {
// 			frappe.call({
// 				method: "erpnext.selling.page.point_of_sale.point_of_sale.get_parent_item_group",
// 				async: false,
// 				callback: (r) => { if (r.message) this.parent_item_group = r.message; },
// 			});
// 		}
// 		if (!this.price_list) {
// 			const res = await frappe.db.get_value("POS Profile", this.pos_profile, "selling_price_list");
// 			this.price_list = res.message.selling_price_list;
// 		}

// 		// Loading a larger batch for local Fragment Search (Global feel)
// 		this.get_items({ page_length: 500 }).then(({ message }) => {
// 			this.all_items = message.items || [];
// 			this.render_item_list(this.all_items);
// 		});
// 	}

// 	get_items({ start = 0, page_length = 40, search_term = "" }) {
// 		const doc = this.events.get_frm().doc;
// 		const price_list = (doc && doc.selling_price_list) || this.price_list;
// 		let { item_group, pos_profile } = this;
// 		!item_group && (item_group = this.parent_item_group);

// 		return frappe.call({
// 			method: "erpnext.selling.page.point_of_sale.point_of_sale.get_items",
// 			freeze: false,
// 			args: { start, page_length, price_list, item_group, search_term, pos_profile },
// 		});
// 	}

// 	render_item_list(items) {
// 		this.$items_container.empty();
// 		this.items = items;
// 		items.forEach((item) => {
// 			this.$items_container.append(this.get_item_html(item));
// 		});
// 	}

// 	get_item_html(item) {
// 		const me = this;
// 		const { item_image, item_name, price_list_rate, currency, actual_qty, uom } = item;
// 		const indicator_color = actual_qty > 10 ? "green" : actual_qty <= 0 ? "red" : "orange";
// 		const qty_display = item.is_stock_item ? actual_qty : "";

// 		const img_html = (!me.hide_images && item_image) 
// 			? `<img class="h-full item-img" src="${item_image}" alt="${frappe.get_abbr(item_name)}">`
// 			: `<div class="item-display abbr">${frappe.get_abbr(item_name)}</div>`;

// 		return `
// 			<div class="item-wrapper" 
// 				data-item-code="${escape(item.item_code)}" data-uom="${escape(uom)}" 
// 				data-rate="${escape(price_list_rate || 0)}" title="${item_name}">
// 				<div class="item-qty-pill">
// 					<span class="indicator-pill ${indicator_color}">${qty_display}</span>
// 				</div>
// 				<div class="item-display">
// 					${img_html}
// 				</div>
// 				<div class="item-detail">
// 					<div class="item-name">${frappe.ellipsis(item_name, 30)}</div>
// 					<div class="item-rate">${format_currency(price_list_rate, currency)}</div>
// 				</div>
// 			</div>`;
// 	}

// 	make_search_bar() {
// 		const me = this;
// 		this.search_field = frappe.ui.form.make_control({
// 			df: { label: __("Search"), fieldtype: "Data", placeholder: __("e.g. 're bla'") },
// 			parent: this.$component.find(".search-field"),
// 			render_input: true,
// 		});
// 		this.item_group_field = frappe.ui.form.make_control({
// 			df: {
// 				label: __("Item Group"), fieldtype: "Link", options: "Item Group",
// 				onchange: () => { 
// 					me.item_group = me.item_group_field.get_value() || me.parent_item_group; 
// 					me.load_items_data(); 
// 				}
// 			},
// 			parent: this.$component.find(".item-group-field"),
// 			render_input: true,
// 		});
// 		this.search_field.toggle_label(false);
// 		this.item_group_field.toggle_label(false);
// 		this.attach_clear_btn();
// 	}

// 	filter_items({ search_term = "" } = {}) {
// 		const term = search_term.toLowerCase().trim();
// 		if (!term) {
// 			this.render_item_list(this.all_items.slice(0, 40));
// 			return;
// 		}

// 		// Tokenize "re bla" -> ["re", "bla"]
// 		const tokens = term.split(/\s+/).filter(Boolean);

// 		if (this.all_items) {
// 			const scored = this.all_items.reduce((acc, item) => {
// 				const code = (item.item_code || "").toLowerCase();
// 				const name = (item.item_name || "").toLowerCase();
// 				const pool = `${code} ${name}`;

// 				if (tokens.every(t => pool.includes(t))) {
// 					let score = 0;
// 					if (code === term) score += 2000;
// 					if (code.startsWith(term)) score += 1000;
// 					if (name.includes(term)) score += 500;
// 					acc.push({ item, score });
// 				}
// 				return acc;
// 			}, []);

// 			if (scored.length > 0) {
// 				scored.sort((a, b) => b.score - a.score);
// 				this.render_item_list(scored.map(s => s.item));
// 				this.perform_auto_add();
// 				return;
// 			}
// 		}

// 		// Fallback to server if no local matches
// 		this.get_items({ search_term: term }).then(({ message }) => {
// 			this.render_item_list(message.items || []);
// 			this.perform_auto_add();
// 		});
// 	}

// 	perform_auto_add() {
// 		if (this.auto_add_item && this.items.length === 1 && this.search_field.get_value()) {
// 			this.$items_container.find(".item-wrapper").click();
// 			this.set_search_value("");
// 		}
// 	}

// 	resize_selector(minimize) {
// 		const $filter = this.$component.find(".filter-section");
		
// 		if (minimize) {
// 			$filter.css("grid-template-columns", "repeat(1, minmax(0, 1fr))");
// 			this.$component.css("grid-column", "span 2 / span 2");
// 			this.$items_container.css("grid-template-columns", "repeat(2, minmax(0, 1fr))");
// 		} else {
// 			$filter.css("grid-template-columns", "repeat(12, minmax(0, 1fr))");
// 			this.$component.css("grid-column", "span 6 / span 6");
// 			this.$items_container.css("grid-template-columns", "repeat(auto-fill, minmax(140px, 1fr))");
// 		}
// 	}

// 	// Remaining standard helper methods
// 	attach_clear_btn() {
// 		this.search_field.$wrapper.find(".control-input").append(`<span class="link-btn"><a class="btn-open">${frappe.utils.icon("close", "sm")}</a></span>`);
// 		this.$clear_search_btn = this.search_field.$wrapper.find(".link-btn").on("click", "a", () => {
// 			this.set_search_value("");
// 			this.search_field.set_focus();
// 		});
// 	}

// 	set_search_value(val) { $(this.search_field.$input[0]).val(val).trigger("input"); }

// 	bind_events() {
// 		const me = this;
// 		this.$component.on("click", ".item-wrapper", function () {
// 			const $i = $(this);
// 			me.events.item_selected({
// 				field: "qty", value: "+1",
// 				item: {
// 					item_code: unescape($i.attr("data-item-code")),
// 					uom: unescape($i.attr("data-uom")),
// 					rate: unescape($i.attr("data-rate"))
// 				}
// 			});
// 			me.search_field.set_focus();
// 		});

// 		this.search_field.$input.on("input", (e) => {
// 			clearTimeout(this.last_search);
// 			this.last_search = setTimeout(() => this.filter_items({ search_term: e.target.value }), 300);
// 		});
// 	}

// 	attach_shortcuts() {
// 		frappe.ui.keys.on("enter", () => {
// 			if (this.$component.is(":visible") && this.items.length === 1 && this.search_field.get_value()) {
// 				this.perform_auto_add();
// 			}
// 		});
// 	}

// 	toggle_component(show) {
// 		this.set_search_value("");
// 		this.$component.css("display", show ? "flex" : "none");
// 		if (show) this.resize_selector(false);
// 	}
// };








import onScan from "onscan.js";



erpnext.PointOfSale.ItemSelector = class {
constructor({ frm, wrapper, events, pos_profile, settings }) {
this.wrapper = wrapper;
this.events = events;
this.pos_profile = pos_profile;
this.hide_images = settings.hide_images;
this.auto_add_item = settings.auto_add_item_to_cart;

this.inti_component();
}

inti_component() {
	this.prepare_dom();
	this.make_search_bar();
	this.load_items_data();
	this.bind_events();
	this.attach_shortcuts();
}

// prepare_dom() {
// 	this.wrapper.append(
// 		`<section class="items-selector">
// 			<div class="filter-section">
// 				<div class="label">${__("All Items")}</div>
// 				<div class="search-field"></div>
// 				<div class="item-group-field"></div>
// 			</div>
// 			<div class="items-container"></div>
// 		</section>`
// 	);

// 	this.$component = this.wrapper.find(".items-selector");
// 	this.$items_container = this.$component.find(".items-container");

// 	const show_hide_images = this.hide_images ? "hide-item-image" : "show-item-image";
// 	this.$items_container.addClass(show_hide_images);
// }
prepare_dom() {
	this.wrapper.append(
		`<section class="items-selector">
			<div class="filter-section">
				<div class="label">${__("All Items")}</div>
				<div class="search-field"></div>
				<div class="item-group-field"></div>
			</div>
			<div class="items-container"></div>
		</section>`
	);

	this.$component = this.wrapper.find(".items-selector");
	this.$items_container = this.$component.find(".items-container");

	const show_hide_images = this.hide_images ? "hide-item-image" : "show-item-image";
	this.$items_container.addClass(show_hide_images);
}

async load_items_data() {
	if (!this.item_group) {
		frappe.call({
			method: "erpnext.selling.page.point_of_sale.point_of_sale.get_parent_item_group",
			async: false,
			callback: (r) => {
				if (r.message) this.parent_item_group = r.message;
			},
		});
	}
	if (!this.price_list) {
		const res = await frappe.db.get_value("POS Profile", this.pos_profile, "selling_price_list");
		this.price_list = res.message.selling_price_list;
	}

	// Loading a larger batch (500) so local "Global Search" has a big pool of data
	this.get_items({ page_length: 500 }).then(({ message }) => {
		this.all_items = message.items || []; // CRUCIAL: Save all items locally
		this.render_item_list(this.all_items);
	});
}

get_items({ start = 0, page_length = 40, search_term = "" }) {
	const doc = this.events.get_frm().doc;
	const price_list = (doc && doc.selling_price_list) || this.price_list;
	let { item_group, pos_profile } = this;

	!item_group && (item_group = this.parent_item_group);

	return frappe.call({
		method: "erpnext.selling.page.point_of_sale.point_of_sale.get_items",
		freeze: false,
		args: { start, page_length, price_list, item_group, search_term, pos_profile },
	});
}

render_item_list(items) {
	this.$items_container.html("");
	this.items = items; // Update current reference

	if (this.hide_images) {
		this.$items_container.append(this.render_item_list_column_header());
	}

	items.forEach((item) => {
		const item_html = this.get_item_html(item);
		this.$items_container.append(item_html);
	});
}

render_item_list_column_header() {
	return `<div class="list-column">
		<div class="column-name">Name</div>
		<div class="column-price">Price</div>
		<div class="column-uom">UOM</div>
		<div class="column-qty-available">Quantity Available</div>
	</div>`;
}

get_item_html(item) {
	const me = this;
	const { item_image, serial_no, batch_no, actual_qty, uom, price_list_rate } = item;
	const precision = flt(price_list_rate, 2) % 1 != 0 ? 2 : 0;
	let indicator_color;
	let qty_to_display = actual_qty;

	if (item.is_stock_item) {
		indicator_color = actual_qty > 10 ? "green" : actual_qty <= 0 ? "red" : "orange";

		if (Math.round(qty_to_display) > 999) {
			qty_to_display = Math.round(qty_to_display) / 1000;
			qty_to_display = qty_to_display.toFixed(1) + "K";
		}
	} else {
		indicator_color = "";
		qty_to_display = "Non stock";
	}

	function get_item_image_html() {
		if (me.hide_images) return "";
		let indicator = `<div class="item-qty-pill">
							<span class="indicator-pill whitespace-nowrap ${indicator_color}">${qty_to_display}</span>
						</div>`;
		
		if (item_image) {
			return `${indicator}<div class="item-display">
						<img onerror="cur_pos.item_selector.handle_broken_image(this)"
							class="item-img" src="${item_image}" alt="${item.item_name}">
					</div>`;
		} else {
			return `${indicator}<div class="item-display abbr">${frappe.get_abbr(item.item_name)}</div>`;
		}
	}

	// Colorful Styling
	const price_style = (price_list_rate > 0) 
			? "font-weight: bold; color: #1a1a1a; font-size: 1.1em;" 
			: "color: #999; font-style: italic;";

	let stock_style = "";
	let stock_val = parseFloat(actual_qty);

	if (!item.is_stock_item) {
		stock_style = "background: #f0f4ff; color: #4466ee; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
	} else if (stock_val <= 5) {
		stock_style = "background: #fff0f0; color: #cc3333; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
	} else {
		stock_style = "background: #f2faf2; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
	}

	return `<div class="item-wrapper"
			data-item-code="${escape(item.item_code)}" data-serial-no="${escape(serial_no)}"
			data-batch-no="${escape(batch_no)}" data-uom="${escape(uom)}"
			data-rate="${escape(price_list_rate || 0)}"
			data-stock-uom="${escape(item.stock_uom)}"
			title="${item.item_name}">

			${get_item_image_html()}

			<div class="item-detail">
				<div class="item-name" style="font-weight: 600; margin-bottom: 3px;">
					${!me.hide_images ? frappe.ellipsis(item.item_name, 18) : item.item_name}
				</div>
				${ !me.hide_images ? 
					`<div class="item-rate">${format_currency(price_list_rate, item.currency, precision)} / ${uom}</div>` 
					: `
					<div class="item-price" style="${price_style}">${format_currency(price_list_rate, item.currency, precision)}</div>
					<div class="item-uom" style="font-size: 11px; color: #888;">${uom}</div>
					<div class="item-qty-available"><span style="${stock_style}">${qty_to_display}</span></div>
					`
				}
			</div>
		</div>`;
}

	filter_items({ search_term = "" } = {}) {
		const term = search_term.toLowerCase().trim();
		if (!term) {
			this.render_item_list(this.all_items ? this.all_items.slice(0, 48) : []);
			return;
		}

		const tokens = term.split(/\s+/).filter(Boolean);

		if (this.all_items) {
			const scored = this.all_items.reduce((acc, item) => {
				const pool = `${item.item_code} ${item.item_name} ${item.barcode || ""}`.toLowerCase();
				if (tokens.every(t => pool.includes(t))) {
					let score = 0;
					const code = item.item_code.toLowerCase();
					if (code === term) score += 2000;
					else if (code.startsWith(term)) score += 1000;
					if (item.item_name.toLowerCase().includes(term)) score += 500;
					acc.push({ item, score });
				}
				return acc;
			}, []);

			if (scored.length > 0) {
				scored.sort((a, b) => b.score - a.score);
				this.items = scored.map(s => s.item);
				this.render_item_list(this.items);
				this.perform_auto_add_logic();
				return;
			}
		}

		this.get_items({ search_term: term }).then(({ message }) => {
			this.render_item_list(message.items || []);
			this.perform_auto_add_logic();
		});
	}
render_loader() {
	this.$items_container.html(`
		<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 350px; background-color: #ffffff; border-radius: 8px;">
			<style>
				@keyframes loader-rotate {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
				@keyframes loader-fade {
					0%, 100% { opacity: 0.5; }
					50% { opacity: 1; }
				}
				.custom-loader-ring {
					width: 50px;
					height: 50px;
					border: 3px solid #f3f3f3;
					border-top: 3px solid #3498db; /* Blue Accent */
					border-radius: 50%;
					animation: loader-rotate 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
					margin-bottom: 20px;
					box-shadow: 0 4px 10px rgba(0,0,0,0.05);
				}
				.loader-text {
					font-family: inherit;
					font-weight: 500;
					color: #1f272e;
					letter-spacing: -0.2px;
					animation: loader-fade 2s ease-in-out infinite;
					text-align: center;
				}
			</style>

			<div class="custom-loader-ring"></div>
			
			<div class="loader-text">
				<div style="font-size: 16px; margin-bottom: 4px;">${__("Fetching Items")}</div>
				<div style="font-size: 12px; color: #8d99a6; font-weight: 400;">
					${__("Organizing your inventory...")}
				</div>
			</div>
		</div>
	`);
}

// async load_items_data() {
// 	this.render_loader();
// 	if (!this.item_group) {
// 		frappe.call({
// 			method: "erpnext.selling.page.point_of_sale.point_of_sale.get_parent_item_group",
// 			async: false,
// 			callback: (r) => {
// 				if (r.message) this.parent_item_group = r.message;
// 			},
// 		});
// 	}
// 	if (!this.price_list) {
// 		const res = await frappe.db.get_value("POS Profile", this.pos_profile, "selling_price_list");
// 		this.price_list = res.message.selling_price_list;
// 	}
// 	this.render_loader();
// 	// Loading a larger batch (500) so local "Global Search" has a big pool of data
// 	this.get_items({ page_length: 500 }).then(({ message }) => {
// 		this.all_items = message.items || []; // CRUCIAL: Save all items locally
// 		this.render_item_list(this.all_items);
// 	});
// }

// get_items({ start = 0, page_length = 40, search_term = "" }) {
// 	const doc = this.events.get_frm().doc;
// 	const price_list = (doc && doc.selling_price_list) || this.price_list;
// 	let { item_group, pos_profile } = this;

// 	!item_group && (item_group = this.parent_item_group);

// 	return frappe.call({
// 		method: "erpnext.selling.page.point_of_sale.point_of_sale.get_items",
// 		freeze: false,
// 		args: { start, page_length, price_list, item_group, search_term, pos_profile },
// 	});
// }

// render_item_list(items) {
// 	this.$items_container.html("");
// 	this.items = items; // Update current reference

// 	if (this.hide_images) {
// 		this.$items_container.append(this.render_item_list_column_header());
// 	}

// 	items.forEach((item) => {
// 		const item_html = this.get_item_html(item);
// 		this.$items_container.append(item_html);
// 	});
// }

// render_item_list_column_header() {
// 	return `<div class="list-column">
// 		<div class="column-name">Name</div>
// 		<div class="column-price">Price</div>
// 		<div class="column-uom">UOM</div>
// 		<div class="column-qty-available">Quantity Available</div>
// 	</div>`;
// }

// get_item_html(item) {
// 	const me = this;
// 	const { item_image, serial_no, batch_no, actual_qty, uom, price_list_rate } = item;
// 	const precision = flt(price_list_rate, 2) % 1 != 0 ? 2 : 0;
// 	let indicator_color;
// 	let qty_to_display = actual_qty;

// 	if (item.is_stock_item) {
// 		indicator_color = actual_qty > 10 ? "green" : actual_qty <= 0 ? "red" : "orange";

// 		if (Math.round(qty_to_display) > 999) {
// 			qty_to_display = Math.round(qty_to_display) / 1000;
// 			qty_to_display = qty_to_display.toFixed(1) + "K";
// 		}
// 	} else {
// 		indicator_color = "";
// 		qty_to_display = "Non stock";
// 	}

// 	function get_item_image_html() {
// 		if (me.hide_images) return "";
// 		let indicator = `<div class="item-qty-pill">
// 							<span class="indicator-pill whitespace-nowrap ${indicator_color}">${qty_to_display}</span>
// 						</div>`;
		
// 		if (item_image) {
// 			return `${indicator}<div class="item-display">
// 						<img onerror="cur_pos.item_selector.handle_broken_image(this)"
// 							class="item-img" src="${item_image}" alt="${item.item_name}">
// 					</div>`;
// 		} else {
// 			return `${indicator}<div class="item-display abbr">${frappe.get_abbr(item.item_name)}</div>`;
// 		}
// 	}

// 	// Colorful Styling
// 	const price_style = (price_list_rate > 0) 
// 			? "font-weight: bold; color: #1a1a1a; font-size: 1.1em;" 
// 			: "color: #999; font-style: italic;";

// 	let stock_style = "";
// 	let stock_val = parseFloat(actual_qty);

// 	if (!item.is_stock_item) {
// 		stock_style = "background: #f0f4ff; color: #4466ee; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
// 	} else if (stock_val <= 5) {
// 		stock_style = "background: #fff0f0; color: #cc3333; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
// 	} else {
// 		stock_style = "background: #f2faf2; color: #2e7d32; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;";
// 	}

// 	return `<div class="item-wrapper"
// 			data-item-code="${escape(item.item_code)}" data-serial-no="${escape(serial_no)}"
// 			data-batch-no="${escape(batch_no)}" data-uom="${escape(uom)}"
// 			data-rate="${escape(price_list_rate || 0)}"
// 			data-stock-uom="${escape(item.stock_uom)}"
// 			title="${item.item_name}">

// 			${get_item_image_html()}

// 			<div class="item-detail">
// 				<div class="item-name" style="font-weight: 600; margin-bottom: 3px;">
// 					${!me.hide_images ? frappe.ellipsis(item.item_name, 18) : item.item_name}
// 				</div>
// 				${ !me.hide_images ? 
// 					`<div class="item-rate">${format_currency(price_list_rate, item.currency, precision)} / ${uom}</div>` 
// 					: `
// 					<div class="item-price" style="${price_style}">${format_currency(price_list_rate, item.currency, precision)}</div>
// 					<div class="item-uom" style="font-size: 11px; color: #888;">${uom}</div>
// 					<div class="item-qty-available"><span style="${stock_style}">${qty_to_display}</span></div>
// 					`
// 				}
// 			</div>
// 		</div>`;
// }

handle_broken_image($img) {
	const item_abbr = $($img).attr("alt");
	$($img).parent().replaceWith(`<div class="item-display abbr">${item_abbr}</div>`);
}

make_search_bar() {
	const me = this;
	this.$component.find(".search-field").html("");
	this.$component.find(".item-group-field").html("");

	this.search_field = frappe.ui.form.make_control({
		df: {
			label: __("Search"),
			fieldtype: "Data",
			placeholder: __("Search by name, code or fragment..."),
		},
		parent: this.$component.find(".search-field"),
		render_input: true,
	});
	
	this.item_group_field = frappe.ui.form.make_control({
		df: {
			label: __("Item Group"),
			fieldtype: "Link",
			options: "Item Group",
			placeholder: __("Select group"),
			onchange: function () {
				me.item_group = this.value;
				!me.item_group && (me.item_group = me.parent_item_group);
				// When group changes, reload the master list pool
				me.load_items_data(); 
			},
			get_query: () => {
				const doc = me.events.get_frm().doc;
				return {
					query: "erpnext.selling.page.point_of_sale.point_of_sale.item_group_query",
					filters: { pos_profile: doc ? doc.pos_profile : "" },
				};
			},
		},
		parent: this.$component.find(".item-group-field"),
		render_input: true,
	});
	
	this.search_field.toggle_label(false);
	this.item_group_field.toggle_label(false);
	this.attach_clear_btn();
}

attach_clear_btn() {
	this.search_field.$wrapper.find(".control-input").append(
		`<span class="link-btn"><a class="btn-open no-decoration">${frappe.utils.icon("close", "sm")}</a></span>`
	);
	this.$clear_search_btn = this.search_field.$wrapper.find(".link-btn");
	this.$clear_search_btn.on("click", "a", () => {
		this.set_search_value("");
		this.search_field.set_focus();
	});
}

set_search_value(value) {
	$(this.search_field.$input[0]).val(value).trigger("input");
}

bind_events() {
	const me = this;
	window.onScan = onScan;
	
	onScan.attachTo(document, {
		onScan: (sScancode) => {
			if (this.search_field && this.$component.is(":visible")) {
				this.search_field.set_focus();
				this.set_search_value(sScancode);
				this.barcode_scanned = true;
			}
		},
	});

	this.$component.on("click", ".item-wrapper", function () {
		const $item = $(this);
		const item_params = {
			item_code: unescape($item.attr("data-item-code")),
			batch_no: unescape($item.attr("data-batch-no")),
			serial_no: unescape($item.attr("data-serial-no")),
			uom: unescape($item.attr("data-uom")),
			rate: unescape($item.attr("data-rate")),
			stock_uom: unescape($item.attr("data-stock-uom")),
		};

		Object.keys(item_params).forEach(k => {
			if (item_params[k] === "undefined") item_params[k] = undefined;
		});

		me.events.item_selected({
			field: "qty",
			value: "+1",
			item: item_params,
		});
		me.search_field.set_focus();
	});

	// THE SEARCH TRIGGER
	this.search_field.$input.on("input", (e) => {
		const val = e.target.value;
		this.$clear_search_btn.toggle(Boolean(val.trim()));

		clearTimeout(this.last_search);
		this.last_search = setTimeout(() => {
			this.filter_items({ search_term: val });
		}, 300);
	});
}

attach_shortcuts() {
	frappe.ui.keys.on("enter", () => {
		if (!this.$component.is(":visible") || !this.search_field.get_value()) return;
		if (this.items && this.items.length === 1) {
			this.$items_container.find(".item-wrapper").click();
			this.set_search_value("");
		}
	});
}

/**
 * FRAPPE GLOBAL SEARCH LOGIC
 * Matches "rig f la" inside "(EIS) Right Fit Labels"
 */
filter_items({ search_term = "" } = {}) {
	const term = search_term.toLowerCase().trim();
	const keywords = term.split(/\s+/).filter(Boolean); // Array of fragments

	if (!term) {
		this.render_item_list(this.all_items || []);
		return;
	}

	// 1. LOCAL SEARCH (Fragment match like global search)
	if (this.all_items && this.all_items.length > 0) {
		const local_matches = this.all_items.filter(item => {
			const searchable_text = `${item.item_name} ${item.item_code} ${item.barcode || ""}`.toLowerCase();
			// Ensure EVERY keyword fragment is found in the item details
			return keywords.every(kw => searchable_text.includes(kw));
		});

		if (local_matches.length > 0) {
			this.render_item_list(local_matches);
			this.perform_auto_add_logic();
			return; 
		}
	}

	// 2. SERVER FALLBACK (If item not in initial master pool)
	this.get_items({ search_term: term }).then(({ message }) => {
		this.render_item_list(message.items || []);
		this.perform_auto_add_logic();
	});
}

perform_auto_add_logic() {
	if (this.auto_add_item && this.search_field.get_value() && this.items.length === 1) {
		this.add_filtered_item_to_cart();
	}
}

add_filtered_item_to_cart() {
	this.$items_container.find(".item-wrapper").click();
	this.set_search_value("");
}
start_item_loading_animation() { this.$items_container.addClass("is-loading"); }
stop_item_loading_animation() { this.$items_container.removeClass("is-loading"); }

toggle_component(show) {
	this.set_search_value("");
	this.$component.toggle(show);
}
};