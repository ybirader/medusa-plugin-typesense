# Typesense

Provide powerful indexing and searching features in your commerce application with Typesense.

## Features

- Flexible configurations for specifying searchable and retrievable attributes.
- Utilize Typesense's powerful search functionalities including typo-tolerance, synonyms, filtering, and more.

## Prerequisites

- Medusa backend
- Typesense instance

## How to Install

1. Run the following command in the directory of the Medusa backend:

`npm install medusa-plugin-typesense`

2. Set the following environment variables in .env:

```
TYPESENSE_NODES=<YOUR_TYPESENSE_NODES>
TYPESENSE_API_KEY=<YOUR_MASTER_KEY>
```

For development, the API key is `xyz` by default.

3. In medusa-config.js add the following at the end of the plugins array:

```js
const plugins = [
  // ...
  {
    resolve: "medusa-plugin-typesense",
    options: {
      config: {
        apiKey: process.env.TYPESENSE_API_KEY,
        nodes: [{ url: process.env.TYPESENSE_NODES }],
        connectionTimeoutSeconds: 300,
      },
      settings: {
        products: {
          fields: [
            {
              name: "title",
              type: "auto",
              facet: false,
            },
            {
              name: "description",
              type: "auto",
              facet: false,
            },
            {
              name: "variant_sku",
              type: "auto",
              facet: false,
            },
            {
              name: "handle",
              type: "auto",
              facet: false,
            },
          ],
        },
      },
    },
  },
];
```

## Test the Plugin

1. Run the following command in the directory of the Medusa backend to run the backend:

`npm run start`

2. Try searching products either using your storefront or using the Store APIs.
