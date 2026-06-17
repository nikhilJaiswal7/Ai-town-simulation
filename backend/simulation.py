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
    TICK_RATE = 1.0 
    
    # Designated Village Hotspots for Chores
    locations = {
        "river": {"x": 0, "y": 0, "desc": "fishing or gathering water"},
        "east_hill": {"x": 800, "y": 500, "desc": "gathering herbs"},
        "west_hill": {"x": -800, "y": -1000, "desc": "stargazing or watching the valley"},
        "bakery": {"x": 250, "y": 50, "desc": "baking fresh bread"},
        "clock_tower": {"x": 150, "y": 150, "desc": "winding the great village clock"},
        "town_square": {"x": 0, "y": 300, "desc": "socializing with neighbors"}
    }

    # Character-specific chore preferences
    chore_map = {
        "n1": ["clock_tower", "town_square"],
        "n2": ["west_hill", "river"],
        "n3": ["east_hill", "river"],
        "n4": ["river", "town_square"],
        "n5": ["bakery", "town_square"],
        "n6": ["west_hill", "town_square"]
    }

    while True:
        for char in characters_db.values():
            char.update_position(TICK_RATE)

            if char.state == "idle" and random.random() < 0.03: 
                # Pick a chore based on identity
                choices = chore_map.get(char.id, ["town_square"])
                loc_name = random.choice(choices)
                loc = locations[loc_name]
                
                # Add some randomness to the exact spot
                target_x = loc["x"] + random.uniform(-50, 50)
                target_y = loc["y"] + random.uniform(-50, 50)
                
                char.set_target(target_x, target_y)
                print(f"Agent {char.name} is heading to {loc_name} for {loc['desc']}.")

        # Proximity checks for social interactions
        char_list = list(characters_db.values())
        for i in range(len(char_list)):
            for j in range(i + 1, len(char_list)):
                c1 = char_list[i]
                c2 = char_list[j]
                
                dist = math.hypot(c1.x - c2.x, c1.y - c2.y)
                if dist < 60 and c1.state != "talking" and c2.state != "talking":
                    c1.state = "talking"
                    c2.state = "talking"
                    c1.talking_to = c2.id
                    c2.talking_to = c1.id
                    c1.target_x, c1.target_y = c1.x, c1.y
                    c2.target_x, c2.target_y = c2.x, c2.y
                    asyncio.create_task(simulate_interaction(c1, c2, manager))

        state_payload = {
            "type": "sync",
            "characters": [c.to_dict() for c in characters_db.values()]
        }
        await manager.broadcast(state_payload)
        await asyncio.sleep(TICK_RATE)

async def simulate_interaction(c1, c2, manager: ConnectionManager):
    fallbacks = {
        "Elias": ["The gears of the world are grinding to a halt.", "Time is a circle of rust.", "The Great Clock needs winding... again."],
        "Sera": ["...the silence here is louder than any poem.", "A quiet heart hears the stars.", "[She points toward the river with a knowing look]"],
        "Thistle": ["Found a rare silver moss by the river!", "This basket is getting heavy with thyme.", "The hills are alive with secrets today."],
        "Bramble": ["The fish aren't biting today, same as yesterday.", "River's cold. Keeps the mind sharp.", "I think I saw a giant pike near the bridge."],
        "Clara": ["The bread is rising, just like my spirits!", "Warmth is the best medicine for a cold soul.", "I have a fresh batch of cinnamon rolls for you."],
        "Silas": ["The constellation of the Loom is bright tonight.", "The hills have a long memory.", "Shadows are lengthening in the valley."]
    }
    
    await manager.broadcast({
        "type": "chat_event",
        "character_id": c1.id,
        "message": f"Greetings, {c2.name}." if random.random() > 0.5 else f"Ah, {c2.name}..."
    })
    
    await asyncio.sleep(3) 
    
    secret = ""
    try:
        if not os.getenv("OPENAI_API_KEY"):
            secret = random.choice(fallbacks.get(c1.name, ["The world is quiet today."]))
        else:
            prompt = f"As {c1.name} ({c1.personality}), tell {c2.name} something about your current village chore or a secret you've noticed. One short sentence."
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            secret = response.choices[0].message.content
    except Exception as e:
        secret = random.choice(fallbacks.get(c1.name, ["The world is quiet today."]))
        
    memory_module.add_memory(c1.id, f"I told {c2.name}: {secret}")
    memory_module.add_memory(c2.id, f"{c1.name} whispered to me: {secret}")
    
    await manager.broadcast({
        "type": "chat_event",
        "character_id": c1.id,
        "message": secret
    })
    
    await asyncio.sleep(6) 
    c1.state = "idle"
    c2.state = "idle"
    c1.talking_to = None
    c2.talking_to = None
