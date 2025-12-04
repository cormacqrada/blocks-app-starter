from fastapi import FastAPI

app = FastAPI(title="Blocks FastAPI Backend")


@app.get("/health")
async def health() -> dict:
    """Simple healthcheck endpoint for the generated backend."""
    return {"status": "ok"}
