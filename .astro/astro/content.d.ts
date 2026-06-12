declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		
	};

	type DataEntryMap = {
		"practice": {
"t01": {
	id: "t01";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t02": {
	id: "t02";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t03": {
	id: "t03";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t04": {
	id: "t04";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t05": {
	id: "t05";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t06": {
	id: "t06";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t07": {
	id: "t07";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t08": {
	id: "t08";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t09": {
	id: "t09";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
"t10": {
	id: "t10";
  collection: "practice";
  data: InferEntrySchema<"practice">
};
};
"questions": {
"t01": {
	id: "t01";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t02": {
	id: "t02";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t03": {
	id: "t03";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t04": {
	id: "t04";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t05": {
	id: "t05";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t06": {
	id: "t06";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t07": {
	id: "t07";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
"t08": {
	id: "t08";
  collection: "questions";
  data: InferEntrySchema<"questions">
};
};
"topics": {
"t01": {
	id: "t01";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t02": {
	id: "t02";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t03": {
	id: "t03";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t04": {
	id: "t04";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t05": {
	id: "t05";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t06": {
	id: "t06";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t07": {
	id: "t07";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t08": {
	id: "t08";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t09": {
	id: "t09";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t10": {
	id: "t10";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t11": {
	id: "t11";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t12": {
	id: "t12";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t13": {
	id: "t13";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t14": {
	id: "t14";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t15": {
	id: "t15";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t16": {
	id: "t16";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t17": {
	id: "t17";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t18": {
	id: "t18";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t19": {
	id: "t19";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t20": {
	id: "t20";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t21": {
	id: "t21";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t22": {
	id: "t22";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t23": {
	id: "t23";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t24": {
	id: "t24";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t25": {
	id: "t25";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t26": {
	id: "t26";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t27": {
	id: "t27";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t28": {
	id: "t28";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t29": {
	id: "t29";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t30": {
	id: "t30";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t31": {
	id: "t31";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t32": {
	id: "t32";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t33": {
	id: "t33";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t34": {
	id: "t34";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t35": {
	id: "t35";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t36": {
	id: "t36";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t37": {
	id: "t37";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t38": {
	id: "t38";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t39": {
	id: "t39";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t40": {
	id: "t40";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t41": {
	id: "t41";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t42": {
	id: "t42";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t43": {
	id: "t43";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t44": {
	id: "t44";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t45": {
	id: "t45";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
"t46": {
	id: "t46";
  collection: "topics";
  data: InferEntrySchema<"topics">
};
};

	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
