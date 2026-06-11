from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import certifi

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where()
    )
    db = client[settings.DB_NAME]
    print("Connected to MongoDB successfully")

async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_db():
    return db
