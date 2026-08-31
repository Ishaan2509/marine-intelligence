from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def root():
    return {"message": "Marine Intelligence API is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    return {
        "message": f"I received your query: {request.message}"
    }