import { SearchUtils } from "@medusajs/utils";
import { Client } from "typesense";
import TypesensePluginOptions, { typesenseErrorCodes } from "../types";
import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";
import { transformProduct } from "../utils/transformer";
import {
  SearchParams,
  SearchParamsWithPreset,
} from "typesense/lib/Typesense/Documents";
import { SearchTypes } from "@medusajs/types";
import { CollectionUpdateSchema } from "typesense/lib/Typesense/Collection";

class TypesenseService extends SearchUtils.AbstractSearchService {
  isDefault = false;

  protected readonly config: TypesensePluginOptions;
  protected readonly client: Client;
  DEFAULT_DEVELOPMENT_API_KEY = "xyz";

  constructor(_, options: TypesensePluginOptions) {
    super(_, options);

    this.config = options;

    if (!options.config?.apiKey) {
      throw Error(
        "Typesense API key is missing in plugin config. See https://docs.medusajs.com/add-plugins/typesense"
      );
    }

    if (!options.config?.nodes) {
      throw Error(
        "Typesense nodes is missing in plugin config. See https://docs.medusajs.com/add-plugins/typesense"
      );
    }

    this.client = new Client(options.config);
  }

  // See https://typesense.org/docs/0.25.2/api/collections.html for schema options
  createIndex(indexName: string, options: Record<string, unknown>) {
    const schema: CollectionCreateSchema = {
      name: indexName,
      ...options,
    };

    return this.client.collections().create(schema);
  }

  getIndex(indexName: string) {
    return this.client.collections(indexName).retrieve();
  }

  addDocuments(indexName: string, documents: any[], type: string) {
    // IMPORTANT: Be sure to increase connectionTimeoutSeconds to at least 5 minutes or more for imports,
    //  when instantiating the client

    const transformedDocuments = this.getTransformedDocuments(type, documents);

    return this.client
      .collections(indexName)
      .documents()
      .import(transformedDocuments, { action: "upsert" });
  }

  replaceDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = this.getTransformedDocuments(type, documents);

    return this.client
      .collections(indexName)
      .documents()
      .import(transformedDocuments, { action: "update" });
  }

  deleteDocument(indexName: string, document_id: string) {
    return this.client.collections(indexName).documents(document_id).delete();
  }

  async deleteAllDocuments(indexName: string) {
    // Typesense currently has no way to clear an entire collection for arbitrary documents.
    // Instead, we delete the collection and recreate it.

    const schema = await this.client.collections(indexName).retrieve();
    await this.client.collections(indexName).delete();
    return this.client.collections().create(schema);
  }

  // See https://typesense.org/docs/0.25.2/api/search.html#search-parameters for options
  search(indexName: string, query: string, options: Record<string, unknown>) {
    const { paginationOptions, filter, additionalOptions } = options;

    const searchParameters = {
      q: query,
      filter,
      ...(paginationOptions as Record<string, unknown>),
      ...(additionalOptions as Record<string, unknown>),
    } as unknown as SearchParams | SearchParamsWithPreset;

    return this.client
      .collections(indexName)
      .documents()
      .search(searchParameters);
  }

  async updateSettings(
    indexName: string,
    settings: SearchTypes.IndexSettings & CollectionUpdateSchema
  ) {
    try {
      await this.client.collections(indexName).retrieve();
      await this.client.collections(indexName).update(settings);
    } catch (error) {
      if (error.httpStatus === typesenseErrorCodes.INDEX_NOT_FOUND) {
        await this.createIndex(
          indexName,
          settings as SearchTypes.IndexSettings
        );
      }
    }
  }

  private getTransformedDocuments(type: string, documents: any[]) {
    if (!documents.length) {
      return [];
    }

    switch (type) {
      case SearchUtils.indexTypes.PRODUCTS:
        const productsTransformer =
          this.config.settings?.[SearchUtils.indexTypes.PRODUCTS]
            ?.transformer ?? transformProduct;

        return documents.map(productsTransformer);
      default:
        return documents;
    }
  }
}

export default TypesenseService;
