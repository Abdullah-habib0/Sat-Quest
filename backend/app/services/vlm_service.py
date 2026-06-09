
import base64
import ssl
import aiohttp
from config import settings

class VLMService:
    def __init__(self):
        self.endpoint = settings.MODEL_NAME  # now stores the ngrok endpoint

    async def generate_answer(
        self,
        query: str,
        image_bytes: bytes | None,
        stored_image_b64: str | None = None,
    ) -> str:
        """
        Calls the external VLM API endpoint (ngrok) with base64 image and question.
        If image_bytes is provided, it takes priority over stored_image_b64.
        """
        image_b64 = None
        if image_bytes:
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        elif stored_image_b64:
            image_b64 = stored_image_b64

        payload = {"question": query}
        if image_b64:
            payload["image_b64"] = image_b64
            
        # # Disable SSL verification for ngrok
        # ssl_context = ssl.create_default_context()
        # ssl_context.check_hostname = False
        # ssl_context.verify_mode = ssl.CERT_NONE
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.endpoint, json=payload, timeout=aiohttp.ClientTimeout(total=120), ssl=False) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise RuntimeError(f"VLM API error: {resp.status} {text}")
                data = await resp.json()
        return data.get("answer", "[No answer returned]")


vlm_service = VLMService()