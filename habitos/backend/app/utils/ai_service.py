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
        # Force reload environment variables to ensure they're available
        from dotenv import load_dotenv
        load_dotenv()
        
        # Allow passing config directly or use environment variables
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.model_name = model_name or os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = max_tokens or int(os.getenv('GEMINI_MAX_TOKENS', 1024))
        self.temperature = temperature or float(os.getenv('GEMINI_TEMPERATURE', 0.7))
        
        # Simple cache for prompts (cache for 5 minutes to reduce API calls)
        self._prompt_cache = {}
        self._cache_duration = timedelta(minutes=5)
        
        logger.info(f"Initializing AI Service - API Key set: {bool(self.api_key)}, Model: {self.model_name}")
        
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
            logger.info(f"Gemini AI service initialized successfully with model: {self.model_name}")
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
        if not self.enabled:
            raise RuntimeError("AI service is not enabled and fallback mode is disabled.")
        if not entries:
            raise ValueError("No journal entries provided for summary.")
        
        # Create a cache key based on entry count and content hash
        import hashlib
        entries_hash = hashlib.md5(str(entries).encode()).hexdigest()
        cache_key = f"monthly_summary_{len(entries)}_{entries_hash}"
        
        # Check cache first
        if cache_key in self._prompt_cache:
            cached_data = self._prompt_cache[cache_key]
            if datetime.now() - cached_data['timestamp'] < self._cache_duration:
                return cached_data['data']
            else:
                # Remove expired cache entry
                del self._prompt_cache[cache_key]
        
        # Generate summary
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
        
        result = {
            'summary': summary,
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'monthly_summary',
            'entry_count': len(entries),
            'is_fallback': False
        }
        
        # Cache the results
        self._prompt_cache[cache_key] = {
            'data': result,
            'timestamp': datetime.now()
        }
        return result

    def generate_prompts(self, count: int = 5) -> List[Dict[str, str]]:
        """
        Generate journal writing prompts using Gemini
        
        Args:
            count (int): Number of prompts to generate
            
        Returns:
            List of prompt objects
        """
        if not self.enabled:
            logger.info("AI service disabled, using fallback prompts")
            return self._get_fallback_prompts(count)
        
        # Check cache first
        cache_key = f"prompts_{count}"
        if cache_key in self._prompt_cache:
            cached_data = self._prompt_cache[cache_key]
            if datetime.now() - cached_data['timestamp'] < self._cache_duration:
                logger.info(f"Returning cached prompts for count {count}")
                return cached_data['prompts']
            else:
                # Remove expired cache entry
                del self._prompt_cache[cache_key]
        
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
            
            # Cache the results
            self._prompt_cache[cache_key] = {
                'prompts': prompts[:count],
                'timestamp': datetime.now()
            }
            
            logger.info(f"Successfully generated {len(prompts)} AI prompts")
            return prompts[:count]
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                logger.warning(f"Rate limit exceeded for Gemini API: {error_msg}")
                logger.info("Falling back to randomized prompts due to rate limit")
            else:
                logger.error(f"Error generating prompts: {e}")
            return self._get_fallback_prompts(count)

    def clear_prompt_cache(self):
        """Clear the prompt cache to force fresh generation"""
        self._prompt_cache.clear()
        logger.info("Prompt cache cleared")

    def clear_monthly_summary_cache(self):
        """Clear the monthly summary cache to force fresh generation"""
        # Remove only monthly summary cache entries
        keys_to_remove = [key for key in self._prompt_cache.keys() if key.startswith('monthly_summary_')]
        for key in keys_to_remove:
            del self._prompt_cache[key]
        logger.info(f"Monthly summary cache cleared ({len(keys_to_remove)} entries)")

    def clear_all_cache(self):
        """Clear all cache entries"""
        self._prompt_cache.clear()
        logger.info("All cache entries cleared")

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
        """Fallback monthly summary when Gemini is disabled or rate limited"""
        entry_count = len(entries) if entries else 0
        
        # Calculate some basic statistics
        total_words = sum(len(entry.get('content', '').split()) for entry in entries)
        avg_words_per_entry = total_words / entry_count if entry_count > 0 else 0
        
        # Analyze mood trends if available
        mood_ratings = [entry.get('mood_rating') for entry in entries if entry.get('mood_rating')]
        avg_mood = sum(mood_ratings) / len(mood_ratings) if mood_ratings else None
        
        # Generate a more detailed fallback summary
        if entry_count == 0:
            summary_text = "You haven't written any journal entries this month yet. Start your journaling journey today!"
        elif entry_count < 5:
            summary_text = f"You wrote {entry_count} journal entries this month with an average of {avg_words_per_entry:.0f} words per entry. Keep building this wonderful habit of self-reflection!"
        elif entry_count < 15:
            summary_text = f"Great progress! You wrote {entry_count} journal entries this month. That's an average of {avg_words_per_entry:.0f} words per entry. You're developing a consistent journaling practice!"
        else:
            summary_text = f"Excellent consistency! You wrote {entry_count} journal entries this month with an average of {avg_words_per_entry:.0f} words per entry. Your dedication to self-reflection is inspiring!"
        
        # Add mood insight if available
        if avg_mood:
            if avg_mood >= 8:
                mood_insight = " Your overall mood has been quite positive this month!"
            elif avg_mood >= 6:
                mood_insight = " Your mood has been generally positive this month."
            elif avg_mood >= 4:
                mood_insight = " You've experienced a mix of emotions this month."
            else:
                mood_insight = " You've had some challenging moments this month. Remember, it's okay to not be okay."
            summary_text += mood_insight
        
        return {
            'summary': summary_text,
            'generated_at': datetime.utcnow().isoformat(),
            'type': 'monthly_summary',
            'entry_count': entry_count,
            'total_words': total_words,
            'avg_words_per_entry': round(avg_words_per_entry, 1),
            'avg_mood': round(avg_mood, 1) if avg_mood else None,
            'is_fallback': True
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
            },
            {
                "text": "Describe a moment today that made you smile.",
                "category": "reflection",
                "focus_area": "positive moments"
            },
            {
                "text": "What's something you're looking forward to?",
                "category": "future",
                "focus_area": "anticipation"
            },
            {
                "text": "How did you take care of yourself today?",
                "category": "self-care",
                "focus_area": "wellness"
            },
            {
                "text": "What challenged you today and how did you handle it?",
                "category": "growth",
                "focus_area": "resilience"
            },
            {
                "text": "Write about a person who influenced your day.",
                "category": "relationships",
                "focus_area": "social connections"
            },
            {
                "text": "What's one thing you'd do differently if you could?",
                "category": "reflection",
                "focus_area": "learning"
            },
            {
                "text": "Describe your energy level today and what affected it.",
                "category": "wellness",
                "focus_area": "energy awareness"
            },
            {
                "text": "What's a small win you experienced today?",
                "category": "celebration",
                "focus_area": "achievement"
            },
            {
                "text": "How did you show kindness to yourself or others?",
                "category": "kindness",
                "focus_area": "compassion"
            },
            {
                "text": "What's something you're curious about right now?",
                "category": "growth",
                "focus_area": "curiosity"
            }
        ]
        
        # Shuffle the prompts to get different ones each time
        import random
        shuffled_prompts = default_prompts.copy()
        random.shuffle(shuffled_prompts)
        
        # Return requested number of prompts
        return shuffled_prompts[:count]

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
    # Always create a fresh instance to ensure proper configuration
    ai_service = AIService()
    logger.info(f"AI Service initialized - Enabled: {ai_service.enabled}, Model: {ai_service.model_name}")
    return ai_service 