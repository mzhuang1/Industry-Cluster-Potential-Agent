import os
import json
import asyncio
import math
from typing import List, Dict, Any, Optional, Tuple
import glob

class VectorStore:
    def __init__(self):
        # Setup directories
        self.chunks_dir = "./data/chunks"
        self.embeddings_dir = "./data/embeddings"
        self.metadata_file = "./data/document_metadata.json"
        
        # Create directories if they don't exist
        for directory in [self.chunks_dir, self.embeddings_dir]:
            os.makedirs(directory, exist_ok=True)
        
        # Load document metadata
        self.document_metadata = {}
        self._load_metadata()
    
    def _load_metadata(self):
        """Load document metadata from file"""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    self.document_metadata = json.load(f)
            except json.JSONDecodeError:
                self.document_metadata = {}
    
    async def search(
        self, 
        query: str, 
        industry: Optional[str] = None,
        region: Optional[str] = None,
        top_k: int = 5
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Search for relevant chunks based on query
        
        Args:
            query: Search query
            industry: Industry filter
            region: Region filter
            top_k: Number of top results to return
            
        Returns:
            Tuple of (context, sources)
        """
        # In a real implementation, generate query embedding and do similarity search
        # For this example, we'll simulate the search process
        
        # Get all embeddings files
        embedding_files = glob.glob(os.path.join(self.embeddings_dir, "*_embeddings.json"))
        
        # Get document IDs that match filters
        filtered_doc_ids = []
        for doc_id, metadata in self.document_metadata.items():
            if industry and metadata.get("industry") != industry:
                continue
            if region and metadata.get("region") != region:
                continue
            filtered_doc_ids.append(doc_id)
        
        # Collect all chunks from filtered documents
        all_chunks = []
        for embedding_file in embedding_files:
            doc_id = os.path.basename(embedding_file).split("_")[0]
            if not filtered_doc_ids or doc_id in filtered_doc_ids:
                try:
                    with open(embedding_file, "r", encoding="utf-8") as f:
                        embeddings = json.load(f)
                        
                        # Load corresponding chunks file to get full text
                        chunks_file = os.path.join(self.chunks_dir, f"{doc_id}_chunks.json")
                        if os.path.exists(chunks_file):
                            with open(chunks_file, "r", encoding="utf-8") as cf:
                                chunks = json.load(cf)
                                
                                for i, embedding in enumerate(embeddings):
                                    if i < len(chunks):
                                        all_chunks.append({
                                            "doc_id": doc_id,
                                            "chunk_id": embedding["chunk_id"],
                                            "text": chunks[i],
                                            "metadata": self.document_metadata.get(doc_id, {})
                                        })
                except Exception as e:
                    print(f"Error loading embeddings: {str(e)}")
        
        # Simulate semantic search
        # In a real implementation, compute similarity between query embedding and all chunk embeddings
        # For now, use simple keyword matching
        results = []
        query_keywords = set(query.lower().split())
        
        for chunk in all_chunks:
            # Count matching keywords
            chunk_text = chunk["text"].lower()
            matching_keywords = sum(1 for keyword in query_keywords if keyword in chunk_text)
            
            # Calculate a simple relevance score
            if matching_keywords > 0:
                score = matching_keywords / len(query_keywords)
                results.append({
                    "doc_id": chunk["doc_id"],
                    "chunk_id": chunk["chunk_id"],
                    "text": chunk["text"],
                    "score": score,
                    "metadata": chunk["metadata"]
                })
        
        # Sort by score and take top k
        results.sort(key=lambda x: x["score"], reverse=True)
        top_results = results[:top_k]
        
        # Build context string from top results
        context = "\n\n".join([result["text"] for result in top_results])
        
        # Prepare sources metadata
        sources = []
        for result in top_results:
            source = {
                "title": result["metadata"].get("title", "Unknown"),
                "score": result["score"],
                "industry": result["metadata"].get("industry", "Unknown"),
                "region": result["metadata"].get("region", "Unknown")
            }
            sources.append(source)
        
        return context, sources
    
    async def add_embeddings(self, embeddings: List[Dict[str, Any]], doc_id: str) -> None:
        """
        Add embeddings to the vector store
        
        Args:
            embeddings: List of embedding dictionaries
            doc_id: Document ID
        """
        embeddings_path = os.path.join(self.embeddings_dir, f"{doc_id}_embeddings.json")
        with open(embeddings_path, "w", encoding="utf-8") as f:
            json.dump(embeddings, f, ensure_ascii=False, indent=2)
    
    async def delete_document(self, doc_id: str) -> None:
        """
        Delete a document and its embeddings
        
        Args:
            doc_id: Document ID
        """
        # Delete embeddings
        embeddings_path = os.path.join(self.embeddings_dir, f"{doc_id}_embeddings.json")
        if os.path.exists(embeddings_path):
            os.remove(embeddings_path)
        
        # Delete chunks
        chunks_path = os.path.join(self.chunks_dir, f"{doc_id}_chunks.json")
        if os.path.exists(chunks_path):
            os.remove(chunks_path)
        
        # Update metadata
        if doc_id in self.document_metadata:
            del self.document_metadata[doc_id]
            
            # Save updated metadata
            with open(self.metadata_file, "w", encoding="utf-8") as f:
                json.dump(self.document_metadata, f, ensure_ascii=False, indent=2)