import requests
import xml.etree.ElementTree as ET

url = "http://export.arxiv.org/api/query"
params = {
    "search_query": "all:quantum computing",
    "max_results": 1
}

r = requests.get(url, params=params)
print(r.text[:2000])
