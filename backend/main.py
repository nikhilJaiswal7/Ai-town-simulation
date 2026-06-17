from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import json
import asyncio
from dotenv import load_dotenv
import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

from .memory import memory_module
from .character import characters_db
from .database import get_db_connection, init_db
from .simulation import simulation_loop, ConnectionManager

app = FastAPI(title="AI Town Real-Time API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
init_db()

@app.on_event("startup")
async def startup_event():
    # Start the real-time game loop
    asyncio.create_task(simulation_loop(manager))

@app.get("/api/state")
async def get_state():
    return {
        "characters": [c.to_dict() for c in characters_db.values()],
        "relationships": [] # Simplified for now
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We can receive client commands here (like forced movement or direct chat)
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("type") == "move":
                char = characters_db.get(payload["character_id"])
                if char:
                    char.set_target(payload["x"], payload["y"])
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class ChatRequest(BaseModel):
    character_id: str
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    character = characters_db.get(request.character_id)
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    memories = memory_module.retrieve_memories(request.character_id, request.message)
    prompt = character.build_prompt("Town Square", "Stranger", memories, request.message)

    try:
        if not openai.api_key:
            response_text = f"[{character.name} looks at you silently.] (Set OPENAI_API_KEY)"
        else:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            response_text = response.choices[0].message.content
    except Exception as e:
        response_text = f"[{character.name} sighs, the air growing cold.] (API Quota Exceeded)"

    character.add_to_history("user", request.message)
    character.add_to_history("assistant", response_text)
    memory_module.add_memory(request.character_id, f"User said: {request.message}. I replied: {response_text}")

    # Broadcast the chat event to all clients so they see chat bubbles
    await manager.broadcast({
        "type": "chat_event",
        "character_id": character.id,
        "message": response_text
    })

    return {"character_name": character.name, "response": response_text}
