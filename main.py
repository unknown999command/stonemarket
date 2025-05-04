from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import os
import requests
import uvicorn
from dotenv import load_dotenv

# Загружаем переменные окружения из файла .env
load_dotenv()

# Создаем экземпляр FastAPI
app = FastAPI()

# Монтируем статические файлы (CSS, JS, изображения и т.д.)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Настраиваем шаблонизатор
templates = Jinja2Templates(directory="templates")

# Читаем токен бота и chat_id из переменных окружения
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Проверяем, что токен и chat_id заданы
if not BOT_TOKEN or not CHAT_ID:
    raise RuntimeError("Пожалуйста, добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env")

# Pydantic-модель для JSON-пayload
class CallbackRequest(BaseModel):
    name: str = "Клиент"
    phone: str
    message: str = "Запрос звонка"

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/callback")
async def callback(payload: CallbackRequest):
    # Формируем текст сообщения для Telegram
    text = (
        f"📞 Новый запрос на обратный звонок:\n"
        f"Имя: {payload.name}\n"
        f"Телефон: {payload.phone}\n"
        f"Комментарий: {payload.message}"
    )
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML"
    }

    try:
        resp = requests.post(url, data=data, timeout=5)
        resp.raise_for_status()
    except requests.RequestException as e:
        # Логируем ошибку
        print(f"Ошибка при отправке в Telegram: {e}")
        return {"status": "error", "message": "Не удалось отправить уведомление"}

    return {"status": "success", "message": "Запрос получен"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)