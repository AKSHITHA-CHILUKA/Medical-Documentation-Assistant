# backend/app.py
import asyncio
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import urllib.parse
import uvicorn
import os
import logging

# try to import and load the embedding model; if unavailable, continue without embeddings
# (replaced with lazy, opt-in loader controlled by ENABLE_EMBEDDINGS env var)
EMB_MODEL = None
_EMB_LOADING = False

def get_embedding_model():
    global EMB_MODEL, _EMB_LOADING
    # Enable embeddings only if you set ENABLE_EMBEDDINGS=1 in your environment
    if os.environ.get("ENABLE_EMBEDDINGS", "0") != "1":
        return None
    if EMB_MODEL is None and not _EMB_LOADING:
        try:
            _EMB_LOADING = True
            from sentence_transformers import SentenceTransformer
            EMB_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logging.warning("SentenceTransformer not available or failed to load: %s", e)
            EMB_MODEL = None
        finally:
            _EMB_LOADING = False
    return EMB_MODEL

app = FastAPI(title="MedDocAssistant")

class QueryRequest(BaseModel):
    symptoms: str
    top_k: int = 5

EUROPE_PMC_SEARCH = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize={n}"

async def fetch_europepmc(query: str, n: int = 5):
    # use urllib.parse.quote_plus for safe URL encoding
    url = EUROPE_PMC_SEARCH.format(q=urllib.parse.quote_plus(query), n=n)
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

@app.post("/api/query")
async def query_literature(req: QueryRequest):
    symptoms = req.symptoms.strip()
    if not symptoms:
        raise HTTPException(status_code=400, detail="No symptoms provided")

    # 1) Search Europe PMC
    try:
        data = await fetch_europepmc(symptoms, n=req.top_k)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    results = []
    abstracts = []
    for hit in data.get("resultList", {}).get("result", []):
        title = hit.get("title")
        abstract = hit.get("abstractText") or ""
        journal = hit.get("journalTitle") or ""
        year = hit.get("pubYear") or ""
        pmcid = hit.get("pmcid") or hit.get("id")
        url = hit.get("source") or f"https://europepmc.org/article/pmc/{pmcid}"
        snippet = abstract[:400] + ("..." if len(abstract) > 400 else "")
        results.append({
            "title": title,
            "abstract": abstract,
            "snippet": snippet,
            "journal": journal,
            "year": year,
            "source": "EuropePMC",
            "url": url
        })
        abstracts.append(abstract or title or "")

    # 2) (Optional) Semantic ranking using embeddings
    try:
        model = get_embedding_model()
        if model is not None and abstracts:
            query_emb = model.encode([symptoms])[0]
            doc_embs = model.encode(abstracts)
            # naive cosine ranking
            import numpy as np
            from numpy.linalg import norm
            scores = []
            for emb in doc_embs:
                s = float(np.dot(query_emb, emb) / (norm(query_emb) * norm(emb) + 1e-10))
                scores.append(s)
            # sort results by score desc
            order = sorted(range(len(results)), key=lambda i: scores[i], reverse=True)
            results = [results[i] for i in order]
    except Exception:
        # if embedding step fails, continue with original order
        logging.exception("Embedding/ranking step failed")

    # 3) Create a lightweight LLM prompt for summarization (placeholder)
    # Replace the block below with a call to your LLM provider to summarize.
    # e.g. OpenAI: openai.ChatCompletion.create(...) or call a local LLM
    summary_placeholder = (
        "SUMMARY (placeholder): Found {} articles. Replace this with LLM-generated educational summary that cites sources."
        .format(len(results))
    )

    # 4) Build citations list
    citations = []
    for r in results:
        citations.append(f"{r['title']} — {r['journal']} ({r['year']}) — {r['url']}")
    return {
        "summary": summary_placeholder,
        "matches": results,
        "citations": citations
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.environ.get("PORT", 8000)))

# To test the API, you can use the following curl commands:
# curl http://127.0.0.1:8000/docs
# curl -X POST http://127.0.0.1:8000/api/query -H "Content-Type: application/json" -d "{\"symptoms\":\"fever cough\",\"top_k\":3}"

