-- 启用pgvector扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建向量表
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    document_chunk_id INTEGER NOT NULL,
    embedding vector(1536),  -- 使用OpenAI的embedding维度
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用于快速检索的索引
CREATE INDEX IF NOT EXISTS embeddings_vector_idx ON embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- 文本搜索历史表
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    results_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建检索函数
CREATE OR REPLACE FUNCTION search_similar_chunks(
    query_embedding vector,
    similarity_threshold FLOAT,
    max_results INTEGER
)
RETURNS TABLE (
    chunk_id INTEGER,
    document_id INTEGER,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id AS chunk_id,
        dc.document_id,
        dc.content,
        dc.metadata,
        1 - (e.embedding <=> query_embedding) AS similarity
    FROM 
        embeddings e
    JOIN 
        document_chunks dc ON e.document_chunk_id = dc.id
    WHERE 
        1 - (e.embedding <=> query_embedding) > similarity_threshold
    ORDER BY 
        similarity DESC
    LIMIT 
        max_results;
END;
$$;