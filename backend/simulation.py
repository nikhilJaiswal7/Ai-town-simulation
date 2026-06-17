import asyncio
import random
import math
import os
import openai
from fastapi import WebSocket
from typing import List

from .character import characters_db
from .memory import memory_module

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

async def simulation_loop(manager: ConnectionManager):
    TICK_RATE = 1.0 # Run every 1 second
    
    buildings = [
        {"name": "Shop", "x": 400, "y": 100},
        {"name": "Library", "x": 250, "y": 350},
        {"name": "House", "x": 100, "y": 150}
    ]

    while True:
        # 1. Update Positions
        for char in characters_db.values():
            char.update_position(TICK_RATE)

            # Agent AI: Decide what to do if idle
            if char.state == "idle" and random.random() < 0.05: # 5% chance per second to pick a new goal
                action = random.choice(["wander", "visit_building"])
                if action == "wander":
                    char.set_target(random.uniform(-400, 400), random.uniform(-400, 400))
                else:
                    b = random.choice(buildings)
                    char.set_target(b["x"], b["y"])

        # 2. Check for Proximity (Meeting and Greeting)
        char_list = list(characters_db.values())
        for i in range(len(char_list)):
            for j in range(i + 1, len(char_list)):
                c1 = char_list[i]
                c2 = char_list[j]
                
                dist = math.hypot(c1.x - c2.x, c1.y - c2.y)
                if dist < 50 and c1.state != "talking" and c2.state != "talking":
                    # They meet!
                    c1.state = "talking"
                    c2.state = "talking"
                    c1.talking_to = c2.id
                    c2.talking_to = c1.id
                    
                    # Stop them
                    c1.target_x = c1.x
                    c1.target_y = c1.y
                    c2.target_x = c2.x
                    c2.target_y = c2.y
                    
                    # Trigger conversation in background so we don't block the loop
                    asyncio.create_task(simulate_interaction(c1, c2, manager))

        # 3. Broadcast State
        state_payload = {
            "type": "sync",
            "characters": [c.to_dict() for c in characters_db.values()]
        }
        await manager.broadcast(state_payload)

        await asyncio.sleep(TICK_RATE)

async def simulate_interaction(c1, c2, manager: ConnectionManager):
    print(f"Agent Interaction: {c1.name} meets {c2.name}")
    
    # Context-aware fallback responses based on personality
    fallbacks = {
        "Elias": ["The gears of the world are grinding to a halt.", "Time is a circle of rust.", "Do you hear the ticking in the walls?"],
        "Sera": ["...the silence here is louder than any poem.", "A quiet heart hears the stars.", "[She nods slowly, eyes full of unwritten verses]"],
        "Thistle": ["Found a rare silver moss by the river!", "Nature has a curious way of hiding its best secrets.", "Have you seen the herbs near the east hill?"],
        "Bramble": ["The fish aren't biting today, same as yesterday.", "River's cold. Keeps the mind sharp.", "Quiet down, you'll scare the trout."],
        "Clara": ["The bread is rising, just like my spirits!", "Warmth is the best medicine for a cold soul.", "Fresh rolls soon, Elias!"],
        "Silas": ["The constellation of the Loom is bright tonight.", "The hills have a long memory.", "Walking keeps the shadows at bay."]
    }
    
    # Broadcast they are talking
    intro = f"Ah, {c2.name}..." if random.random() > 0.5 else f"Greetings, {c2.name}."
    await manager.broadcast({
        "type": "chat_event",
        "character_id": c1.id,
        "message": intro
    })
    
    await asyncio.sleep(3) 
    
    secret = ""
    try:
        if not os.getenv("OPENAI_API_KEY"):
            secret = random.choice(fallbacks.get(c1.name, ["Hello there."]))
        else:
            prompt = f"Write a one-sentence secret or piece of gossip that {c1.name} ({c1.personality}) might share with {c2.name} ({c2.personality}) in our small village."
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            secret = response.choices[0].message.content
    except Exception as e:
        print(f"Simulation API Error: {e}")
        secret = random.choice(fallbacks.get(c1.name, ["The world is quiet today."]))
        
    memory_module.add_memory(c1.id, f"I told {c2.name}: {secret}")
    memory_module.add_memory(c2.id, f"{c1.name} whispered to me: {secret}")
    
    await manager.broadcast({
        "type": "chat_event",
        "character_id": c1.id,
        "message": secret
    })
    
    await asyncio.sleep(5) 
    
    c1.state = "idle"
    c2.state = "idle"
    c1.talking_to = None
    c2.talking_to = None
