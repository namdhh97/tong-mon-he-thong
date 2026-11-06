import io
import os
import hmac
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

import soundfile
from vieneu import Vieneu


tts = Vieneu(mode="v3nano")


class VoiceHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/voice":
            self.send_error(404)
            return
        token = os.environ.get("VOICE_API_TOKEN")
        if token and not hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + token):
            self.send_error(401)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 8192:
                raise ValueError("Invalid request length")
            text = json.loads(self.rfile.read(length)).get("text")
            if not isinstance(text, str) or not text.strip() or len(text) > 1200:
                raise ValueError("Invalid text")
        except (ValueError, AttributeError):
            self.send_error(400)
            return
        try:
            samples = tts.infer(text, voice="Minh Quân")
            output = io.BytesIO()
            soundfile.write(output, samples, 24000, format="WAV", subtype="PCM_16")
            audio = output.getvalue()
        except Exception as error:
            print(f"Voice generation failed: {type(error).__name__}: {error}")
            self.send_error(503)
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(audio)))
        self.end_headers()
        self.wfile.write(audio)


HTTPServer(("0.0.0.0", 8000), VoiceHandler).serve_forever()
