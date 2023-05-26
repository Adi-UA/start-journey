from auth import HF_TOKEN
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from io import BytesIO
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "cuda"
model = "CompVis/stable-diffusion-v1-4"
pipe = StableDiffusionPipeline.from_pretrained(
    model, revision="fp16", torch_dtype=torch.float16, use_auth_token=HF_TOKEN
)
pipe.to(device)


@app.get("/")
def generate(prompt: str):
    with autocast(device):
        result_img = pipe(prompt, guidance_scale=8.5).images[0]

    result_img.save("result.png")

    buffer = BytesIO()
    result_img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue())

    return Response(content=img_str, media_type="image/png")
