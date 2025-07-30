"""
Simple AI Service for HabitOS Journal Features
Provides stable, focused AI insights without complex dependencies
"""

import os
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class SimpleAIService:
    """Simplified AI service for journal features with focus on stability"""
    
    def __init__(self, api_key=None, model_name=None):
        """Initialize AI service with API key and model configuration"""
        # Allow passing config directly or use environment variables
        self.api_key = api_key or os.getenv('OPENAI_API_KEY') or os.getenv('GEMINI_API_KEY')
        self.model_name = model_name or os.getenv('AI_MODEL', 'gpt-3.5-turbo')
        
        if not self.api_key:
            logger.warning("AI API key not configured. AI features will use fallback responses.")
            self.enabled = False
            return
        
        # Determine which AI service to use based on API key format
        if self.api_key.startswith('sk-'):
            self.service_type = 'openai'
            self._init_openai()
        else:
            self.service_type = 'gemini'
            # Use correct model name for Gemini
            self.model_name = 'gemini-1.5-flash'
            self._init_gemini()
    
    def _init_openai(self):
        """Initialize OpenAI client"""
        try:
            import openai
            self.client = openai.OpenAI(api_key=self.api_key)
            self.enabled = True
            logger.info("OpenAI service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI service: {e}")
            self.enabled = False
    
    def _init_gemini(self):
        """Initialize Gemini client"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            self.enabled = True
            logger.info("Gemini service initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            self.enabled = False
    
    def generate_entry_insight(self, content: str) -> Dict[str, Any]:
        """
        Generate a simple, focused insight for a journal entry
        
        Args:
            content (str): Journal entry content
            
        Returns:
            Dict containing insight data
        """
        if not self.enabled or not content:
            return self._get_fallback_insight(content)
        
        try:
            prompt = f"""
            Analyze this journal entry and provide a brief, encouraging insight (2-3 sentences max).
            Focus on one key observation or reflection that could be helpful to the writer.
            Keep it positive and supportive.
            
            Journal Entry:
            {content[:500]}  # Limit content length for stability
            
            Respond with just the insight text, no JSON formatting.
            """
            
            if self.service_type == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=100,
                    temperature=0.7
                )
                insight = response.choices[0].message.content.strip()
            else:
                response = self.model.generate_content(prompt)
                insight = response.text.strip()
            
            return {
                'insight': insight,
                'generated_at': datetime.utcnow().isoformat(),
                'type': 'entry_insight'
            }
            
        except Exception as e:
            logger.error(f"Error generating entry insight: {e}")
            return self._get_fallback_insight(content)
    
    def generate_monthly_summary(self, entries: List[Dict]) -> Dict[str, Any]:
        """
        Generate a monthly summary from journal entries
        
        Args:
            entries (List[Dict]): List of journal entries for the month
            
        Returns:
            Dict containing monthly summary
        """
        if not self.enabled or not entries:
            return self._get_fallback_monthly_summary(entries)
        
        try:
            # Prepare entries summary
            entries_text = "\n\n".join([
                f"Entry {i+1}: {entry.get('content', '')[:200]}..."
                for i, entry in enumerate(entries[:20])  # Limit to 20 entries
            ])
            
            prompt = f"""
            Based on these journal entries from the past month, provide a brief monthly summary (3-4 sentences).
            Focus on recurring themes, emotional patterns, or notable reflections.
            Keep it encouraging and insightful.
            
            Journal Entries:
            {entries_text}
            
            Respond with just the summary text, no JSON formatting.
            """
            
            if self.service_type == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=150,
                    temperature=0.7
                )
                summary = response.choices[0].message.content.strip()
            else:
                response = self.model.generate_content(prompt)
                summary = response.text.strip()
            
            return {
                'summary': summary,
                'generated_at': datetime.utcnow().isoformat(),
                'type': 'monthly_summary',
                'entry_count': len(entries)
            }
            
        except Exception as e:
            logger.error(f"Error generating monthly summary: {e}")
            return self._get_fallback_monthly_summary(entries)
    
    def generate_prompts(self, count: int = 5) -> List[Dict[str, str]]:
        """
        Generate journal writing prompts
        
        Args:
            count (int): Number of prompts to generate
            
        Returns:
            List of prompt objects
        """
        if not self.enabled:
            return self._get_fallback_prompts(count)
        
        try:
            prompt = f"""
            Generate {count} thoughtful journal writing prompts.
            Make them diverse and encouraging for self-reflection.
            Each prompt should be 1-2 sentences max.
            
            Respond with just the prompts, one per line, no numbering or formatting.
            """
            
            if self.service_type == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.8
                )
                prompts_text = response.choices[0].message.content.strip()
            else:
                response = self.model.generate_content(prompt)
                prompts_text = response.text.strip()
            
            # Parse prompts from response
            prompts = []
            for line in prompts_text.split('\n'):
                line = line.strip()
                if line and not line.startswith(('1.', '2.', '3.', '4.', '5.', '-')):
                    prompts.append({
                        'text': line,
                        'category': 'reflection'
                    })
            
            return prompts[:count]
            
        except Exception as e:
            logger.error(f"Error generating prompts: {e}")
            return self._get_fallback_prompts(count)
    
    def _get_fallback_insight(self, content: str) -> Dict[str, Any]:
        """Fallback insight when AI is disabled"""
        word_count = len(content.split()) if content else 0
        insights = [
            "Your journaling practice shows commitment to self-reflection and growth.",
            "Writing about your experiences helps you process and understand them better.",
            "Regular journaling builds self-awareness and emotional intelligence.",
            "Your entries demonstrate thoughtful reflection on daily experiences.",
            "Journaling is a powerful tool for personal development and mindfulness."
        ]
        
        import random
        return {
            'insight': random.choice(insights),
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'entry_insight'
        }
    
    def _get_fallback_monthly_summary(self, entries: List[Dict]) -> Dict[str, Any]:
        """Fallback monthly summary when AI is disabled"""
        entry_count = len(entries) if entries else 0
        
        if entry_count == 0:
            summary = "You haven't written any journal entries this month yet. Consider starting your journaling practice to gain insights into your thoughts and experiences."
        elif entry_count < 5:
            summary = f"You've written {entry_count} journal entries this month. Each entry contributes to your self-awareness and personal growth journey."
        elif entry_count < 15:
            summary = f"You've maintained a good journaling practice with {entry_count} entries this month. Your consistent reflection is building valuable self-insights."
        else:
            summary = f"You're a dedicated journaler with {entry_count} entries this month. Your regular practice is creating a rich record of your personal development."
        
        return {
            'summary': summary,
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'monthly_summary',
            'entry_count': entry_count
        }
    
    def _get_fallback_prompts(self, count: int) -> List[Dict[str, str]]:
        """Fallback prompts when AI is disabled"""
        default_prompts = [
            "What's on your mind today? How are you feeling?",
            "What's one thing you're grateful for right now?",
            "What did you learn about yourself today?",
            "What's something you're looking forward to?",
            "How can you be kinder to yourself today?",
            "What would make today feel more meaningful?",
            "What's one small step you can take toward your goals?",
            "What's something you'd like to let go of?",
            "How can you create more peace in your day?",
            "What would you tell a friend going through this?"
        ]
        
        import random
        selected = random.sample(default_prompts, min(count, len(default_prompts)))
        return [{'text': prompt, 'category': 'reflection'} for prompt in selected]

# Global instance
simple_ai_service = None

def get_simple_ai_service():
    """Get or create the simple AI service instance"""
    global simple_ai_service
    if simple_ai_service is None:
        simple_ai_service = SimpleAIService()
    return simple_ai_service 