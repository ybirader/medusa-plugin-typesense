import { MedusaContainer } from "@medusajs/modules-sdk";
import { Logger } from "@medusajs/types";
import TypesenseService from "../services/typesense";
import type TypesensePluginOptions from "../types";

export default async (
  container: MedusaContainer,
  options: TypesensePluginOptions
) => {
  const logger: Logger = container.resolve("logger");

  try {
    const typesenseService: TypesenseService =
      container.resolve("typesenseService");

    const { settings = {} } = options;

    await Promise.all(
      Object.entries(settings).map(async ([indexName, value]) => {
        return typesenseService.updateSettings(indexName, value);
      })
    );
  } catch (err) {
    // ignore
    logger.warn(err);
  }
};
