from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, company, risk
import models
from database import engine, Base

# Create tables in Postgres database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VYUHA Supply Chain Risk Intelligence API",
    description="Python FastAPI backend powering predictive supply chain risk analysis, company onboarding, and scenario simulations.",
    version="1.0.0"
)

# Configure CORS to allow access from Vite React frontend and deployed domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
