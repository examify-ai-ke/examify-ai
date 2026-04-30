import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse

import requests

from .s3_client import S3Client


def extract_image_references(markdown_content: str) -> List[Dict[str, str]]:
    images = []

    for match in re.finditer(r"!\[([^\]]*)\]\(([^)]+)\)", markdown_content):
        images.append({
            "path": match.group(2).strip(),
            "original": match.group(0),
            "type": "markdown",
            "alt": match.group(1),
        })

    for match in re.finditer(r'<img\s+[^>]*src=["\']([^"\']+)["\'][^>]*>', markdown_content, re.IGNORECASE):
        images.append({
            "path": match.group(1),
            "original": match.group(0),
            "type": "html",
            "alt": "",
        })

    seen = set()
    unique = []
    for img in images:
        if img["path"] not in seen:
            seen.add(img["path"])
            unique.append(img)
    return unique


def _content_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
    }.get(ext, "application/octet-stream")


def _is_http_url(path: str) -> bool:
    return path.startswith(("http://", "https://"))


def _s3_image_key(institution: str, exam_name: str, filename: str) -> str:
    now = datetime.now(timezone.utc)
    return f"{institution}/{exam_name}/{now.year:04d}{now.month:02d}/{filename}"


def download_and_upload_image(
    url: str,
    s3: S3Client,
    institution: str,
    exam_name: str,
) -> Optional[str]:
    try:
        resp = requests.get(url, timeout=60, stream=True)
        resp.raise_for_status()

        parsed = urlparse(url)
        filename = Path(parsed.path).name or f"{uuid.uuid4().hex[:8]}.png"
        if not Path(filename).suffix:
            ext = ".png"
            content_type = resp.headers.get("Content-Type", "")
            if "jpeg" in content_type or "jpg" in content_type:
                ext = ".jpg"
            elif "gif" in content_type:
                ext = ".gif"
            elif "svg" in content_type:
                ext = ".svg"
            elif "webp" in content_type:
                ext = ".webp"
            filename = f"{filename}{ext}"

        s3_key = _s3_image_key(institution, exam_name, filename)
        ct = _content_type(filename)

        s3.upload_image(resp.content, s3_key, content_type=ct)
        region = os.environ.get("AWS_REGION", "us-east-1")
        return f"https://{s3.images_bucket}.s3.{region}.amazonaws.com/{s3_key}"

    except Exception as e:
        print(f"  Warning: Failed to download/upload image {url}: {e}")
        return None


def replace_urls_in_markdown(
    markdown_content: str,
    images: List[Dict],
    url_map: Dict[str, str],
) -> str:
    updated = markdown_content
    for img in images:
        old_path = img["path"]
        new_url = url_map.get(old_path)
        if not new_url:
            continue

        if img["type"] == "markdown":
            new_syntax = f'![{img["alt"]}]({new_url})'
            updated = updated.replace(img["original"], new_syntax)
        elif img["type"] == "html":
            new_tag = img["original"].replace(f'src="{old_path}"', f'src="{new_url}"')
            new_tag = new_tag.replace(f"src='{old_path}'", f"src='{new_url}'")
            updated = updated.replace(img["original"], new_tag)

    return updated


def replace_urls_in_json(data: dict, url_map: Dict[str, str]) -> dict:
    if isinstance(data, dict):
        return {k: replace_urls_in_json(v, url_map) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_urls_in_json(item, url_map) for item in data]
    elif isinstance(data, str) and data in url_map:
        return url_map[data]
    return data


def _upload_s3_local_image(
    s3: S3Client,
    source_s3_dir: str,
    local_path: str,
    institution: str,
    exam_name: str,
) -> Optional[str]:
    s3_key = f"{source_s3_dir.rstrip('/')}/{local_path}"
    filename = Path(local_path).name

    try:
        resp = s3.s3.get_object(Bucket=s3.bucket, Key=s3_key)
        data = resp["Body"].read()
        ct = _content_type(filename)

        img_key = _s3_image_key(institution, exam_name, filename)
        s3.upload_image(data, img_key, content_type=ct)

        region = os.environ.get("AWS_REGION", "us-east-1")
        return f"https://{s3.images_bucket}.s3.{region}.amazonaws.com/{img_key}"
    except Exception as e:
        print(f"  Warning: Could not resolve local image from S3 ({s3_key}): {e}")
        return None


def process_images(
    markdown_content: str,
    s3: S3Client,
    institution: str,
    exam_name: str,
    source_s3_dir: str = "",
) -> Dict:
    images = extract_image_references(markdown_content)
    if not images:
        return {
            "updated_markdown": markdown_content,
            "url_map": {},
            "uploaded_count": 0,
            "errors": [],
        }

    url_map: Dict[str, str] = {}
    errors: List[str] = []

    for img in images:
        path = img["path"]

        if _is_http_url(path):
            print(f"  Re-hosting remote image: {path[:80]}...")
            new_url = download_and_upload_image(path, s3, institution, exam_name)
            if new_url:
                url_map[path] = new_url
                print(f"  -> {new_url}")
            else:
                errors.append(f"Failed to re-host: {path}")
        else:
            print(f"  Resolving local image from S3: {path}")
            new_url = _upload_s3_local_image(s3, source_s3_dir, path, institution, exam_name)
            if new_url:
                url_map[path] = new_url
                print(f"  -> {new_url}")
            else:
                errors.append(f"Local image not found in S3: {source_s3_dir}{path}")

    updated = replace_urls_in_markdown(markdown_content, images, url_map)

    return {
        "updated_markdown": updated,
        "url_map": url_map,
        "uploaded_count": len(url_map),
        "errors": errors,
    }
