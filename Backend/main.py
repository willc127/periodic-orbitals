from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "API FastAPI funcionando"}

@app.get("/api/dados")
async def get_dados():
    return {"nome": "William", "profissao": "Desenvolvedor"}
