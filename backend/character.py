from typing import List, Dict
import math

class Character:
    def __init__(self, id: str, name: str, personality: str, x: float = 0, y: float = 0):
        self.id = id
        self.name = name
        self.personality = personality
        self.short_term_memory: List[Dict[str, str]] = [] # Chat history
        
        # Simulation State
        self.x = x
        self.y = y
        self.target_x = x
        self.target_y = y
        self.state = "idle" # idle, walking, talking
        self.talking_to = None
        self.speed = 20.0 # units per second

    def set_target(self, x, y):
        self.target_x = x
        self.target_y = y
        self.state = "walking"
        self.talking_to = None

    def update_position(self, dt):
        if self.state == "walking":
            dx = self.target_x - self.x
            dy = self.target_y - self.y
            dist = math.hypot(dx, dy)
            
            if dist < 1.0:
                self.x = self.target_x
                self.y = self.target_y
                self.state = "idle"
            else:
                self.x += (dx / dist) * self.speed * dt
                self.y += (dy / dist) * self.speed * dt

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "target_x": self.target_x,
            "target_y": self.target_y,
            "state": self.state
        }

    def build_prompt(self, current_location: str, relationship_tier: str, retrieved_memories: List[str], user_message: str):
        memories_str = "\n".join([f"- {m}" for m in retrieved_memories])
        prompt = f"""
        You are {self.name}. 
        Your personality: {self.personality}
        
        Current context:
        - Location: {current_location}
        - Relationship with the other person: {relationship_tier}
        
        Relevant Memories:
        {memories_str}
        
        Short-term history:
        {self.format_history()}
        
        The other person says: "{user_message}"
        
        Response as {self.name} (Keep it moody, introspective, and concise):
        """
        return prompt.strip()

    def format_history(self):
        return "\n".join([f"{m['role']}: {m['content']}" for m in self.short_term_memory[-5:]])

    def add_to_history(self, role: str, content: str):
        self.short_term_memory.append({"role": role, "content": content})
        if len(self.short_term_memory) > 10:
            self.short_term_memory.pop(0)

# Initialize with more village characters
characters_db = {
    "n1": Character("n1", "Elias", "A reclusive clockmaker who speaks in metaphors about time and decay.", 100, 150),
    "n2": Character("n2", "Sera", "A former poet who lost her voice but communicates through intense, quiet presence.", -100, -50),
    "n3": Character("n3", "Thistle", "The energetic village herbalist, always searching for rare moss near the river.", -200, 100),
    "n4": Character("n4", "Bramble", "The grumpy but kind fisherman who spends his days near the water.", 50, -250),
    "n5": Character("n5", "Clara", "The baker whose laughter is as warm as her bread.", 250, 50),
    "n6": Character("n6", "Silas", "A mysterious traveler who watches the stars from the hills.", 0, 300)
}
