"""
Gemini AI Service for HabitOS Journal Features
Provides personalized insights and reflective prompts using Google's Gemini API
"""

import os
import logging
from typing import List, Dict, Optional, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini AI for journal features"""
    
    def __init__(self, api_key=None, model_name=None, max_tokens=None, temperature=None):
        """Initialize Gemini service with API key and model configuration"""
        # Allow passing config directly or use environment variables
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        self.model_name = model_name or os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = max_tokens or int(os.getenv('GEMINI_MAX_TOKENS', 2048))
        self.temperature = temperature or float(os.getenv('GEMINI_TEMPERATURE', 0.7))
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. AI features will be disabled.")
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
            logger.info(f"Gemini service initialized with model: {self.model_name}")
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
            {content}
            
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
    
    def generate_journal_insights(self, content: str, user_context: Dict = None) -> Dict[str, Any]:
        """
        Generate personalized insights from journal content
        
        Args:
            content (str): Journal entry content
            user_context (Dict): Optional user context (habits, goals, etc.)
            
        Returns:
            Dict containing AI-generated insights
        """
        if not self.enabled or not content:
            return self._get_fallback_insights(content)
        
        try:
            context_info = ""
            if user_context:
                context_info = f"""
                User Context:
                - Habits: {user_context.get('habits', [])}
                - Goals: {user_context.get('goals', [])}
                - Recent mood trends: {user_context.get('mood_trends', [])}
                """
            
            prompt = f"""
            Analyze this journal entry and provide personalized insights for self-improvement and wellness.
            
            {context_info}
            
            Journal Entry:
            {content}
            
            Provide insights in the following areas:
            1. Emotional patterns and triggers
            2. Habit and goal alignment
            3. Wellness recommendations
            4. Personal growth opportunities
            5. Summary of key themes
            
            Respond in JSON format:
            {{
                "summary": "Brief summary of the entry",
                "emotional_patterns": ["pattern1", "pattern2"],
                "habit_alignment": "How this entry relates to user's habits and goals",
                "wellness_recommendations": ["recommendation1", "recommendation2"],
                "growth_opportunities": ["opportunity1", "opportunity2"],
                "key_themes": ["theme1", "theme2"],
                "action_items": ["action1", "action2"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result:
                return {
                    'summary': result.get('summary', ''),
                    'emotional_patterns': result.get('emotional_patterns', []),
                    'habit_alignment': result.get('habit_alignment', ''),
                    'wellness_recommendations': result.get('wellness_recommendations', []),
                    'growth_opportunities': result.get('growth_opportunities', []),
                    'key_themes': result.get('key_themes', []),
                    'action_items': result.get('action_items', [])
                }
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
        
        return self._get_fallback_insights(content)
    
    def generate_reflective_prompts(self, user_context: Dict = None, prompt_type: str = "general") -> List[Dict[str, str]]:
        """
        Generate personalized reflective journaling prompts
        
        Args:
            user_context (Dict): User context (habits, goals, recent entries, etc.)
            prompt_type (str): Type of prompts to generate (general, habit-focused, goal-oriented, emotional, etc.)
            
        Returns:
            List of prompt objects with category and text
        """
        if not self.enabled:
            return self._get_fallback_prompts()
        
        try:
            context_info = ""
            if user_context:
                context_info = f"""
                User Context:
                - Current habits: {user_context.get('habits', [])}
                - Active goals: {user_context.get('goals', [])}
                - Recent mood: {user_context.get('recent_mood', 'neutral')}
                - Last entry themes: {user_context.get('last_entry_themes', [])}
                - Time of day: {user_context.get('time_of_day', 'morning')}
                """
            
            prompt_categories = {
                "general": "general reflection and daily experiences",
                "habit-focused": "habit tracking and consistency",
                "goal-oriented": "goal progress and achievement",
                "emotional": "emotional awareness and processing",
                "gratitude": "gratitude and positive reflection",
                "challenge": "overcoming difficulties and growth",
                "wellness": "physical and mental wellness"
            }
            
            category_description = prompt_categories.get(prompt_type, "general reflection")
            
            prompt = f"""
            Generate 5 personalized journaling prompts for {category_description}.
            
            {context_info}
            
            Each prompt should be:
            - Specific and actionable
            - Relevant to the user's context
            - Encouraging and supportive
            - Designed to promote self-reflection and growth
            
            Respond in JSON format:
            {{
                "prompts": [
                    {{
                        "category": "category_name",
                        "text": "prompt text",
                        "focus_area": "what this prompt helps with"
                    }}
                ]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result and 'prompts' in result:
                return result['prompts']
            
        except Exception as e:
            logger.error(f"Error generating prompts: {e}")
        
        return self._get_fallback_prompts()
    
    def analyze_journal_patterns(self, entries: List[Dict]) -> Dict[str, Any]:
        """
        Analyze patterns across multiple journal entries
        
        Args:
            entries (List[Dict]): List of journal entries with content and metadata
            
        Returns:
            Dict containing pattern analysis
        """
        if not self.enabled or not entries:
            return self._get_fallback_patterns()
        
        try:
            # Prepare entries data
            entries_text = "\n\n".join([
                f"Entry {i+1} ({entry.get('entry_date', 'unknown')}): {entry.get('content', '')}"
                for i, entry in enumerate(entries[:10])  # Limit to last 10 entries
            ])
            
            prompt = f"""
            Analyze these journal entries to identify patterns and trends:
            
            {entries_text}
            
            Provide analysis in the following areas:
            1. Recurring themes and topics
            2. Emotional patterns and mood trends
            3. Habit and goal-related patterns
            4. Writing patterns and preferences
            5. Growth and progress indicators
            
            Respond in JSON format:
            {{
                "recurring_themes": ["theme1", "theme2"],
                "emotional_patterns": ["pattern1", "pattern2"],
                "habit_patterns": ["pattern1", "pattern2"],
                "writing_patterns": ["pattern1", "pattern2"],
                "growth_indicators": ["indicator1", "indicator2"],
                "recommendations": ["recommendation1", "recommendation2"]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result:
                return {
                    'recurring_themes': result.get('recurring_themes', []),
                    'emotional_patterns': result.get('emotional_patterns', []),
                    'habit_patterns': result.get('habit_patterns', []),
                    'writing_patterns': result.get('writing_patterns', []),
                    'growth_indicators': result.get('growth_indicators', []),
                    'recommendations': result.get('recommendations', [])
                }
            
        except Exception as e:
            logger.error(f"Error analyzing patterns: {e}")
        
        return self._get_fallback_patterns()
    
    def generate_writing_suggestions(self, content: str, user_context: Dict = None) -> List[Dict[str, str]]:
        """
        Generate writing suggestions for journal entries
        
        Args:
            content (str): Current journal content
            user_context (Dict): User context for personalization
            
        Returns:
            List of writing suggestions
        """
        if not self.enabled:
            return self._get_fallback_writing_suggestions()
        
        try:
            context_info = ""
            if user_context:
                habits = ", ".join(user_context.get('habits', []))
                goals = ", ".join(user_context.get('goals', []))
                context_info = f"\nUser's habits: {habits}\nUser's goals: {goals}"
            
            prompt = f"""
            Generate 3-5 writing suggestions to help expand this journal entry.
            Consider the user's context and provide thoughtful, reflective prompts.
            
            Current Content:
            {content}
            
            User Context:{context_info}
            
            Provide suggestions that encourage:
            1. Deeper reflection
            2. Emotional awareness
            3. Goal alignment
            4. Habit tracking
            5. Personal growth
            
            Respond in JSON format:
            {{
                "suggestions": [
                    {{
                        "type": "suggestion_type",
                        "text": "suggestion_text",
                        "focus": "focus_area"
                    }}
                ]
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result and result.get('suggestions'):
                return result['suggestions']
            
        except Exception as e:
            logger.error(f"Error generating writing suggestions: {e}")
        
        return self._get_fallback_writing_suggestions()
    
    def generate_insights_summary(self, entries: List, user_context: Dict = None, period: str = "week") -> Dict[str, Any]:
        """
        Generate comprehensive insights summary for a period
        
        Args:
            entries (List): List of journal entries
            user_context (Dict): User context for personalization
            period (str): Time period (week, month, year)
            
        Returns:
            Dict containing insights summary
        """
        if not self.enabled:
            return self._get_fallback_insights_summary()
        
        try:
            # Prepare entry summaries
            entry_summaries = []
            for entry in entries[:20]:  # Limit to last 20 entries
                entry_summaries.append(f"Date: {entry.entry_date}, Content: {entry.content[:200]}...")
            
            entries_text = "\n".join(entry_summaries)
            
            context_info = ""
            if user_context:
                habits = ", ".join(user_context.get('habits', []))
                goals = ", ".join(user_context.get('goals', []))
                context_info = f"\nUser's habits: {habits}\nUser's goals: {goals}"
            
            prompt = f"""
            Generate a comprehensive insights summary for this user's journal entries over the past {period}.
            
            Journal Entries:
            {entries_text}
            
            User Context:{context_info}
            
            Provide a detailed summary including:
            1. Key themes and patterns
            2. Emotional journey and growth
            3. Habit and goal alignment
            4. Notable achievements and challenges
            5. Recommendations for continued growth
            
            Respond in JSON format:
            {{
                "key_themes": ["theme1", "theme2"],
                "emotional_journey": "journey_description",
                "growth_areas": ["area1", "area2"],
                "achievements": ["achievement1", "achievement2"],
                "challenges": ["challenge1", "challenge2"],
                "recommendations": ["recommendation1", "recommendation2"],
                "overall_summary": "comprehensive_summary"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result:
                return {
                    'key_themes': result.get('key_themes', []),
                    'emotional_journey': result.get('emotional_journey', ''),
                    'growth_areas': result.get('growth_areas', []),
                    'achievements': result.get('achievements', []),
                    'challenges': result.get('challenges', []),
                    'recommendations': result.get('recommendations', []),
                    'overall_summary': result.get('overall_summary', f'Analyzed {len(entries)} entries over {period}')
                }
            
        except Exception as e:
            logger.error(f"Error generating insights summary: {e}")
        
        return self._get_fallback_insights_summary()
    
    def analyze_habit_correlations(self, habit_data: List[Dict], entry_data: List[Dict]) -> Dict[str, Any]:
        """
        Analyze correlations between habits and journal entries
        
        Args:
            habit_data (List[Dict]): List of user habits
            entry_data (List[Dict]): List of journal entries
            
        Returns:
            Dict containing habit correlations analysis
        """
        if not self.enabled:
            return self._get_fallback_habit_correlations()
        
        try:
            # Prepare habit and entry summaries
            habit_summary = []
            for habit in habit_data:
                habit_summary.append(f"Habit: {habit['title']} (Category: {habit['category']})")
            
            entry_summary = []
            for entry in entry_data[:15]:  # Limit to last 15 entries
                entry_summary.append(f"Date: {entry['date']}, Content: {entry['content'][:150]}...")
            
            habits_text = "\n".join(habit_summary)
            entries_text = "\n".join(entry_summary)
            
            prompt = f"""
            Analyze the correlations between this user's habits and their journal entries.
            
            User Habits:
            {habits_text}
            
            Journal Entries:
            {entries_text}
            
            Identify:
            1. How habits influence journal content and mood
            2. Which habits are most reflected in journaling
            3. Potential habit-journal synergies
            4. Opportunities for habit-journal integration
            5. Recommendations for leveraging journaling to improve habits
            
            Respond in JSON format:
            {{
                "habit_influences": ["influence1", "influence2"],
                "journal_reflections": ["reflection1", "reflection2"],
                "synergies": ["synergy1", "synergy2"],
                "integration_opportunities": ["opportunity1", "opportunity2"],
                "recommendations": ["recommendation1", "recommendation2"],
                "correlation_summary": "overall_correlation_analysis"
            }}
            """
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            if result:
                return {
                    'habit_influences': result.get('habit_influences', []),
                    'journal_reflections': result.get('journal_reflections', []),
                    'synergies': result.get('synergies', []),
                    'integration_opportunities': result.get('integration_opportunities', []),
                    'recommendations': result.get('recommendations', []),
                    'correlation_summary': result.get('correlation_summary', f'Analyzed {len(habit_data)} habits and {len(entry_data)} entries')
                }
            
        except Exception as e:
            logger.error(f"Error analyzing habit correlations: {e}")
        
        return self._get_fallback_habit_correlations()
    
    def _parse_json_response(self, response_text: str) -> Optional[Dict]:
        """Parse JSON response from Gemini, handling common formatting issues"""
        try:
            import json
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
        """Fallback sentiment analysis when AI is disabled"""
        return {
            'sentiment': 'neutral',
            'sentiment_score': 0.0,
            'emotional_themes': [],
            'confidence': 0.0,
            'reasoning': 'AI analysis disabled'
        }
    
    def _get_fallback_insights(self, content: str) -> Dict[str, Any]:
        """Fallback insights when AI is disabled"""
        word_count = len(content.split()) if content else 0
        return {
            'summary': f"Journal entry with {word_count} words",
            'emotional_patterns': [],
            'habit_alignment': 'AI insights disabled',
            'wellness_recommendations': [],
            'growth_opportunities': [],
            'key_themes': [],
            'action_items': []
        }
    
    def _get_fallback_prompts(self) -> List[Dict[str, str]]:
        """Fallback prompts when AI is disabled"""
        return [
            {
                "category": "general",
                "text": "How are you feeling today? What's on your mind?",
                "focus_area": "general reflection"
            },
            {
                "category": "gratitude",
                "text": "What are three things you're grateful for today?",
                "focus_area": "gratitude practice"
            },
            {
                "category": "growth",
                "text": "What did you learn about yourself today?",
                "focus_area": "self-awareness"
            }
        ]
    
    def _get_fallback_patterns(self) -> Dict[str, Any]:
        """Fallback pattern analysis when AI is disabled"""
        return {
            'recurring_themes': [],
            'emotional_patterns': [],
            'habit_patterns': [],
            'writing_patterns': [],
            'growth_indicators': [],
            'recommendations': []
        }

    def _get_fallback_writing_suggestions(self) -> List[Dict[str, str]]:
        """Fallback writing suggestions when AI is disabled"""
        return [
            {
                "type": "reflection",
                "text": "Take a moment to reflect on your day. What stood out?",
                "focus": "deep reflection"
            },
            {
                "type": "gratitude",
                "text": "What are three things you're grateful for today?",
                "focus": "gratitude practice"
            },
            {
                "type": "growth",
                "text": "What did you learn about yourself today?",
                "focus": "self-awareness"
            }
        ]

    def _get_fallback_insights_summary(self) -> Dict[str, Any]:
        """Fallback insights summary when AI is disabled"""
        return {
            "key_themes": [],
            "emotional_journey": "AI insights summary disabled",
            "growth_areas": [],
            "achievements": [],
            "challenges": [],
            "recommendations": [],
            "overall_summary": "AI insights summary disabled"
        }

    def _get_fallback_habit_correlations(self) -> Dict[str, Any]:
        """Fallback habit correlations analysis when AI is disabled"""
        return {
            "habit_influences": [],
            "journal_reflections": [],
            "synergies": [],
            "integration_opportunities": [],
            "recommendations": [],
            "correlation_summary": "AI habit correlation analysis disabled"
        }

# Global instance - will be initialized when needed
gemini_service = None

def get_gemini_service():
    """Get or create the Gemini service instance"""
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service 