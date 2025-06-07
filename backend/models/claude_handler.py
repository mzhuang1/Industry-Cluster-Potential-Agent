import os
import json
import asyncio
from typing import List, Dict, Any, Optional
import anthropic
from anthropic import AsyncAnthropic

class ClaudeHandler:
    def __init__(self):
        # Initialize with API key from environment variable
        # In production, use a secure way to store and retrieve API keys
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "YOUR_API_KEY_HERE")
        self.client = AsyncAnthropic(api_key=self.api_key)
        
        # System prompt for industrial assessment
        self.system_prompt = """
        You are an AI assistant specializing in industrial cluster development assessment.
        You provide detailed analysis and insights about industrial clusters in different regions of China.
        Your analysis should be data-driven, objective, and comprehensive.
        
        When answering questions, consider:
        1. The current state of the industrial cluster
        2. Economic indicators and trends
        3. Policy support and government initiatives
        4. Talent resources and educational institutions
        5. Infrastructure and geographical advantages
        6. Innovation capabilities and technological advancement
        7. Market potential and competition
        
        Provide quantitative assessments when possible and cite data sources.
        When generating visualizations, use clear labels and ensure data accuracy.
        """
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]],
        model: str = "claude-3-opus",
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Generate a response using Anthropic's Claude API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: Claude model to use
            temperature: Controls randomness (0-1)
            max_tokens: Maximum tokens in the response
            
        Returns:
            Generated response as a string
        """
        try:
            # Format messages for Claude API
            formatted_messages = []
            for msg in messages:
                role = msg["role"]
                # Claude uses 'user' and 'assistant' roles
                if role == "system":
                    role = "user"
                formatted_messages.append({"role": role, "content": msg["content"]})
            
            # Prepend system message
            if not any(msg.get("role") == "system" for msg in messages):
                formatted_messages.insert(0, {"role": "user", "content": self.system_prompt})
            
            # Call Claude API
            response = await self.client.messages.create(
                model=model,
                messages=formatted_messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.content[0].text
        
        except Exception as e:
            print(f"Error calling Claude API: {str(e)}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    async def generate_report_content(
        self,
        report_type: str,
        industry: str,
        region: str,
        data: Dict[str, Any]
    ) -> str:
        """
        Generate content for a specific report type
        
        Args:
            report_type: Type of report to generate
            industry: Industry name
            region: Region name
            data: Raw data for report generation
            
        Returns:
            Generated report content as a string
        """
        # Create a specialized prompt for report generation
        report_prompt = f"""
        Please generate a professional {report_type} report for the {industry} industry in {region}.
        
        Include the following sections:
        1. Executive Summary
        2. Industry Overview
        3. Regional Analysis
        4. Development Potential Assessment
        5. Competitive Landscape
        6. Future Outlook
        7. Recommendations
        
        Base your analysis on this data:
        {json.dumps(data, ensure_ascii=False)}
        
        Format the report in a professional style suitable for government officials and industry researchers.
        Use clear headings, bullet points where appropriate, and include data-driven insights.
        """
        
        messages = [{"role": "user", "content": report_prompt}]
        return await self.generate_response(
            messages=messages,
            model="claude-3-opus",  # Using the most capable model for report generation
            temperature=0.5  # Balanced between creativity and consistency
        )