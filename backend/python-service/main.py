from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ai_id_verification import analyze_front_id
from datetime import datetime

app = FastAPI()

# Allow frontend + backend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/verify-front")
async def verify_front(id_card_front: UploadFile = File(...)):
    """
    Accepts ONLY the front side of an ID card.
    """
    front_bytes = await id_card_front.read()
    current_date = datetime.now().strftime("%d/%m/%Y")

    result = analyze_front_id(front_bytes, current_date)
    return result


@app.get("/")
def root():
    return {"status": "Python verification service running"}
