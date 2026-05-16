import os
import aiohttp
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

import re

def is_biographical_query(query: str) -> bool:
    """Checks if a query is biographical or historical about a person."""
    bio_markers = [
        "who is", "life of", "biography", "dark history", 
        "scandal", "career of", "born in", "personal life",
        "story of", "history of", "bio", "autobiography",
        "early life", "achievements of", "controversy",
        "death of", "spouse", "children", "early years",
        "family", "ancestry"
    ]
    query_lower = query.lower().strip()
    
    # Check for direct marker match
    if any(marker in query_lower for marker in bio_markers):
        print(f"arXiv: BLOCKING biographical query based on markers: {query}")
        return True
    
    # Heuristic for person names: If it's 2-3 capitalized words AND contains 
    # definitely non-scientific words or common biographical keywords.
    # For now, we'll stick to the expanded markers list as it's safer.
    
    return False

async def search_arxiv(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Searches arXiv for academic papers.
    Returns a list of papers in a standardized format.
    """
    if is_biographical_query(query):
        print(f"arXiv: BLOCKING biographical query: {query}")
        return []
        
    url = "http://export.arxiv.org/api/query"
    params = {
        "start": 0,
        "max_results": max_results
    }
    
    # If the query looks like an arXiv ID (e.g., 2403.001 or 2101.12345v2)
    import re
    is_id = re.match(r'^\d{4}\.\d{4,5}(v\d+)?$', query) or re.match(r'^[a-z\-]+/\d{7}(v\d+)?$', query)
    
    if is_id:
        params["id_list"] = query
    else:
        params["search_query"] = f"all:{query}"
    headers = {
        "User-Agent": "RegleResearchDashboard/1.0 (https://github.com/black-hand-corp; contact@regle.io)"
    }

    import asyncio
    try:
        # Create a TCP connector that doesn't verify SSL
        connector = aiohttp.TCPConnector(ssl=False)
        async with aiohttp.ClientSession(connector=connector) as session:
            for attempt in range(2): # Max 2 attempts
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status == 429:
                        import random
                        wait_time = 5 + random.uniform(0, 2)
                        print(f"arXiv: 429 Rate Limit. Attempt {attempt+1}/2. Waiting {wait_time:.1f}s...")
                        await asyncio.sleep(wait_time)
                        continue
                        
                    if response.status != 200:
                        print(f"arXiv Error: {response.status}")
                        return []
                    
                    xml_data = await response.text()
                    break
            else:
                return []
            
            # Move parsing OUTSIDE the else block
            root = ET.fromstring(xml_data)
            namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
            
            entries = root.findall('atom:entry', namespaces)
            results = []
            
            for entry in entries:
                paper_id = entry.find('atom:id', namespaces).text if entry.find('atom:id', namespaces) is not None else ""
                title = entry.find('atom:title', namespaces).text.strip() if entry.find('atom:title', namespaces) is not None else "Untitled"
                summary = entry.find('atom:summary', namespaces).text.strip() if entry.find('atom:summary', namespaces) is not None else ""
                published = entry.find('atom:published', namespaces).text if entry.find('atom:published', namespaces) is not None else ""
                
                # Extract authors
                authors_list = entry.findall('atom:author', namespaces)
                authors = ", ".join([a.find('atom:name', namespaces).text for a in authors_list if a.find('atom:name', namespaces) is not None])
                
                # Links
                links = entry.findall('atom:link', namespaces)
                paper_url = ""
                for link in links:
                    if link.get('rel') == 'alternate':
                        paper_url = link.get('href')
                        break
                
                if not paper_url:
                    paper_url = paper_id # Fallback to ID which is usually a permalink
                
                content = f"Title: {title}\nAuthors: {authors}\nPublished: {published}\n\nAbstract: {summary}"
                
                results.append({
                    "id": paper_id,
                    "title": title,
                    "content": content,
                    "url": paper_url,
                    "metadata": {
                        "title": title,
                        "url": paper_url,
                        "source": "arxiv",
                        "authors": authors,
                        "published": published,
                        "type": "academic_paper"
                    },
                    "source": "academic"
                })
            
            return results

    except Exception as e:
        print(f"arXiv Service Error: {str(e)}")
        return []
