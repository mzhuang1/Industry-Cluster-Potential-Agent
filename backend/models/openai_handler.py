import os
import json
import logging
from typing import Dict, List, Any, Optional
import time
import httpx
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIHandler:
    """处理与OpenAI API的交互"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.error("OPENAI_API_KEY未设置")
            raise ValueError("OPENAI_API_KEY环境变量未设置")
            
        self.base_url = "https://api.openai.com/v1"
        self.default_model = os.getenv("DEFAULT_MODEL", "gpt-4-turbo-preview")
        self.timeout = httpx.Timeout(30.0, connect=10.0)
        
        # 初始化HTTP客户端
        self.client = httpx.Client(
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=self.timeout
        )
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        发送对话请求到OpenAI API
        
        Args:
            messages: 对话消息列表
            model: 使用的模型，默认为gpt-4-turbo-preview
            temperature: 温度参数，控制随机性
            max_tokens: 最大生成的token数
            stream: 是否使用流式响应
            
        Returns:
            API响应数据
        """
        try:
            url = f"{self.base_url}/chat/completions"
            payload = {
                "model": model or self.default_model,
                "messages": messages,
                "temperature": temperature,
                "stream": stream
            }
            
            if max_tokens:
                payload["max_tokens"] = max_tokens
                
            # 添加请求重试逻辑
            max_retries = 3
            retry_delay = 1  # 初始延迟1秒
            
            for attempt in range(max_retries):
                try:
                    async with httpx.AsyncClient(
                        headers={"Authorization": f"Bearer {self.api_key}"},
                        timeout=self.timeout
                    ) as client:
                        response = await client.post(url, json=payload)
                        
                        if response.status_code == 200:
                            if stream:
                                return response.aiter_lines()
                            return response.json()
                        elif response.status_code == 429:  # 速率限制
                            retry_delay = min(retry_delay * 2, 60)  # 指数退避，最多等待60秒
                            logger.warning(f"API速率限制，重试前等待{retry_delay}秒")
                            time.sleep(retry_delay)
                            continue
                        else:
                            logger.error(f"OpenAI API错误: {response.status_code} - {response.text}")
                            response.raise_for_status()
                    
                except (httpx.ConnectError, httpx.TimeoutException) as e:
                    logger.warning(f"连接错误: {e}. 尝试 {attempt+1}/{max_retries}")
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(retry_delay)
                    retry_delay = min(retry_delay * 2, 60)
            
            logger.error("重试次数用尽")
            raise httpx.RequestError("重试次数用尽")
            
        except Exception as e:
            logger.error(f"调用OpenAI API时出错: {e}")
            raise
    
    async def embeddings(self, texts: List[str], model: str = "text-embedding-3-large") -> List[List[float]]:
        """
        为文本生成嵌入向量
        
        Args:
            texts: 要嵌入的文本列表
            model: 使用的嵌入模型
            
        Returns:
            嵌入向量列表
        """
        try:
            url = f"{self.base_url}/embeddings"
            
            # 对于大量文本，分批处理
            batch_size = 20
            all_embeddings = []
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                
                payload = {
                    "model": model,
                    "input": batch
                }
                
                async with httpx.AsyncClient(
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=self.timeout
                ) as client:
                    response = await client.post(url, json=payload)
                    
                    if response.status_code == 200:
                        result = response.json()
                        batch_embeddings = [item["embedding"] for item in result["data"]]
                        all_embeddings.extend(batch_embeddings)
                    else:
                        logger.error(f"OpenAI嵌入API错误: {response.status_code} - {response.text}")
                        response.raise_for_status()
                
                # 避免触发速率限制
                if i + batch_size < len(texts):
                    time.sleep(0.5)
            
            return all_embeddings
            
        except Exception as e:
            logger.error(f"生成嵌入时出错: {e}")
            raise
    
    def close(self):
        """关闭HTTP客户端"""
        if hasattr(self, 'client'):
            self.client.close()