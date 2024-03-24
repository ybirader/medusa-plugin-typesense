import { SearchTypes } from "@medusajs/types";
import Configuration from "typesense/lib/Typesense/Configuration";

export const typesenseErrorCodes = {
  INDEX_NOT_FOUND: 404,
}

export default interface TypesensePluginOptions {
  /**
   * Typesense configuration
   */
  config: Configuration;

  /**
   * Index settings
   */
  settings?: {
    [key: string]: SearchTypes.IndexSettings;
  };
}
