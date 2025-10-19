from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # aceita qualquer origem (para teste)
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    encoded = base64.b64encode(contents).decode("utf-8")
    return JSONResponse(
        {
            "filename": file.filename,
            "content_type": file.content_type,
            "image_base64": encoded,
        }
    )
