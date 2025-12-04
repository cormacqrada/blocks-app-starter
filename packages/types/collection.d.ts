export interface Collection {
  name: string;
  items: unknown[];
  relationships: Record<string, unknown>;
  version: string;
  schema: "collection.schema.json";
}
