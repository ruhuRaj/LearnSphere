from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.moderation_service import moderate_comment

router = APIRouter()


class ModerationRequest(BaseModel):
    text: str


@router.post('/moderate-comment')
async def moderate(req: ModerationRequest):
    try:
        result = moderate_comment(req.text)
        return {"success": True, "moderation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
