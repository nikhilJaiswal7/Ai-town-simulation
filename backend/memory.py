import chromadb
from chromadb.config import Settings
import uuid

class MemoryModule:
    def __init__(self, town_name="ai_town"):
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(name=f"{town_name}_memories")

    def add_memory(self, character_id, content, metadata=None):
        if metadata is None:
            metadata = {}
        metadata["character_id"] = character_id
        
        self.collection.add(
            documents=[content],
            metadatas=[metadata],
            ids=[str(uuid.uuid4())]
        )

    def retrieve_memories(self, character_id, query, n_results=5):
        results = self.collection.query(
            query_texts=[query],
            where={"character_id": character_id},
            n_results=n_results
        )
        return results["documents"][0] if results["documents"] else []

memory_module = MemoryModule()
