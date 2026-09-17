from fastapi import APIRouter, Depends, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_db
from app.models.user import User
from app.models.resume import Document
from app.routes.auth import get_user_from_token
from app.utils.file_upload import save_upload, extract_text

router = APIRouter(prefix='/api/rag', tags=['rag'])

# Simple in-memory vector store for demo
_documents: dict[str, list[dict]] = {}


def simple_chunk(text: str, chunk_size: int = 500) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunks.append(' '.join(words[i:i + chunk_size]))
    return chunks


@router.post('/upload')
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    file_path, filename = await save_upload(file, 'documents')
    content = extract_text(file_path)
    chunks = simple_chunk(content)

    doc = Document(
        user_id=current_user.id,
        filename=filename,
        doc_type='study_material',
        content_text=content,
        chunk_count=len(chunks),
    )
    await db.documents.insert_one(doc.to_doc())

    _documents[current_user.id] = _documents.get(current_user.id, []) + [{'doc_id': doc.id, 'chunks': chunks}]
    return {'id': doc.id, 'filename': filename, 'chunk_count': len(chunks), 'status': 'indexed'}


@router.post('/query')
async def query_rag(body: dict, current_user: User = Depends(get_user_from_token)):
    query = body.get('query', '')
    user_docs = _documents.get(current_user.id, [])

    # Simple keyword search (demo mode — no embeddings needed)
    results = []
    for doc_data in user_docs:
        for chunk in doc_data['chunks']:
            score = sum(1 for word in query.lower().split() if word in chunk.lower())
            if score > 0:
                results.append({'chunk': chunk, 'score': score, 'doc_id': doc_data['doc_id']})

    results.sort(key=lambda x: x['score'], reverse=True)
    context = ' '.join(r['chunk'] for r in results[:3])

    answer = f'Based on the uploaded documents: {context[:300]}...' if context else 'No relevant content found in uploaded documents.'
    return {'answer': answer, 'sources': results[:3]}
