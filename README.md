# Blended Feelings
The repo contains source code for https://blendedfeelings.com,
a website where you can browse through a variety of topics, explore new subjects and organizing knowldge effectively.

## Indexer

The Indexer component, as the name suggests, is responsible for indexing documents into a store that can later be accessed by the web app.

### Data Source

To handle a variety of data sources, the Indexer defines interface, [`IContentSource`](src/indexer/lib/contentSource/contentSource.ts), which is implemented by the following 

- [`fileSystemContentSource`](src/indexer/lib/contentSource/fileSystemContentSource.ts) - manages the indexing of documents from the file system.
- [`gitHubContentSource`](src/indexer/lib/contentSource/gitHubContentSource.ts) - supports indexing documents hosted on GitHub repos.

### Indexing Queue

The entry point to the indexer is the indexing queue. It supports various queue implementations through the [`IQueue<T>`](src/indexer/lib/queue/index.ts)
- [`inMemoryQueue`](src/indexer/lib/queue/inMemoryQueue.ts) - in-memory queue implementation that leverages the fastq package.

### Data Storage

The Indexer utilizes a store to retain data for subsequent access by the indexer or other system components. The generic interface [`IStore<T>`](/src/indexer/lib/store/index.ts) makes it possible to use diffrent database or file stores.

- [`inMemoryStore`](src/indexer/lib/store/inMemoryStore.ts) - an in-memory storage.
- [`sqlServerStore`](src/indexer/lib/store/sqlServerStore.ts) -  SQL Server supported storage.

### Search
The indexer also supports indexing documents into full text search. [`ISearch`](src/indexer/lib/search/index.ts) interface is implemented by the following:

- [`meilisearchSearch`](src/indexer/lib/search/meilisearchSearch.ts) - [MeiliSearch](https://www.meilisearch.com/) client implementation.
- [`inMemorySearch`](src/indexer/lib/search/inMemorySearch.ts) - in-memory search using [fuse.js](https://www.fusejs.io/) package pacakge.

### Indexing Steps

The indexing process is divided into steps, each requiring the implementation of the [`IStep`](src/indexer/lib/indexer/index.ts) interface. The indexing pipeline processes every item (file or folder) from the data source, executing the following steps:

1. [`CrawlStep`](src/indexer/lib/indexer/crawlStep.ts): For folders, this step enumerates all child items and enqueues them for indexing. Files are passed through without modification.
2. [`IndexStep`](src/indexer/lib/indexer/indexStep.ts): Responsible for storing the items in `indexStore`.
3. [`IncludesStep`](src/indexer/lib/indexer/includesStep.ts): Checks for external file inclusions within items. A external item can be included using the syntax [!INCLUDE url_to_include]. You can see an example [here](https://github.com/BlendedFeelings/software/blob/main/algorithms/sort/bubble-sort-algorithm.md). It fetches the content from the specified URL and stores it in `includesStore`.
4. [`WebIndexStep`](src/indexer/lib/indexer/webIndexStep.ts): Prepares items for the web application by combining data from `indexStore` and `includesStore` into a single consumable entity.
5. [`WebSearchStep`](src/indexer/lib/indexer/webSearchStep.ts): Indexes items in a full-text search service, facilitating search functionality  within the web application.


## FrontEnd

Built using https://kit.svelte.dev/

Articles are stored in a store in markdown format.

When a single article is displayed:
- [markdown.ts](src/web/src/lib/markdown/processor/markdown.ts) processor uses https://github.com/syntax-tree/mdast packages to parse and create markdown Markdown AST
- [Markdown.svelte](src/web/src/lib/markdown/components/Markdown.svelte) renders Markdown AST

When a list of articles is displayed:
- one of [fetchStrategy](src/web/src/lib/webIndex/fetchStrategy.ts) is employed to get the list items: [latestFetchStrategy](src/web/src/lib/webIndex/latestFetchStrategy.ts), [randomFetchStrategy](src/web/src/lib/webIndex/randomFetchStrategy.ts), [searchFetchStrategy](src/web/src/lib/webIndex/searchFetchStrategy.ts), [allFoldersFetchStrategy](src/web/src/lib/webIndex/allFoldersFetchStrategy.ts)
- each item is processed and rendered

