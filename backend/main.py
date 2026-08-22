from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, company, risk

app = FastAPI(
    title="VYUHA Supply Chain Risk Intelligence API",
    description="Python FastAPI backend powering predictive supply chain risk analysis, company onboarding, and scenario simulations.",
    version="1.0.0"
)

# Configure CORS to allow access from Vite React frontend
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(company.router)
app.include_router(risk.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "VYUHA Supply Chain Risk Intelligence Platform API",
        "docs": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
