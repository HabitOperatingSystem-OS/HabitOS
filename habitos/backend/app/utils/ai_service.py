import os
import logging
import json
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import google.generativeai as genai

logger = logging.getLogger(__name__)

class AIService:
    """AI service for all journal features using Google Gemini"""
    
    def __init__(self, api_key=None, model_name=None, max_tokens=None, temperature=None):
        """Initialize AI service with Gemini API configuration"""
        # Allow passing config directly or use environment variables
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.model_name = model_name or os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = max_tokens or int(os.getenv('GEMINI_MAX_TOKENS', 2048))
        self.temperature = temperature or float(os.getenv('GEMINI_TEMPERATURE', 0.7))
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. AI features will use fallback responses.")
            self.enabled = False
            return
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=self.max_tokens,
                    temperature=self.temperature,
                )
            )
            self.enabled = True
            logger.info(f"Gemini AI service initialized with model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini service: {e}")
            self.enabled = False

    def analyze_journal_sentiment(self, content: str) -> Dict[str, Any]:
        """
        Analyze sentiment of journal content using Gemini
        
        Args:
            content (str): Journal entry content
            
        Returns:
            Dict containing sentiment analysis results
        """
        if not self.enabled or not content:
            return self._get_fallback_sentiment()
        
        try:
            prompt = f"""
            Analyze the sentiment of this journal entry. Provide a detailed analysis including:
            
            1. Overall sentiment (very_negative, negative, neutral, positive, very_positive)
            2. Sentiment score (-1.0 to 1.0, where -1 is very negative and 1 is very positive)
            3. Key emotional themes identified
            4. Confidence level in the analysis
            
            Journal Entry:
            {content[:1000]}  # Limit content length for stability
            
            Respond in JSON format:
            {{
                "sentiment": "sentiment_label",
                "sentiment_score": float_value,
                "emotional_themes": ["theme1", "theme2"],
                "confidence": float_value,
                "reasoning": "brief explanation"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result:
                return {
                    'sentiment': result.get('sentiment', 'neutral'),
                    'sentiment_score': result.get('sentiment_score', 0.0),
                    'emotional_themes': result.get('emotional_themes', []),
                    'confidence': result.get('confidence', 0.5),
                    'reasoning': result.get('reasoning', '')
                }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
        
        return self._get_fallback_sentiment()

    def generate_monthly_summary(self, entries: List[Dict]) -> Dict[str, Any]:
        """
        Generate a monthly summary from journal entries using Gemini
        
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
        Generate journal writing prompts using Gemini
        
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
            
            response = self.model.generate_content(prompt)
            prompts_text = response.text.strip()
            
            # Parse prompts from response
            prompts = []
            for line in prompts_text.split('\n'):
                line = line.strip()
                if line and not line.startswith(('1.', '2.', '3.', '4.', '5.', '-')):
                    prompts.append({
                        'text': line,
                        'category': 'general',
                        'focus_area': 'self-reflection'
                    })
            
            # Ensure we have the requested number of prompts
            while len(prompts) < count:
                prompts.append({
                    'text': 'How are you feeling today? What\'s on your mind?',
                    'category': 'general',
                    'focus_area': 'general reflection'
                })
            
            return prompts[:count]
            
        except Exception as e:
            logger.error(f"Error generating prompts: {e}")
            return self._get_fallback_prompts(count)

    def _parse_json_response(self, response_text: str) -> Optional[Dict]:
        """Parse JSON response from Gemini, handling common formatting issues"""
        try:
            # Clean up the response text
            cleaned_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            cleaned_text = cleaned_text.strip()
            
            return json.loads(cleaned_text)
        except Exception as e:
            logger.error(f"Error parsing JSON response: {e}")
            logger.debug(f"Response text: {response_text}")
            return None

    def _get_fallback_sentiment(self) -> Dict[str, Any]:
        """Fallback sentiment analysis when Gemini is disabled"""
        return {
            'sentiment': 'neutral',
            'sentiment_score': 0.0,
            'emotional_themes': [],
            'confidence': 0.0,
            'reasoning': 'AI analysis disabled'
        }

    def _get_fallback_monthly_summary(self, entries: List[Dict]) -> Dict[str, Any]:
        """Fallback monthly summary when Gemini is disabled"""
        entry_count = len(entries) if entries else 0
        return {
            'summary': f"You wrote {entry_count} journal entries this month. Keep up the great work of self-reflection!",
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'monthly_summary',
            'entry_count': entry_count
        }

    def _get_fallback_prompts(self, count: int) -> List[Dict[str, str]]:
        """Fallback prompts when Gemini is disabled"""
        default_prompts = [
            {
                "text": "How are you feeling today? What's on your mind?",
                "category": "general",
                "focus_area": "general reflection"
            },
            {
                "text": "What are three things you're grateful for today?",
                "category": "gratitude",
                "focus_area": "gratitude practice"
            },
            {
                "text": "What did you learn about yourself today?",
                "category": "growth",
                "focus_area": "self-awareness"
            },
            {
                "text": "What was the highlight of your day?",
                "category": "reflection",
                "focus_area": "positive reflection"
            },
            {
                "text": "What would you like to improve or work on?",
                "category": "growth",
                "focus_area": "self-improvement"
            }
        ]
        
        # Return requested number of prompts, cycling through defaults if needed
        result = []
        for i in range(count):
            result.append(default_prompts[i % len(default_prompts)])
        
        return result

    def _get_fallback_insight(self, content: str) -> Dict[str, Any]:
        """Fallback insight when Gemini is disabled"""
        word_count = len(content.split()) if content else 0
        return {
            'insight': f"Journal entry with {word_count} words. Keep writing to discover more about yourself.",
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'entry_insight'
        }

# Global instance - will be initialized when needed
ai_service = None

def get_ai_service():
    """Get or create the AI service instance"""
    global ai_service
    if ai_service is None:
        ai_service = AIService()
    return ai_service 