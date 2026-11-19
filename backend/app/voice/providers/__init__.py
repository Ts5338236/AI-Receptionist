"""Voice Provider factory module."""

from app.core.config import settings
from app.voice.providers.base import BaseSTTProvider, BaseTTSProvider
from app.voice.providers.deepgram_provider import DeepgramSTTProvider
from app.voice.providers.elevenlabs_provider import ElevenLabsTTSProvider
from app.voice.providers.mock_provider import MockSTTProvider, MockTTSProvider


def get_stt_provider() -> BaseSTTProvider:
    """Factory returning configured STT provider instance."""
    provider_name = settings.STT_PROVIDER.lower()
    if provider_name == "deepgram":
        return DeepgramSTTProvider()
    elif provider_name == "mock":
        return MockSTTProvider()
    return DeepgramSTTProvider()


def get_tts_provider() -> BaseTTSProvider:
    """Factory returning configured TTS provider instance."""
    provider_name = settings.TTS_PROVIDER.lower()
    if provider_name == "elevenlabs":
        return ElevenLabsTTSProvider()
    elif provider_name == "mock":
        return MockTTSProvider()
    return ElevenLabsTTSProvider()


__all__ = [
    "BaseSTTProvider",
    "BaseTTSProvider",
    "DeepgramSTTProvider",
    "ElevenLabsTTSProvider",
    "MockSTTProvider",
    "MockTTSProvider",
    "get_stt_provider",
    "get_tts_provider",
]
