# ArXiv API Integration Basics

This document provides a technical overview of how ArXiv is integrated into the Regle RAG Search platform.

## Overview

ArXiv is a free distribution service and an open-access archive for 2.4 million scholarly articles in the fields of physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering and systems science, and economics.

## API Endpoint

We use the ArXiv API query interface:
`http://export.arxiv.org/api/query`

## Key Parameters

| Parameter | Description | Our Default |
|-----------|-------------|-------------|
| `search_query` | The actual query. We use `all:query` to search all fields. | `all:{query}` |
| `start` | The starting index for results (pagination). | `0` |
| `max_results` | The maximum number of results to return. | `5` (configurable) |

## Implementation Details

### Service Layer: `arxiv_service.py`

The service implementation handles the following:
1.  **Request Execution**: Uses `aiohttp` for asynchronous requests.
2.  **SSL Handling**: Disables SSL verification (via `TCPConnector`) to avoid certificate issues in some environments.
3.  **Rate Limiting**: Implements a basic retry loop with a 5-second wait if a `429 Too Many Requests` status is encountered.
4.  **XML Parsing**: ArXiv returns data in Atom (XML) format. We use `xml.etree.ElementTree` with namespaces to extract:
    *   `id`: Unique paper identifier (permalink).
    *   `title`: The paper's title.
    *   `summary`: The abstract.
    *   `published`: Publication date.
    *   `author`: A list of authors.
    *   `link`: Links to the paper (we prioritize the `alternate` link).

### Standardized Format

The service maps ArXiv data into the internal `Document` format used by the RAG orchestrator:

```json
{
  "id": "http://arxiv.org/abs/2403.xxxxx",
  "title": "Quantum Gravity in 2D",
  "content": "Title: ...\nAuthors: ...\nPublished: ...\n\nAbstract: ...",
  "url": "http://arxiv.org/abs/2403.xxxxx",
  "metadata": {
    "title": "...",
    "url": "...",
    "source": "arxiv",
    "authors": "...",
    "published": "...",
    "type": "academic_paper"
  },
  "source": "academic"
}
```

## Integration into LangGraph

ArXiv can be triggered in the `Hybrid` or `Web` research modes when the query implies academic or scientific research intent (e.g., "papers about...", "latest research on...", "arxiv search for...").

### Adding to the Orchestrator

1.  **Node Definition**: Create an `arxiv_node` in `src/agents/nodes.py`.
2.  **Graph Inclusion**: Add the node to `src/agents/graph.py`.
3.  **Routing Logic**: Update `route_after_planning` to trigger the node when academic keywords are detected in the planner's output.

## Future Improvements

*   **Advanced Queries**: Support field-specific searching (e.g., `au:Einstein` for author search).
*   **PDF Ingestion**: Integrated vision-centric PDF parsing for ArXiv papers to extract more than just the abstract.
*   **Category Filtering**: Allow users to restrict searches to specific ArXiv categories (e.g., `cs.AI`).
