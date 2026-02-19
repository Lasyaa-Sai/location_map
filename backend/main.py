from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)


THUNDERFOREST_API_KEY = os.getenv("REACT_APP_THUNDERFOREST_API_KEY")

client = httpx.AsyncClient(headers={"User-Agent": "MapTransportApp/1.0"})

@app.get("/api/search")
async def search(q: str = Query(...)):
    """Proxy for Nominatim Search API - Forced to English"""
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={q}&accept-language=en"
    response = await client.get(url)
    return response.json()

@app.get("/api/reverse")
async def reverse(lat: float, lon: float):
    """Proxy for Nominatim Reverse Geocoding API - Forced to English"""
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&accept-language=en"
    response = await client.get(url)
    return response.json()

@app.get("/api/nearby")
async def nearby(cat: str, viewbox: str):
    """Proxy for Nominatim Nearby Search - Forced to English"""
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={cat}&viewbox={viewbox}&bounded=1&limit=5&layer=poi&accept-language=en"
    response = await client.get(url)
    return response.json()

@app.get("/api/tiles/{z}/{x}/{y}")
async def tiles(z: int, x: int, y: int):
    """
    Proxy for Thunderforest Tiles.
    Using async and httpx significantly reduces lag compared to synchronous requests.
    """
    if not THUNDERFOREST_API_KEY:
        return Response(status_code=500, content="API Key not configured in backend")
    
    url = f"https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey={THUNDERFOREST_API_KEY}"
    try:
        response = await client.get(url, timeout=10)
        if response.status_code == 200:
            return Response(content=response.content, media_type="image/png")
        return Response(status_code=response.status_code, content="Tile fetch failed")
    except Exception as e:
        return Response(status_code=500, content=str(e))

@app.on_event("shutdown")
async def shutdown_event():
    await client.aclose()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
