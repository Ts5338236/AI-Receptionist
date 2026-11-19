"""Audio preprocessing, validation, and signal analysis utilities."""

import math
import struct
from typing import Optional, Tuple


class AudioProcessor:
    """Preprocesses and inspects inbound audio streams from the kiosk client."""

    @staticmethod
    def calculate_pcm16_energy(raw_bytes: bytes) -> Tuple[float, bool]:
        """Calculates Root-Mean-Square (RMS) dBFS energy of 16-bit PCM samples.

        Returns:
            Tuple of (rms_dbfs, is_speech)
        """
        if len(raw_bytes) < 2:
            return -100.0, False

        # Read 16-bit signed integer samples
        sample_count = len(raw_bytes) // 2
        try:
            samples = struct.unpack(f"<{sample_count}h", raw_bytes[: sample_count * 2])
        except struct.error:
            return -100.0, False

        sum_squares = sum(s * s for s in samples)
        mean_square = sum_squares / max(1, sample_count)
        rms = math.sqrt(mean_square)

        # Normalize to dBFS relative to max 32768
        if rms > 0:
            dbfs = 20.0 * math.log10(rms / 32768.0)
        else:
            dbfs = -100.0

        # Typical ambient room noise is < -45 dBFS, speech is > -35 dBFS
        is_speech = dbfs > -38.0
        return dbfs, is_speech

    @staticmethod
    def validate_audio_chunk(audio_bytes: bytes, max_bytes: int = 262144) -> Tuple[bool, Optional[str]]:
        """Validates payload boundary constraints."""
        if len(audio_bytes) == 0:
            return False, "Audio chunk is empty"
        if len(audio_bytes) > max_bytes:
            return False, f"Chunk size {len(audio_bytes)} exceeds maximum limit {max_bytes}"
        return True, None
