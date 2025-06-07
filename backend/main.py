import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional, List, Dict, Any
import time
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# 导入自定义模块
from backend.models.openai_handler import OpenAIHandler
from backend.rag.document_processor import DocumentProcessor
from backend.rag.vector_store import VectorStore
from backend.reports.report_generator import ReportGenerator

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO").upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建上传目录
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 创建FastAPI应用
app = FastAPI(
    title="产业集群发展潜力评估系统API",
    description="为产业集群发展潜力评估系统提供后端API服务",
    version="1.0.0",
)

# 配置CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
openai_handler = OpenAIHandler()
document_processor = DocumentProcessor(openai_handler)
vector_store = VectorStore(openai_handler)
report_generator = ReportGenerator(openai_handler, vector_store)

# 中间件 - 请求计时和日志
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # 记录API请求日志
        logger.info(
            f"Path: {request.url.path} | "
            f"Method: {request.method} | "
            f"Status: {response.status_code} | "
            f"Time: {process_time:.4f}s"
        )
        
        return response
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        process_time = time.time() - start_time
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error",
                "process_time": process_time,
            },
        )

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}

# API路由组
from backend.routes import auth, chat, reports, admin, documents

# 注册路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(chat.router, prefix="/api/chat", tags=["对话"])
app.include_router(reports.router, prefix="/api/reports", tags=["报告"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理"])
app.include_router(documents.router, prefix="/api/documents", tags=["文档"])

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

# 挂载上传文件目录
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 根路径重定向到前端应用
@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("static/index.html")

# 404处理 - 返回前端应用以支持客户端路由
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    return FileResponse("static/index.html")

# 应用启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("应用启动中...")
    # 测试数据库连接
    # 初始化服务
    
    # 预热模型
    try:
        logger.info("预热AI模型...")
        await openai_handler.chat_completion(
            messages=[{"role": "system", "content": "你好，这是一次预热测试。"}],
            max_tokens=5
        )
    except Exception as e:
        logger.error(f"模型预热失败: {e}")

# 应用关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("应用关闭中...")
    # 关闭连接和资源
    openai_handler.close()

# 主入口点
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8021)),
        reload=os.getenv("ENVIRONMENT", "development") == "development",
    )