import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-organmatch'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-super-secret-key-organmatch'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limit
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 🟢 Professional SQLite Database (High Reliability for Project Demo)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'organmatch.db')

    # 🔄 Production MySQL Fallback (To use: Run migrate_to_mysql.py and switch lines below)
    #SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@127.0.0.1:3306/organmatch_db?charset=utf8mb4'

